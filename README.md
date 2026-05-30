# Journalists

Editorial tooling and Ghost theme work for Tech With Life.

## Contents

- `ghost-seo-publisher/` - Codex skill, references, and scripts for planning, deduping, and creating Ghost article drafts.
- `drafts/` - Local article briefs and HTML drafts.
- `references/NewsMagazineRef/` - Static reference designs used for the magazine theme.
- `techwithlife-editorial/` - Custom Ghost theme source for Tech With Life.
- `decisions/` - Durable editorial, product, taxonomy, and theme decisions.

## Ghost Theme

The theme source lives in `techwithlife-editorial/`.

Validate it with:

```bash
npx --yes gscan@latest techwithlife-editorial
```

Package it for Ghost Admin upload with:

```bash
cd techwithlife-editorial
zip -r ../techwithlife-editorial.zip .
```

Then upload `techwithlife-editorial.zip` in Ghost Admin under:

`Settings` -> `Design & branding` -> `Change theme` -> `Upload theme`

## Secrets

Ghost Admin API credentials belong in a local `.env` file and are intentionally ignored by Git.
