import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';
import { after, before, test } from 'node:test';

const projectRoot = process.cwd();
const port = 32000 + Math.floor(Math.random() * 1000);
const baseUrl = `http://127.0.0.1:${port}`;
let fixtureRoot;
let server;
let serverOutput = '';

async function createFixture() {
  fixtureRoot = await mkdtemp(path.join(tmpdir(), 'serenade-test-'));
  await mkdir(path.join(fixtureRoot, 'content', 'posts', 'smoke-post'), { recursive: true });
  await writeFile(
    path.join(fixtureRoot, 'content', 'posts', 'smoke-post', 'README.md'),
    `---\ntitle: Smoke post\ndate: 2025-01-01\ntags: [测试]\nabstract: A test post\n---\n\n# Hello\n\nThis checks the blog route.\n`,
  );
  await writeFile(
    path.join(fixtureRoot, 'content', 'career.json'),
    `${JSON.stringify([
      {
        period: '2020 — 2024',
        org: '一所名字长到必须在窄屏里换行的机构名称用于检查轨迹标签',
        role: '把职业说明写得足够长以便在三百二十像素的内容栏里折行',
        type: '全职',
        note: '备注同样要在轨道内折行，不能把页面撑出视口。',
      },
    ], null, 2)}\n`,
  );
  await mkdir(path.join(fixtureRoot, 'content', 'posts', 'wide-post'), { recursive: true });
  await writeFile(
    path.join(fixtureRoot, 'content', 'posts', 'wide-post', 'README.md'),
    `---\ntitle: Wide post\ndate: 2024-06-01\ntags: [版式]\nabstract: Wide fixtures\n---\n\n## 宽表\n\n| alpha | bravo | charlie | delta | echo | foxtrot | golf | hotel |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n| very-wide-cell-alpha | very-wide-cell-bravo | very-wide-cell-charlie | very-wide-cell-delta | very-wide-cell-echo | very-wide-cell-foxtrot | very-wide-cell-golf | very-wide-cell-hotel |\n\n$$\nx = a + b + c + d + e + f + g + h + i + j + k + l + m + n + o + p + q + r + s + t\n$$\n\n\`\`\`text\nthis_is_a_single_line_that_is_wider_than_a_320px_column_and_must_scroll_inside_the_code_block_only\n\`\`\`\n\n![wide](https://example.com/wide.png)\n`,
  );
  await Promise.all(Array.from({ length: 69 }, (_, index) => {
    const slug = `filler-${String(index + 1).padStart(2, '0')}`;
    const dir = path.join(fixtureRoot, 'content', 'posts', slug);
    return mkdir(dir, { recursive: true }).then(() => writeFile(
      path.join(dir, 'README.md'),
      `---\ntitle: Filler ${index + 1}\ndate: 2020-01-${String((index % 28) + 1).padStart(2, '0')}\ntags: []\n---\n\nFiller body ${index + 1}.\n`,
    ));
  }));
  await writeFile(path.join(fixtureRoot, 'content', 'friends.json'), '[]\n');
  await writeFile(path.join(fixtureRoot, 'content', 'projects.json'), '{"categories": {}}\n');
  await writeFile(path.join(fixtureRoot, 'content', 'collections.json'), '{}\n');
}

async function request(pathname, init) {
  return fetch(`${baseUrl}${pathname}`, init);
}

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await request('/');
      if (response.status < 600) return;
    } catch {
      // 服务还未监听。
    }
    await wait(100);
  }
  throw new Error(`测试服务启动超时\n${serverOutput}`);
}

