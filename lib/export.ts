import type { StoryData, Scene, Character, WorldBible } from './types';

/**
 * Export builders: complete story / scene selections as JSON, Markdown or
 * plain text — plus prompt packages optimized for specific AI video generators.
 */

export type ExportContent = 'story' | 'video' | 'raw';
export type ExportFormat = 'json' | 'md' | 'txt';
export type ExportScope =
  | { kind: 'all' }
  | { kind: 'scene'; sceneNumber: number }
  | { kind: 'range'; from: number; to: number };

/** Target AI video model for prompt tailoring. 'all' emits every variant (JSON only). */
export type VideoProvider = 'universal' | 'veo' | 'kling' | 'runway' | 'pika' | 'luma' | 'all';

export const VIDEO_PROVIDERS: { value: VideoProvider; label: string; hint: string }[] = [
  { value: 'universal', label: 'Universal', hint: 'Rich, model-agnostic prompt' },
  { value: 'veo', label: 'Google Veo', hint: 'Cinematic prose incl. audio' },
  { value: 'kling', label: 'Kling', hint: 'Structured, motion + negative' },
  { value: 'runway', label: 'Runway', hint: 'Concise, camera-forward' },
  { value: 'pika', label: 'Pika', hint: 'Short with style tags' },
  { value: 'luma', label: 'Luma Dream Machine', hint: 'Natural language, ending frame' },
  { value: 'all', label: 'All providers', hint: 'One variant each (JSON only)' },
];

const scopeScenes = (story: StoryData, scope: ExportScope): Scene[] => {
  switch (scope.kind) {
    case 'all':
      return story.scenes;
    case 'scene':
      return story.scenes.filter((s) => s.sceneNumber === scope.sceneNumber);
    case 'range':
      return story.scenes.filter((s) => s.sceneNumber >= scope.from && s.sceneNumber <= scope.to);
  }
};

const castFor = (scene: Scene, characters: Character[]): Character[] => {
  if (!scene.charactersPresent || scene.charactersPresent.length === 0) return characters;
  const present = characters.filter((c) => scene.charactersPresent!.includes(c.name));
  return present.length > 0 ? present : characters;
};

const characterLine = (c: Character): string => {
  const extras = [
    c.age && `age: ${c.age}`,
    c.height && `height: ${c.height}`,
    c.personality && `personality: ${c.personality}`,
    c.voiceStyle && `voice: ${c.voiceStyle}`,
  ]
    .filter(Boolean)
    .join('; ');
  return `${c.name} (${c.role}): ${c.appearance}${extras ? ` [${extras}]` : ''}`;
};

const dialogueLine = (d: Scene['dialogue'][number]): string =>
  `${d.character.toUpperCase()}${d.emotion ? ` (${d.emotion})` : ''}: "${d.text}"`;

const join = (parts: (string | undefined | false)[], sep = ', ') => parts.filter(Boolean).join(sep);

/** Common, provider-agnostic facts pulled from a scene + the world bible. */
function sceneFacts(scene: Scene, characters: Character[], world?: WorldBible) {
  const cast = castFor(scene, characters);
  return {
    cast,
    subjects: cast.map(characterLine),
    setting: join([scene.location, scene.timeOfDay, scene.environment]),
    action: scene.action,
    emotion: scene.emotion,
    camera: join([scene.shotType, scene.cameraAngle, scene.cameraMovement, scene.cameraPosition, scene.composition]),
    lighting: join([scene.lighting, world?.lightingStyle], '; '),
    mood: scene.mood,
    style: join([scene.cinematicStyle, world?.visualStyle], '; '),
    palette: world?.colorPalette,
    atmosphere: join([scene.visualDetails, world?.atmosphere], '; '),
    audio: join([scene.soundEffects && `SFX: ${scene.soundEffects}`, scene.backgroundMusic && `music: ${scene.backgroundMusic}`], '; '),
    dialogue: scene.dialogue.map(dialogueLine),
    negative: scene.negativePrompt,
    ending: scene.transition,
    description: scene.description,
  };
}

