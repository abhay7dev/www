# FEATURES.md

Supplementary detail for the site. [AGENTS.md](AGENTS.md) is canonical and contains every decision; this file repeats them with extra implementation detail and rationale. If the two disagree, AGENTS.md wins. Keep both in sync when decisions change.

Implementation status: all five scaffold milestones implemented and verified (2026-11-15). Phase 4 design approved 2026-11-16; its full spec lives in AGENTS.md → Design (stages D1–D6), not repeated here.

Status markers: **[confirmed]** user decided · **[recommended]** proposed, awaiting the user · **[open]** undecided · **[deferred]** postponed.

## Delivery milestones [confirmed]

Phase 2 is delivered in order; each milestone builds and is verified before the next starts.

1. **Skeleton** — config, routes, layouts, 404 pages, meta tags + CSP, manifest, placeholder logo/favicon, `.gitignore`, tooling, minimal CSS including article layout.
2. **Blog engine** — discovery, validation, grouping, sorting, URLs, redirects, RSS, sitemap, OG cards, tests.
3. **Markdown pipeline** — Shiki, KaTeX, footnotes, heading anchors, table of contents, tables, callouts, dropdowns.
4. **Components** — tabs, image zoom, embeds, Mermaid, Giscus, image pipeline.
5. **Migration** — the 8 posts from `../blog`.

## Pages

- Homepage, About, Contact, Projects, Experience, Blog. [confirmed] Placeholder content is lorem ipsum sized to the slot; never invented biography or details.
- Licenses page `/licenses`, linked from a one-line footer: own content license first, then implementation (AGPL), article code samples (MIT), then third-party licenses for everything shipped to readers. [confirmed]
- Contact: static links — GitHub `https://github.com/abhay7dev`, LinkedIn `https://linkedin.com/in/abhaygbhat`, X `https://x.com/abhaygb7`; email and résumé present but disabled until supplied. No form. [confirmed]
- Background simulation: not chosen [do not implement the visual]; the scaffold module is approved (AGENTS.md → Design). Full strength on the homepage, dimmed on other non-blog pages; never under `/blog`. Persists across SPA navigation between non-blog pages. Requirements listed in AGENTS.md. [confirmed]

## 404 pages [confirmed]

- Prerendered, styled like every other page, with a link home.
- Under `/blog/…`, the link goes to `/blog` instead.
- Implementation [recommended]: two prerendered pages, `/404.html` and `/blog/404.html` (Cloudflare serves the nearest `404.html` walking up the path). They render with `csr = false` so they do not hydrate against a URL they were not rendered for. Client-side navigation to an unknown route renders `+error.svelte`, which shares the same markup. A top-level `404.html` is mandatory: without it, Cloudflare serves `/` for every unknown path.

## Head, meta tags, security [confirmed]

- Every page: `<title>`, meta description, canonical URL (`https://abhay7.dev/...`), Open Graph (`og:title`, `og:description`, `og:url`, `og:type`, `og:image`, article dates on posts), Twitter/X card, `theme-color`, manifest link, favicon.
- CSP: SvelteKit `csp` config generates a `<meta>` CSP with hashes for its inline scripts. Cloudflare `_headers` sets what a meta tag cannot: `frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. `script-src` stays strict; `style-src` needs `'unsafe-inline'` (Shiki and Mermaid write inline styles). Allowlist additions for Giscus, YouTube (`youtube-nocookie.com`), and X as their components land.
- Open Graph images: one default site image (blocked on the logo), plus a card generated per post at build time (a new dependency is approved; library [open], to be verified under Bun).

## Manifest [confirmed]

- `manifest.webmanifest` with Catppuccin Mocha colors and all logo/icon files. Not a PWA: no service worker, no offline mode.

## Logo and favicon [confirmed]

- **Open until the user says it is solved.** The user will supply the final SVG and PNG.
- Placeholder: copy of `../blog/static/favicon.svg` (and `favicon.ico`), clearly marked as a placeholder.

## Layout and CSS [confirmed]

- Minimal, functional CSS. Mobile responsiveness and performance are requirements.
- Colors as CSS custom properties. Full Mocha + Latte theme approved 2026-11-16 (AGENTS.md → Design).
- Article layout: centered content column, `--measure: 70ch`, full width with gutters on mobile.
- Side table of contents on articles, generated from `#`–`######` headings with correct nesting; sticky right at ≥ 75rem, collapsed `<details>` above the article otherwise.

