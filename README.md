# IIITOne — Web

Next.js (App Router) frontend for **IIITOne**, the academic resource hub for IIIT Jabalpur (IIITDMJ) students — Google-login-gated browse/search of notes and PYQs, upload with an inline PDF viewer, and admin moderation screens.

This repo covers **Phase 1 (Academic Resource Hub)** only. See `docs/superpowers/plans/2026-07-17-frontend-phase1.md` for the full task-by-task plan and `../iiitone-backend/docs/superpowers/specs/` for the approved design spec.

> **Status: work in progress.** Scaffold, design system, API client, app shell, auth guards, and the browse/search page are implemented and tested. Material detail/PDF viewer, upload, profile, and admin pages are still in progress. This frontend also depends on the sibling `iiitone-backend` repo — until that backend's router/handlers are fully wired (see its README), authenticated flows here have nothing real to talk to.

## Tech stack

- Next.js 16 (App Router, TypeScript) — note: this is a recent major version with some API differences from Next 14; see `AGENTS.md` in this repo if something in App Router behavior looks unfamiliar
- Tailwind CSS v4 (CSS-first config, no `tailwind.config.ts`) + [shadcn/ui](https://ui.shadcn.com) on top of [Base UI](https://base-ui.com) primitives (not Radix — this affects a few component APIs, e.g. `Button` uses a `render` prop instead of `asChild`)
- [TanStack Query](https://tanstack.com/query) for server state
- [Sonner](https://sonner.emilkowal.ski) for toasts (shadcn's classic `toast` component is deprecated in the installed CLI version)
- `react-pdf` for the inline PDF viewer (planned, Task 7)
- Vitest + React Testing Library

## Prerequisites

- Node 20+
- The `iiitone-backend` repo running locally for any authenticated flow to actually work (see its README)

## Local dev setup

```bash
npm install
cp .env.example .env.local   # points NEXT_PUBLIC_API_URL at the local backend
npm run dev                  # http://localhost:3000
```

```bash
npx vitest run       # run tests
npm run build         # production build
npm run lint           # lint
```

## Project layout

```text
src/
  app/
    page.tsx            landing/login page
    layout.tsx           root layout (fonts, providers, theme flash-guard script)
    providers.tsx         QueryClientProvider + Toaster
    app/                  the authenticated /app/* URL segment (yes, app/app — see note below)
      layout.tsx           RequireAuth + AppShell
      page.tsx              browse/search page
      admin/                 RequireAdmin-gated routes
  components/
    ui/                    shadcn-generated primitives (Base UI-backed)
    layout/                 AppShell, ThemeToggle
    auth/                   RequireAuth, RequireAdmin
    materials/               MaterialCard, SearchFilters, (PdfViewer, CourseCombobox — in progress)
  hooks/                    use-session, use-theme, use-debounced-value, use-materials
  lib/                      api-client.ts (typed fetch wrapper, always sends credentials)
```

**Routing note:** the App Router's own root is `src/app/`; the product's authenticated URL prefix is also `/app`, so the authenticated route tree lives at `src/app/app/` — a folder literally named `app` nested inside the framework's `app` directory. Not a typo.

## Deployment target (not yet wired)

Cloudflare Pages via `@cloudflare/next-on-pages` (backend on Azure — see `iiitone-backend`'s README). Not set up yet; this is a target, not a working pipeline.