/** Universal, richly detailed production prompt (model-agnostic). */
export const buildVideoPrompt = (scene: Scene, characters: Character[] = [], world?: WorldBible): string => {
  const f = sceneFacts(scene, characters, world);
  const lines = [
    f.description,
    '',
    join([scene.location && `Location: ${scene.location}`, scene.timeOfDay && `Time: ${scene.timeOfDay}`, scene.environment && `Environment: ${scene.environment}`], '. '),
    f.cast.length ? `Characters (keep appearances exactly consistent):\n${f.cast.map((c) => `- ${characterLine(c)}`).join('\n')}` : '',
    f.action && `Action & body language: ${f.action}`,
    f.emotion && `Emotions: ${f.emotion}`,
    f.dialogue.length ? `Dialogue:\n${f.dialogue.map((d) => `- ${d}`).join('\n')}` : '',
    f.camera && `Camera: ${f.camera}`,
    join([f.lighting && `Lighting: ${f.lighting}`, f.mood && `Mood: ${f.mood}`, f.palette && `Color palette: ${f.palette}`], '. '),
    f.style && `Visual style: ${f.style}`,
    f.atmosphere && `Visual details & atmosphere: ${f.atmosphere}`,
    f.audio && `Audio: ${f.audio}`,
    f.ending && `Ending / transition: ${f.ending}`,
    f.negative && `Negative prompt: ${f.negative}`,
  ];
  return lines.filter(Boolean).join('\n');
};

/** Google Veo — flowing cinematic prose, includes audio direction. */
const veoPrompt = (f: ReturnType<typeof sceneFacts>): string =>
  join(
    [
      f.camera ? `${f.camera}.` : 'Cinematic shot.',
      `${f.description}`,
      f.subjects.length > 0 && `Featuring ${f.subjects.join('; ')}.`,
      f.setting && `Setting: ${f.setting}.`,
      f.action && `${f.action}.`,
      f.emotion && `The mood is ${f.emotion}${f.mood ? `, ${f.mood}` : ''}.`,
      f.lighting && `Lighting: ${f.lighting}.`,
      f.palette && `Color palette: ${f.palette}.`,
      f.style && `Visual style: ${f.style}.`,
      f.atmosphere && `${f.atmosphere}.`,
      f.audio && `Audio: ${f.audio}.`,
      f.ending && `End on ${f.ending}.`,
      f.negative && `Avoid: ${f.negative}.`,
    ],
    ' '
  );

/** Kling — structured, emphasizes subject + motion + camera, explicit negative. */
const klingPrompt = (f: ReturnType<typeof sceneFacts>): string =>
  join(
    [
      f.subjects.length > 0 && `Subject: ${f.subjects.join('; ')}`,
      f.setting && `Scene: ${f.setting}`,
      f.action && `Motion: ${f.action}`,
      f.camera && `Camera: ${f.camera}`,
      join([f.lighting && `Lighting: ${f.lighting}`, f.mood && `mood: ${f.mood}`], ', '),
      f.style && `Style: ${f.style}`,
      f.palette && `Palette: ${f.palette}`,
      f.negative && `Negative prompt: ${f.negative}`,
    ],
    '\n'
  );

/** Runway — concise, camera-forward, present tense. */
const runwayPrompt = (f: ReturnType<typeof sceneFacts>): string =>
  join(
    [
      f.camera && `${f.camera}:`,
      f.description,
      f.action && `${f.action}`,
      f.subjects.length > 0 && `Subjects: ${f.subjects.join('; ')}`,
      join([f.lighting, f.mood, f.style], ', '),
    ],
    ' '
  );

