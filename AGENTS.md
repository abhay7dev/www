# AGENTS.md

Canonical instructions for any agent working in this repository. `CLAUDE.md` only points here; edit this file, not that one.

## Purpose

Abhay Bhat's personal website (6th iteration), eventually at **https://abhay7.dev**: homepage, About, Contact, Projects, Experience, and a Blog. It is a personal site with a blog — not an experiment gallery or documentation site.

Never fabricate biography, contact details, projects, experience, or article content. Use clearly marked placeholders instead.

## Current phase

**Phase 3 — Handoff complete for the approved scaffold (2026-11-15).** All five Phase 2 milestones are implemented and verified. New work (styling/theme, simulation, new features) needs the user's explicit go-ahead; it is not implied by the scaffold approval.

| Phase | Scope | Gate |
| --- | --- | --- |
| 0 | Create `AGENTS.md` and `CLAUDE.md` only | Done |
| 1 | Interview; record confirmed decisions here; present full plan (decisions, file tree, dependencies with reasons, scope, non-scope) | Done; plan approved |
| 2 | Create only the approved scaffold and a project-specific `.gitignore` | Done |
| 3 | Run checks, inspect build output, hand off | Done; stop |

Throwaway compatibility probes go in a scratch directory outside the repo. Never commit, push, deploy, or connect external services without explicit permission for that action. `../blog` (the old site) is read-only source material: never modify it.

## Instruction files

- `AGENTS.md` (this file) is complete and canonical: every confirmed, recommended, unresolved, and deferred decision lives here.
- [FEATURES.md](FEATURES.md) adds extra implementation detail and rationale on top. It never holds a decision missing from this file. If the two disagree, this file wins; fix the other.
- `CLAUDE.md` only imports this file.

## Decision status

Every recorded decision carries one status. Update this file whenever a decision changes status.

- **Confirmed** — the user decided. Do not ask again or reopen unless the user does.
- **Recommended** — proposed by an agent, not yet accepted. Never act on it as if confirmed.
- **Unresolved** — must be decided before the work that depends on it.
- **Deferred** — explicitly postponed by the user. Do not implement.

## Confirmed decisions

### Stack and tooling

- SvelteKit; Svelte for pages and interactive components. mdsvex for blog content, not MDX.
- JavaScript only — application code, config, simulation code, tooling. No TypeScript, and no tool that requires installing the `typescript` package.
  - Runtime validation at content/external boundaries. Selective JSDoc only where it materially helps editor support or API clarity; do not recreate TypeScript in comments.
- Bun is the package manager, script runner, test runner, **and the runtime for the build** (`bun --bun vite build`), locally and on Cloudflare. Any tool that fails under the Bun runtime must be documented as an exception, not silently switched to Node.
- Bun version: production builds use exactly **1.4.4** (Cloudflare `BUN_VERSION=1.4.4`). Local development may use 1.4.4 or later. Upgrading the build version is a deliberate change.
- Cloudflare Pages builds and deploys the site using Bun. **No preview deployments** (production branch only; the user disables previews in the Cloudflare dashboard).
- Formatting: Prettier (+ `prettier-plugin-svelte`). Linting: ESLint (+ `eslint-plugin-svelte`). Tests: `bun test`.
- `bun run verify`: a script that checks the build output (expected pages exist, 404 pages have no scripts, RSS/sitemap/`_redirects` well-formed, client JS per route listed, blog pages never reference the simulation chunk).
- `.gitignore`: `node_modules/`, `.svelte-kit/`, `build/`, `.env*`, `*.log`, `vite.config.js.timestamp-*`, `.DS_Store`, coverage output. `bun.lock` tracked. No `.env.example` (nothing needs secrets; Giscus IDs are public). Replaces the generic template.
- Do not introduce Astro, MDX, React, TypeScript, or a replacement framework unless the user reopens that decision.

### Rendering and navigation

