import type { Scene, Character } from './types';

// Canvas layout constants — must match the card widths/gaps used in the canvas JSX.
export const PAD = 80;      // p-20 around the frame row
export const TITLE_W = 600; // title card width
export const SCENE_W = 450; // scene / cast / add-scene card width
export const GAP = 64;      // gap-16 between cards

export const MIN_SCALE = 0.1;
export const MAX_SCALE = 3;

// Rotating placeholder ideas for the first-launch chat bar
export const IDEAS = [
  'A cyberpunk detective searching for a lost AI in a neon-drenched city...',
  'A lonely lighthouse keeper befriends a glowing sea creature...',
  'Two rival street chefs fall in love during a midnight cook-off...',
  'A paper airplane crosses a war-torn city carrying a love letter...',
  'An astronaut finds a garden growing inside an abandoned space station...',
];

// Clapperboard stripe used on slate-styled cards
export const CLAPPER_STRIPES = 'repeating-linear-gradient(-45deg, #18181b 0 10px, #fafafa 10px 20px)';

// One consistent visual style for every generated panel
const STYLE_SUFFIX = ', cinematic film still, storyboard panel, dramatic lighting, highly detailed, 35mm film';

// Compact cast block appended to every scene prompt so characters stay consistent
const castBlock = (characters?: Character[]) => {
  if (!characters || characters.length === 0) return '';
  const block = characters.map((c) => `${c.name}: ${c.appearance}`).join('; ');
  return `. Consistent characters — ${block}`.slice(0, 600);
};

export const imageUrl = (scene: Scene, seed: number, characters?: Character[], attempt = 0) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(
    scene.imagePrompt + castBlock(characters) + STYLE_SUFFIX
  )}?width=800&height=450&nologo=true&model=flux&enhance=true&seed=${seed}${attempt ? `&r=${attempt}` : ''}`;

export const characterImageUrl = (character: Character, seed = 0) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(
    `Character reference portrait of ${character.name}: ${character.appearance}. Neutral studio background, head and shoulders, character sheet, cinematic film still, highly detailed`
  )}?width=400&height=400&nologo=true&model=flux&enhance=true&seed=${seed}`;
