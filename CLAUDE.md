# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Storyboard — a Next.js (App Router) applet exported from Google AI Studio. The user enters a story concept (optionally with a reference image), Gemini generates a structured storyboard (title, concept, scenes with descriptions/actions/emotions/dialogue), and the scenes render as draggable/zoomable cards on an infinite canvas.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build (`output: 'standalone'`)
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`; lint errors are ignored during builds via `next.config.ts`, but TypeScript errors are not)

There is no test suite.

Requires `GEMINI_API_KEY` in `.env.local` (see `.env.example`). In AI Studio this is injected automatically from user secrets; locally you must set it yourself.

## Architecture

All state lives in `app/page.tsx` (`StoryboardApp`); child components are presentational and receive props/callbacks. Data flow: `page.tsx` owns `storyData`, canvas transform (scale/position/tool), per-scene image `seeds`, and inspector selection.

- `app/page.tsx` — state + handlers + composition. Hand-rolled pan/zoom canvas (CSS transform; wheel = pan, Ctrl/Cmd+wheel = cursor-anchored zoom, Space/H or Shift+drag = hand tool, V = pointer, Ctrl+\ = toggle sidebar). Layout constants in `lib/constants.ts` (PAD/TITLE_W/SCENE_W/GAP) must match card widths/gaps in the canvas JSX — `fitView`/`focusScene` compute positions from them.
- `components/` — `Sidebar` (collapsible left panel: prompt form pre-generation, poster + filmstrip + "New Take" after), `Inspector` (right panel for the selected scene, incl. "Edit with AI"), `ChatBar` (first-launch bottom input), `CanvasToolbar`, `SceneCard`, `TitleCard`, `SkeletonFrames` (loading), `GhostFrames` (empty state), `EditableText` (click-to-edit spans on cards).
- `app/api/{generate,edit-scene,add-scene}/route.ts` — Gemini calls (`@google/genai`, model `gemini-3.5-flash`) with `responseSchema` forcing structured JSON. The schemas live in `lib/gemini-schemas.ts` and mirror the interfaces in `lib/types.ts` — if you change one, change the other. All cinematic Scene/Character fields are optional in TS (older saves lack them) but required in the Gemini schemas.
- Persistence: `lib/storage.ts` auto-saves the project (validated) to localStorage; `page.tsx` restores it on mount. Export: `lib/export.ts` + `components/ExportDialog.tsx` build story docs / AI-video prompt packages (snake_case) / raw JSON in JSON/MD/TXT, scoped to all scenes, one scene, or a range.
- Scene images come from `image.pollinations.ai` via `imageUrl(scene, seed)` in `lib/constants.ts` (no server-side image generation); bumping a scene's seed regenerates its image. `SceneCard` derives its load/error state from `${seed}:${imagePrompt}` using the render-phase state-reset pattern (not an effect — the `react-hooks/set-state-in-effect` lint rule is enforced).
- Theme: class-based dark mode (`@custom-variant dark` in `globals.css`) stored in localStorage outside React (`lib/theme.ts`, read via `useSyncExternalStore` to avoid hydration mismatch). The Figma-style canvas surface is `#1E1E1E` in dark mode.

Styling is Tailwind CSS v4 (PostCSS plugin, no tailwind.config). The user prefers no build/lint/typecheck runs after style-only changes — verify only when logic, imports, state, types, or components change.

## AI Studio Constraints

This project is tied to Google AI Studio (see `metadata.json`, `assets/.aistudio/`):

- `next.config.ts` disables webpack file watching when `DISABLE_HMR=true` (set by AI Studio) — do not remove this.
- The Gemini client sends a `User-Agent: aistudio-build` header.
- `images.remotePatterns` only allows `picsum.photos`; pollinations.ai images bypass optimization via `unoptimized` on the `<Image>`.
