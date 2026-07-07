# AI Storyboard

Turn a story idea into a visual storyboard in seconds. Describe a concept (optionally with a reference image), and Gemini generates a structured storyboard — title, concept, and scenes with descriptions, actions, emotions, and dialogue — rendered as cards on an infinite, Figma-style canvas.

## Features

- **AI story generation** — Gemini (`gemini-3.5-flash`) returns structured JSON via a response schema; no brittle text parsing.
- **Adjustable length** — choose 1–6 scenes before generating; the director prompt adapts its narrative structure to the count (single iconic shot → full four-act arc).
- **Infinite canvas** — pan, zoom, and drag scene cards around a hand-rolled CSS-transform canvas.
- **Scene images** — each scene gets an illustration from [pollinations.ai](https://pollinations.ai); hit "New Take" to reroll with a fresh seed.
- **Inline editing** — click any text on a card to edit it, or use the Inspector's "Edit with AI" to rewrite a scene with a prompt.
- **Add scenes with AI** — extend the story one scene at a time, in context.
- **Export** — story docs, AI-video prompt packages, or raw JSON in JSON/MD/TXT formats, scoped to all scenes, one scene, or a range.
- **Auto-save** — the project persists to localStorage and restores on reload.
- **Dark mode** — class-based theme with no hydration flicker.

### Keyboard & mouse

| Input | Action |
| --- | --- |
| Wheel | Pan |
| Ctrl/Cmd + Wheel | Zoom (anchored at cursor) |
| `Space` or `H` (hold) / Shift + drag | Hand tool |
| `V` | Pointer tool |
| Ctrl + `\` | Toggle sidebar |

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` from [.env.example](.env.example) and set your Gemini API key (get one at [aistudio.google.com](https://aistudio.google.com/apikey)):

   ```
   GEMINI_API_KEY="your-key-here"
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

   Then open http://localhost:3000.

### Other commands

| Command | Description |
| --- | --- |
| `npm run build` | Production build (standalone output) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Project Structure

```
app/
  page.tsx              # All app state: storyboard data, canvas transform, selection
  api/
    generate/           # Generate a full storyboard from a prompt (+ optional image)
    edit-scene/         # Rewrite a scene with an AI instruction
    add-scene/          # Append a new AI-generated scene
components/
  Sidebar.tsx           # Prompt form → poster, filmstrip, "New Take"
  Inspector.tsx         # Right panel for the selected scene, incl. "Edit with AI"
  SceneCard.tsx         # Draggable scene card with image + editable text
  ExportDialog.tsx      # Export options (format, scope)
  ...
lib/
  types.ts              # Storyboard/Scene/Character interfaces
  gemini-schemas.ts     # Gemini responseSchema (mirrors types.ts)
  constants.ts          # Canvas layout constants + pollinations image URL builder
  storage.ts            # localStorage auto-save/restore
  export.ts             # Export document builders
```

## How It Works

- `app/page.tsx` owns all state; components are presentational. The canvas is a CSS-transformed div — no canvas library.
- The API routes call Gemini through `@google/genai` with `responseSchema` forcing structured JSON output. Schemas in `lib/gemini-schemas.ts` mirror the TypeScript interfaces in `lib/types.ts`.
- Scene images aren't generated server-side: `imageUrl(scene, seed)` builds a deterministic `image.pollinations.ai` URL from the scene's image prompt and a per-scene seed.

## AI Studio Notes

This project is designed to run inside Google AI Studio, which injects `GEMINI_API_KEY` and `APP_URL` automatically. Locally you set them yourself in `.env.local`. Webpack file watching is disabled when `DISABLE_HMR=true` (set by AI Studio) — see `next.config.ts`.

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router, React 19)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [@google/genai](https://www.npmjs.com/package/@google/genai) — Gemini API client
- [motion](https://motion.dev/) + [lucide-react](https://lucide.dev/)
