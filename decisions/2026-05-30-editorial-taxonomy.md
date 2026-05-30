# Editorial Taxonomy and Theme Labeling

Date: 2026-05-30

## Decision

Tech With Life will use a small set of durable reader-facing section tags:

- AI
- Apps
- Platforms
- Gadgets
- Guides
- Reviews
- Life

These are the only tags that should behave like top-level editorial sections.

## Rationale

The site should feel like a mainstream technology publication, not a company-indexed blog. Labels such as Google, Meta, OpenAI, Apple, and Samsung are useful, but they are entities/topics rather than editorial sections.

The theme previously surfaced the first Ghost tag as the visible category label. When company tags were first, homepage cards and article headers displayed labels like Google and Meta. That made the site feel less organized and less editorial.

The desired reader-facing structure is:

- section/category first
- article type second
- company/product/topic tags after that

## Tag Order Rule

Every post must put one main section tag first:

```text
AI
Apps
Platforms
Gadgets
Guides
Reviews
Life
```

Article-type tags should come next:

```text
Reports
Explainers
Buying Guides
Reviews
Opinion
Roundups
```

Company, product, and topic tags should come after those:

```text
Google
Meta
OpenAI
Apple
Samsung
Spotify
Chrome
Android XR
MacBook Pro
AWS
Gemini
```

## Examples

```text
AI, Reports, OpenAI, ChatGPT, Codex
Platforms, Reports, Meta, Facebook, Instagram, Security
Apps, Reports, Spotify, Streaming, Families
Guides, Buying Guides, Apple, MacBook Pro, Laptops
Gadgets, Reports, Google, Samsung, Android XR, XR
```

## Existing Posts Updated

The current published posts were updated through the Ghost Admin API to use the new order:

```text
Google and Samsung Roll Out 5 New Android XR Features
Gadgets, Reports, Google, Samsung, Android XR, XR

OpenAI Introduces GPT-5.5, Its New Flagship Model for Coding and Research
AI, Reports, OpenAI, ChatGPT, Codex

Meta Account Is Replacing Accounts Center Over the Next Year
Platforms, Reports, Meta, Facebook, Instagram, Security

Meta Signs AWS Graviton Deal to Power Its Next Wave of Agentic AI
AI, Reports, Meta, AWS, Infrastructure

Gemini in Chrome Features Explained: Side Panel, Auto Browse, and Connected Apps
AI, Explainers, Google, Chrome, Gemini

Spotify's New Video Controls Let Families Turn Off Music Videos and Canvas
Apps, Reports, Spotify, Streaming, Families

Apple M5 Pro vs M5 Max: Which MacBook Pro Should You Buy?
Guides, Buying Guides, Apple, MacBook Pro, Laptops, Explainers
```

## Theme Impact

The Ghost theme uses the first public tag as the visible primary section label in:

- homepage hero metadata
- homepage card metadata
- The Index
- article header metadata
- related/read-next cards

The homepage section blocks should align to the seven main section tags:

```text
AI
Apps
Platforms
Gadgets
Guides
Reviews
Life
```

Do not create top navigation tabs or homepage sections for every tag. Company/product tags remain useful for archive pages, related content, search, and SEO, but they should not drive the top-level site structure.

## Workflow Impact

Future Ghost drafts should enforce the same tag order. The publisher scripts were updated so `create_draft.mjs` and `update_post.mjs` require at least one of the seven main section tags and reorder tags into:

```text
main section, article type, entity/topic tags
```

## Related Files

- `ghost-seo-publisher/references/site_profile.md`
- `ghost-seo-publisher/references/editorial_controls.md`
- `ghost-seo-publisher/references/article_brief_template.md`
- `ghost-seo-publisher/scripts/create_draft.mjs`
- `ghost-seo-publisher/scripts/update_post.mjs`
- `techwithlife-editorial/index.hbs`
