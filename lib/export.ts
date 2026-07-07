import type { StoryData, Scene, Character } from './types';

/**
 * Export builders: complete story / scene selections as JSON, Markdown or
 * plain text — plus a prompt package optimized for AI video generation.
 */

export type ExportContent = 'story' | 'video' | 'raw';
export type ExportFormat = 'json' | 'md' | 'txt';
export type ExportScope =
  | { kind: 'all' }
  | { kind: 'scene'; sceneNumber: number }
  | { kind: 'range'; from: number; to: number };

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

/** One production-ready video-generation prompt for a scene. */
export const buildVideoPrompt = (scene: Scene, characters: Character[] = []): string => {
  const cast = castFor(scene, characters);
  const lines = [
    scene.description,
    '',
    [
      scene.location && `Location: ${scene.location}`,
      scene.timeOfDay && `Time: ${scene.timeOfDay}`,
      scene.environment && `Environment: ${scene.environment}`,
    ]
      .filter(Boolean)
      .join('. '),
    cast.length > 0 ? `Characters (keep appearances exactly consistent):\n${cast.map((c) => `- ${characterLine(c)}`).join('\n')}` : '',
    scene.action && `Action & body language: ${scene.action}`,
    scene.emotion && `Emotions: ${scene.emotion}`,
    scene.dialogue.length > 0 ? `Dialogue:\n${scene.dialogue.map((d) => `- ${dialogueLine(d)}`).join('\n')}` : '',
    [
      scene.shotType && `Shot: ${scene.shotType}`,
      scene.cameraPosition && `camera position: ${scene.cameraPosition}`,
      scene.cameraAngle && `angle: ${scene.cameraAngle}`,
      scene.cameraMovement && `movement: ${scene.cameraMovement}`,
      scene.composition && `composition: ${scene.composition}`,
    ]
      .filter(Boolean)
      .join(', '),
    [
      scene.lighting && `Lighting: ${scene.lighting}`,
      scene.mood && `Mood: ${scene.mood}`,
      scene.cinematicStyle && `Style: ${scene.cinematicStyle}`,
    ]
      .filter(Boolean)
      .join('. '),
    scene.visualDetails && `Visual details: ${scene.visualDetails}`,
    [
      scene.soundEffects && `Sound effects: ${scene.soundEffects}`,
      scene.backgroundMusic && `Music: ${scene.backgroundMusic}`,
    ]
      .filter(Boolean)
      .join('. '),
    scene.negativePrompt && `Negative prompt: ${scene.negativePrompt}`,
  ];
  return lines.filter(Boolean).join('\n');
};

/** Structured snake_case object for AI video generators. */
export const sceneToVideoJSON = (scene: Scene, characters: Character[] = []) => ({
  scene_number: scene.sceneNumber,
  scene_title: scene.title,
  prompt: buildVideoPrompt(scene, characters),
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

const storyMd = (story: StoryData, scenes: Scene[]): string => {
  const parts = [
    `# ${story.title}`,
    '',
    `> ${story.concept}`,
    '',
  ];
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

const videoMd = (story: StoryData, scenes: Scene[]): string => {
  const parts = [
    `# ${story.title} — AI Video Prompt Package`,
    '',
    `> ${story.concept}`,
    '',
  ];
  scenes.forEach((scene) => {
    parts.push(`## Scene ${scene.sceneNumber}: ${scene.title}`, '', '```', buildVideoPrompt(scene, story.characters), '```', '');
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
  scope: ExportScope
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
    if (format === 'json') {
      return {
        filename: `${base}-video-prompts.json`,
        mime: 'application/json',
        data: JSON.stringify(
          {
            title: story.title,
            concept: story.concept,
            characters: (story.characters ?? []).map((c) => ({ name: c.name, role: c.role, appearance: c.appearance })),
            scenes: scenes.map((s) => sceneToVideoJSON(s, story.characters)),
          },
          null,
          2
        ),
      };
    }
    const md = videoMd(story, scenes);
    return format === 'md'
      ? { filename: `${base}-video-prompts.md`, mime: 'text/markdown', data: md }
      : { filename: `${base}-video-prompts.txt`, mime: 'text/plain', data: mdToTxt(md) };
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
