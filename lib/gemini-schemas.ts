import { Type } from '@google/genai';

/**
 * Shared Gemini responseSchema definitions used by the generate / edit-scene /
 * add-scene API routes. These mirror the interfaces in lib/types.ts — if you
 * change one, change the other.
 */

export const CHARACTER_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    role: { type: Type.STRING, description: 'Role in the story, e.g. protagonist, mentor, antagonist.' },
    appearance: {
      type: Type.STRING,
      description:
        'Consolidated, highly detailed visual appearance combining face, hair, clothing, build and distinctive features. This exact text is the single source of truth and must stay identical across all scenes.',
    },
    age: { type: Type.STRING, description: 'Apparent age, e.g. "early 30s".' },
    height: { type: Type.STRING, description: 'Height / build, e.g. "tall and lean, ~185cm".' },
    face: { type: Type.STRING, description: 'Facial features: shape, eyes, nose, mouth, skin, marks.' },
    hairstyle: { type: Type.STRING, description: 'Hair color, length, texture and style.' },
    clothing: { type: Type.STRING, description: 'Signature outfit worn throughout the story.' },
    accessories: { type: Type.STRING, description: 'Glasses, jewelry, weapons, props always carried.' },
    personality: { type: Type.STRING, description: 'Core personality traits.' },
    voiceStyle: { type: Type.STRING, description: 'How they speak: tone, pace, accent, quirks.' },
    emotionalArc: { type: Type.STRING, description: "How this character's emotional state evolves across the story." },
  },
  required: ['name', 'role', 'appearance', 'age', 'hairstyle', 'clothing', 'personality', 'voiceStyle', 'emotionalArc'],
};

export const SCENE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    sceneNumber: { type: Type.NUMBER },
    title: { type: Type.STRING },
    description: { type: Type.STRING, description: 'Detailed prose description of everything happening in the scene.' },
    imagePrompt: {
      type: Type.STRING,
      description:
        'Self-contained prompt for an image model: shot type, camera angle, setting, lighting, action, and the full verbatim appearance of every base character present.',
    },
    action: { type: Type.STRING, description: 'Character actions and body language, including facial expressions.' },
    emotion: { type: Type.STRING, description: 'Primary emotions of the characters in the scene.' },
    dialogue: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          character: { type: Type.STRING },
          text: { type: Type.STRING },
          emotion: { type: Type.STRING, description: 'Emotional delivery, e.g. "whispered, fearful".' },
        },
        required: ['character', 'text', 'emotion'],
      },
    },
    location: { type: Type.STRING, description: 'Specific place where the scene happens.' },
    timeOfDay: { type: Type.STRING, description: 'Time of day, e.g. "golden hour, late afternoon".' },
    environment: { type: Type.STRING, description: 'Environment details: weather, props, background activity.' },
    charactersPresent: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Names of base characters appearing in this scene. Only names from the base cast.',
    },
    cameraPosition: { type: Type.STRING, description: 'Where the camera sits relative to subjects, e.g. "low, 2m in front of the door".' },
    cameraAngle: { type: Type.STRING, description: 'Angle, e.g. "low angle", "eye level", "birds-eye".' },
    cameraMovement: { type: Type.STRING, description: 'Pan, Tilt, Dolly, Crane, Handheld, Steadicam, Orbit, Zoom, or Static.' },
    shotType: { type: Type.STRING, description: 'Extreme Wide, Wide, Medium, Close-up, Extreme Close-up, Over-the-Shoulder, etc.' },
    composition: { type: Type.STRING, description: 'Subject framing, focus depth, perspective, rule of thirds, leading lines.' },
    lighting: { type: Type.STRING, description: 'Lighting setup: key light, color, contrast, practical sources.' },
    mood: { type: Type.STRING, description: 'Mood and atmosphere of the scene.' },
    cinematicStyle: { type: Type.STRING, description: 'Visual style, e.g. "neo-noir, teal-orange grade, anamorphic".' },
    visualDetails: { type: Type.STRING, description: 'Small visual details that sell the shot: textures, particles, reflections.' },
    soundEffects: { type: Type.STRING, description: 'Key sound effects heard in the scene.' },
    backgroundMusic: { type: Type.STRING, description: 'Background music mood/instrumentation.' },
    negativePrompt: {
      type: Type.STRING,
      description: 'What an AI video/image generator must avoid: artifacts, extra limbs, inconsistent faces, text, watermarks, style drift.',
    },
    transition: { type: Type.STRING, description: 'Suggested transition into the next scene, e.g. "match cut on the closing door".' },
  },
  required: [
    'sceneNumber', 'title', 'description', 'imagePrompt', 'action', 'emotion', 'dialogue',
    'location', 'timeOfDay', 'environment', 'charactersPresent',
    'cameraPosition', 'cameraAngle', 'cameraMovement', 'shotType', 'composition',
    'lighting', 'mood', 'cinematicStyle', 'visualDetails', 'negativePrompt', 'transition',
  ],
};

