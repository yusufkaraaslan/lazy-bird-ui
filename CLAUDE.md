# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Standalone React + TypeScript dashboard for the **lazy-bird** automation system. This is the frontend client only — it connects to the lazy-bird REST API (FastAPI backend at `http://localhost:5000`) for all data operations.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server (default http://localhost:5173)
npm run build        # Type-check (tsc -b) then Vite production build
npm run lint         # ESLint
npm run preview      # Preview production build locally
```

There is no test suite configured yet.

## Architecture

### Tech Stack

- React 19 + TypeScript + Vite 7
- TanStack Query v5 for server state (caching, polling, mutations)
- Zustand for client state (persisted to localStorage)
- React Router v7 for routing
- Tailwind CSS v4 for styling
- Framer Motion for animations
- @dnd-kit for drag-and-drop block reordering
- Lucide React for icons

### State Management Split

- **Server state** (projects, queue, system status, analytics, agents): TanStack Query hooks in `src/hooks/`. These auto-poll — system status every 5s, projects/queue every 10s.
- **Client state** (active tab, current view, block layout, theme): Zustand stores in `src/store/`, persisted to localStorage under keys `dashboard-storage` and `theme-storage`.

### Modular Block System

The dashboard uses a plugin-style block architecture:

1. **Block Registry** (`src/config/blockRegistry.ts`) — central registry mapping block type IDs to their component, metadata, and which tab/view they belong to.
2. **Block components** (`src/components/blocks/`) — self-contained widgets implementing `BlockProps` interface (receives `blockId`, `config`, `onRemove`, `onConfigChange`).
3. **Dashboard Store** manages which blocks are visible, their order, and per-block config. Users can add/remove/reorder blocks.

To add a new dashboard block: create component in `src/components/blocks/`, register it in `BLOCK_REGISTRY`, and it auto-appears in the "Add Block" dropdown.

There are two view modes:
- **Overall view** — system-wide blocks (SystemStatus, ActiveProjects, QueueOverview, AgentStatus, RecentActivity, CostTracker)
- **Project view** — per-project blocks (ProjectHeader, ProjectIssues, ProjectStatistics, ProjectTimeline, ProjectTestHistory, ProjectCost)

### Navigation Structure

Three top-level tabs (managed by Zustand, not routes):
- **Dashboard** — block-based views (overall / project / agent)
- **Analytics** — analytics content
- **Settings** — opens route-based pages for projects, queue, services, and system settings

Settings sub-pages use React Router with route-based forms (not modals) — `/projects/add`, `/projects/:id/edit`, `/services/:name/edit`, etc. All settings routes are wrapped in `SettingsPageWrapper`.

### API Layer

`src/lib/api.ts` — Axios client with base URL from `VITE_API_URL` env var (defaults to `http://localhost:5000`). API modules: `projectsApi`, `systemApi`, `queueApi`, `settingsApi`, `issuesApi`, `agentsApi`, `analyticsApi`.

All API types are in `src/types/api.ts`.

### Custom Hooks Pattern

All API logic lives in hooks (`src/hooks/`), not components. Each hook wraps TanStack Query's `useQuery` or `useMutation` and handles cache invalidation via `queryClient.invalidateQueries()`. Query keys follow a hierarchical pattern: `['projects']`, `['system', 'status']`, `['queue', projectId]`.

### Theme System

`src/config/theme.ts` defines design tokens (colors, z-index layers, layout constants, Framer Motion variants). Theme mode (light/dark/system) is in the Zustand theme store with auto-detection of OS preference.

## Environment Variables

```
VITE_API_URL=http://localhost:5000   # Backend API base URL (default if unset)
```