- Prerender every page to static HTML at build time. Work happens at build time where practical: blog discovery, metadata validation, grouping/sorting, highlighting, math, image processing, feeds, any future search index.
- The site behaves as an SPA: SvelteKit client-side routing is enabled and JavaScript loads on all pages, including blog pages. Keep SvelteKit's default hover link preloading.
- Progressive enhancement is mandatory: every page's primary content (prose, Markdown/HTML, links, images) must be present in the prerendered HTML and readable with JavaScript disabled. JavaScript may enhance, never gate, content. (Exception the user accepted: Mermaid diagrams render client-side; see Rich content.)
- Heavy or interactive dependencies stay scoped to the route or article that uses them. The background simulation (when chosen) may run on every non-blog page; it must never load on `/blog` or any page under it.
- Mobile responsiveness and performance are requirements, not polish. Never claim payload sizes or performance without measuring build output.
- 404 pages are real prerendered pages that look like the rest of the site, with a link home. Under `/blog/…` the link goes to `/blog` instead.
- Every page gets the full practical set of meta tags: title, description, canonical, Open Graph, Twitter/X card, theme color, and a Content Security Policy.
- A `manifest.webmanifest` with Catppuccin colors and the site logos. Not a full PWA: no service worker or offline mode.

### Delivery milestones

Phase 2 is delivered in order; each milestone builds and is verified before the next starts.

1. **Skeleton** — config, routes, layouts, 404 pages, meta tags + CSP, manifest, placeholder logo/favicon, `.gitignore`, tooling, minimal CSS including article layout.
2. **Blog engine** — discovery, validation, grouping, sorting, URLs, redirects, RSS, sitemap, OG cards, tests.
3. **Markdown pipeline** — Shiki, KaTeX, footnotes, heading anchors, table of contents, tables, callouts, dropdowns.
4. **Components** — tabs, image zoom, embeds, Mermaid, Giscus, image pipeline.
5. **Migration** — the 8 posts from `../blog`.

### Pages, head, and security

- Pages: Homepage, About, Contact, Projects, Experience, Blog, Licenses. Placeholder content only.
- Contact: static page, no form, no backend. Links: GitHub, LinkedIn (`https://linkedin.com/in/abhaygbhat`), X (`https://x.com/abhaygb7`) — LinkedIn and X copied from the old site's config. Email and résumé entries exist in the source but stay disabled until the user supplies them. GitHub URL to be confirmed by the user (not in the old config).
- Footer: one line linking to `/licenses`. The licenses page lists the user's own content license first (CC BY-NC-SA 4.0 prose/illustrations, MIT article code samples, AGPL-3.0 implementation), then every third-party license for material shipped to readers (fonts, KaTeX CSS/fonts, client libraries, Catppuccin palette).
- 404 pages are prerendered, look like every other page, and link home; under `/blog/…` the link goes to `/blog`. A top-level `404.html` is mandatory (without it Cloudflare serves `/` for every unknown path).
- Every page: `<title>`, meta description, canonical URL on `https://abhay7.dev`, Open Graph (`og:title`, `og:description`, `og:url`, `og:type`, `og:image`, article dates on posts), Twitter/X card, `theme-color`, manifest link, favicon.
- CSP: SvelteKit's `csp` config emits a `<meta>` CSP with hashes for its inline scripts; Cloudflare `_headers` sets what a meta tag cannot (`frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`). `script-src` stays strict; `style-src` allows `'unsafe-inline'` (Shiki and Mermaid inline styles). Allowlist entries for Giscus, YouTube (`youtube-nocookie.com`), and X are added as their components land.
- Open Graph images: a default site image (blocked on the logo) plus a card generated per post at build time. A new dependency for card generation is approved; the library must be verified under Bun.
- `manifest.webmanifest` with Catppuccin Mocha colors and all logo/icon files. Not a PWA: no service worker, no offline mode.

### Blog

- Articles are `.svx` files in a content directory outside `src/routes`, served by dynamic routes. Discovery, validation, grouping, and sorting happen at build time, never by fetching metadata in the browser. The listing's data comes from a `+page.server.js` so article modules never enter its client bundle.
- A directory in the blog content directory is a group. Exactly one level: a group cannot contain a group. Each group has a landing page `index.svx` (frontmatter `title`, `description`; no `date`) whose body is the landing page and whose title is the group's title. `index` and `404` are reserved slugs.
- URLs: standalone posts `/blog/<slug>`; grouped posts `/blog/<group>/<slug>`; group pages `/blog/<group>`. Slug = file name. Slugs are unique across the whole blog, including group names; collisions fail the build.
- Listing (`/blog`): standalone posts and groups interleaved, newest first. A standalone post sorts by its `date`; a group sorts by its newest non-draft post. A group is a native `<details>`, closed by default; its `<summary>` holds the group title as a link to the group page; expanding it shows its posts indented, newest first. Ties: date descending, then slug ascending. No pagination anywhere.
- Frontmatter:
  - `title` — required.
  - `date` — required on posts, `YYYY-MM-DD`, calendar date, no time zone.
  - `updated` — optional `YYYY-MM-DD`, ≥ `date`, displayed, does not affect ordering.
  - `description` — required on posts and groups; one line of plain text; used in listings, meta description, RSS, OG.
  - `draft` — optional boolean; drafts show in dev and are excluded from production.
  - `redirect_from` — optional list of old paths; each becomes a 301 in the built `_redirects`.
