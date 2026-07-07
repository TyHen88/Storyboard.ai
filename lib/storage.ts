import type { StoryData, Scene } from './types';

/**
 * localStorage persistence for the current project. The structure is validated
 * both before saving and after loading so corrupted data never enters the app.
 */

const STORAGE_KEY = 'sb-project-v1';

export interface SavedProject {
  storyData: StoryData;
  seeds: Record<number, number>;
  savedAt: string;
}

const isString = (v: unknown): v is string => typeof v === 'string';

const isValidScene = (s: any): s is Scene =>
  !!s &&
  typeof s === 'object' &&
  typeof s.sceneNumber === 'number' &&
  isString(s.title) &&
  isString(s.description) &&
  isString(s.imagePrompt) &&
  isString(s.action) &&
  isString(s.emotion) &&
  Array.isArray(s.dialogue) &&
  s.dialogue.every((d: any) => !!d && isString(d.character) && isString(d.text));

export function validateStoryData(data: any): data is StoryData {
  return (
    !!data &&
    typeof data === 'object' &&
    isString(data.title) &&
    isString(data.concept) &&
    Array.isArray(data.scenes) &&
    data.scenes.length > 0 &&
    data.scenes.every(isValidScene) &&
    (data.characters === undefined ||
      (Array.isArray(data.characters) &&
        data.characters.every(
          (c: any) => !!c && isString(c.name) && isString(c.role) && isString(c.appearance)
        )))
  );
}

export function saveProject(storyData: StoryData, seeds: Record<number, number>): boolean {
  if (!validateStoryData(storyData)) return false;
  try {
    const payload: SavedProject = {
      storyData,
      seeds,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    // Quota exceeded or storage unavailable — nothing we can do
    return false;
  }
}

export function loadProject(): SavedProject | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !validateStoryData(parsed.storyData)) return null;
    return {
      storyData: parsed.storyData,
      seeds: parsed.seeds && typeof parsed.seeds === 'object' ? parsed.seeds : {},
      savedAt: isString(parsed.savedAt) ? parsed.savedAt : '',
    };
  } catch {
    return null;
  }
}

export function clearProject() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
