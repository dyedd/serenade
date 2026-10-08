import path from 'path';

const API_KEY = process.env.OPENAI_API_KEY;
// 默认值与 .env.example / README 保持一致：没显式配置时不该把标题和密钥
// 悄悄发往第三方中转地址。
const BASE_URL = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';
const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

const IMAGE_API_KEY = process.env.IMAGE_API_KEY;
const IMAGE_API_MODE = String(process.env.IMAGE_API_MODE ?? 'images').trim().toLowerCase();
const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL ?? 'https://api.openai.com/v1';
const IMAGE_MODEL = process.env.IMAGE_MODEL ?? 'gpt-image-2';

const SLUG_RESPONSE_FORMAT = {
  type: 'json_schema',
  json_schema: {
    name: 'slug_response',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['slug'],
      properties: {
        slug: {
          type: 'string',
        },
      },
    },
  },
};

const normalizeCoverKindByTargetPath = (targetPath) => {
  if (typeof targetPath !== 'string') {
    return 'post';
  } else {
    const trimmedPath = targetPath.trim();

    if (!trimmedPath) {
      return 'post';
    } else {
      const normalizedPath = path.normalize(trimmedPath);
      const segments = normalizedPath
        .split(path.sep)
        .map((segment) => segment.toLowerCase());

      if (segments.includes('columns')) {
        return 'column';
      } else if (segments.includes('posts')) {
        return 'post';
      } else {
        return 'post';
      }
    }
  }
};

const getCoverAspectHint = (coverKind) => {
  const hints = {
    column: {
      kind: 'column',
      layoutHint: '9:16 竖图（portrait）',
      size: '1024x1536',
      promptSuffix: 'aspect ratio 9:16, portrait, vertical composition, clean safe area for title',
    },
    post: {
      kind: 'post',
      layoutHint: '16:9 横图（landscape）',
      size: '1536x1024',
      promptSuffix: 'aspect ratio 16:9, landscape, wide composition, clean safe area for title',
    },
  };

  if (coverKind === 'column') {
    return hints.column;
  } else {
    return hints.post;
  }
};

