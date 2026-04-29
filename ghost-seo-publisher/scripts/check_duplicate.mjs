import { findDuplicate, listPosts } from './ghost_api.mjs';

function parseArgs(argv) {
  const args = {};

  for (let index = 2; index < argv.length; index += 1) {
    const current = argv[index];
    const next = argv[index + 1];

    if (current === '--title' && next) {
      args.title = next;
      index += 1;
    }
  }

  return args;
}

async function main() {
  const { title } = parseArgs(process.argv);

  if (!title) {
    throw new Error('Usage: node scripts/check_duplicate.mjs --title "Your article title"');
  }

  const posts = await listPosts();
  const match = findDuplicate({ title, posts });

  console.log(`Candidate title: ${title}`);

  if (!match) {
    console.log('Decision: create');
    console.log('Reason: no close duplicate found among current Ghost posts.');
    return;
  }

  const { post, reasons } = match;
  const decision = post.status === 'draft' ? 'update-existing-draft' : 'skip-duplicate';

  console.log(`Decision: ${decision}`);
  console.log(`Matched post: ${post.title}`);
  console.log(`Matched status: ${post.status}`);
  console.log(`Matched slug: ${post.slug}`);
  console.log(
    `Signals: exact_slug=${reasons.exactSlug}, exact_title=${reasons.exactTitle}, same_lead=${reasons.sameLead}, title_similarity=${reasons.titleSimilarity.toFixed(2)}`
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
