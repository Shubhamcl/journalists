import fs from 'node:fs';
import { slugify, updatePost, uploadImage } from './ghost_api.mjs';

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
  const id = args.id;

  if (!id) {
    throw new Error('Usage: node scripts/update_post.mjs --id "post_id" [--title "..."] [--slug "..."] [--excerpt "..."] [--html-file "/path/to/file.html"] [--feature-image-file "/path/to/file.jpg"]');
  }

  const patch = {};

  if (args.title) {
    patch.title = args.title;
  }

  if (args.slug) {
    patch.slug = slugify(args.slug);
  }

  if (args.excerpt) {
    patch.custom_excerpt = args.excerpt;
  }

  if (args.html) {
    patch.html = args.html;
  }

  if (args['html-file']) {
    patch.html = fs.readFileSync(args['html-file'], 'utf8');
  }

  if (args['feature-image-url']) {
    patch.feature_image = args['feature-image-url'];
  }

  if (args['feature-image-file']) {
    patch.feature_image = (
      await uploadImage(args['feature-image-file'], args['feature-image-ref'] ?? args['feature-image-file'])
    ).url;
  }

  if (args['feature-image-alt']) {
    patch.feature_image_alt = args['feature-image-alt'];
  }

  const post = await updatePost(id, patch);
  console.log(`Updated: ${post.title}`);
  console.log(`ID: ${post.id}`);
  console.log(`Status: ${post.status}`);
  console.log(`URL: ${post.url ?? 'not returned by API'}`);
  console.log(`Feature image: ${post.feature_image ?? 'none'}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
