import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';
import { after, before, test } from 'node:test';
import {
  hasFrontMatterDate,
  insertTimestamp,
  normalizeSlug,
  quoteYamlString,
} from './front-matter.js';
import { isSafeUrl } from './prompt-helper.js';
import { resolveContentUrl } from './content-helper.js';

const projectRoot = process.cwd();
let baseUrl;
let fixtureRoot;
let server;
const serverEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('SITE_')));

// 测试显式注入固定的 SITE_*，不依赖本地 .env。
const TEST_SITE_ENV = {
  SITE_AUTHOR: 'Test Author',
  SITE_TITLE: 'Test Notes',
  SITE_URL: 'https://test.example',
  SITE_EMAIL: 'test@example.com',
  SITE_DESCRIPTION: 'Fixture site',
  SITE_PROFILE_INTRO: 'Test intro line|Second intro <script>window.__envLeak=true</script>',
  SITE_PROFILE_MOTTO: 'Test motto',
  SITE_PROFILE_GITHUB_CHART: 'https://example.com/chart.svg',
  SITE_PROFILE_TECH_STACK: 'TypeScript::https://example.com/ts.svg',
  SITE_GITHUB_URL: 'https://github.com/test-author',
  SITE_QQ_URL: 'https://example.com/contact',
  SITE_FOOTER_ICP_LABEL: 'Test ICP',
  SITE_START_TIME: '2020-01-01',
  SITE_ANALYTICS_SCRIPT: 'https://example.com/analytics.js',
  SITE_ANALYTICS_WEBSITE_ID: 'test-analytics',
};
const siteTitle = TEST_SITE_ENV.SITE_TITLE;
const siteUrl = TEST_SITE_ENV.SITE_URL;
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function createFixture() {
  fixtureRoot = await mkdtemp(path.join(tmpdir(), 'serenade-test-'));
  await mkdir(path.join(fixtureRoot, 'content', 'posts', 'smoke-post'), { recursive: true });
  await writeFile(
    path.join(fixtureRoot, 'content', 'posts', 'smoke-post', 'README.md'),
    `---\ntitle: Smoke post\ndate: 2025-01-01\ntags: [测试, "50%25"]\nabstract: A test post\n---\n\n# Hello\n\nThis checks the blog route.\n`,
  );
  await writeFile(
    path.join(fixtureRoot, 'content', 'career.json'),
    `${JSON.stringify([
      {
        period: '2020 — 2024',
        org: '一所名字长到必须在窄屏里换行的机构名称用于检查轨迹标签',
        role: '把职业说明写得足够长以便在三百二十像素的内容栏里折行',
        note: '备注同样要在轨道内折行，不能把页面撑出视口。',
      },
      { period: '2019 — 2020', org: '第二段经历', role: '研究工作' },
      { period: '2018 — 2019', org: '第三段经历', role: '开发工作' },
      { period: '2017 — 2018', org: '第四段经历', role: '实习工作' },
      { period: '2016 — 2017', org: '第五段经历', role: '学习经历' },
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

  // 同一文章目录里的其他 .md 不是文章：索引、标签计数、搜索和 RSS 都必须忽略它们。
  for (const extra of ['chapter-draft.md', 'scratch.md']) {
    await writeFile(
      path.join(fixtureRoot, 'content', 'posts', 'smoke-post', extra),
      `---\ntitle: ${extra}\ndate: 2025-01-02\ntags: [测试]\n---\n\nshared-keyword 只出现在附属文件里\n`,
    );
  }

  // 专栏：README + 数字前缀章节 + 非数字章节（排序要稳定，README 不算章节）
  await mkdir(path.join(fixtureRoot, 'content', 'columns', 'smoke-column'), { recursive: true });
  await writeFile(
    path.join(fixtureRoot, 'content', 'columns', 'smoke-column', 'README.md'),
    '---\ntitle: Smoke column\ndate: 2025-01-03\n---\n\nColumn intro\n',
  );
  await writeFile(
    path.join(fixtureRoot, 'content', 'columns', 'smoke-column', '002-second.md'),
    '# 第二章\n\nsecond chapter\n',
  );
  await writeFile(
    path.join(fixtureRoot, 'content', 'columns', 'smoke-column', '001-first.md'),
    '# 第一章\n\nfirst chapter\n',
  );
  await writeFile(
    path.join(fixtureRoot, 'content', 'columns', 'smoke-column', 'appendix.md'),
    '# 附录\n\nappendix chapter\n',
  );

  await writeFile(path.join(fixtureRoot, 'content', 'projects.json'), `${JSON.stringify({
    categories: {
      test: {
        name: '测试项目',
        icon: '',
        projects: [
          { name: '项目一', date: '2022-01-01' },
          { name: '项目二', date: '2022-01-02' },
          { name: '项目三', date: '2022-01-03' },
        ],
      },
    },
  }, null, 2)}\n`);
  await writeFile(path.join(fixtureRoot, 'content', 'collections.json'), '{}\n');
}

async function request(pathname, init) {
  return fetch(`${baseUrl}${pathname}`, init);
}

async function startServer(siteEnv) {
  const port = 32000 + Math.floor(Math.random() * 1000);
  const url = `http://127.0.0.1:${port}`;
  const serveScript = path.join(projectRoot, 'node_modules', '@react-router', 'serve', 'bin.cjs');
  const child = spawn(process.execPath, [serveScript, path.join(projectRoot, 'build/server/index.js')], {
    cwd: fixtureRoot,
    env: { ...serverEnv, ...siteEnv, HOST: '127.0.0.1', PORT: String(port), NODE_ENV: 'production' },
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk; });
  child.stderr.on('data', (chunk) => { output += chunk; });
  for (let attempt = 0; attempt < 300; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`测试服务提前退出\n${output}`);
    const response = await fetch(`${url}/robots.txt`).catch(() => null);
    if (response?.status === 200) return { child, url };
    await wait(100);
  }
  child.kill();
  throw new Error(`测试服务启动超时\n${output}`);
}