/** Pika — short and punchy with trailing style/mood tags. */
const pikaPrompt = (f: ReturnType<typeof sceneFacts>): string => {
  const base = join([f.description, f.action, f.camera], ', ');
  const tags = join([f.style, f.mood, f.palette], ', ');
  const neg = f.negative ? ` -neg ${f.negative}` : '';
  return `${base}${tags ? ` — ${tags}` : ''}${neg}`;
};

/** Luma Dream Machine — natural language, smooth motion, explicit ending frame. */
const lumaPrompt = (f: ReturnType<typeof sceneFacts>): string =>
  join(
    [
      f.description,
      f.action && `${f.action}, with smooth natural motion.`,
      f.camera && `Camera: ${f.camera}.`,
      join([f.lighting && `${f.lighting}`, f.mood, f.style], ', '),
      f.ending ? `The shot ends on ${f.ending}.` : 'Hold a clean final frame.',
    ],
    ' '
  );

/** Build a prompt tailored to a specific provider. */
export const buildProviderPrompt = (
  provider: Exclude<VideoProvider, 'all'>,
  scene: Scene,
  characters: Character[] = [],
  world?: WorldBible
): string => {
  if (provider === 'universal') return buildVideoPrompt(scene, characters, world);
  const f = sceneFacts(scene, characters, world);
  switch (provider) {
    case 'veo':
      return veoPrompt(f);
    case 'kling':
      return klingPrompt(f);
    case 'runway':
      return runwayPrompt(f);
    case 'pika':
      return pikaPrompt(f);
    case 'luma':
      return lumaPrompt(f);
  }
};

/** All provider variants for one scene, keyed by provider id. */
export const sceneVideoPrompts = (scene: Scene, characters: Character[] = [], world?: WorldBible) =>
  Object.fromEntries(
    VIDEO_PROVIDERS.filter((p) => p.value !== 'all').map((p) => [
      p.value,
      buildProviderPrompt(p.value as Exclude<VideoProvider, 'all'>, scene, characters, world),
    ])
  );

/** Structured snake_case object for AI video generators. */
export const sceneToVideoJSON = (
  scene: Scene,
  characters: Character[] = [],
  world?: WorldBible,
  provider: VideoProvider = 'universal'
) => ({
  scene_number: scene.sceneNumber,
  scene_title: scene.title,
  ...(provider === 'all'
    ? { prompts: sceneVideoPrompts(scene, characters, world) }
    : { prompt: buildProviderPrompt(provider, scene, characters, world) }),
  location: scene.location ?? '',
  time: scene.timeOfDay ?? '',
  environment: scene.environment ?? '',
  characters: castFor(scene, characters).map((c) => ({
    name: c.name,
    role: c.role,
    appearance: c.appearance,
    age: c.age ?? '',
    height: c.height ?? '',
    face: c.face ?? '',
    hairstyle: c.hairstyle ?? '',
    clothing: c.clothing ?? '',
    accessories: c.accessories ?? '',
    personality: c.personality ?? '',
    voice_style: c.voiceStyle ?? '',
  })),
  dialogue: scene.dialogue.map((d) => ({ character: d.character, text: d.text, emotion: d.emotion ?? '' })),
  actions: scene.action,
  emotions: scene.emotion,
  camera_position: scene.cameraPosition ?? '',
  camera_angle: scene.cameraAngle ?? '',
  camera_movement: scene.cameraMovement ?? '',
  shot_type: scene.shotType ?? '',
  composition: scene.composition ?? '',
  lighting: scene.lighting ?? '',
  mood: scene.mood ?? '',
  cinematic_style: scene.cinematicStyle ?? '',
  visual_details: scene.visualDetails ?? '',
  sound_effects: scene.soundEffects ?? '',
  background_music: scene.backgroundMusic ?? '',
  negative_prompt: scene.negativePrompt ?? '',
  transition: scene.transition ?? '',
});

