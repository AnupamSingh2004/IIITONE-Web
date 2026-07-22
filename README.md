# IIITOne — Web

Next.js (App Router) frontend for **IIITOne**, the academic resource hub for IIIT Jabalpur (IIITDMJ) students — Google-login-gated browse/search of notes and PYQs, upload with an inline PDF viewer, and admin moderation screens.

This repo covers **Phase 1 (Academic Resource Hub)** only. See `docs/superpowers/plans/2026-07-17-frontend-phase1.md` for the full task-by-task plan and `../iiitone-backend/docs/superpowers/specs/` for the approved design spec.

> **Status:** all Phase 1 pages are implemented — login, browse/search, material detail with inline PDF viewing, upload (including on-the-fly course creation), profile, and the admin pending-queue/flags screens. This frontend depends on the sibling `iiitone-backend` repo for everything behind auth — run that repo locally too (see its README) or none of the authenticated flows here have anything real to talk to.

## Tech stack

- Next.js 16 (App Router, TypeScript) — note: this is a recent major version with some API differences from Next 14; see `AGENTS.md` in this repo if something in App Router behavior looks unfamiliar
- Tailwind CSS v4 (CSS-first config, no `tailwind.config.ts`) + [shadcn/ui](https://ui.shadcn.com) on top of [Base UI](https://base-ui.com) primitives (not Radix — this affects a few component APIs, e.g. `Button` uses a `render` prop instead of `asChild`)
- [TanStack Query](https://tanstack.com/query) for server state
- [Sonner](https://sonner.emilkowal.ski) for toasts (shadcn's classic `toast` component is deprecated in the installed CLI version)
- `react-pdf` for the inline PDF viewer (dynamically imported, no SSR)
- Vitest + React Testing Library

## Prerequisites

- Node 20+
- The `iiitone-backend` repo running locally (Postgres/Redis/MinIO via its `docker-compose.yml`) for any authenticated flow to actually work — see its README

## Local dev setup

```bash
npm install
cp .env.example .env.local   # points NEXT_PUBLIC_API_URL at the local backend (default http://localhost:8080)
npm run dev                  # http://localhost:3000
```

```bash
npx vitest run        # run tests
npm run build          # production build (plain next build)
npm run lint             # lint
npm run pages:build       # Cloudflare Pages adapter build (npx @cloudflare/next-on-pages)
```

## Project layout

```text
src/
  app/
    page.tsx                     landing/login page, redirects to Google OAuth
    layout.tsx                    root layout (fonts, providers, theme flash-guard script)
    providers.tsx                  QueryClientProvider + sonner Toaster
    app/                            the authenticated /app/* URL segment (yes, app/app — see note below)
      layout.tsx                     RequireAuth + AppShell
      page.tsx                        browse/search page
      materials/[id]/page.tsx          material detail + inline PDF viewer (edge runtime)
      upload/page.tsx                   drag-and-drop upload, on-the-fly course creation
      profile/page.tsx                   branch/year profile editor
      admin/layout.tsx                    RequireAdmin
      admin/pending/page.tsx               approve/reject queue
      admin/flags/page.tsx                  remove-material / ban-uploader queue
  components/
    ui/                            shadcn-generated primitives (Base UI-backed)
    layout/                         AppShell, ThemeToggle
    auth/                            RequireAuth, RequireAdmin
    materials/                        MaterialCard, SearchFilters, PdfViewer, CourseCombobox
  hooks/                          use-session, use-theme, use-debounced-value, use-materials, use-upload
  lib/                            api-client.ts (typed fetch wrapper, always sends credentials)
```

**Routing note:** the App Router's own root is `src/app/`; the product's authenticated URL prefix is also `/app`, so the authenticated route tree lives at `src/app/app/` — a folder literally named `app` nested inside the framework's `app` directory. Not a typo.

## Deployment target

Cloudflare Pages via `@cloudflare/next-on-pages` (backend on Azure — see `iiitone-backend`'s README). CI (`.github/workflows/ci.yml`) runs typecheck, lint, tests, `next build`, and `npm run pages:build` (the Cloudflare adapter build) on every push/PR to `main`. The Cloudflare Pages *project* itself (dashboard git integration, build command `npx @cloudflare/next-on-pages`, output directory `.vercel/output/static`) is a one-time setup step not yet done.

Note: `.npmrc` sets `legacy-peer-deps=true` because `@cloudflare/next-on-pages`'s peer range doesn't yet officially support Next 16 — see the comment in that file before removing it.
