# Editorial Controls

## 1. Preventing content cannibalization

The core rule is:

**one primary search intent per canonical article**

Before approving a new topic, identify:

- primary keyword
- secondary keywords
- search intent
- article label
- closest existing site URL

Reject or reroute the topic when an existing post already owns the same primary intent.

### Decision rules

Create a new article only when at least one of these is true:

- it targets a meaningfully different keyword cluster
- it serves a different intent such as report vs buying guide
- the existing coverage is too old or too thin and should be replaced with a new canonical article

Update an existing post when:

- the same core query is already covered
- the article mostly needs fresher sources, screenshots, sections, or metadata
- the article can be expanded to satisfy the intent better than creating a second page

Skip the topic when:

- the site already has a strong page for that intent
- the difference is only wording, not intent

### Practical cannibalization checks

Use all of these:

1. Ghost post inventory
2. title and slug similarity
3. keyword and intent comparison
4. Search Console page/query mapping when available

If Search Console is available, check whether the proposed keyword already drives impressions to an existing page. If it does, prefer improving that page.

## 2. Source requirements

Factual articles must have a source packet before drafting.

### Minimum source bar

For reports, explainers, and analysis:

- at least 2 authoritative sources
- at least 1 primary source whenever possible

Good primary sources include:

- company blog posts
- press releases
- earnings reports
- official documentation
- product pages
- government or regulatory documents
- direct interviews

Secondary sources can be used for context, but should not replace primary sources when primary material exists.

### Source usage rules

- do not draft factual claims without a supporting source
- do not copy competitor framing or structure too closely
- distinguish confirmed facts from interpretation
- if a fact is unstable or very recent, verify it again before final draft creation
- for reports, explainers, analysis, and source-driven guides, expose sources to readers with natural inline links and/or a short "Sources" section at the end
- keep citations readable; do not turn the article into an academic footnote block
- prioritize primary-source links when the claim comes directly from an announcement, support page, spec sheet, filing, or documentation

## 3. Draft-only publishing

All outputs should remain drafts in Ghost unless the user explicitly instructs otherwise.

Default workflow:

1. research
2. article brief
3. draft article
4. image plan
5. Ghost draft creation
6. human review

## 4. Article labels

Every article must be labeled in the working brief as one of:

- report
- analysis
- opinion
- review
- explainer
- guide
- roundup

### Label rules

**Report**
- centered on new facts, announcements, or events
- relies on fresh sources

**Analysis**
- interprets the significance of a development
- clearly separates facts from takeaways

**Opinion**
- explicitly framed as viewpoint
- grounded in facts, but allowed to argue

**Review**
- based on first-hand use whenever possible
- should explain test basis

**Explainer**
- teaches the reader what something is and why it matters

**Guide**
- helps the reader complete a task

**Roundup**
- compares multiple options or developments using explicit criteria

When the piece is opinion, say so clearly in the brief and opening framing.