before(async () => {
  await createFixture();
  const running = await startServer(TEST_SITE_ENV);
  server = running.child;
  baseUrl = running.url;
});

after(async () => {
  server?.kill('SIGTERM');
  // 等进程真正退出，否则 Windows 上 fixture 目录仍被占用，rm 会失败残留。
  await new Promise((resolve) => {
    if (!server || server.exitCode !== null || server.signalCode !== null) {
      resolve();
      return;
    }
    const timer = setTimeout(() => {
      server.kill('SIGKILL');
      resolve();
    }, 5000);
    server.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });
  });
  if (fixtureRoot) {
    assert.equal(path.dirname(fixtureRoot), path.resolve(tmpdir()));
    assert.ok(path.basename(fixtureRoot).startsWith('serenade-test-'));
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});

test('SSR 页面可以响应', async () => {
  for (const pathname of ['/', '/posts', '/posts/smoke-post', '/tags', '/projects', '/friends']) {
    const response = await request(pathname);
    assert.equal(response.status, 200, pathname);
    assert.match(response.headers.get('content-type') ?? '', /text\/html/);
  }
});

test('SEO endpoints and rendered metadata are present', async () => {
  const titlePattern = new RegExp(`<title>${escapeRegExp(siteTitle)}</title>`);
  const canonicalBase = escapeRegExp(siteUrl);

  const homeResponse = await request('/');
  const homeHtml = await homeResponse.text();
  assert.match(homeHtml, titlePattern);
  assert.match(homeHtml, new RegExp(`rel="canonical" href="${canonicalBase}/?"`));
  assert.match(homeHtml, /application\/ld\+json/);
  assert.equal([...homeHtml.matchAll(/rel="canonical"/g)].length, 1);
  assert.match(homeHtml, /<text\b[^>]*>Test intro line<\/text>/);
  assert.match(homeHtml, /<text\b[^>]*>Test motto<\/text>/);
  assert.match(homeHtml, /<text\b[^>]*>Second intro &lt;script&gt;window\.__envLeak=true&lt;\/script&gt;<\/text>/);
  assert.doesNotMatch(homeHtml, /<script>window\.__envLeak=true<\/script>/);
  assert.match(homeHtml, /href="mailto:test@example.com"/);
  assert.match(homeHtml, /href="https:\/\/github.com\/test-author"/);
  assert.match(homeHtml, /src="https:\/\/example.com\/chart.svg"/);
  assert.equal([...homeHtml.matchAll(/class="github-chart"/g)].length, 1);
  assert.match(homeHtml, /<a\b[^>]*>Test ICP<\/a>/);
  assert.match(homeHtml, /<script\b[^>]*src="https:\/\/example.com\/analytics.js"[^>]*data-website-id="test-analytics"/);

  const articleResponse = await request('/posts/smoke-post');
  const articleHtml = await articleResponse.text();
  assert.match(articleHtml, /BlogPosting/);
  assert.match(articleHtml, new RegExp(`Smoke post - ${escapeRegExp(siteTitle)}`));
  assert.match(articleHtml, new RegExp(`rel="canonical" href="${canonicalBase}/posts/smoke-post"`));

  const notFoundResponse = await request('/missing-page');
  assert.equal(notFoundResponse.status, 404);
  assert.match(await notFoundResponse.text(), /name="robots" content="noindex, follow"/);

  const robotsResponse = await request('/robots.txt');
  assert.equal(robotsResponse.status, 200);
  assert.match(await robotsResponse.text(), new RegExp(`Sitemap: ${canonicalBase}/sitemap\\.xml`));

  const sitemapResponse = await request('/sitemap.xml');
  assert.equal(sitemapResponse.status, 200);
  assert.match(sitemapResponse.headers.get('content-type') ?? '', /application\/xml/);
  assert.match(await sitemapResponse.text(), new RegExp(`${canonicalBase}/posts/smoke-post`));
});

