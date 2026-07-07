import { NextRequest, NextResponse } from "next/server";
import { SCENE_SCHEMA, DIRECTING_RULES } from "@/lib/gemini-schemas";
import { geminiGenerate, friendlyGeminiError } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { storyTitle, storyConcept, characters, scenes, instruction, model } = await req.json();

    if (!scenes || !Array.isArray(scenes)) {
      return NextResponse.json(
        { error: "Existing scenes are required" },
        { status: 400 }
      );
    }

    const parts = [
      {
        text: `You are an expert film director, cinematographer and storyboard artist adding the NEXT scene to an existing storyboard.

Story title: "${storyTitle ?? ""}"
Story concept: "${storyConcept ?? ""}"

Base characters (their appearances are the single source of truth — never redesign them, never add new characters):
${JSON.stringify(characters ?? [], null, 2)}

Existing scenes so far:
${JSON.stringify(scenes, null, 2)}

${instruction?.trim() ? `The user wants the new scene to be about: "${instruction}".` : 'Continue the story naturally from the last scene.'}

Write ONE new scene that follows logically from the existing scenes, stays consistent with the story's setting, tone and characters, and serves the overall concept. The imagePrompt must be self-contained and repeat the FULL verbatim appearance of every base character present. Use the same visual style as the rest of the board. Fill every field.
${DIRECTING_RULES}`,
      },
    ];

    const data = await geminiGenerate(parts, SCENE_SCHEMA, model);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const { message, status } = friendlyGeminiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
