import { listPosts } from './ghost_api.mjs';

async function main() {
  const posts = await listPosts();

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