- Build failures: invalid or missing required fields (error names the file), a future `date` or `updated` on a non-draft, nested groups, duplicate slugs, duplicate redirect sources, a redirect source equal to a live page, malformed redirect paths. No scheduled publishing.
- Redirects: per-post `redirect_from` plus a hand-written site-level redirects source (e.g. `/posts/` → `/blog`, old feed `/index.xml` → new feed, `/tags/*` and `/categories/*` → `/blog`), merged into the built `_redirects`. Cloudflare limit: 2,000 static + 100 dynamic rules.
- RSS at `/rss.xml`: every post (standalone and grouped), full textual content as standalone HTML rendered at build time with Svelte's server renderer. Interactive components detect feed rendering through Svelte context and output a "View this on abhay7.dev" link. Images kept with absolute URLs. Math emitted as MathML. Part of the first implementation.
- Sitemap: every prerendered page including group pages, generated without a dependency. Part of the first implementation.
- Article layout: centered content column, about half the viewport on desktop (exact width undecided), full width with gutters on mobile. Side table of contents generated from headings with correct nesting. Heading permalinks (`/post#section`).
- Tags and search are not planned.
- mdsvex articles are trusted executable source. Never describe them as sandboxed or safe Markdown.

### Rich content

All in scope for Phase 2. **Approved deviations:** mdsvex runs as an early Vite transform (not a Svelte preprocessor) so `enhanced-img` sees compiled markup; three small local remark plugins (KaTeX → `{@html}`, `[!TYPE]` callouts, relative images → `<enhanced:img>`), each unit-tested. Every mdsvex plugin must be verified compatible with mdsvex 0.12.8's older remark/rehype generation in a probe before adoption.

- Syntax highlighting: Shiki at build time as mdsvex's highlighter, theme `catppuccin-mocha`.
- Math: KaTeX at build time, `$inline$` and `$$display$$`; KaTeX CSS and fonts self-hosted from the `katex` package as a separate font set.
- Mermaid: rendered client-side; the library loads only on articles containing a diagram; without JS the diagram source shows as code.
- Footnotes: `[^1]` syntax, semantic links and back-references.
- Heading anchors: `id` on every heading plus a visible anchor link.
- Tables: GFM tables, horizontally scrollable on narrow screens.
- Callouts: both GitHub-style `> [!NOTE]` syntax and a `<Callout type="…">` component, types note, tip, info, caution/warning, error/danger, colored with Catppuccin Mocha CSS variables.
- Dropdowns: native `<details>`/`<summary>`.
- Tabs: `<Tabs>`/`<Tab label>`; prerendered HTML shows every panel under its own heading; after hydration, the ARIA tabs pattern with arrow-key navigation.
- Image zoom: without JS the image links to its full-size file; with JS, `medium-zoom`.
- Embeds: YouTube and X only. **No Gist support** (user does not want possibly outdated content displayed).
  - YouTube: click-to-load; a static preview plus link is the no-JS view; the iframe (`youtube-nocookie.com`) loads only on click.
  - X: the post is authored as a static quote with a link (the no-JS view); X's `widgets.js` loads only on articles that contain an X embed.
- Comments: Giscus, loaded lazily when the comments area scrolls into view. Set up fresh against this repository (`abhay7dev/www`); old-site comments are discarded, not migrated.
- Interactive demos: inline in `.svx` or imported components.
- Third-party embeds and Giscus never load eagerly and are reflected in the CSP.

### Migration

- Initial blog content is migrated from the old Hugo site at `../blog` (`https://github.com/abhay7dev/blog`). It is read-only source material: never modify it.
- 8 standalone posts in `content/posts/*.md`, images in `static/<post>/`. Old post URLs were `/posts/<slug>/`.
- Steps: convert TOML frontmatter to YAML; keep `title`, `date`, `description`; drop `author`; `hello-world` date `2023-04-08T17:27:53-07:00` becomes `2023-04-08`; move images next to their posts; add `redirect_from: ["/posts/<slug>/"]`; convert indented code blocks to fenced blocks (mdsvex disables indented code: they render as paragraphs; `discordbot.md` uses them); review raw `<br>` after images.
- `discordbot.md` has an empty description: the user must supply it. Never invent missing content during migration.

