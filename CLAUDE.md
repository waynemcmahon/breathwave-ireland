# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — runs Astro dev server (`localhost:4321`) **and** the Decap CMS proxy (`localhost:8081`) in parallel via `npm-run-all`. This is the standard workflow; `/admin` only works against the proxy when running this way.
- `npm run astro` — Astro dev server only (no CMS proxy).
- `npm run decap` — Decap CMS proxy only (`npx decap-server`).
- `npm run build` — production build to `dist/`.
- `npm run preview` — serves the built site locally to verify production output.

There is no test suite, linter, or formatter configured. Type-checking is provided by `@astrojs/check` and runs implicitly during `astro build`.

## Architecture

This is an **Astro v4 static site** for Breathwave Ireland, a breathwork business. It's built on the "Intermediate Astro v4 - Decap CMS" template and deployed to **Netlify**.

### Content flow (Decap CMS → Astro Content Collections)

Content is managed via Decap CMS and **must stay in sync across three places**:

1. `public/admin/config.yml` — CMS field definitions (what editors see).
2. `src/content/config.ts` — Astro Content Collection Zod schemas (build-time validation).
3. `src/content/{events,podcasts}/*.md` — the actual content files.

The two collections are `events` and `podcasts`. Editors upload via Netlify Identity + Git Gateway; images go to `src/assets/images/uploads` (inside `src/` so Astro can optimize them via `<Image />`/`<Picture />`).

When adding a CMS field, update **both** `config.yml` and `config.ts` — a schema mismatch fails the build.

### Routing

- Static pages are `.astro` files directly in `src/pages/` (e.g., `about.astro`, `contact.astro`, `book.astro`).
- Dynamic collection pages use `src/pages/{blog,events,podcasts}/[...post].astro` — these use `getStaticPaths()` against the content collections.
- `src/pages/api/subscribe.ts` is a **server-rendered Astro API route** for the Kit (ConvertKit) newsletter signup.
- `netlify/functions/submit-to-kit.mts` is a **Netlify Function** doing the same job. Both exist; the API route is the primary path. If changing subscription logic, check both.
- `public/_redirects` handles legacy-URL 301s for the Netlify deploy. Note: the final catch-all (`/* → /`) is aggressive — new top-level routes must be declared here or they'll be redirected.

### Layout & data

- `src/layouts/BaseLayout.astro` is the single wrapper; every page should render inside `<BaseLayout>`. It owns `<head>`, social meta, preloads, View Transitions, the Netlify Identity widget (homepage only), and the Header/Footer.
- `src/data/client.json` — the site's single source of truth for business metadata (name, contact, social, URLs for Stripe gift card and Members portal). Meta tags, canonical URLs, and footer contact info all read from here.
- `src/data/navData.json` — nav structure, including dropdown `children` arrays. The Header component renders dropdowns automatically when `children` is populated.
- `src/data/menuData.json` — separate menu data (unrelated to nav).

### Path aliases (`tsconfig.json`)

```
@assets/*     → src/assets/*
@data/*       → src/data/*
@styles/*     → src/styles/*
@components/* → src/components/*
@libs/*       → src/libs/*
```

### Styling

LESS, not Sass. Global stylesheets are imported in `BaseLayout.astro`:
- `src/styles/root.less` — CodeStitch `:root` variables, `.cs-topper`, `.cs-title`, `.cs-text`.
- `src/styles/dark.less` — dark-mode overrides (the dark-mode toggle script in `BaseLayout.astro` is currently commented out).
- `src/styles/blog.less`, `critical.less` — page-specific.

Tailwind is also configured (`@astrojs/tailwind`) and coexists with LESS — the template's UI is LESS/CodeStitch; Tailwind is available for new components.

### View Transitions gotcha

`<ViewTransitions />` is enabled in `BaseLayout.astro`. Scripts that attach listeners (nav, FAQ) must wrap their setup in `astro:page-load`, or they won't re-run after client-side navigation. Pages that need a full reload can opt out with `<BaseLayout disableTransitions={true}>`.

### Images

- Assets in `src/assets/` are optimized by Astro (use with `<Image />`/`<Picture />`).
- Assets in `public/assets/` are copied verbatim — use for favicons, fonts, `_redirects`, `robots.txt`, `sitemap.xml`.
- `src/components/TemplateComponents/CSPicture.astro` is a custom wrapper around `getImage()` for CodeStitch-style responsive `<picture>` with distinct mobile/desktop sources.
- Above-the-fold images are preloaded via `getOptimizedImage()` in `src/libs/utils.js` — pass the result as `preloadedImage` to `BaseLayout`.

### Icons

`astro-icon` is configured. SVGs used with the `<Icon />` component **must** live in `src/icons/` (not `src/assets/` or `public/`).

### Environment variables

- `KIT_API_KEY` — used by both `src/pages/api/subscribe.ts` (via `import.meta.env`) and `netlify/functions/submit-to-kit.mts` (via `process.env`). The Netlify function currently also has a hardcoded key in headers; prefer the env var when editing.

### Deployment

Netlify, with Netlify Identity + Git Gateway for CMS auth. The homepage injects the Netlify Identity widget that redirects logged-in users to `/admin/`. CMS edits commit to `main`, which triggers a rebuild.
