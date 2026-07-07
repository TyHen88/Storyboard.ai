import { NextRequest, NextResponse } from "next/server";
import { STORY_SCHEMA, BLUEPRINT_SCHEMA, DIRECTING_RULES } from "@/lib/gemini-schemas";
import { geminiGenerate, friendlyGeminiError } from "@/lib/gemini";
import { styleDescriptor } from "@/lib/styles";

/**
 * Storyboard generation as a small film-production pipeline instead of one
 * giant prompt:
 *   1. Blueprint — plan genre/tone/pacing, a World & Style bible, a Character
 *      bible, and a 3-act beat outline (one beat per scene).
 *   2. Produce  — expand the blueprint into full cinematic scenes.
 *   3. QA       — a continuity pass that fixes drift before the user sees it.
 * Each stage validates the previous one; any stage can fall back so a single
 * failed pass never breaks generation.
 */

/** Clamp the requested scene count to the supported 1–6 range. */
function clampSceneCount(raw: unknown): number {
  const n = Math.round(Number(raw));
  if (!Number.isFinite(n)) return 6;
  return Math.min(6, Math.max(1, n));
}

/** Narrative structure guidance tailored to how many scenes were requested. */
function structureGuidance(count: number): string {
  if (count === 1) {
    return `a single, self-contained, iconic beat that captures the heart of the concept — the most cinematic, emotionally loaded moment.`;
  }
  if (count === 2) {
    return `2 beats: a setup that establishes world and stakes, and a payoff that resolves or twists them.`;
  }
  if (count === 3) {
    return `3 beats in a tight three-act shape: setup → confrontation → resolution, each raising the stakes.`;
  }
  return `${count} beats forming a complete arc (setup → rising action → climax → resolution), with the climax near the end and the final beat resolving the story.`;
}