before(async () => {
  await createFixture();
  const serveScript = path.join(projectRoot, 'node_modules', '@react-router', 'serve', 'bin.cjs');
  server = spawn(process.execPath, [serveScript, path.join(projectRoot, 'build/server/index.js')], {
    cwd: fixtureRoot,
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.on('data', (chunk) => {
    serverOutput += chunk;
  });
  server.stderr.on('data', (chunk) => {
    serverOutput += chunk;
  });
  await waitForServer();
});

after(async () => {
  server?.kill('SIGTERM');
  await wait(100);
  if (fixtureRoot) await rm(fixtureRoot, { recursive: true, force: true });
});

test('SSR 页面可以响应', async () => {
  for (const pathname of ['/', '/posts', '/posts/smoke-post', '/tags', '/projects', '/friends']) {
    const response = await request(pathname);
    assert.equal(response.status, 200, pathname);
    assert.match(response.headers.get('content-type') ?? '', /text\/html/);
  }
});

test('SEO endpoints and rendered metadata are present', async () => {
  const homeResponse = await request('/');
  const homeHtml = await homeResponse.text();
  assert.match(homeHtml, /<title>染念的笔记<\/title>/);
  assert.match(homeHtml, /rel="canonical" href="https:\/\/dyedd\.cn\/?"/);
  assert.match(homeHtml, /application\/ld\+json/);
  assert.equal([...homeHtml.matchAll(/rel="canonical"/g)].length, 1);

  const articleResponse = await request('/posts/smoke-post');
  const articleHtml = await articleResponse.text();
  assert.match(articleHtml, /BlogPosting/);
  assert.match(articleHtml, /Smoke post - 染念的笔记/);
  assert.match(articleHtml, /rel="canonical" href="https:\/\/dyedd\.cn\/posts\/smoke-post"/);

  const notFoundResponse = await request('/missing-page');
  assert.equal(notFoundResponse.status, 404);
  assert.match(await notFoundResponse.text(), /name="robots" content="noindex, follow"/);

  const robotsResponse = await request('/robots.txt');
  assert.equal(robotsResponse.status, 200);
  assert.match(await robotsResponse.text(), /Sitemap: https:\/\/dyedd\.cn\/sitemap\.xml/);

  const sitemapResponse = await request('/sitemap.xml');
  assert.equal(sitemapResponse.status, 200);
  assert.match(sitemapResponse.headers.get('content-type') ?? '', /application\/xml/);
  assert.match(await sitemapResponse.text(), /https:\/\/dyedd\.cn\/posts\/smoke-post/);
});

test('文章 API 和标签 API 返回程序数据', async () => {
  const postsResponse = await request('/api/posts?page=1&pageSize=1');
  assert.equal(postsResponse.status, 200);
  const posts = await postsResponse.json();
  assert.equal(posts.data[0].path, 'smoke-post');
  assert.equal(posts.data[0].title, 'Smoke post');

  const tagsResponse = await request('/api/tags');
  assert.equal(tagsResponse.status, 200);
  const tags = await tagsResponse.json();
  assert.equal(tags['测试'], 1);
});

test('文章详情和 RSS 可以响应', async () => {
  const postResponse = await request('/api/posts/smoke-post');
  assert.equal(postResponse.status, 200);
  const post = await postResponse.json();
  assert.equal(post.path, 'smoke-post');
  assert.match(post.html, /This checks the blog route/);

  const feedResponse = await request('/feed.xml');
  assert.equal(feedResponse.status, 200);
  assert.match(feedResponse.headers.get('content-type') ?? '', /application\/xml/);
  const etag = feedResponse.headers.get('etag');
  assert.ok(etag);
  assert.match(await feedResponse.text(), /Smoke post/);

  const cachedResponse = await request('/feed.xml', { headers: { 'if-none-match': etag } });
  assert.equal(cachedResponse.status, 304);
});

test('窄屏首页把职业轨迹收在轨道内，主导航不进顶栏', async () => {
  const html = await (await request('/')).text();
  assert.match(html, /一所名字长到必须在窄屏里换行的机构名称用于检查轨迹标签/);
  assert.match(html, /class="career-item"/);
  assert.doesNotMatch(html, /width="90%"/);
  assert.match(html, /<nav class="ml-auto hidden items-center md:flex" aria-label="主导航">/);
  assert.match(html, /aria-label="打开菜单"/);
  assert.match(html, /class="github-chart"/);
  assert.match(html, /posts-heatmap/);
  assert.match(html, /minmax\(0,1fr\)/);
});

test('宽文章的表格、公式和代码各自包在栏内滚动盒里', async () => {
  const response = await request('/posts/wide-post');
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<div class="prose-scroll"><table>/);
  assert.match(html, /very-wide-cell-hotel/);
  assert.match(html, /<math[^>]*display="block"/);
  assert.match(html, /class="code-block-wrapper[^"]*"/);
  assert.match(html, /this_is_a_single_line_that_is_wider_than_a_320px_column_and_must_scroll_inside_the_code_block_only/);
  assert.match(html, /<img [^>]*src="https:\/\/example.com\/wide.png"/);
  assert.match(html, /lg:hidden/);
  assert.match(html, /hidden lg:sticky lg:top-24 lg:block/);
});

test('超过七页的分页在窄屏可以折行，文字标签让到 sm', async () => {
  const html = await (await request('/posts?page=4')).text();
  assert.match(html, /flex-wrap/);
  assert.match(html, /hidden sm:inline">上一页/);
  assert.match(html, /hidden sm:inline">下一页/);
  assert.match(html, /page=8/);
  assert.match(html, /aria-current="page"/);
});