const worldToJSON = (w?: WorldBible) =>
  w
    ? {
        name: w.name ?? '',
        genre: w.genre ?? '',
        tone: w.tone ?? '',
        pacing: w.pacing ?? '',
        setting: w.setting ?? '',
        time_period: w.timePeriod ?? '',
        technology_or_magic: w.technologyOrMagic ?? '',
        color_palette: w.colorPalette ?? '',
        visual_style: w.visualStyle ?? '',
        lighting_style: w.lightingStyle ?? '',
        atmosphere: w.atmosphere ?? '',
      }
    : undefined;

const sceneFieldsMd = (scene: Scene): string => {
  const rows: [string, string | undefined][] = [
    ['Location', scene.location],
    ['Time', scene.timeOfDay],
    ['Environment', scene.environment],
    ['Action', scene.action],
    ['Emotion', scene.emotion],
    ['Shot type', scene.shotType],
    ['Camera position', scene.cameraPosition],
    ['Camera angle', scene.cameraAngle],
    ['Camera movement', scene.cameraMovement],
    ['Composition', scene.composition],
    ['Lighting', scene.lighting],
    ['Mood', scene.mood],
    ['Cinematic style', scene.cinematicStyle],
    ['Visual details', scene.visualDetails],
    ['Sound effects', scene.soundEffects],
    ['Music', scene.backgroundMusic],
    ['Negative prompt', scene.negativePrompt],
    ['Transition', scene.transition],
  ];
  return rows
    .filter(([, v]) => v)
    .map(([k, v]) => `- **${k}:** ${v}`)
    .join('\n');
};

const worldMd = (w?: WorldBible): string[] => {
  if (!w) return [];
  const rows = [
    w.genre && `- **Genre:** ${w.genre}`,
    w.tone && `- **Tone:** ${w.tone}`,
    w.pacing && `- **Pacing:** ${w.pacing}`,
    w.setting && `- **Setting:** ${w.setting}`,
    w.timePeriod && `- **Time period:** ${w.timePeriod}`,
    w.technologyOrMagic && `- **Technology / magic:** ${w.technologyOrMagic}`,
    w.colorPalette && `- **Color palette:** ${w.colorPalette}`,
    w.visualStyle && `- **Visual style:** ${w.visualStyle}`,
    w.lightingStyle && `- **Lighting:** ${w.lightingStyle}`,
    w.atmosphere && `- **Atmosphere:** ${w.atmosphere}`,
  ].filter(Boolean) as string[];
  if (!rows.length) return [];
  return [`## World & Style${w.name ? ` — ${w.name}` : ''}`, '', ...rows, ''];
};

const storyMd = (story: StoryData, scenes: Scene[]): string => {
  const parts = [`# ${story.title}`, '', `> ${story.concept}`, '', ...worldMd(story.world)];
  if (story.characters?.length) {
    parts.push('## Cast', '');
    story.characters.forEach((c) => {
      parts.push(`### ${c.name} — ${c.role}`, '', c.appearance, '');
      const extras = [
        c.age && `- **Age:** ${c.age}`,
        c.height && `- **Height:** ${c.height}`,
        c.face && `- **Face:** ${c.face}`,
        c.hairstyle && `- **Hair:** ${c.hairstyle}`,
        c.clothing && `- **Clothing:** ${c.clothing}`,
        c.accessories && `- **Accessories:** ${c.accessories}`,
        c.personality && `- **Personality:** ${c.personality}`,
        c.voiceStyle && `- **Voice:** ${c.voiceStyle}`,
        c.emotionalArc && `- **Emotional arc:** ${c.emotionalArc}`,
      ].filter(Boolean) as string[];
      if (extras.length) parts.push(...extras, '');
    });
  }
  scenes.forEach((scene) => {
    parts.push(`## Scene ${scene.sceneNumber}: ${scene.title}`, '', scene.description, '');
    const fields = sceneFieldsMd(scene);
    if (fields) parts.push(fields, '');
    if (scene.dialogue.length) {
      parts.push('**Dialogue:**', '');
      scene.dialogue.forEach((d) => parts.push(`> ${dialogueLine(d)}`));
      parts.push('');
    }
    parts.push(`**Image prompt:** ${scene.imagePrompt}`, '');
  });
  return parts.join('\n');
};

