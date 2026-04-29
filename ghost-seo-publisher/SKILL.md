---
name: ghost-seo-publisher
description: Write SEO-focused tech articles for a Ghost CMS site, check existing Ghost posts before drafting, avoid repeating published or draft content, and create or update Ghost drafts through the Admin API. Use this skill when the user wants article ideation, duplicate-safe article writing, Ghost draft creation, or a content pipeline for a specific Ghost publication.
---

# Ghost SEO Publisher

## Overview

Use this skill when the task is to research, draft, deduplicate, and stage articles for a Ghost publication.

Before choosing topics or drafting, read:

- `references/site_profile.md` for editorial fit and content mix
- `references/editorial_models.md` for the publication model and comparables
- `references/editorial_controls.md` for cannibalization, sourcing, and labeling rules
- `references/article_brief_template.md` for the required article brief structure
- `references/image_policy.md` for image selection and creation rules

Default behavior:

1. Read credentials from a local `.env` file with `API_URL` and `ADMIN_API_KEY`.
2. Query Ghost before writing.
3. Refuse to create a new post when a close duplicate already exists unless the user asks to update the existing draft.
4. Require a source packet before drafting factual articles.
5. Label the piece as report, analysis, opinion, review, explainer, guide, or roundup.
6. Attach a feature image before creating the Ghost draft.
7. Create drafts by default.

## Workflow

### 1. Inspect the existing publication

Use the bundled scripts before planning a new article:

- `scripts/list_posts.mjs` to fetch current posts
- `scripts/check_duplicate.mjs --title "..."` to test a candidate topic or title

If the user gives only a broad niche, inspect the post list first, then apply `references/site_profile.md` to identify gaps rather than writing immediately.

### 2. Decide whether the topic is new enough

Treat a topic as a duplicate or near-duplicate when any of these are true:

- exact slug match
- exact normalized title match
- very close title match
- the candidate targets the same search intent as an existing published or draft post
- the candidate would compete for the same primary keyword and article type as an existing post

When there is a collision, prefer one of these actions:

1. improve the existing draft
2. update or expand the existing published post
3. create a fresher angle with a different search intent
3. skip the topic

Do not create a second post that would obviously cannibalize the first one.
Follow the controls in `references/editorial_controls.md`.

### 3. Write for a real SERP intent

Before drafting, define:

- target keyword
- search intent
- article label: report, analysis, opinion, review, explainer, guide, or roundup
- distinct angle that is not already covered on the site
- content bucket: tech, life, or hybrid
- decision: new draft or update existing URL

Avoid vague, generic tech posts. Prefer titles that promise a concrete outcome.
Keep the publication mix aligned with `references/site_profile.md`.

### 4. Draft the article

Unless the user asks otherwise, produce two separate artifacts:

- a local article brief that follows `references/article_brief_template.md`
- a publishable article body with no internal notes or operational metadata embedded in the HTML

The article itself should include:

- clear headline
- short excerpt
- scannable structure with strong H2s
- natural source links where factual claims depend on reporting, specs, support docs, or announcements
- original examples, screenshots, or concrete product details where possible
- FAQ section when it helps search intent
- tags relevant to the site taxonomy
- image plan that follows `references/image_policy.md`
- source notes that support factual claims

### 5. Create the Ghost draft

Use `scripts/create_draft.mjs` after the duplicate check passes.

Default to `draft`. Do not publish directly unless the user explicitly asks.
If the article is opinion, label it clearly in the draft title, excerpt, or opening framing when needed.
The Ghost draft must include a feature image when the article is created. Do not leave imagery as a separate follow-up task unless the user explicitly asks for text-only drafts.

## Scripts

### `scripts/list_posts.mjs`

Lists recent Ghost posts with status, slug, tags, and update timestamp.

### `scripts/check_duplicate.mjs`

Checks a proposed article against existing Ghost posts using normalized title and slug similarity. It prints a recommended action:

- `create`
- `update-existing-draft`
- `skip-duplicate`

This script is only the first gate. Final topic approval should also use the intent and keyword ownership rules in `references/editorial_controls.md`.

### `scripts/create_draft.mjs`

Creates a Ghost draft post from command-line inputs and can upload a feature image as part of draft creation.

### `scripts/update_post.mjs`

Updates an existing Ghost post or draft and can replace the HTML and feature image.

## Output policy

When using this skill, report:

- what existing content was checked
- what primary keyword and intent were assigned
- whether the topic passed duplicate screening
- what sources were gathered
- what label was assigned to the piece
- what draft was created or why creation was blocked

If a duplicate is detected, name the conflicting post and explain the better next move.