const buildHeaders = (apiKey) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${apiKey}`,
});

const normalizeBaseUrl = (baseUrl) => String(baseUrl ?? '').trim().replace(/\/+$/, '');

const chatCompletionsUrl = () => `${normalizeBaseUrl(BASE_URL)}/chat/completions`;

const imageGenerationUrl = () => {
  if (IMAGE_API_MODE === 'images') {
    return `${normalizeBaseUrl(IMAGE_BASE_URL)}/images/generations`;
  }

  if (IMAGE_API_MODE === 'chat') {
    return `${normalizeBaseUrl(IMAGE_BASE_URL)}/chat/completions`;
  }

  throw new Error(`不支持的图片API模式: ${IMAGE_API_MODE}`);
};

const summarizeBodyText = (bodyText, maxLength = 240) => {
  const normalizedText = String(bodyText ?? '').replace(/\s+/g, ' ').trim();

  if (!normalizedText) {
    return '';
  }

  if (normalizedText.length <= maxLength) {
    return normalizedText;
  }

  return `${normalizedText.slice(0, maxLength)}…`;
};

const parseJsonText = (bodyText) => {
  const trimmedText = String(bodyText ?? '').trim();

  if (!trimmedText) {
    return null;
  }

  try {
    return JSON.parse(trimmedText);
  } catch {
    return null;
  }
};

const getResponseErrorMessage = (response, bodyText) => {
  const parsed = parseJsonText(bodyText);

  if (parsed) {
    const message = parsed?.error?.message ?? parsed?.message;

    if (message) {
      return message;
    }
  }

  const bodyPreview = summarizeBodyText(bodyText);

  if (bodyPreview) {
    const contentType = response.headers.get('content-type') ?? '';
    // 只保留主机与路径：BASE_URL 里若带 user:token 形式的凭据，不该进日志。
  const responseUrl = (() => {
    if (!response.url) return '';
    try {
      const parsed = new URL(response.url);
      return `；URL: ${parsed.origin}${parsed.pathname}`;
    } catch {
      return '';
    }
  })();
    const contentTypeInfo = contentType ? `；Content-Type: ${contentType}` : '';

    return `${bodyPreview}${responseUrl}${contentTypeInfo}`;
  }

  if (response.statusText) {
    return response.statusText;
  }

  return `HTTP ${response.status}`;
};

const AI_REQUEST_TIMEOUT_MS = 60_000;

const requestJson = async (url, body, apiKey, errorPrefix) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(apiKey),
    body: JSON.stringify(body),
    // 没有超时的话，对端不响应会让 CLI 永久挂住。
    signal: AbortSignal.timeout(AI_REQUEST_TIMEOUT_MS),
  });

  const responseText = await response.text();
  const parsed = parseJsonText(responseText);

  if (response.ok) {
    if (parsed) {
      return parsed;
    }

    const bodyPreview = summarizeBodyText(responseText);
    const contentType = response.headers.get('content-type') ?? '';
    const contentTypeInfo = contentType ? `；Content-Type: ${contentType}` : '';
    const previewInfo = bodyPreview ? `；响应预览: ${bodyPreview}` : '';

    throw new Error(`${errorPrefix}: 返回内容不是有效JSON${contentTypeInfo}${previewInfo}`);
  }

  const errorMessage = getResponseErrorMessage(response, responseText);

  throw new Error(`${errorPrefix}: ${errorMessage}`);
};

const normalizeSlug = (slug) =>
  String(slug ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const readSlugResponse = (data) => {
  const content = data?.choices?.[0]?.message?.content;
  const parsed = typeof content === 'string' ? parseJsonText(content) : null;
  const firstLine = typeof content === 'string' ? content.split(/\r?\n/)[0] : '';
  const firstLineJson = parseJsonText(firstLine);
  const slug = normalizeSlug(parsed?.slug ?? firstLineJson?.slug ?? firstLine);

  if (!slug) {
    throw new Error('API返回的slug为空或格式无效');
  }

  return slug;
};

const buildCoverPrompt = (title, coverAspect) => `Create a modern technical blog cover image for the article titled "${title}".
Use a clean, professional, minimal composition with visual metaphors related to the title.
Do not render readable title text, UI mockups, watermarks, logos, or captions.
Use soft but distinct colors, strong focal structure, and enough negative space for blog layout cropping.
Output composition: ${coverAspect.layoutHint}; ${coverAspect.promptSuffix}.`;

const buildImageRequestBody = (prompt, coverAspect) => {
  if (IMAGE_API_MODE === 'images') {
    return {
      model: IMAGE_MODEL,
      prompt,
      size: coverAspect.size,
    };
  }

  if (IMAGE_API_MODE === 'chat') {
    return {
      model: IMAGE_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    };
  }

  throw new Error(`不支持的图片API模式: ${IMAGE_API_MODE}`);
};

const parseImageDataUrl = (value) => {
  const match = String(value ?? '').match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);

  return match?.[1] ?? null;
};

const findFirstUrl = (value) => {
  const match = String(value ?? '').match(/https?:\/\/[^\s"'<>)]*/);

  return match?.[0] ?? null;
};

const imagePayloadFromValue = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'object') {
    return imagePayloadFromValue(value.url);
  }

  const dataUrlBase64 = parseImageDataUrl(value);

  if (dataUrlBase64) {
    return { kind: 'base64', value: dataUrlBase64 };
  }

  const normalizedValue = String(value).trim();
  const url = normalizedValue.startsWith('http') ? normalizedValue : findFirstUrl(normalizedValue);

  if (url) {
    return { kind: 'url', value: url };
  }

  return null;
};

const imagePayloadFromBase64 = (value) => {
  const normalizedValue = String(value ?? '').trim();

  if (!normalizedValue) {
    return null;
  }

  const dataUrlBase64 = parseImageDataUrl(normalizedValue);

  return {
    kind: 'base64',
    value: dataUrlBase64 ?? normalizedValue,
  };
};

const extractImagePayloadFromObject = (value) => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  // 顺序很重要：url 要先于 base64 判断。`{ result: "https://…/a.png" }` 若先走
  // base64 分支，会把这段 URL 文本当 base64 解码，写出一张损坏的封面图。
  return (
    imagePayloadFromBase64(value.b64_json) ??
    imagePayloadFromValue(value.url) ??
    imagePayloadFromValue(value.image_url) ??
    imagePayloadFromValue(value.result) ??
    imagePayloadFromBase64(value.result)
  );
};

const extractChatContent = (messageContent) => {
  if (typeof messageContent === 'string') {
    return messageContent;
  }

  if (Array.isArray(messageContent)) {
    const textPart = messageContent.find((part) => typeof part?.text === 'string');
    const imagePart = messageContent.find(
      (part) => typeof part?.image_url?.url === 'string' || typeof part?.image_url === 'string'
    );
    const imageValue =
      typeof imagePart?.image_url === 'string' ? imagePart.image_url : imagePart?.image_url?.url;

    return imageValue ?? textPart?.text ?? '';
  }

  return '';
};

const extractImagePayload = (data) => {
  const imageApiPayload = extractImagePayloadFromObject(data?.data?.[0]);

  if (imageApiPayload) {
    return imageApiPayload;
  }

  const chatContent = extractChatContent(data?.choices?.[0]?.message?.content);
  const parsedContent = parseJsonText(chatContent);

  return extractImagePayloadFromObject(parsedContent) ?? imagePayloadFromValue(chatContent);
};

// 图片来源于模型返回的文本/JSON，不能无条件信任：限制协议、类型与体积，
// 超时兜底，避免把任意地址的内容（或超大文件）写进文章目录。
const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
const IMAGE_FETCH_TIMEOUT_MS = 30_000;

const decodeBase64Image = (value) => {
  const cleaned = String(value ?? '').replace(/\s/g, '');
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(cleaned) || cleaned.length % 4 !== 0) {
    throw new Error('返回的 base64 图片数据不合法');
  }
  const buffer = Buffer.from(cleaned, 'base64');
  if (buffer.byteLength === 0) {
    throw new Error('返回的 base64 图片数据为空');
  }
  if (buffer.byteLength > IMAGE_MAX_BYTES) {
    throw new Error(`图片超过 ${IMAGE_MAX_BYTES / 1024 / 1024}MB 上限`);
  }
  return buffer;
};

const downloadImage = async (rawUrl) => {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error(`图片地址无效: ${rawUrl}`);
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`不支持的图片地址协议: ${url.protocol}`);
  }

  const response = await fetch(url, { signal: AbortSignal.timeout(IMAGE_FETCH_TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`下载图片失败: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.startsWith('image/')) {
    throw new Error(`图片地址返回的不是图片: ${contentType || '未知类型'}`);
  }

  const declaredLength = Number.parseInt(response.headers.get('content-length') ?? '', 10);
  if (Number.isFinite(declaredLength) && declaredLength > IMAGE_MAX_BYTES) {
    throw new Error(`图片超过 ${IMAGE_MAX_BYTES / 1024 / 1024}MB 上限`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > IMAGE_MAX_BYTES) {
    throw new Error(`图片超过 ${IMAGE_MAX_BYTES / 1024 / 1024}MB 上限`);
  }
  return buffer;
};