export const WORLD_SCHEMA = {
  type: Type.OBJECT,
  description: 'World & Style bible shared by every scene for consistency.',
  properties: {
    name: { type: Type.STRING, description: 'Name of the world/setting.' },
    genre: { type: Type.STRING, description: 'Primary genre.' },
    tone: { type: Type.STRING, description: 'Overall tone, e.g. "hopeful, melancholic".' },
    pacing: { type: Type.STRING, description: 'Pacing, e.g. "slow-burn", "propulsive".' },
    setting: { type: Type.STRING, description: 'Where the story takes place.' },
    timePeriod: { type: Type.STRING, description: 'Era / time period.' },
    technologyOrMagic: { type: Type.STRING, description: 'Technology level or magic/physics rules of the world.' },
    colorPalette: { type: Type.STRING, description: 'Signature color palette used throughout.' },
    visualStyle: { type: Type.STRING, description: 'The single consistent cinematic style guide applied to every scene.' },
    lightingStyle: { type: Type.STRING, description: 'Signature lighting approach.' },
    atmosphere: { type: Type.STRING, description: 'Recurring atmosphere: weather, particles, mood.' },
  },
  required: ['name', 'genre', 'setting', 'colorPalette', 'visualStyle', 'lightingStyle', 'atmosphere'],
};

/** Compact pre-production plan produced before any scene is written. */
export const BLUEPRINT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Working title of the film.' },
    logline: { type: Type.STRING, description: 'One-sentence logline capturing the dramatic core.' },
    genre: { type: Type.STRING },
    tone: { type: Type.STRING },
    pacing: { type: Type.STRING },
    targetAudience: { type: Type.STRING },
    world: WORLD_SCHEMA,
    characters: {
      type: Type.ARRAY,
      description: 'The Character Bible — the permanent, single-source-of-truth cast.',
      items: CHARACTER_SCHEMA,
    },
    beats: {
      type: Type.ARRAY,
      description: 'Ordered scene beats forming a 3-act arc — one beat per final scene.',
      items: {
        type: Type.OBJECT,
        properties: {
          act: { type: Type.NUMBER, description: 'Act number (1, 2, or 3).' },
          title: { type: Type.STRING, description: 'Short beat/scene title.' },
          goal: { type: Type.STRING, description: 'What the scene is trying to achieve.' },
          conflict: { type: Type.STRING, description: 'The obstacle or tension in the scene.' },
          emotion: { type: Type.STRING, description: 'Dominant emotion of the beat.' },
          purpose: { type: Type.STRING, description: 'Why this beat exists in the overall story.' },
        },
        required: ['act', 'title', 'goal', 'conflict', 'emotion', 'purpose'],
      },
    },
  },
  required: ['title', 'logline', 'genre', 'tone', 'pacing', 'world', 'characters', 'beats'],
};

export const STORY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Title of the story/film' },
    concept: { type: Type.STRING, description: 'Overall concept or logline' },
    world: WORLD_SCHEMA,
    characters: {
      type: Type.ARRAY,
      description: 'The base cast. Appearances must stay identical in every scene.',
      items: CHARACTER_SCHEMA,
    },
    scenes: {
      type: Type.ARRAY,
      items: SCENE_SCHEMA,
    },
  },
  required: ['title', 'concept', 'world', 'characters', 'scenes'],
};

/** Shared directing rules appended to every route's prompt. */
export const DIRECTING_RULES = `
CINEMATOGRAPHY RULES (mandatory for every scene):
- Professional camera direction: exact camera position, camera angle, camera movement (Pan/Tilt/Dolly/Crane/Handheld/Steadicam/Orbit/Zoom/Static), shot size (Extreme Wide/Wide/Medium/Close-up/Extreme Close-up/Over-the-Shoulder), composition (subject framing, focus depth, perspective).
- Full production detail: location, time of day, environment, lighting setup, mood, one consistent cinematic style across the whole film, telling visual details, sound effects, background-music mood, and a negative prompt (things generators must avoid: deformed faces, extra limbs, watermarks, text, character redesigns, style drift).
- Dialogue lines include their emotional delivery. Actions describe body language AND facial expressions.
- charactersPresent lists only names from the base cast. Character appearances are the single source of truth — repeat them verbatim inside imagePrompt, never redesign, never add new characters.
- Each scene ends with a transition suggestion into the next scene.`;