test('文章索引与标签计数忽略同目录的附属 Markdown', async () => {
  const posts = await (await request('/api/posts?pageSize=50')).json();
  const smokePosts = posts.data.filter((post) => post.path === 'smoke-post');
  assert.equal(smokePosts.length, 1, '同一文章目录只能出现一次');
  assert.equal(posts.totalItems, 71, '两篇正文加 69 篇分页数据，附属 Markdown 不计入');

  const tags = await (await request('/api/tags')).json();
  assert.equal(tags['测试'], 1, '标签计数按文章数，不按文件数');

  const tagPosts = await (await request('/api/tags/%E6%B5%8B%E8%AF%95')).json();
  assert.equal(tagPosts.totalItems, tags['测试'], '标签云与标签详情的数量必须一致');

  const search = await (await request('/api/posts/search?keyword=shared-keyword')).json();
  assert.equal(search.totalItems, 0, '只出现在附属文件里的关键词不应命中');

  const feed = await (await request('/feed.xml')).text();
  const guids = [...feed.matchAll(/<guid[^>]*>([^<]+)<\/guid>/g)].map((m) => m[1]);
  assert.equal(new Set(guids).size, guids.length, 'RSS 里不能有重复 guid');
});

test('空 env 隐藏可选入口，统计 ID 单独存在时不输出脚本', async (t) => {
  const { child, url } = await startServer({ SITE_ANALYTICS_WEBSITE_ID: 'id-without-script' });
  t.after(async () => {
    if (child.exitCode !== null || child.signalCode !== null) return;
    const exited = new Promise((resolve) => child.once('exit', resolve));
    child.kill();
    await exited;
  });
  const html = await (await fetch(url)).text();
  assert.match(html, /<title>未命名站点<\/title>/);
  assert.match(html, /src="\/avatar.jpg"/);
  assert.match(html, /Powered by serenade<\/a>/);
  assert.doesNotMatch(html, /aria-label="(?:GitHub|Email|QQ)"/);
  assert.doesNotMatch(html, /id="github-heading"|已运行|href="https:\/\/beian.miit.gov.cn\/"/);
  assert.doesNotMatch(html, /<script\b[^>]*data-website-id=/);
  assert.match(await (await fetch(`${url}/friends`)).text(), /发送给站主/);
  assert.doesNotMatch(await (await fetch(`${url}/projects`)).text(), /访问我的 GitHub/);
});

test('CLI slug 只校验文章路径，支持手动输入并拒绝冲突和越界', async () => {
  const directory = path.join(fixtureRoot, 'content', 'posts');
  assert.equal(await resolveContentUrl(null, '标题', directory, 'new-post', false), 'new-post');
  for (const slug of ['../escape', '--flag', 'smoke-post']) {
    assert.equal(await resolveContentUrl(null, '标题', directory, slug, false), null);
  }
  const answers = ['', 'manual-slug'];
  const rl = { question: (_prompt, reply) => reply(answers.shift()) };
  assert.equal(await resolveContentUrl(rl, '标题', directory, '', false), 'manual-slug');
  assert.equal(answers.length, 0);
});

