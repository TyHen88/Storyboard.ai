export interface Dialogue {
  character: string;
  text: string;
  /** Emotional delivery of the line, e.g. "whispered, fearful". */
  emotion?: string;
}

export interface Character {
  name: string;
  role: string;
  /** Consolidated, highly detailed visual description — kept identical across all scenes. */
  appearance: string;
  age?: string;
  height?: string;
  face?: string;
  hairstyle?: string;
  clothing?: string;
  accessories?: string;
  personality?: string;
  voiceStyle?: string;
  /** How the character's emotional state evolves across the story. */
  emotionalArc?: string;
}

export interface Scene {
  sceneNumber: number;
  title: string;
  description: string;
  imagePrompt: string;
  action: string;
  emotion: string;
  dialogue: Dialogue[];
  // Cinematic fields (optional for backward compatibility with older saves)
  location?: string;
  timeOfDay?: string;
  environment?: string;
  /** Names of base characters present in this scene. */
  charactersPresent?: string[];
  cameraPosition?: string;
  cameraAngle?: string;
  cameraMovement?: string;
  shotType?: string;
  composition?: string;
  lighting?: string;
  mood?: string;
  cinematicStyle?: string;
  visualDetails?: string;
  soundEffects?: string;
  backgroundMusic?: string;
  negativePrompt?: string;
  /** Suggested transition into the next scene. */
  transition?: string;
}

export interface StoryData {
  title: string;
  concept: string;
  characters?: Character[];
  scenes: Scene[];
}
