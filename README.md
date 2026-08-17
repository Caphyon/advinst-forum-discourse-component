# Category Table View

A Discourse theme component that turns a category's subcategory list into a
classic phpBB-style forum-index table — Topics / Posts / Last post columns —
instead of Discourse's default card-based subcategory boxes. It also adds a
configurable "Author" column to the main topic list.

Built to make a Discourse category page visually resemble a phpBB forum index.

## What it does

1. **Adds a real "Posts" column** to the subcategory board. Discourse tracks
   `category.post_count` but never surfaces it in the built-in subcategory
   table styles. A plugin-outlet connector inserts a `<td>` with the post
   count next to the existing Topics column.

2. **Relabels "Latest" → "Last post" and adds a matching header** on the
   subcategory board. There is no plugin outlet inside a Discourse `<thead>`,
   so the header row is patched via a small, idempotent DOM patch
   (`MutationObserver`-free, retried a bounded number of times on page change
   to survive the SPA's async render).

3. **Shows the last poster's username** under the last-post topic title/date
   on the subcategory board, as `by <username>`, linking to their user
   profile — mimicking phpBB's "by Author" line.

4. **Hides the topic list below the subcategory board** on the configured
   homepage category's page, so visitors only see the subcategory table (like
   a phpBB forum index), not a duplicated topic list underneath it.

5. **Redirects the site homepage** to the configured category, so `/` behaves
   like a phpBB `index.php` landing on the main forum board instead of
   Discourse's default latest-topics view.

6. **Adds a configurable "Author" column to the main topic list**
   (category/latest/top pages — the standard `table.topic-list`, distinct
   from the subcategory board table above), showing the topic creator's
   avatar and/or username, phpBB-style. Also hides Discourse's default
   contributor-avatars ("posters") column so the same info isn't shown twice.

7. **Styling**: dark navy `<thead>`, zebra-striped rows, borders on the
   subcategory board — a compact table look closer to traditional forum
   software than Discourse's default spacious card list.

## Files

| File | Purpose |
|---|---|
| `about.json` | Component metadata (Discourse theme-component manifest). |
| `settings.yml` | Component settings — see below. |
| `common/common.scss` | All styling: subcategory board table, Author column, mobile fixup, `#list-area` hiding. |
| `javascripts/discourse/api-initializers/homepage-category.js` | Redirects `/` to the configured category; toggles the `ai-forum-index` body class on its page. |
| `javascripts/discourse/api-initializers/subcategory-table-headers.js` | DOM-patches the subcategory board's `<thead>` to add a "Posts" header and relabel "Latest" to "Last post". |
| `javascripts/discourse/api-initializers/author-column.js` | Registers the "Author" column on the topic list (desktop via the `topic-list-columns` value transformer, mobile via plugin outlets). |
| `javascripts/discourse/components/author-column-header.gjs` | `<th>` for the Author column. |
| `javascripts/discourse/components/author-column-content.gjs` | `<td>`/mobile content for the Author column — avatar and/or username, per settings. |
| `javascripts/discourse/connectors/category-list-after-topics-section/posts-count.gjs` | Plugin-outlet connector rendering the subcategory board's Posts `<td>`. |
| `javascripts/discourse/connectors/category-list-after-latest-section/last-post-author.gjs` | Plugin-outlet connector rendering the subcategory board's "by `<username>`" line. |
| `package.json` / `scripts/build-zip.js` | `npm run zip` packages the component into `dist/*.zip` for "Install → From your device". Dev-only, not needed for a git-based install. |

## Settings

Configurable from Admin → Customize → Themes → this component → Settings:

| Setting | Values | Default | Effect |
|---|---|---|---|
| `homepage_category` | category picker | *(none)* | The category to redirect `/` to and to treat as the forum-index page. Leave empty to disable both the redirect and the topic-list-hiding behavior. |
| `author_column_enabled` | boolean | `true` | Turns the Author column on/off entirely (and un-hides the default posters column when off). |
| `author_column_display` | `avatar_and_username` / `avatar_only` / `username_only` | `avatar_and_username` | What to show in the column. |
| `author_column_position` | `left` / `center` / `right` | `center` | Where to place it: before the topic title, before Replies (phpBB-style, default), or at the end. |

**`homepage_category` UI note:** Discourse has no plain "pick one category"
setting type, so this is an `objects` setting with a single schema row. Click
**"Add"**, then pick the category from the dropdown that appears, then save.
(See the comment in `settings.yml` for why the stored value is a nested array
— `[{ category_id: [123] }]` — even though only one category can be picked.)

## Configuration

Set **`homepage_category`** to whichever category should act as the site's
forum-index landing page. `homepage-category.js` then:

- redirects `/` to that category, and
- toggles an `ai-forum-index` class on `<body>` while browsing that category,
  which `common.scss` uses to hide `#list-area` (the topic list below the
  subcategory board).

Both behaviors are driven by this one setting — no slug is hardcoded or kept
in sync between JS and CSS. Leave it empty to disable both; the Posts column,
header relabel, last-post-author styling, and Author column all work
independently of it.

## Category prerequisites

For the subcategory table to render at all (a native Discourse feature this
component styles/extends, not one it creates), the parent category needs:

- `show_subcategory_list = true`
- `subcategory_list_style = "rows_with_featured_topics"`
- `num_featured_topics = 1` (so each subcategory row has a "latest topic" to
  show a last-post-author for)

## Known limitations

- **Subcategory board is desktop only.** Discourse renders entirely
  different markup for the subcategory board on mobile viewports (no
  `<table>`, no matching outlets), so none of its table/column/header styling
  applies there yet. (The Author column on the main topic list *does* work on
  mobile — see below.)
- The subcategory board's header patch (`subcategory-table-headers.js`) is a
  DOM-manipulation workaround, not a supported Discourse plugin-outlet,
  because no outlet exists inside `<thead>` as of this writing. It's written
  defensively (idempotent via a `.ai-forum-patched` marker class, bounded
  retries) but is inherently more fragile to Discourse core markup changes
  than the outlet connectors are.
- The Author column's mobile rendering reuses the same `<td>`-emitting
  component inside a non-table plugin outlet (the same trick the official
  `discourse-topic-list-author` component uses) — `common.scss` strips the
  table-cell box model back off for that context. If a future Discourse
  version changes those outlet names/markup, this is the first place to
  check.

## Local development / packaging

```
npm install
npm run zip
```

Produces `dist/category-table-view-<version>.zip`, ready for Admin →
Customize → Themes → Install → "From your device".

**Zip installs have no update-in-place.** Re-uploading a zip always creates a
brand-new component (Discourse only offers an "Update to latest" button for
git-installed themes/components). So the workflow when iterating locally is:
delete the existing component → re-upload the new zip → reattach it to the
parent theme(s) → **reconfigure settings from scratch** (they don't carry
over). For anything beyond quick local testing, installing via "From a git
repository" instead avoids this — it gets a real update button that
preserves settings.

## Installation

In Discourse admin → Customize → Themes → Install → "From a git repository" or
"From your device" (upload as a `.zip`, see above), pointing at this
repository/folder. Then attach it as a component to whichever parent theme(s)
you want it applied to.
