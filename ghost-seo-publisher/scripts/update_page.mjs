import fs from 'node:fs';
import { slugify, updatePage } from './ghost_api.mjs';

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
    throw new Error('Usage: node scripts/update_page.mjs --id "page_id" [--title "..."] [--slug "..."] [--excerpt "..."] [--html-file "/path/to/file.html"]');
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

  const page = await updatePage(id, patch);
  console.log(`Updated: ${page.title}`);
  console.log(`ID: ${page.id}`);
  console.log(`Status: ${page.status}`);
  console.log(`URL: ${page.url ?? 'not returned by API'}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