const videoMd = (story: StoryData, scenes: Scene[], provider: VideoProvider): string => {
  const label = VIDEO_PROVIDERS.find((p) => p.value === provider)?.label ?? 'Universal';
  const parts = [`# ${story.title} — ${label} Video Prompts`, '', `> ${story.concept}`, '', ...worldMd(story.world)];
  // 'all' isn't meaningful for md/txt — fall back to universal for readable text.
  const single = (provider === 'all' ? 'universal' : provider) as Exclude<VideoProvider, 'all'>;
  scenes.forEach((scene) => {
    parts.push(
      `## Scene ${scene.sceneNumber}: ${scene.title}`,
      '',
      '```',
      buildProviderPrompt(single, scene, story.characters, story.world),
      '```',
      ''
    );
    if (scene.transition) parts.push(`_Transition: ${scene.transition}_`, '');
  });
  return parts.join('\n');
};

const mdToTxt = (md: string): string =>
  md
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^> /gm, '')
    .replace(/^```$/gm, '')
    .replace(/^_(.+)_$/gm, '$1');

const slug = (s: string) => s.replace(/[^a-z0-9]+/gi, '-').toLowerCase().replace(/^-|-$/g, '') || 'storyboard';

export function buildExport(
  story: StoryData,
  content: ExportContent,
  format: ExportFormat,
  scope: ExportScope,
  provider: VideoProvider = 'universal'
): { filename: string; mime: string; data: string } {
  const scenes = scopeScenes(story, scope);
  const scopeSuffix =
    scope.kind === 'scene' ? `-scene-${scope.sceneNumber}` : scope.kind === 'range' ? `-scenes-${scope.from}-${scope.to}` : '';
  const base = `${slug(story.title)}${scopeSuffix}`;

  if (content === 'raw') {
    return {
      filename: `${base}.json`,
      mime: 'application/json',
      data: JSON.stringify(scope.kind === 'all' ? story : { ...story, scenes }, null, 2),
    };
  }

  if (content === 'video') {
    const providerSlug = provider === 'universal' ? '' : `-${provider}`;
    if (format === 'json') {
      return {
        filename: `${base}-video-prompts${providerSlug}.json`,
        mime: 'application/json',
        data: JSON.stringify(
          {
            title: story.title,
            concept: story.concept,
            provider,
            world: worldToJSON(story.world),
            characters: (story.characters ?? []).map((c) => ({ name: c.name, role: c.role, appearance: c.appearance })),
            scenes: scenes.map((s) => sceneToVideoJSON(s, story.characters, story.world, provider)),
          },
          null,
          2
        ),
      };
    }
    const md = videoMd(story, scenes, provider);
    return format === 'md'
      ? { filename: `${base}-video-prompts${providerSlug}.md`, mime: 'text/markdown', data: md }
      : { filename: `${base}-video-prompts${providerSlug}.txt`, mime: 'text/plain', data: mdToTxt(md) };
  }

  // content === 'story'
  if (format === 'json') {
    return {
      filename: `${base}.json`,
      mime: 'application/json',
      data: JSON.stringify({ ...story, scenes }, null, 2),
    };
  }
  const md = storyMd(story, scenes);
  return format === 'md'
    ? { filename: `${base}.md`, mime: 'text/markdown', data: md }
    : { filename: `${base}.txt`, mime: 'text/plain', data: mdToTxt(md) };
}

export function downloadExport(exp: { filename: string; mime: string; data: string }) {
  const blob = new Blob([exp.data], { type: exp.mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = exp.filename;
  a.click();
  URL.revokeObjectURL(url);
}