/** Build the reference-image content part from a data URL, if present. */
function imagePart(image?: string): any | null {
  if (!image) return null;
  const match = image.match(/^data:(image\/[a-zA-Z]*);base64,([^\"]*)$/);
  if (!match) return null;
  return { inlineData: { mimeType: match[1], data: match[2] } };
}

/** Stage 1 — the pre-production blueprint. */
async function generateBlueprint(
  prompt: string,
  count: number,
  style: string,
  model: string | undefined,
  image?: string
) {
  const parts: any[] = [
    {
      text: `You are a Story Planner, Story Architect, Production Designer and Character Director building the pre-production blueprint for a cinematic storyboard.

User concept: "${prompt}"

Honor this visual style as the film's consistent look: ${style}

Produce a BLUEPRINT that FAITHFULLY serves the user's concept (same subject, genre, tone, setting):
1. Determine genre, tone, pacing, target audience, and a one-sentence logline built around the dramatic core (who wants what, what's in the way, the feeling to leave the audience with).
2. WORLD & STYLE BIBLE: name, genre, setting, time period, technology/magic rules, signature color palette, a single consistent visualStyle (fuse the requested style above), lighting style, and recurring atmosphere. This bible governs every scene.
3. CHARACTER BIBLE: define ${'1-4'} main characters (only as many as the story needs). Each gets a full, specific, memorable profile with a consolidated appearance that is the single source of truth and never changes.
4. BEATS: break the story into ${structureGuidance(count)} Provide EXACTLY ${count} beats, ordered, tagged with their act (1/2/3), each with goal, conflict, emotion, and story purpose. Beats must follow logically and track each character's emotional arc.`,
    },
  ];
  const img = imagePart(image);
  if (img) {
    parts.push(img);
    parts.push({
      text: "Use the attached reference image as the visual reference for the characters and/or setting: match its subjects' appearance and style in the World and Character bibles.",
    });
  }
  return geminiGenerate(parts, BLUEPRINT_SCHEMA, model);
}

/** Stage 2 — expand the blueprint into full cinematic scenes. */
async function produceScenes(blueprint: any, count: number, model: string | undefined) {
  const parts: any[] = [
    {
      text: `You are a Screenwriter, Director and Storyboard Artist turning a pre-production blueprint into a production-ready storyboard for AI video generation.

BLUEPRINT (authoritative — do not contradict it):
${JSON.stringify(blueprint, null, 2)}

Write the full storyboard as structured data:
- Carry the blueprint's World & Style bible into "world" (keep its meaning; you may polish wording).
- Use the blueprint's Character Bible verbatim as "characters" — appearances are the single source of truth and must stay identical in every scene; never add characters outside this cast.
- Produce EXACTLY ${count} scenes, one per beat, in the blueprint's order. Each scene must realize its beat's goal, conflict, emotion and purpose.
- Every scene's imagePrompt must be self-contained (shot, angle, setting, lighting, action) and repeat the FULL verbatim appearance of every character present, using world.visualStyle as the one consistent style.
- Show emotion and stakes through staging and imagery; keep dialogue sparse and purposeful; vary shot types scene to scene.
${DIRECTING_RULES}`,
    },
  ];
  return geminiGenerate(parts, STORY_SCHEMA, model);
}

/** Stage 3 — continuity QA: fix drift, return the corrected storyboard. */
async function continuityPass(story: any, count: number, model: string | undefined) {
  const parts: any[] = [
    {
      text: `You are a Continuity Checker and Editor performing final QA on a storyboard before delivery.

STORYBOARD JSON:
${JSON.stringify(story, null, 2)}

Inspect every scene for continuity errors and FIX them in place:
- Character appearance / clothing / hair / age drift between scenes.
- Sudden unexplained lighting, weather, or time-of-day jumps.
- Emotional progression that doesn't follow from the previous scene.
- Timeline or spatial logic errors; camera sanity (avoid crossing the 180° line without motivation).
- imagePrompts that fail to repeat the base character appearances verbatim or drift from world.visualStyle.

Return the COMPLETE corrected StoryData: same title, same "world", same "characters", the same ${count} scenes with unchanged sceneNumbers. Change only what is genuinely inconsistent; preserve everything else. Every field must remain filled.
${DIRECTING_RULES}`,
    },
  ];
  return geminiGenerate(parts, STORY_SCHEMA, model);
}

/** Fallback — the original single-call generation, used if the pipeline fails. */
async function generateLegacy(
  prompt: string,
  count: number,
  style: string,
  model: string | undefined,
  image?: string
) {
  const parts: any[] = [
    {
      text: `You are an award-winning film director, cinematographer, screenwriter and storyboard artist producing a production-ready storyboard for AI video generation based on: "${prompt}".

Honor this visual style throughout: ${style}

FAITHFULLY follow the user's subject, genre, tone and setting.
1. WORLD & STYLE BIBLE ("world"): name, genre, setting, time period, tech/magic, color palette, a single consistent visualStyle (fuse the requested style), lighting style, atmosphere.
2. CHARACTERS (1-4): full profiles with a consolidated appearance that is the single source of truth and never changes.
3. SCENES: exactly ${count} scenes forming a complete narrative arc (setup → rising action → climax → resolution), with the climax near the end and the final scene resolving the story. Each imagePrompt is self-contained and repeats every present character's appearance verbatim, in one consistent visualStyle.
${DIRECTING_RULES}`,
    },
  ];
  const img = imagePart(image);
  if (img) {
    parts.push(img);
    parts.push({
      text: 'Use the attached reference image as the visual reference for the characters and/or setting.',
    });
  }
  return geminiGenerate(parts, STORY_SCHEMA, model);
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, image, sceneCount, model, style } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const count = clampSceneCount(sceneCount);
    const styleGuide = styleDescriptor(style);

    // Stage 1: blueprint. If it fails, fall back to the single-call generator.
    let blueprint: any;
    try {
      blueprint = await generateBlueprint(prompt, count, styleGuide, model, image);
    } catch (err) {
      console.warn("Blueprint stage failed, using legacy single-call generation.", err);
      const legacy = await generateLegacy(prompt, count, styleGuide, model, image);
      return NextResponse.json(legacy);
    }

    // Stage 2: produce scenes from the blueprint (core — legacy fallback if it fails).
    let story: any;
    try {
      story = await produceScenes(blueprint, count, model);
    } catch (err) {
      console.warn("Produce stage failed, using legacy single-call generation.", err);
      const legacy = await generateLegacy(prompt, count, styleGuide, model, image);
      return NextResponse.json(legacy);
    }

    // Stage 3: continuity QA (best-effort). Skipped for 1–2 scenes, where there's
    // little continuity to drift and it isn't worth the extra latency.
    if (count >= 3) {
      try {
        const checked = await continuityPass(story, count, model);
        if (checked?.scenes?.length) story = checked;
      } catch (err) {
        console.warn("Continuity QA stage failed, returning produced storyboard.", err);
      }
    }

    return NextResponse.json(story);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const { message, status } = friendlyGeminiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