test('文章封面保留 images 和 chat 两种 API 模式', async (t) => {
  const imageKeys = ['IMAGE_API_KEY', 'IMAGE_API_MODE', 'IMAGE_BASE_URL'];
  const previousEnv = Object.fromEntries(imageKeys.map((key) => [key, process.env[key]]));
  t.after(() => {
    for (const key of imageKeys) {
      if (previousEnv[key] === undefined) delete process.env[key];
      else process.env[key] = previousEnv[key];
    }
  });
  process.env.IMAGE_API_KEY = 'fixture-key';
  process.env.IMAGE_BASE_URL = 'https://images.example/v1';
  const image = Buffer.from('fixture-image');
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    const body = JSON.parse(init.body);
    requests.push({ url, body });
    const payload = body.messages
      ? { choices: [{ message: { content: `data:image/png;base64,${image.toString('base64')}` } }] }
      : { data: [{ b64_json: image.toString('base64') }] };
    return Response.json(payload);
  });
  for (const mode of ['images', 'chat']) {
    process.env.IMAGE_API_MODE = mode;
    const { generateImageWithAI } = await import(`./ai-helper.js?mode=${mode}`);
    const target = path.join(fixtureRoot, `${mode}-cover.png`);
    assert.equal(await generateImageWithAI('测试文章', target), true);
    assert.deepEqual(await readFile(target), image);
  }
  assert.equal(requests[0].url, 'https://images.example/v1/images/generations');
  assert.equal(requests[0].body.size, '1536x1024');
  assert.equal(requests[1].url, 'https://images.example/v1/chat/completions');
  assert.match(requests[1].body.messages[0].content, /16:9/);
});

test('畸形 URL 编码由请求边界返回 400', async () => {
  for (const pathname of ['/tags/50%', '/tags/%E4%B8', '/api/tags/50%']) {
    const response = await request(pathname);
    assert.equal(response.status, 400, pathname);
  }
});

test('标签参数只由路由解码一次，保留名称中的百分号编码', async () => {
  const tag = encodeURIComponent('50%25');
  const posts = await (await request(`/api/tags/${tag}`)).json();
  assert.equal(posts.totalItems, 1);
  assert.equal(posts.data[0].path, 'smoke-post');
  const html = await (await request(`/tags/${tag}`)).text();
  assert.match(html, /<h1\b[^>]*>50%25<\/h1>/);
  assert.match(html, /href="\/posts\/smoke-post"/);
});

test('pageSize 有上界，恶意大值不会拖垮响应', async () => {
  const response = await request('/api/posts?pageSize=100000');
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.ok(body.pageSize <= 50, `pageSize 应被夹紧，实际 ${body.pageSize}`);
});

