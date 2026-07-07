import { NextRequest, NextResponse } from "next/server";
import { STORY_SCHEMA, DIRECTING_RULES } from "@/lib/gemini-schemas";
import { geminiGenerate, friendlyGeminiError } from "@/lib/gemini";

/** Clamp the requested scene count to the supported 1–6 range. */
function clampSceneCount(raw: unknown): number {
  const n = Math.round(Number(raw));
  if (!Number.isFinite(n)) return 6;
  return Math.min(6, Math.max(1, n));
}

/**
 * Narrative structure guidance tailored to how many scenes were requested.
 * One scene is a single iconic shot; a full arc only makes sense with several.
 */
function structureGuidance(count: number): string {
  if (count === 1) {
    return `Write exactly ONE scene: a single, self-contained, iconic shot that captures the heart of the concept — the most cinematic, emotionally loaded moment of the story. It must stand alone with no "to be continued" feeling.`;
  }
  if (count === 2) {
    return `Write exactly 2 scenes: a setup that establishes the world and stakes, and a payoff that resolves or twists them. The second must follow directly and meaningfully from the first.`;
  }
  if (count === 3) {
    return `Write exactly 3 scenes forming a tight three-act shape: setup → confrontation → resolution. Each turn should raise the stakes.`;
  }
  return `Write exactly ${count} scenes forming a complete narrative arc (setup → rising action → climax → resolution), pacing the beats so the climax lands near the end and the final scene resolves the story.`;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, image, sceneCount, model } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const count = clampSceneCount(sceneCount);

    let parts: any[] = [
      { text: `You are an award-winning film director, cinematographer, screenwriter and storyboard artist producing a production-ready storyboard for AI video generation.
The user wants a storytelling experience/film based on this prompt: "${prompt}".

Your job is to turn that prompt into a vivid, coherent visual story. Think first about the dramatic core: who wants what, what stands in the way, and the single feeling the audience should leave with. Then build the board around that. FAITHFULLY honor the user's subject, genre, tone and setting — never drift into a different premise.

1. BASE CHARACTERS: first define the main characters (1-4, only as many as the story truly needs). For each provide the full profile: role, consolidated appearance (the single source of truth), age, height, face, hairstyle, clothing, accessories, personality, voice style, and their emotional arc across the story. Give them specific, memorable, non-generic looks. Appearances must stay identical in every scene — never redesign them, never add characters outside this cast.

2. SCENES: ${structureGuidance(count)} Each scene must follow logically from the previous one, stay consistent in setting/tone/time period, and directly serve the user's prompt. Vary the shot types and camera work scene to scene so the board feels edited, not repetitive. Track each character's emotional progression scene to scene, consistent with their emotional arc. Prefer showing emotion and stakes through action, staging and imagery over on-the-nose exposition. Keep dialogue sparse, natural and purposeful — cut any line that doesn't reveal character or move the story.

3. IMAGE PROMPTS: each scene's imagePrompt must be fully self-contained for an image model: shot type and camera angle, setting and time of day, lighting and mood, the action happening — and it must repeat the FULL exact appearance description of every base character present (copy the base description verbatim). Use one consistent visual style across all imagePrompts.
${DIRECTING_RULES}` }
    ];

    if (image) {
      // Split "data:image/jpeg;base64,..." to get the pure base64 data and mime type
      const match = image.match(/^data:(image\/[a-zA-Z]*);base64,([^\"]*)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        });
        parts.push({
          text: "Use the attached reference image as the visual reference for the base characters and/or setting: match its subjects' appearance and style in the base character descriptions and image prompts."
        });
      }
    }

    const data = await geminiGenerate(parts, STORY_SCHEMA, model);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const { message, status } = friendlyGeminiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
