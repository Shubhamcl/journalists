import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ENV_PATH = path.join(process.cwd(), '.env');
const API_VERSION = 'v5.0';

function readEnvFile(filePath) {
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

function createGhostToken(adminApiKey) {
  const [id, secret] = adminApiKey.split(':');

  if (!id || !secret) {
    throw new Error('ADMIN_API_KEY must be in the format "<id>:<secret>"');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'HS256',
    typ: 'JWT',
    kid: id,
  };
  const payload = {
    iat: now,
    exp: now + 5 * 60,
    aud: '/admin/',
  };

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

async function listPosts({ apiUrl, adminApiKey, limit = 25 }) {
  const token = createGhostToken(adminApiKey);
  const normalizedApiUrl = apiUrl.replace(/\/$/, '');
  const endpoint =
    `${normalizedApiUrl}/ghost/api/admin/posts/` +
    `?limit=${limit}&include=tags,authors&formats=html,lexical`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Ghost ${token}`,
      'Accept-Version': API_VERSION,
    },
  });

  const responseText = await response.text();
  let parsed;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    parsed = { raw: responseText };
  }

  if (!response.ok) {
    const errorDetails =
      parsed?.errors?.map((error) => `${error.message} (${error.code})`).join('; ') ||
      response.statusText ||
      'Unknown Ghost API error';
    throw new Error(`Ghost API request failed with ${response.status}: ${errorDetails}`);
  }

  return parsed.posts ?? [];
}

async function main() {
  const env = readEnvFile(ENV_PATH);
  const apiUrl = env.API_URL;
  const adminApiKey = env.ADMIN_API_KEY;

  if (!apiUrl) {
    throw new Error('Missing API_URL in .env');
  }

  if (!adminApiKey) {
    throw new Error('Missing ADMIN_API_KEY in .env');
  }

  const posts = await listPosts({ apiUrl, adminApiKey });

  console.log(`Fetched ${posts.length} posts.`);
  for (const post of posts) {
    const tagNames = (post.tags ?? []).map((tag) => tag.name).join(', ') || '-';
    console.log(
      [
        `- ${post.title}`,
        `status=${post.status}`,
        `slug=${post.slug}`,
        `updated_at=${post.updated_at}`,
        `tags=${tagNames}`,
      ].join(' | ')
    );
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
