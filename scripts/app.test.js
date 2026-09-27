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
  await writeFile(path.join(fixtureRoot, 'content', 'career.json'), '[]\n');
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
