import fs from 'node:fs';
import { ghostRequest, loadConfig, slugify, uploadImage } from './ghost_api.mjs';

function parseArgs(argv) {
  const args = {};

  for (let index = 2; index < argv.length; index += 1) {
    const current = argv[index];
    const next = argv[index + 1];

    if (current.startsWith('--') && next) {
      args[current.slice(2)] = next;
      index += 1;
    }
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const title = args.title;
  const html =
    args['html-file']
      ? fs.readFileSync(args['html-file'], 'utf8')
      : args.html ?? '<p>Draft created by ghost-seo-publisher.</p>';
  const excerpt = args.excerpt ?? '';
  const slug = args.slug ? slugify(args.slug) : `${slugify(title)}-${Date.now()}`;
  const featureImage =
    args['feature-image-file']
      ? (await uploadImage(args['feature-image-file'], args['feature-image-ref'] ?? args['feature-image-file'])).url
      : args['feature-image-url'] ?? undefined;
  const featureImageAlt = args['feature-image-alt'] ?? '';
  const tags = (args.tags ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => ({ name: tag }));

  if (!title) {
    throw new Error('Usage: node scripts/create_draft.mjs --title "..." [--slug "..."] [--excerpt "..."] [--tags "Tag 1,Tag 2"] [--html "<p>...</p>"] [--html-file "/path/to/file.html"]');
  }

  const { apiUrl, adminApiKey } = loadConfig();
  const body = {
    posts: [
      {
        title,
        slug,
        status: 'draft',
        html,
        custom_excerpt: excerpt,
        feature_image: featureImage,
        feature_image_alt: featureImageAlt || null,
        tags,
      },
    ],
  };

  const parsed = await ghostRequest({
    apiUrl,
    adminApiKey,
    method: 'POST',
    endpoint: '/ghost/api/admin/posts/?source=html',
    body,
  });

  const post = parsed.posts?.[0];
  console.log(`Draft created: ${post.title}`);
  console.log(`ID: ${post.id}`);
  console.log(`Status: ${post.status}`);
  console.log(`URL: ${post.url ?? 'not returned by API'}`);
  console.log(`Feature image: ${post.feature_image ?? 'none'}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