### Assets, images, URLs

- Trailing slashes: SvelteKit default `'never'` (`/blog/foo` → `blog/foo.html`). Whatever Cloudflare does with `/blog/foo/` is acceptable.
- Blog content directory: `src/content/blog/`. Never copied to public output.
- A folder in it is a **group** only if it contains `index.svx`. A folder with the same name as a sibling `.svx` file holds that post's assets (e.g. `graphics/raytracing.svx` uses `graphics/raytracing/fig.png`). Any other folder fails the build.
- The public directory keeps SvelteKit's name, `static/`, copied without transformation. It holds site-wide files only (favicon, manifest, `robots.txt`, `_headers`, the site-level redirects source, shared site images), never blog content.
- Images: `@sveltejs/enhanced-img` at build time — `<picture>` with AVIF/WebP variants plus fallback, responsive sizes, intrinsic `width`/`height`. A small remark plugin turns relative Markdown images into processed imports. SVGs pass through unprocessed. Lazy-load except the first image on a page. Missing `alt` text or a missing image file fails the build.

### Fonts

- Files are supplied by the user; agents never download fonts. Unneeded files from the user's downloads were deleted at the user's request.
- Fira Sans: 400, 400 italic, 700, 700 italic (true faces for Markdown bold/italic). Each split into Latin and Latin Extended files with `unicode-range`. Split once with `subset-font` (Google Fonts latin / latin-ext ranges) outside the repo; split files in `src/fonts/`, unsplit originals in `src/fonts/original/` (not served) for re-splitting.
- Fira Code: Regular only (`src/fonts/FiraCode-Regular.woff2`, unsplit). No bold or italic in code; the user accepts upright/synthesized emphasis there.
- Format: WOFF2 only. satori 0.63 reads WOFF2 directly (verified: identical glyph output to WOFF), so no TTF/OTF copies are needed for OG cards.
- OFL texts supplied by the user: `src/fonts/OFL-FiraSans.txt`, `src/fonts/OFL-FiraCode.txt`, also shown on `/licenses`.
- Font files live under `src/` so Vite hashes them (immutable caching). `font-display: swap`. Preload only Fira Sans 400 Latin. OFL license text ships alongside.

### Licensing

- Website implementation code, including executable components and interactive demos: AGPL-3.0 (`LICENSE`).
- Original article prose and illustrations: © 2026 Abhay Bhat, CC BY-NC-SA 4.0, unless otherwise noted.
- Code samples presented in articles: MIT.
- Third-party material (including fonts) retains its own license; ship required notices (e.g. OFL text with fonts).

### Visual direction

- Self-hosted fonts only; no font CDN or third-party stylesheet. General text: **Fira Sans**. Monospace: **Fira Code** (plain, not the Nerd Font variant). KaTeX fonts are the accepted exception for math. The user supplies the Fira files; agents do not download fonts. Do not substitute other fonts without asking.
- **Favicon and personal logo are open until the user says they are solved.** Placeholder: the old site's `favicon.svg`/`favicon.ico`, marked as a placeholder. Do not design a logo.
- Catppuccin Mocha is the future theme. **Not implemented yet**, except where the user explicitly asked: Shiki `catppuccin-mocha` code theme, manifest colors, and callout colors. Colors are always CSS custom properties.
- Scaffold CSS is minimal and functional: readability, document flow, usable controls, media/code/table overflow, visible focus, accessibility, responsive layout, math rendering, plus the two approved layout asks (narrow centered article column, side table of contents). No full palette, theme switcher, polished nav, animation, gradients, cards, CSS framework, or component library. Do not style and call it scaffolding.

### Background simulation

- One simulation/generative background, not yet chosen. Do not choose or implement it.
- Scope: may appear on every non-blog page (homepage, About, Contact, Projects, Experience, Licenses), never under `/blog`. Expected structure: a SvelteKit layout group for non-blog pages owns the background, so it persists across SPA navigation between those pages and is destroyed on entering `/blog`.
- Requirements for whatever is chosen: decorative (`aria-hidden`, no content inside); `prefers-reduced-motion` shows a still frame or nothing; visible pause/play control, choice remembered in `localStorage` (wrapped in try/catch); suspend when the tab is hidden or the canvas is offscreen; cap resolution and frame rate on mobile/low-power; if a required feature (e.g. WebGL) is missing, fall back silently to the plain background; overlaid text stays legible; no layout shift; full cleanup on destroy; loaded with dynamic `import()` in `onMount`.

