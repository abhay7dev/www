# AGENTS.md

Canonical instructions for any agent working in this repository. `CLAUDE.md` only points here; edit this file, not that one.

## Purpose

Abhay Bhat's personal website (6th iteration), eventually at **https://abhay7.dev**: homepage, About, Contact, Projects, Experience, and a Blog. It is a personal site with a blog — not an experiment gallery or documentation site.

Never fabricate biography, contact details, projects, experience, or article content. Use clearly marked placeholders instead.

## Current phase

**Phase 4 — Design implementation (approved 2026-11-16).** The design in [Design](#design-phase-4) was settled in an interview and approved. It is delivered in stages D1–D6; each stage builds, passes `bun run verify`, and is reviewed by the user running in dev before the next starts.

| Phase | Scope | Gate |
| --- | --- | --- |
| 0 | Create `AGENTS.md` and `CLAUDE.md` only | Done |
| 1 | Interview; record confirmed decisions here; present full plan (decisions, file tree, dependencies with reasons, scope, non-scope) | Done; plan approved |
| 2 | Create only the approved scaffold and a project-specific `.gitignore` | Done |
| 3 | Run checks, inspect build output, hand off | Done |
| 4 | Design stages D1–D6 (see Design) | In progress; user review after each stage |

Throwaway compatibility probes go in a scratch directory outside the repo. **No git operations at all** (no add, commit, branch, stash, push): the user handles version control. Never deploy or connect external services without explicit permission for that action. `../blog` (the old site) is read-only source material: never modify it.

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

- Pages: Homepage, About, Contact, Projects, Experience, Blog, Licenses. Placeholder content is lorem ipsum, sized to the slot (short for a tagline, paragraphs for About); never invented facts.
- Contact: static page, no form, no backend. Links: GitHub (`https://github.com/abhay7dev`, confirmed by the user), LinkedIn (`https://linkedin.com/in/abhaygbhat`), X (`https://x.com/abhaygb7`) — LinkedIn and X copied from the old site's config. Email and résumé entries exist in the source but stay disabled until the user supplies them.
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
- Listing (`/blog`): standalone posts and groups interleaved, newest first. A standalone post sorts by its `date`; a group sorts by its newest non-draft post. A group is a native `<details>` whose `<summary>` holds the group title as a link to the group page; its posts are shown indented, newest first. Ties: date descending, then slug ascending. No pagination anywhere.
  - **Changed by the user 2026-11-16 (was "closed by default"):** groups are prerendered `open` (all posts reachable without JS). On hydration, JS closes groups that are below the viewport; each animates open when ~40% visible and stays open. No disclosure marker; clicking the row outside the title link toggles. Grouped posts are distinguished by indentation only.
- Frontmatter:
  - `title` — required. May contain `inline code` in backticks (rendered as `<code>` on pages; backticks stripped in `<title>`, meta tags, RSS, and OG cards). No other Markdown in frontmatter.
  - `date` — required on posts, `YYYY-MM-DD`, calendar date, no time zone.
  - `updated` — optional `YYYY-MM-DD`, ≥ `date`, displayed, does not affect ordering.
  - `description` — required on posts and groups; one line of plain text; used in listings, meta description, RSS, OG.
  - `draft` — optional boolean; drafts show in dev and are excluded from production.
  - `redirect_from` — optional list of old paths; each becomes a 301 in the built `_redirects`.
- Build failures: invalid or missing required fields (error names the file), a future `date` or `updated` on a non-draft, nested groups, duplicate slugs, duplicate redirect sources, a redirect source equal to a live page, malformed redirect paths. No scheduled publishing.
- Redirects: per-post `redirect_from` plus a hand-written site-level redirects source (e.g. `/posts/` → `/blog`, old feed `/index.xml` → new feed, `/tags/*` and `/categories/*` → `/blog`), merged into the built `_redirects`. Cloudflare limit: 2,000 static + 100 dynamic rules.
- RSS at `/rss.xml`: every post (standalone and grouped), full textual content as standalone HTML rendered at build time with Svelte's server renderer. Interactive components detect feed rendering through Svelte context and output a "View this on abhay7.dev" link. Images kept with absolute URLs. Math emitted as MathML. Part of the first implementation.
- Sitemap: every prerendered page including group pages, generated without a dependency. Part of the first implementation.
- Article layout: centered content column (`--measure: 70ch`), full width with gutters on mobile. Side table of contents generated from headings with correct nesting. Heading permalinks (`/post#section`) on the heading text itself.
- Tags and search are not planned.
- mdsvex articles are trusted executable source. Never describe them as sandboxed or safe Markdown.

### Rich content

All in scope for Phase 2. **Approved deviations:** mdsvex runs as an early Vite transform (not a Svelte preprocessor) so `enhanced-img` sees compiled markup; three small local remark plugins (KaTeX → `{@html}`, `[!TYPE]` callouts, relative images → `<enhanced:img>`), each unit-tested. Every mdsvex plugin must be verified compatible with mdsvex 0.12.8's older remark/rehype generation in a probe before adoption.

- Syntax highlighting: Shiki at build time as mdsvex's highlighter, dual themes `catppuccin-latte`/`catppuccin-mocha` emitted as `light-dark()` colors.
- Math: KaTeX at build time, `$inline$` and `$$display$$`; KaTeX CSS and fonts self-hosted from the `katex` package as a separate font set.
- Mermaid: rendered client-side; the library loads only on articles containing a diagram; without JS the diagram source shows as code.
- Footnotes: `[^1]` syntax, semantic links and back-references.
- Heading anchors: `id` on every heading; the heading text links to itself (no visible marker).
- Tables: GFM tables, horizontally scrollable on narrow screens.
- Callouts: both GitHub-style `> [!NOTE]` syntax and a `<Callout type="…">` component, types note, tip, info, caution/warning, error/danger, colored with Catppuccin Mocha CSS variables.
- Dropdowns: native `<details>`/`<summary>`.
- Tabs: `<Tabs>`/`<Tab label>`; prerendered HTML shows every panel under its own heading; after hydration, the ARIA tabs pattern with arrow-key navigation.
- Image zoom: without JS the image links to its full-size file; with JS, `medium-zoom`.
- Embeds: YouTube and X only. **No Gist support** (user does not want possibly outdated content displayed).
  - YouTube: click-to-load; a static preview plus link is the no-JS view; the iframe (`youtube-nocookie.com`) loads only on click.
  - X: the post is authored as a static quote with a link (the no-JS view); X's `widgets.js` loads only on articles that contain an X embed.
- Comments: Giscus, loaded lazily when the comments area scrolls into view. Set up fresh against this repository (`abhay7dev/www`); old-site comments are discarded, not migrated. Configured 2026-11-16: category "Blog Post" (IDs in `src/lib/site.js`), mapping `specific` with term = post slug, strict matching on, reactions on, input box on top, lazy iframe, Catppuccin Latte/Mocha themes. The theme is generated by `src/lib/blog/giscus-theme.js` as a `data:text/css` URL (a localhost theme URL is blocked inside the giscus.app iframe, and a hosted file would need CORS): it `@import`s giscus.app's official Catppuccin theme for the current flavor and overrides accents (Lavender; Text in Latte where Lavender fails contrast), borders (Surface0), and the loading image (the placeholder logo `static/favicon.svg`, inlined as a data URI and pulsing; the iframe URL is ~7.5 KB, so a much larger final logo should be hosted and referenced by https URL instead). Rendered with the npm `giscus` web component (`<giscus-widget>`, Lit, ~8.6 KB gzip, dynamically imported), which frames giscus.app directly, so `giscus.app` is only in `frame-src`, never `script-src`. `giscus.json` at the repo root restricts embedding origins to `https://abhay7.dev` and `http://localhost:5173|4173` (takes effect once it is on the default branch).
- Interactive demos: inline in `.svx` or imported components.
- Third-party embeds and Giscus never load eagerly and are reflected in the CSP.

### Migration

- Initial blog content is migrated from the old Hugo site at `../blog` (`https://github.com/abhay7dev/blog`). It is read-only source material: never modify it.
- 8 standalone posts in `content/posts/*.md`, images in `static/<post>/`. Old post URLs were `/posts/<slug>/`.
- Steps: convert TOML frontmatter to YAML; keep `title`, `date`, `description`; drop `author`; `hello-world` date `2023-04-08T17:27:53-07:00` becomes `2023-04-08`; move images next to their posts; add `redirect_from: ["/posts/<slug>/"]`; convert indented code blocks to fenced blocks (mdsvex disables indented code: they render as paragraphs; `discordbot.md` uses them); review raw `<br>` after images.
- `discordbot.md` had an empty description; the user supplied it. Never invent missing content during migration.

### Assets, images, URLs

- Trailing slashes: SvelteKit default `'never'` (`/blog/foo` → `blog/foo.html`). Whatever Cloudflare does with `/blog/foo/` is acceptable.
- Blog content directory: `src/content/blog/`. Never copied to public output.
- A folder in it is a **group** only if it contains `index.svx`. A folder with the same name as a sibling `.svx` file holds that post's assets (e.g. `graphics/raytracing.svx` uses `graphics/raytracing/fig.png`). Any other folder fails the build.
- The public directory keeps SvelteKit's name, `static/`, copied without transformation. It holds site-wide files only (favicon, manifest, `robots.txt`, `_headers`, the site-level redirects source, shared site images), never blog content.
- Images: `@sveltejs/enhanced-img` at build time — `<picture>` with AVIF/WebP variants plus fallback, responsive sizes, intrinsic `width`/`height`. A small remark plugin turns relative Markdown images into processed imports. SVGs pass through unprocessed. Lazy-load except the first image on a page. Missing `alt` text or a missing image file fails the build.

### Fonts

- Files are supplied by the user; agents never download fonts. Unneeded files from the user's downloads were deleted at the user's request.
- Fira Sans: 400, 400 italic, 700, 700 italic (true faces for Markdown bold/italic). Each split into Latin and Latin Extended files with `unicode-range`. Split once with `subset-font` (Google Fonts latin / latin-ext ranges) outside the repo; split files in `src/fonts/`, unsplit originals in `src/fonts/original/` (not served) for re-splitting.
- Fira Code: Regular (`src/fonts/FiraCode-Regular.woff2`) Bold (`FiraCode-Bold.woff2`, page titles) and SemiBold (`FiraCode-SemiBold.woff2`, blog-listing titles), both added by the user 2026-11-16; all unsplit. No italic in code; the user accepts synthesized italic there.
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
- Colors are always CSS custom properties. The full visual design is in [Design](#design-phase-4); it supersedes the Phase 2 rule "Mocha not implemented yet / scaffold CSS minimal" (changed by the user 2026-11-16: Latte light mode added, full theme approved).

### Background simulation

- One simulation/generative background, not yet chosen. Do not choose or implement the actual visual; only the scaffold described in [Design](#design-phase-4) is approved.
- Scope: full strength on the homepage, dimmed on the other non-blog pages (About, Contact, Projects, Experience, Licenses), never under `/blog`. Expected structure: a SvelteKit layout group for non-blog pages owns the background, so it persists across SPA navigation between those pages and is destroyed on entering `/blog`.
- Requirements for whatever is chosen: decorative (`aria-hidden`, no content inside); `prefers-reduced-motion` shows a still frame or nothing; visible pause/play control, choice remembered in `localStorage` (wrapped in try/catch); suspend when the tab is hidden or the canvas is offscreen; cap resolution and frame rate on mobile/low-power; if a required feature (e.g. WebGL) is missing, fall back silently to the plain background; overlaid text stays legible; no layout shift; full cleanup on destroy; loaded with dynamic `import()` in `onMount`.

### Implementation conventions (approved with the plan)

- Client-side rendering stays on site-wide; `prerender = true` in the root layout. Server endpoints (`+server.js`) must export `prerender = true` themselves.
- 404s: prerendered `/404.html` and `/blog/404.html` with `csr = false`; `+error.svelte` renders the same `NotFound` component for client-side navigation. `paths.relative = false` so 404 pages work at any depth.
- Simulation (when chosen): mounted in `src/routes/(site)/+layout.svelte`, loaded via dynamic `import()` in `onMount`, full cleanup on destroy (client routing never unloads the page).
- Article column `--measure: 70ch`; sticky side TOC (13rem) at ≥ 62rem. Below that, a collapsed `<details>` above the article, plus (with JS) a bottom-right contents button that appears once that scrolls away and opens the TOC in a native `popover` (closes on selection). Blog pages have no simulation pause button, so the corner is free.
- Giscus: mapping `specific`, term = post slug; hidden until `repoId`/`categoryId` are filled in `src/lib/site.js`.
- Inline interactive demos in articles go inside `<Interactive>` so the RSS feed shows a link instead. Custom interactive components read `getContext('feed')` and render a link when it is set.
- `INCLUDE_DRAFTS=1` includes drafts in a production build for preview; never for deploys.
- Fixtures: `src/content/blog/pipeline-fixture.svx` and `src/content/blog/fixture-group/` are drafts that exercise every pipeline feature; they are not real content and never ship.
- Prerender failures are intentional guards: broken internal links, missing `#ids`, and unseen routes other than the two blog post routes fail the build.
- Kit `version.name` is `CF_PAGES_COMMIT_SHA` (or `local`) so builds are deterministic.

## Design (Phase 4)

All **confirmed** by the user 2026-11-16 unless marked. Inspiration: refact0r.dev for its *spirit only* (clean, text-first, minimal homepage over a generative background). **Never reuse its code** (GPL-3.0) or its signature styling (lowercase everywhere, `->/nav`, `[count]`, `===` underlines).

### Principles

- Quick, responsive, clean, beautiful. Motion is **rare but impactful**: a few set pieces (route transition, theme reveal, home typewriter + simulation, project card → popup), everything else is short feedback to user actions.
- No cards-everywhere, shadows, blur/glass, gradients, ALL-CAPS eyebrow labels, or decorative numbering.
- Accessibility floor always: visible focus, required contrast, keyboard operation, `prefers-reduced-motion` disables all non-essential motion. Content never depends on JS (progressive enhancement rule still applies).
- Placeholder copy is lorem ipsum sized to its slot.

### Color and themes

- **Mocha (dark) and Latte (light).** Default follows `prefers-color-scheme`; a sun/moon toggle in the header overrides and is remembered in `localStorage` (try/catch). A tiny inline script in `app.html` applies the theme before paint (its CSP hash must be added).
- Theme switch: the new theme spreads in a circle from the toggle (View Transitions API); instant without support or with reduced motion.
- Theme propagates to Shiki (dual `catppuccin-latte`/`catppuccin-mocha`), Mermaid (re-render on switch), Giscus (Catppuccin themes), KaTeX (inherits color), and the simulation (palette update).
- **Accent: Lavender**, each theme's own value (Mocha `#b4befe`, Latte `#7287fd`). Measured: Latte Lavender on Base is 2.81:1, so in both themes Lavender is never the only carrier of required contrast:
  - links: text color + Lavender underline;
  - focus: two-tone ring (2px Lavender + 1px text-color ring);
  - selection: 30% Lavender tint behind normal text (5.30:1 in Latte);
  - active nav: full-strength text vs muted neighbors, plus the Lavender indicator.
- Other Catppuccin colors only where they carry meaning (callouts, code, simulation).
- Surfaces separate by Base/Mantle/Crust steps and 1px Surface0 borders.
- Single palette source: `src/lib/theme/catppuccin.js` exports every Latte and Mocha color as hex and `[r, g, b]`. `app.css` hand-writes the same values as `--ctp-*` variables plus semantic aliases (`--bg`, `--text`, `--accent`, …). A unit test fails if CSS and JS disagree.
- OG cards and the manifest use Mocha. `theme-color` has one `<meta>` per `prefers-color-scheme`.

### Type, shape, layout

- Fira Sans body 1.125rem / 1.7. Fira Code for headings (weight 400; h1 2.25rem, h2 1.625rem, h3 1.25rem, h4 1.125rem), nav, dates, labels, and code. Dates/labels 0.875rem, muted. Casing as authored; no text-transform.
- Corners: 4px small (inline code, buttons, toggle), 8px blocks (code blocks, callouts, images, embeds, tables, popup). No pills.
- Text left-aligned inside a centered column. Articles `--measure: 70ch`.
- Icons: **Tabler** via `@tabler/icons-svelte-runes` (official Svelte 5 package, one dependency, no Vite plugin; chosen over `unplugin-icons`, which pulls four deps including an auto-installer). Deep-import each icon (`@tabler/icons-svelte-runes/icons/<name>`) so dev never loads the barrel; icons are decorative (`aria-hidden`) unless they are the only label. Used for functional controls and Contact. Not before nav items or post titles.
- Headings in posts (changed by the user 2026-11-16; replaces the `#` margin-marker signature): the heading text itself is the permalink (`rehype-autolink-headings` `wrap`), no visible `#`, no underline. Markdown headings are shifted down one level at build time (`#` → h2, … h6 stays h6) so the post title is the only h1. The post title is clearly larger than body headings and bold (Fira Code Bold, supplied by the user 2026-11-16).

### Site chrome

- Header: nav and header links have no underline. "Abhay Bhat" (Fira Code) links home; **no "Home" link anywhere**. Nav links right, then the theme toggle. Sticky, solid background, 1px bottom border fades in after scrolling. Hides on scroll down (past its own height) and returns on scroll up (150ms); always shown at the top, while the menu is open, or when focus is inside it. Transparent over the simulation on the homepage.
- Mobile (below ~44rem): hamburger menu, **never wrapping links**. Built on `<details>` (works without JS); JS adds Escape, outside-click, close-on-navigate, focus handling. Opens as a full-width panel sliding down under the bar with links staggering in; the icon morphs to an X. The theme toggle stays in the bar.
- Footer: one line — `© 2026 Abhay Bhat`, Licenses, RSS icon, source icon. On phones RSS/source are icon-only.

### Motion

- Route transitions (vital): the header stays put; `<main>` blocks fade + drop out top-to-bottom (30ms stagger, ~120ms), then the new page's blocks rise + fade in (40ms stagger, first ~8 blocks, then the rest together). Whole navigation under ~400ms. Skeleton bars only if a navigation takes over ~200ms. Applies to all routes including back/forward.
- First load: the same entrance as pure CSS (content visible without JS).
- Micro-interactions: underline grows from the left on hover; buttons scale to 0.97 on press; icons nudge 1–2px in their direction on hover; Lavender active-nav indicator slides between items; copy button morphs to a check; `<details>`/dropdowns animate height; hamburger morphs to X; TOC marker slides to the active section.
- Homepage first full load only: "Abhay Bhat" types in (pure CSS `steps()` over `ch` width; full text in the DOM, no layout shift), Lavender caret blinks briefly then fades, then tagline and links fade in, then the simulation fades up. SPA returns to home use the normal route transition. Reduced motion: shown instantly.

### Homepage

- Name (h1, typewriter), lorem one-line tagline (from `site.js`), social icon links; vertically centered, left-aligned block, over the full-strength simulation. No nav repetition, no post/project lists.

### Simulation scaffold

- Full strength on the homepage, dimmed (~15% opacity) on other non-blog pages, continuous across SPA navigation between them; never under `/blog`. A pause/play icon button is fixed bottom-right wherever it runs.
- Entry `src/lib/simulation/simulation.js` (named so instead of `index.js`), dynamically imported in `onMount` of `src/routes/(site)/+layout.svelte`. Exports `start(canvas, { palette, reducedMotion })` → controller `{ paused, setPaused(bool), setPalette(palette), stop() }`, or `null` if no 2D context (plain background). Handles DPR (cap 2; 1 on low power), resize, 60fps (30 on coarse-pointer / ≤ 4-core devices), pausing when hidden/offscreen, reduced-motion still frame (no pause button then), remembered pause state (`localStorage` `simulation-paused`), and cleanup.
- The sketch to replace is `src/lib/simulation/sketch.js`: `setup({ width, height, palette })` returns state (called at start and on every resize); `draw(ctx, { state, t, dt, width, height, palette })` draws a frame in CSS pixels. Currently a stub that clears the canvas. `palette` is the current flavor from `src/lib/theme/catppuccin.js` (`palette.lavender.hex`, `palette.base.rgb`) and updates on theme change.
- `verify` recognizes the simulation chunk by the string `simulation-paused` (Kit names chunks by hash) and fails if blog pages load it or if it is missing from the build.

### Blog design

- Listing (changed by the user 2026-11-16): no bullets; each entry is title left, date (`Feb 5, 2026`, Fira Code) right-aligned on the same row, description below. Same layout on group pages. Entries are **subtle cards** (user request 2026-11-16; an explicit exception to the no-cards principle): Mantle background, 8px radius, a Surface0 border on hover, the whole card is the link. A group is one card containing its posts as indented rows; its summary row has a pointer cursor and toggles with an animated height (clicking the title link navigates instead). A Tabler chevron at the card's bottom right shows the state (down = closed, up = open). Hover underlines only the hovered title (group title on its summary row, a post title on its row). Listing titles use Fira Code SemiBold. Groups as described under Blog (open on scroll, indent only).
- Dates everywhere read `Feb 5, 2026` (`formatDate`, user choice 2026-11-16; replaces ISO). Inline code inside links is a translucent, borderless chip so link underlines pass through it.
- Post page: back link (Blog, or the group for grouped posts); title; date line with `· updated …` when present; description as a muted lede; no reading time. Sticky right TOC with a sliding Lavender marker for the active section (scrollspy).
- Code blocks: language label and copy button; line numbers visible but not selectable or copyable (CSS counters in `::before`, hidden from screen readers), explicitly requested by the user.

### Projects

- **New content type:** `src/content/projects/<slug>.svx`, validated at build time like the blog. Frontmatter: `title`, `description`, `date` (newest first), optional `images` (list; first is the thumbnail), `stack`, `links` (repo, live). Body = popup prose.
- **No per-project pages.** Cards open a popup on `/projects`; no sitemap entries or OG cards per project.
- Grid: 3 columns ≥ 64rem, 2 columns 40–64rem, horizontal rows below 40rem (4:3 thumbnail left, text right). Thumbnails 16:9, `object-fit: cover`. Missing images → a default 1200×675 Mocha card generated at build time with satori (never GitHub's OG image).
- Popup: native `<dialog>` via `showModal()` (focus trap and return, Escape, scroll lock), ~96vw × 94vh desktop, full-screen mobile, 8px radius, Tabler X button, backdrop click closes. Opens by morphing the card into the dialog (View Transitions); fallback fade+scale; instant with reduced motion.
- Popup content: image carousel, title, Fira Code stack line, icon links, prose body.
- Carousel: native CSS scroll-snap (no-JS swipe), no library (no Embla). JS adds Tabler chevron buttons, dots, arrow keys, and per-slide scroll progress as a CSS variable driving embla-style effects: neighbors scale 0.92 and opacity 0.4, image parallax ~10%.
- URLs: opening pushes `/projects#<slug>` (back button closes); closing returns to `/projects`. Arriving at `/projects#<slug>` runs the route transition, smooth-scrolls to the card, waits ~150ms, then morphs it open.
- No JS: each card is `<a href="#slug">`; CSS `:target` shows the prerendered details as a full-screen overlay with a close link.

### Other pages

- About: `src/routes/(site)/about/+page.svx`, lorem prose at article width, no portrait.
- Experience: vertical timeline from `src/content/experience.js` (role, org, start, end, summary, optional link); date range in a Fira Code column.
- Contact: rows of Tabler icon + service + handle (`abhay7dev`, `abhaygbhat`, `@abhaygb7`); email and résumé hidden until supplied.

### Delegated to the agent, reviewed by the user

Callouts, tabs, tables, footnotes, captions, 404, Licenses, pause button, skeletons, scrollbars, focus-ring styling: the agent designs them within this system; the user reviews in dev and rejected items become questions.

### Stages

Status: **D1–D5 done** (user approved 2026-11-16). **D6 built** (2026-11-17), awaiting user review.

Implementation notes (D6):
- Content: `src/content/projects/<slug>.svx`, validated by `src/lib/projects/model.js` (tested): `title`, `description`, `date`, optional `images` (list of `{ src, alt }`, raster files in `<slug>/`; alt required), `stack` (list), `links` (`repo`, `live`, https only), `draft`. Index in `src/lib/projects/content.server.js`; bodies load lazily per project (`+page.js`). Current entries are lorem placeholders (two with generated flat placeholder PNGs; links point to example.com).
- Images go through enhanced-img via `import.meta.glob(…, { query: { enhanced: true, imgSizes: '1' } })` (width-based srcsets + `sizes`). Projects without images get `/projects/<slug>.png` (1200×675, `renderCard` with `height`), allowed as an empty route in `handleUnseenRoutes`.
- Popup state is `page.state.project` (shallow routing, `goto(…, { shallow: true, state })`); one effect opens/closes dialogs to match, so clicks, Escape, backdrop, and back/forward share one path. Opened from a card: closing goes `history.back()`; arrived by URL: closing replaces with `/projects`. In-page links inside a dialog scroll within it instead of navigating. Morph: View Transition name `project` moved from card to dialog; without support a fade+scale (`@starting-style`); instant with reduced motion. The no-JS `:target` overlay is disabled once hydrated (`.enhanced`).
- Carousel: `src/lib/components/projects/Carousel.svelte`, CSS scroll-snap; JS sets `--p`/`--d` per slide for scale 0.92, opacity 0.4, and an 8% image parallax.
- All project bodies share one page, so the build fails if a heading id repeats across projects or clashes with the page's own ids (`main`, `<slug>`, `<slug>-card`, `<slug>-title`). Known limit: arrival at `#slug` waits a fixed 550ms for the scroll before opening.
- OG cards restyled (`src/lib/og.server.js`): Fira Code Bold title, Fira Sans description, Lavender rule, Fira Code footer. Manifest already uses Mocha; unchanged.

Implementation notes (D5):
- About is `src/routes/(site)/about/+page.svx` (Markdown; `#` renders as h2 like posts; the page `<h1>` is written as HTML). Experience reads `src/content/experience.js` (`start`/`end` as `YYYY-MM`, `end: null` = Present, formatted by `formatMonth`). Contact derives handles from the URLs in `site.js`; email/résumé rows appear once set. All copy is lorem placeholder.
- Content dropdown styling (chevron, `::details-content` animation) applies to any `main details` except blog groups (`.group`), so Licenses' license texts share it.
- External `http(s)` links (any origin other than the site's) open in a new tab with `rel="noopener noreferrer"`, set by one capturing click listener in `src/routes/+layout.svelte` (user request 2026-11-16). Without JS they open in the same tab.
- The navigation skeleton is never started for navigations that leave the site (`willUnload`), and any leftover is cleared on `pageshow` (back/forward cache restores).
- `/licenses` lists everything shipped to readers: Svelte/Kit, KaTeX, medium-zoom, Mermaid, Catppuccin, Tabler Icons (MIT), giscus (MIT), Lit (BSD-3-Clause), plus the Fira OFL texts.

Implementation notes (D4):
- Code blocks: `highlight.js` wraps Shiki output as `.code-block > .code-head (+ .code-lang) + pre`. `enhanceCode` mounts `CopyButton.svelte` into each header (no button without JS). Line numbers: CSS counter on `.line::before` with `content: counter(line) / ''`, `user-select: none`.
- Callout icons: Tabler SVGs inlined in `app.css` as `--callout-icon` data-URI masks (CSP `img-src data:` covers them); dropdown chevrons the same way. Tabler is MIT: list it on `/licenses` (D5).
- Mermaid uses `theme: 'base'` with variables from `currentPalette()` and re-renders on `onThemeChange`. Giscus starts with `catppuccin_latte`/`catppuccin_mocha` and switches via `postMessage` `setConfig`.
- Article dropdowns animate with `::details-content` + `interpolate-size` where supported (instant elsewhere); blog-listing groups keep their JS animation.
- Grouped posts get `back: { title, url }` from their route loader for the header's back link.
- In-page links inside an article (TOC, heading links, footnotes) smooth-scroll to their target (instant with reduced motion), update the URL hash via `goto(hash, { noScroll, keepFocus })`, and move focus to the target.

Implementation notes (D1–D2):
- Tokens: every `--ctp-*` is `light-dark(latte, mocha)`; `color-scheme` on `:root` (or `data-theme`) picks the flavor, so components need no theme-specific CSS. Role aliases: `--bg`, `--bg-raised`, `--bg-sunken`, `--border`, `--text`, `--text-muted`, `--text-faint`, `--accent`, `--selection`.
- `src/lib/theme/theme.js`: `currentTheme()`, `currentPalette()`, `setTheme()`, `onThemeChange(cb)` (fires for toggle and system changes). Mermaid, Giscus, and the simulation subscribe through it.
- `app.html`'s inline theme script: `vite.config.js` hashes every inline `<script>` in `app.html` into `script-src`; `verify` checks each built page's inline scripts against its CSP. 404 pages may contain only this script.
- Chrome lives in `src/lib/components/chrome/` (Header, ThemeToggle, Footer). Route transitions: `src/lib/motion/route-transitions.js` (WAAPI on `<main>` blocks) plus the CSS first-load entrance in `app.css`, disabled by the `navigated` class after the first client navigation.
- Page titles (h1) use Fira Code Bold (`src/fonts/FiraCode-Bold.woff2`, supplied by the user, unsplit).

- **D1** palette module + CSS tokens + parity test, type scale, base elements, icons.
- **D2** chrome: header (scroll hide, hamburger, active indicator), footer, theme toggle + reveal, route transitions, focus/selection.
- **D3** homepage (typewriter sequence) + simulation scaffold and pause control.
- **D4** blog listing (groups on scroll), post page, TOC scrollspy, heading markers, code blocks, all rich content restyled, Mermaid/Giscus/Shiki theming.
- **D5** About, Experience, Contact, Licenses, 404.
- **D6** Projects content type, grid, popup, carousel, default thumbnails; OG cards and manifest restyle.

## Unresolved decisions

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

### Probe results for the design phase (2026-11-16)

Probe was a copy of this repo in the session scratchpad, Bun 1.4.4, `bun --bun vite build`.

- `@tabler/icons-svelte-runes@3.52.0` (peer `svelte ^5`, single dep `@tabler/icons`): deep import renders a plain inline `<svg class="tabler-icon …">` in prerendered HTML; `typescript` is not installed.
- CSP: a hand-written `'sha256-…'` in `csp.directives['script-src']` is kept and merged with Kit's own hashes in the emitted meta tag. An inline theme script in `app.html` therefore works if its hash is listed; the hash must be recomputed whenever the script changes (enforce with a check).
- Giscus ships `catppuccin_latte` and `catppuccin_mocha` themes (`giscus/giscus` repo, `styles/themes/`).
- Same-document View Transitions are Baseline (Firefox 144+, Oct 2025; types in Firefox 147). Only same-document transitions are needed (SPA).

## Existing repository notes

- `LICENSE` is AGPL-3.0. `README.md` documents commands, Cloudflare settings, and where things go.
- Migrated posts: bodies copied verbatim from `../blog` except image paths and one fixed link (`uptime-kuma-termux`: `github.com/...` lacked `https://`); `discordbot` description supplied by the user; `diffiehellman` image alt text rewritten at the user's request.
