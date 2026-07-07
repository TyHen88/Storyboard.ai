import { NextRequest, NextResponse } from "next/server";
import { SCENE_SCHEMA, DIRECTING_RULES } from "@/lib/gemini-schemas";
import { geminiGenerate, friendlyGeminiError } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { scene, instruction, storyTitle, storyConcept, characters } = await req.json();

    if (!scene || !instruction) {
      return NextResponse.json(
        { error: "Scene and instruction are required" },
        { status: 400 }
      );
    }

    const parts = [
      {
        text: `You are an expert film director, cinematographer and storyboard artist revising a single scene of an existing storyboard.

Story title: "${storyTitle ?? ""}"
Story concept: "${storyConcept ?? ""}"

Base characters (their appearances are the single source of truth — never redesign them, never add new characters):
${JSON.stringify(characters ?? [], null, 2)}

Current scene JSON:
${JSON.stringify(scene, null, 2)}

Revise this scene according to the user's instruction: "${instruction}".
Keep sceneNumber unchanged. Only change what the instruction requires, keeping the rest consistent with the story. If the visual content changes, update imagePrompt — it must remain self-contained and repeat the FULL verbatim appearance of every base character present. Return the complete revised scene with every field filled.
${DIRECTING_RULES}`,
      },
    ];

    const data = await geminiGenerate(parts, SCENE_SCHEMA);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const { message, status } = friendlyGeminiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