### Implementation conventions (approved with the plan)

- Client-side rendering stays on site-wide; `prerender = true` in the root layout. Server endpoints (`+server.js`) must export `prerender = true` themselves.
- 404s: prerendered `/404.html` and `/blog/404.html` with `csr = false`; `+error.svelte` renders the same `NotFound` component for client-side navigation. `paths.relative = false` so 404 pages work at any depth.
- Simulation (when chosen): mounted in `src/routes/(site)/+layout.svelte`, loaded via dynamic `import()` in `onMount`, full cleanup on destroy (client routing never unloads the page).
- Article column `--measure: 70ch`; side TOC at ≥ 75rem, collapsed `<details>` above the article otherwise.
- Giscus: mapping `specific`, term = post slug; hidden until `repoId`/`categoryId` are filled in `src/lib/site.js`.
- Inline interactive demos in articles go inside `<Interactive>` so the RSS feed shows a link instead. Custom interactive components read `getContext('feed')` and render a link when it is set.
- `INCLUDE_DRAFTS=1` includes drafts in a production build for preview; never for deploys.
- Fixtures: `src/content/blog/pipeline-fixture.svx` and `src/content/blog/fixture-group/` are drafts that exercise every pipeline feature; they are not real content and never ship.
- Prerender failures are intentional guards: broken internal links, missing `#ids`, and unseen routes other than the two blog post routes fail the build.
- Kit `version.name` is `CF_PAGES_COMMIT_SHA` (or `local`) so builds are deterministic.

## Unresolved decisions

- Giscus repository/category IDs (user enables Discussions and the giscus app).
- PNG screenshots: enhanced-img's fallback for opaque PNGs is JPEG (alpha PNGs keep PNG); the user has not chosen whether to force PNG fallbacks.
- Final favicon/logo and default OG image design.

## Deferred decisions

- CI: deferred. No GitHub Actions.

- `svelte-check`: requires the `typescript` package as a non-optional peer; deferred per the no-TypeScript-install rule. Bun's built-in TS support is transpile-only and cannot replace it.

## Engineering standards

- Clear, idiomatic JavaScript. Correct before clever; efficient without speculative optimization.
- Small cohesive modules; explicit ownership of state and side effects; clear browser/server/build boundaries.
- Clean up animation frames, listeners, observers, and other resources.
- Deterministic sorting and build output.
- Semantic, accessible HTML.
- Meaningful tests over coverage targets. Minimal dependencies, each with a stated reason.
- Comments explain non-obvious intent, not syntax. No abstractions for hypothetical needs.
- Use current stable, mutually compatible versions verified against official docs and package metadata. Never mix snippets from incompatible framework generations.
- Use maintained solutions instead of custom parsers, sanitizers, cryptography, or complex asset tooling.

## Honesty about verification

- Do not invent commands, scripts, or package names. Only document commands that exist in the repository.
- Do not claim a check, build, or test ran or passed unless it actually ran in this session; report real output. If a check could not run, say why.
- Do not fabricate compatibility claims, benchmarks, or payload sizes.

## Verified facts (2026-11-15)

Checked against npm metadata, official docs, and a throwaway probe built outside the repo. Re-verify after upgrades.

