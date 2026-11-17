# www

The 6th iteration of my personal website, built with SvelteKit and mdsvex, prerendered to static files for Cloudflare Pages. Project rules and decisions live in [AGENTS.md](AGENTS.md); feature details in [FEATURES.md](FEATURES.md).

## Commands

Requires Bun ≥ 1.4.4 (production builds use exactly 1.4.4).

| Command | What it does |
| --- | --- |
| `bun install` | Install dependencies (from `bun.lock`) |
| `bun run dev` | Dev server; drafts are visible |
| `bun run build` | Production build to `build/`; drafts excluded |
| `INCLUDE_DRAFTS=1 bun run build` | Production build including drafts (preview only, never deploy) |
| `bun run preview` | Serve `build/` locally |
| `bun run verify` | Check `build/`: pages, 404s, CSP, links, feed, sitemap, redirects, JS per page |
| `bun run test` | Unit tests (`bun test`) |
| `bun run lint` / `bun run format` | Prettier + ESLint |

## Deploying (Cloudflare Pages)

Set these in the Pages project (not automated by this repo):

- Build command: `bun install --frozen-lockfile && bun run build`
- Build output directory: `build`
- Environment variables: `BUN_VERSION=1.4.4`, `SKIP_DEPENDENCY_INSTALL=1`
- Preview deployments: disabled (production branch only)

`static/_headers` sets security and cache headers; `_redirects` is generated from `src/redirects.txt` and each post's `redirect_from`.

## Where things go

- **Page:** `src/routes/(site)/<name>/+page.svelte` (non-blog pages share the future background layout). Add it to `nav`/`pages` in `src/lib/site.js`.
- **Article:** `src/content/blog/<slug>.svx` with frontmatter `title`, `date` (`YYYY-MM-DD`), `description` (one line), optional `updated`, `draft`, `redirect_from`.
- **Group:** `src/content/blog/<group>/index.svx` (`title`, `description`; body is the group page) plus posts in that folder. One level only.
- **Article images:** a folder named like the post, next to it (`<slug>/fig.png`), referenced as `![alt](./<slug>/fig.png "optional caption")`.
- **Components for articles:** `src/lib/components/content/` (`Callout`, `Tabs`/`Tab`, `YouTube`, `Tweet`, `Interactive`); import them in the article's `<script>`.
- **Site-wide static files:** `static/` (copied as-is, never processed).
- **Simulation (not chosen yet):** write it in `src/lib/simulation/sketch.js` (`setup` + `draw`; the Catppuccin palette is passed in). `simulation.js` handles the canvas, timing, pausing, and theme.

## Licensing

Implementation code: AGPL-3.0 ([LICENSE](LICENSE)). Article prose and illustrations: © 2026 Abhay Bhat, CC BY-NC-SA 4.0 unless otherwise noted. Code samples in articles: MIT. Fonts: SIL OFL 1.1 (`src/fonts/OFL-*.txt`). Full notices at `/licenses`.