test('专栏章节列表排除 README 并按文件名排序', async () => {
  const response = await request('/columns/smoke-column');
  assert.equal(response.status, 200);
  const html = await response.text();
  const hrefs = [...html.matchAll(/\/columns\/smoke-column\/([^"#?]+)/g)].map((m) => m[1]);
  assert.ok(hrefs.length > 0, '应列出章节链接');
  assert.ok(!hrefs.some((h) => /readme/i.test(h)), 'README 不应被当成章节');
  assert.ok(!hrefs.some((h) => h.includes('/') || h.includes('\\')), '章节链接只应是文件名');

  const first = hrefs.indexOf('001-first.md');
  const second = hrefs.indexOf('002-second.md');
  const appendix = hrefs.indexOf('appendix.md');
  assert.ok(first >= 0 && second >= 0 && appendix >= 0, `缺少章节链接: ${hrefs.join(', ')}`);
  assert.ok(first < second, '数字前缀章节按序号排序');
  assert.ok(second < appendix, '非数字前缀章节排在数字章节之后');
});

test('资产路由只提供图片，且挡掉路径穿越', async () => {
  for (const pathname of [
    '/assets/posts/smoke-post/../../../friends.json',
    '/assets/posts/smoke-post/..%2F..%2Ffriends.json',
    '/assets/posts/smoke-post/README.md',
    '/assets/unknown/smoke-post/cover.png',
  ]) {
    const response = await request(pathname);
    assert.ok(response.status === 403 || response.status === 404, `${pathname} -> ${response.status}`);
  }
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

  // 分页参数来自 query string，非法值要回落到默认而不是 NaN。
  const weird = await (await request('/api/posts?page=abc&pageSize=-5')).json();
  assert.equal(weird.page, 1);
  assert.ok(weird.pageSize > 0);
});

test('CLI 写入的 front matter 可以被站点解析', async () => {
  // 标题必须按 YAML 标量转义：冒号、方括号、引号、换行都不能破坏 front matter。
  const titles = [
    'Docker: 入门',
    '[数组] 标题',
    '"引号" 标题',
    '#井号开头',
    'a: b: c',
    '带\n换行的标题',
  ];
  for (const title of titles) {
    const readme = `---\ntitle: ${quoteYamlString(title)}\ntags: [cli]\n---\n\nCLI 写入的正文\n`;
    const slug = `cli-${Buffer.from(title).toString('hex').slice(0, 8)}`;
    await mkdir(path.join(fixtureRoot, 'content', 'posts', slug), { recursive: true });
    await writeFile(path.join(fixtureRoot, 'content', 'posts', slug, 'README.md'), readme);
  }

  // 索引缓存 30 秒，这里只断言这些文章能通过 API 取到（不依赖缓存失效时机）。
  const detail = await request(`/api/posts/cli-${Buffer.from(titles[0]).toString('hex').slice(0, 8)}`);
  assert.equal(detail.status, 200);
  const post = await detail.json();
  assert.equal(post.title, titles[0]);
});

test('slug 规则在 post 与 sync 两侧一致', () => {
  for (const slug of ['docker-intro', 'a.b_c-d', 'UPPER']) {
    assert.equal(isSafeUrl(slug).valid, true, `${slug} 应被接受`);
    assert.equal(normalizeSlug(slug), slug);
  }
  for (const slug of ['中文标题', 'my post', '--no-ai', '..', 'a/b', '']) {
    assert.equal(isSafeUrl(slug).valid, false, `${slug} 应被拒绝`);
    assert.equal(normalizeSlug(slug), null, `${slug} 在两侧都应被拒绝`);
  }
});

test('时间戳只补进 front matter，且不误判正文里的 date 行', () => {
  const timestamp = '2025-03-04T05:06:07+08:00';

  const skeleton = '---\ntitle: "标题"\ntags: []\n---\n\n正文\n';
  const withDate = insertTimestamp(skeleton, timestamp);
  assert.equal(withDate.updated, true);
  assert.match(withDate.content, /^---\ntitle: "标题"\ndate: 2025-03-04T05:06:07\+08:00\ntags: \[\]\n---/);

  const already = '---\ntitle: "标题"\ndate: 2020-01-01\n---\n\n正文\n';
  assert.equal(insertTimestamp(already, timestamp).updated, false);
  assert.equal(hasFrontMatterDate(already), true);

  // 正文里的 date 行不算，否则真正缺 date 的文章会被跳过
  const proseDate = '---\ntitle: "标题"\n---\n\n这是正文\ndate: 随便一行\n';
  assert.equal(hasFrontMatterDate(proseDate), false);
  assert.equal(insertTimestamp(proseDate, timestamp).updated, true);

  const noFrontMatter = '# 只有正文\n';
  assert.equal(insertTimestamp(noFrontMatter, timestamp).updated, false);
  assert.equal(insertTimestamp(noFrontMatter, timestamp).reason, 'missing-front-matter');
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

test('首页展示两个项目，且 SSR 与客户端取值一致', async () => {
  const first = await (await request('/')).text();
  const second = await (await request('/')).text();
  const projectNames = ['项目一', '项目二', '项目三'].filter((name) => first.includes(name));
  assert.equal(projectNames.length, 2);
  // 按日期确定性选取，两次请求必须给出同一组项目，否则水合会不一致。
  assert.deepEqual(
    ['项目一', '项目二', '项目三'].filter((name) => second.includes(name)),
    projectNames,
  );
});

test('热力图数据由服务端给出，渲染期不读当前时间', async () => {
  const html = await (await request('/')).text();
  // 网格单元格与统计文案都来自 loader，组件不再自行取 new Date()。
  assert.match(html, /posts-heatmap/);
  assert.match(html.replace(/<!-- -->/g, ''), /过去一年 \d+ 天有更新/);
  const labelled = [...html.matchAll(/aria-label="(\d+ 篇文章 · [^"]+|无文章 · [^"]+)"/g)];
  assert.ok(labelled.length > 0, '热力图单元格需要有可访问名称');
});

test('窄屏首页把职业轨迹收在轨道内，主导航不进顶栏', async () => {
  const html = await (await request('/')).text();
  assert.match(html, /一所名字长到必须在窄屏里换行的机构名称用于检查轨迹标签/);
  assert.equal([...html.matchAll(/class="career-item"/g)].length, 3);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /展开更多/);
  assert.doesNotMatch(html, /width="90%"/);
  assert.match(html, /<nav class="ml-auto hidden items-center md:flex" aria-label="主导航">/);
  assert.match(html, /aria-label="打开菜单"/);
  assert.match(html, /aria-label="切换到暗色"/);
  assert.match(html, /class="github-chart"/);
  assert.match(html, /posts-heatmap/);
  assert.match(html, /class="tech-chip"/);
  assert.match(html, /class="size-24 shrink-0 rounded-full border border-border object-cover sm:size-28"/);
  assert.match(html, /class="profile-line mt-3 block max-w-full select-none text-foreground"/);
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
  assert.match(html, /<img class="post-image" [^>]*src="https:\/\/example.com\/wide.png"/);
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