## Blog model [confirmed]

- Source: `.svx` files in a content directory outside `src/routes` (exact path [open]).
- A directory is a group. One level only; nested groups fail the build.
- Group landing page: `index.svx` in the group folder, frontmatter `title` + `description`, no `date`; the body is the landing page. `index` and `404` are reserved slugs.
- URLs: `/blog/<slug>` standalone; `/blog/<group>/<slug>` grouped; `/blog/<group>` group page. Slug = file name. Slugs are unique across the whole blog, including group names.
- Listing (`/blog`): standalone posts and groups interleaved, newest first. Standalone post sorts by `date`; a group sorts by its newest non-draft post. A group is `<details>` whose `<summary>` contains the group title as a link to the group page; its posts show indented, newest first. Prerendered open; opens on scroll with JS (changed 2026-11-16, see AGENTS.md). No pagination anywhere.
- Ordering tie-break: date descending, then slug ascending.
- Listing data comes from a `+page.server.js` at build time, so article modules never enter the listing's client bundle. [recommended]

### Frontmatter

| Field | Required | Format | Notes |
| --- | --- | --- | --- |
| `title` | yes | string | |
| `date` | posts | `YYYY-MM-DD` | calendar date, no time zone; future date on a non-draft fails the build |
| `updated` | no | `YYYY-MM-DD` | ≥ `date`; displayed; does not affect ordering; future fails the build |
| `description` | yes (posts and groups) | one line, plain text | listing, meta description, RSS, OG |
| `draft` | no | boolean | shown in dev, excluded from production |
| `redirect_from` | no | list of paths | each becomes a 301 in `_redirects` |

Any invalid or missing required field fails the build with the file path in the error.

### Redirects

- Per-post `redirect_from` entries plus a hand-written site-level redirects source (e.g. `/posts/` → `/blog`, old feed `/index.xml` → new feed, `/tags/*`, `/categories/*` → `/blog`) are merged into the built `_redirects`.
- Build fails on: duplicate source, source equal to a live page, malformed path. Cloudflare limit: 2,000 static + 100 dynamic rules.

### Feeds and sitemap

- RSS: every post (standalone and grouped). Full textual content as standalone HTML, rendered at build time with Svelte's server renderer. Interactive components detect feed rendering (Svelte context) and output a "View this on abhay7.dev" link. Images kept with absolute URLs. Math emitted as MathML. Feed path `/rss.xml`.
- Sitemap: every prerendered page, including group pages. Generated without a dependency.

## Rich content

| Feature | Approach | Status |
| --- | --- | --- |
| Syntax highlighting | Shiki at build time as mdsvex's highlighter, theme `catppuccin-mocha` | confirmed |
| Math | KaTeX at build time, `$inline$` / `$$display$$`; KaTeX CSS and fonts self-hosted from the `katex` package | confirmed |
| Mermaid | Rendered client-side; the library loads only on articles containing a diagram; without JS, the diagram source shows as code | confirmed |
| Footnotes | `[^1]` syntax, semantic links + backrefs | confirmed |
| Heading permalinks | `id` on every heading; heading text links to itself (`/post#section`), no visible marker; Markdown headings shifted down one level | confirmed |
| Table of contents | Built from headings at build time, nested, side placement | confirmed |
| Tables | GFM tables, horizontally scrollable on narrow screens | confirmed |
| Callouts | Both GitHub-style `> [!NOTE]` syntax and a `<Callout type="…">` component; types note, tip, info, caution/warning, error/danger; Mocha colors via CSS variables | confirmed |
| Dropdowns | Native `<details>`/`<summary>` | confirmed |
| Tabs | `<Tabs>`/`<Tab label>`; prerendered HTML shows every panel under its own heading; after hydration, the ARIA tabs pattern with arrow-key navigation | confirmed |
| Image zoom | Without JS: the image links to its full-size file. With JS: `medium-zoom` | confirmed |
| Embeds | YouTube: click-to-load, static preview + link is the no-JS view, iframe via `youtube-nocookie.com` on click. X: static quote + link is the no-JS view; `widgets.js` loads only on articles that contain an X embed. **No Gist.** | confirmed |
| Comments | Giscus, fresh setup on `abhay7dev/www`; old comments discarded. Loaded lazily on scroll. Mapping: specific term = slug [recommended] | confirmed |
| Interactive demos | Inline in `.svx` or imported components; trusted executable source | confirmed |

