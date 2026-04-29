import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const API_VERSION = 'v5.0';

export function readEnvFile(filePath = path.join(process.cwd(), '.env')) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing .env file at ${filePath}`);
  }

  const env = {};
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const equalsIndex = line.indexOf('=');
    if (equalsIndex === -1) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function createGhostToken(adminApiKey) {
  const [id, secret] = adminApiKey.split(':');

  if (!id || !secret) {
    throw new Error('ADMIN_API_KEY must be in the format "<id>:<secret>"');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT', kid: id };
  const payload = { iat: now, exp: now + 5 * 60, aud: '/admin/' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', Buffer.from(secret, 'hex'))
    .update(unsignedToken)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${unsignedToken}.${signature}`;
}

export function loadConfig() {
  const env = readEnvFile();
  const apiUrl = env.API_URL;
  const adminApiKey = env.ADMIN_API_KEY;

  if (!apiUrl) {
    throw new Error('Missing API_URL in .env');
  }

  if (!adminApiKey) {
    throw new Error('Missing ADMIN_API_KEY in .env');
  }

  return {
    apiUrl: apiUrl.replace(/\/$/, ''),
    adminApiKey,
  };
}

function parseResponseText(responseText) {
  let parsed;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    parsed = { raw: responseText };
  }
  return parsed;
}

export async function ghostRequest({ apiUrl, adminApiKey, method, endpoint, body }) {
  const token = createGhostToken(adminApiKey);
  const response = await fetch(`${apiUrl}${endpoint}`, {
    method,
    headers: {
      Authorization: `Ghost ${token}`,
      'Accept-Version': API_VERSION,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const responseText = await response.text();
  const parsed = parseResponseText(responseText);

  if (!response.ok) {
    const errorDetails =
      parsed?.errors?.map((error) => `${error.message} (${error.code})`).join('; ') ||
      response.statusText ||
      'Unknown Ghost API error';
    throw new Error(`Ghost API request failed with ${response.status}: ${errorDetails}`);
  }

  return parsed;
}

function mimeTypeFromPath(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
  };

  return mimeTypes[extension] ?? 'application/octet-stream';
}

export async function listPosts(limit = 100) {
  const { apiUrl, adminApiKey } = loadConfig();
  const parsed = await ghostRequest({
    apiUrl,
    adminApiKey,
    method: 'GET',
    endpoint: `/ghost/api/admin/posts/?limit=${limit}&include=tags,authors&formats=html`,
  });
  return parsed.posts ?? [];
}

export async function getPost(id) {
  const { apiUrl, adminApiKey } = loadConfig();
  const parsed = await ghostRequest({
    apiUrl,
    adminApiKey,
    method: 'GET',
    endpoint: `/ghost/api/admin/posts/${id}/?formats=html&include=tags,authors`,
  });
  return parsed.posts?.[0];
}

export async function updatePost(id, patch) {
  const { apiUrl, adminApiKey } = loadConfig();
  const current = await getPost(id);

  if (!current) {
    throw new Error(`Post not found: ${id}`);
  }

  const parsed = await ghostRequest({
    apiUrl,
    adminApiKey,
    method: 'PUT',
    endpoint: `/ghost/api/admin/posts/${id}/?source=html`,
    body: {
      posts: [
        {
          updated_at: current.updated_at,
          ...patch,
        },
      ],
    },
  });

  return parsed.posts?.[0];
}

export async function uploadImage(filePath, ref = path.basename(filePath)) {
  const { apiUrl, adminApiKey } = loadConfig();
  const token = createGhostToken(adminApiKey);
  const bytes = fs.readFileSync(filePath);
  const form = new FormData();
  const blob = new Blob([bytes], { type: mimeTypeFromPath(filePath) });

  form.append('file', blob, path.basename(filePath));
  form.append('purpose', 'image');
  form.append('ref', ref);

  const response = await fetch(`${apiUrl}/ghost/api/admin/images/upload/`, {
    method: 'POST',
    headers: {
      Authorization: `Ghost ${token}`,
      'Accept-Version': API_VERSION,
    },
    body: form,
  });

  const responseText = await response.text();
  const parsed = parseResponseText(responseText);

  if (!response.ok) {
    const errorDetails =
      parsed?.errors?.map((error) => `${error.message} (${error.code})`).join('; ') ||
      response.statusText ||
      'Unknown Ghost API error';
    throw new Error(`Ghost image upload failed with ${response.status}: ${errorDetails}`);
  }

  return parsed.images?.[0];
}

export function normalizeText(value) {
  return (value ?? '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function slugify(value) {
  return normalizeText(value).replace(/\s+/g, '-');
}

export function jaccardSimilarity(left, right) {
  const leftTokens = new Set(normalizeText(left).split(' ').filter(Boolean));
  const rightTokens = new Set(normalizeText(right).split(' ').filter(Boolean));

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersection += 1;
    }
  }

  const union = new Set([...leftTokens, ...rightTokens]).size;
  return intersection / union;
}

export function findDuplicate({ title, posts }) {
  const normalizedTitle = normalizeText(title);
  const slug = slugify(title);

  let bestMatch = null;

  for (const post of posts) {
    const postTitle = post.title ?? '';
    const postSlug = post.slug ?? '';
    const normalizedPostTitle = normalizeText(postTitle);
    const titleSimilarity = jaccardSimilarity(title, postTitle);
    const exactTitle = normalizedTitle === normalizedPostTitle;
    const exactSlug = slug === postSlug;
    const closeTitle = titleSimilarity >= 0.7;
    const sameLead = normalizedPostTitle.startsWith(normalizedTitle) || normalizedTitle.startsWith(normalizedPostTitle);
    const matched = exactTitle || exactSlug || closeTitle || sameLead;

    if (!matched) {
      continue;
    }

    const score =
      (exactSlug ? 1 : 0) +
      (exactTitle ? 1 : 0) +
      titleSimilarity +
      (sameLead ? 0.25 : 0);

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = {
        score,
        post,
        reasons: {
          exactSlug,
          exactTitle,
          sameLead,
          titleSimilarity,
        },
      };
    }
  }

  return bestMatch;
}