const writeImageFile = async (payload, targetPath) => {
  const { writeFileSync } = await import('fs');

  if (payload.kind === 'base64') {
    writeFileSync(targetPath, decodeBase64Image(payload.value));
    return;
  }

  if (payload.kind === 'url') {
    writeFileSync(targetPath, await downloadImage(payload.value));
    return;
  }

  throw new Error(`不支持的图片返回类型: ${payload.kind}`);
};

const generateUrlWithAI = async (title) => {
  if (!API_KEY) {
    console.error('❌ 错误：未找到API密钥');
    console.log('请在项目根目录创建 .env 文件，并配置 OPENAI_API_KEY');
    console.log('参考 .env.example 文件');
    return null;
  } else {
    try {
      const body = {
        model: MODEL,
        response_format: SLUG_RESPONSE_FORMAT,
        messages: [
          {
            role: 'system',
            content:
              '你负责生成技术博客 URL slug。必须只返回一个 JSON 对象，格式为 {"slug":"english-kebab-case"}，不要 Markdown，不要解释，不要多余文本。slug 使用英文 kebab-case，保留常见技术词和数字，不要包含 article、post、blog 等泛词。',
          },
          {
            role: 'user',
            content: `标题：${title}`,
          },
        ],
      };

      const data = await requestJson(chatCompletionsUrl(), body, API_KEY, 'API请求失败');
      return readSlugResponse(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ AI生成URL失败:', error.message);
      } else {
        console.error('❌ AI生成URL失败: 未知错误');
      }
      return null;
    }
  }
};

const generateImageWithAI = async (title, targetPath) => {
  if (!IMAGE_API_KEY) {
    return null;
  } else {
    const coverKind = normalizeCoverKindByTargetPath(targetPath);
    const coverAspect = getCoverAspectHint(coverKind);

    try {
      const finalPrompt = buildCoverPrompt(title, coverAspect);

      console.log('🎨 开始生成图片...');
      const imageData = await requestJson(
        imageGenerationUrl(),
        buildImageRequestBody(finalPrompt, coverAspect),
        IMAGE_API_KEY,
        '图片生成API请求失败'
      );
      const imagePayload = extractImagePayload(imageData);

      if (!imagePayload) {
        throw new Error('图片生成返回空图片数据');
      } else {
        await writeImageFile(imagePayload, targetPath);
        return true;
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ AI生成配图失败:', error.message);
      } else {
        console.error('❌ AI生成配图失败: 未知错误');
      }
      return null;
    }
  }
};

export { generateImageWithAI, generateUrlWithAI };