Implementation notes from the probe (see AGENTS.md for full results):

- mdsvex runs as an early Vite transform (not a Svelte preprocessor) so `enhanced-img` sees compiled markup.
- Small local remark plugins: KaTeX → `{@html}`, `[!TYPE]` callouts, relative images → `<enhanced:img>`. Each gets a unit test.
- Packages: `remark-math@3.0.1`, `remark-footnotes@2.0.0`, `rehype-slug`, `rehype-autolink-headings`, `katex`, `shiki`, `@sveltejs/enhanced-img`, `satori`, `@resvg/resvg-js`, `medium-zoom`, `mermaid`, `unist-util-visit`.

All mdsvex plugins must be versions compatible with mdsvex 0.12.8's older remark/rehype generation; each is verified in a probe before adoption.

## Assets and URLs [confirmed]

- Trailing slashes: `'never'` (default). Cloudflare's handling of `/blog/foo/` accepted as-is.
- `src/content/blog/`: posts, group `index.svx` files, and post asset folders (folder named like a sibling `.svx`). Any other folder fails the build.
- `static/` (SvelteKit's public directory, name kept): favicon, manifest, `robots.txt`, `_headers`, site-level redirects source, shared site images. Never blog content.
- `@sveltejs/enhanced-img` for raster images; remark plugin converts relative Markdown image paths into imports; SVG untouched; first image eager, rest lazy; required `alt`; missing files fail the build.

## Fonts

- Fira Sans for text, Fira Code (not Nerd Font) for monospace, KaTeX fonts for math. All self-hosted. The user supplies the Fira files. [confirmed]
- Fira Sans faces: 400, 400 italic, 700, 700 italic — true faces for Markdown `*italic*`, `**bold**`, `***both***`. Each split into Latin and Latin Extended files with `unicode-range`. [confirmed]
- Fira Code: Regular only; no bold/italic files. [confirmed]
- In place: Fira Sans 400/400i/700/700i split into latin + latin-ext (`src/fonts/`), originals in `src/fonts/original/`, Fira Code Regular, OFL texts. [done]
- WOFF2 only (satori reads WOFF2, verified). Fonts under `src/` (hashed, immutable caching). `font-display: swap`. Preload Fira Sans 400 Latin only. OFL text ships with the fonts. [confirmed]

## Licensing [confirmed]

- Implementation code, including components and demos: AGPL-3.0.
- Original article prose and illustrations: © 2026 Abhay Bhat, CC BY-NC-SA 4.0, unless otherwise noted.
- Code samples in articles: MIT.
- Third-party material keeps its own license; OFL text ships with the fonts.

## Migration from `../blog` [confirmed]

Old Hugo site (read-only). 8 standalone posts in `content/posts/`, images in `static/<post>/`. Old URLs `/posts/<slug>/`.

- Convert TOML frontmatter to YAML; keep `title`, `date`, `description`; drop `author`.
- `hello-world`: `2023-04-08T17:27:53-07:00` → `2023-04-08`.
- `discordbot`: description was empty; supplied by the user.
- Move images next to their posts; replace absolute `/post/x.png` paths.
- Add `redirect_from: ["/posts/<slug>/"]` to each post.
- Convert indented code blocks to fenced (mdsvex disables indented code). `discordbot.md` uses them.
- Review raw `<br>` after images.

## Deferred / not planned

- `svelte-check` (requires `typescript`). [deferred]
- CI / GitHub Actions. [deferred]
- Cloudflare preview deployments: off. [confirmed]
- Tags, search. [not planned]
- Scheduled publishing. [not planned]
- Pagination. [not planned]
- Full PWA / service worker. [not planned]