- Current stable: `@sveltejs/kit` 3.2.0 (requires Node ≥ 22.17, Svelte ≥ 5.57.1, Vite ≥ 8.0.12, vite-plugin-svelte 7), `svelte` 5.57.3, `vite` 8.3.8, `@sveltejs/adapter-static` 4.0.1, `mdsvex` 0.12.8, `eslint` 10, `eslint-plugin-svelte` 3, `prettier` 3, `prettier-plugin-svelte` 4. TypeScript is an optional peer of Kit.
- SvelteKit 3 removed `svelte.config.js`; config (adapter, `preprocess`, `extensions`) goes to the `sveltekit()` Vite plugin in `vite.config.js`. `$lib` became `#lib` (package.json `imports`, explicit file extensions). `$app/environment` → `$app/env`; `$app/stores` removed. Snippets written for SvelteKit 1/2 are wrong here.
- `csr = false` ships no JavaScript and makes links full-page navigations. Page options cascade from layouts; children override. They are per route module, not per `[slug]` entry.
- mdsvex 0.12.8 uses an older unified/remark generation; remark/rehype plugins must be versions compatible with it. Generated HTML containing `{`/`}` can break Svelte compilation.
- Probe (`sv create` minimal, no types, + prettier, eslint, mdsvex, adapter-static, Bun 1.4.4): `bun --bun vite build` prerendered an mdsvex `+page.md` with content in HTML; `prettier --check` and `eslint` ran under `bun --bun`; `typescript` was not installed.
- Cloudflare Pages: v3 build image ships Bun 1.4.4 and Node 22.23.4; Bun pinned via `BUN_VERSION` (no version file documented). Docs don't say whether Pages detects `bun.lock`; `SKIP_DEPENDENCY_INSTALL=1` disables auto-install. `/about.html` serves at `/about`. Nearest `404.html` up the directory tree is served for missing paths; **with no top-level `404.html`, Pages serves `/` for every unknown path.**
- Cloudflare `_redirects`: max 2,000 static + 100 dynamic rules, 1,000 chars per line, top-most rule wins, redirects apply even if a file exists at the source path; Bulk Redirects run in front of it. `_headers`: max 100 rules, 2,000 chars per line; duplicate headers are comma-joined.

### Probe results for the rich-content pipeline (2026-11-15)

All under `bun --bun vite build` and `vite dev` with Bun 1.4.4, SvelteKit 3.2.0, mdsvex 0.12.8. Probe lived in the session scratchpad, not this repo.

- mdsvex bundles pre-micromark `remark-parse`. Remark *syntax* plugins must be the old generation: `remark-math@3.0.1` and `remark-footnotes@2.0.0` work. Rehype transformers work at current versions: `rehype-slug@6`, `rehype-autolink-headings@7`.
- `rehype-katex` **fails**: KaTeX's TeX annotation contains `{…}`, which Svelte parses as expressions (`ReferenceError: a is not defined` at prerender). Working approach: a ~10-line remark plugin calling `katex.renderToString` and emitting `{@html "…"}`.
- `remark-github-blockquote-alert` **does nothing**: the old parser reads `[!NOTE]` as a shortcut `linkReference` labelled `!NOTE`. Working approach: a ~25-line remark transformer producing `<aside class="callout callout-<type>">` that fails on unknown types.
- Shiki 4 as mdsvex `highlight.highlighter`, wrapped as `{@html \`${escapeSvelte(html)}\`}`: works, including braces/backticks in code and untagged blocks.
- mdsvex disables indented code blocks (rendered as paragraphs).
- `@sveltejs/enhanced-img` transforms markup in a Vite `order: 'pre'` hook that runs before Svelte preprocessors, so with mdsvex as a preprocessor it parses raw Markdown and fails. Working approach: run mdsvex `compile()` in a small Vite plugin (`enforce: 'pre'`, `transform.order: 'pre'`, `.svx` filter) placed before `enhancedImages()`, instead of in `preprocess`. A remark plugin turns relative Markdown images into `<enhanced:img … loading="lazy">` and fails on missing alt. Output: `<picture>` AVIF/WebP/JPEG at 1x/2x with width/height (a 141 KB PNG became an 8 KB AVIF at 1x). Note the raster fallback for a PNG source was JPEG.
- Typing `<enhanced:img>` directly in `.svx` text gets its quotes curled by mdsvex smartypants; emit it from the remark plugin instead.
- `satori@0.63` + `@resvg/resvg-js@2.6` generate a 1200×630 PNG under Bun (needs a TTF/OTF font).
- RSS full text: `render()` from `svelte/server` inside a prerendered `+server.js` renders an imported `.svx`; a component reading a `feed` context swaps itself for a link. Works.
- A route with `csr = false` (e.g. `/blog/404`) prerenders with zero `<script>` tags and no `_app` references.

## Existing repository notes

- `LICENSE` is AGPL-3.0. `README.md` documents commands, Cloudflare settings, and where things go.
- Migrated posts: bodies copied verbatim from `../blog` except image paths and one fixed link (`uptime-kuma-termux`: `github.com/...` lacked `https://`); `discordbot` description supplied by the user; `diffiehellman` image alt text rewritten at the user's request.
