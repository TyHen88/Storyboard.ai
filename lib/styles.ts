/**
 * Director-style presets. Shared by the client (style picker) and the server
 * (generate route), so this module stays framework-free — no 'use client', no
 * React. Each preset is described by cinematic characteristics rather than
 * imitation of a specific person.
 */

export interface StylePreset {
  id: string;
  label: string;
  /** Short hint shown in the picker. */
  hint: string;
  /** The style guide fed to the model as the consistent visual direction. */
  descriptor: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'cinematic',
    label: 'Cinematic',
    hint: 'Balanced modern film look',
    descriptor:
      'Balanced modern cinematic look: natural color grade, motivated realistic lighting, classical shot coverage, shallow-to-medium depth of field, filmic contrast.',
  },
  {
    id: 'epic-realist',
    label: 'Epic Realist',
    hint: 'Large-format, grounded, IMAX-scale',
    descriptor:
      'Epic realist style: large-format IMAX-scale framing, in-camera practical realism, high-contrast naturalistic lighting, restrained steely/desaturated palette, sweeping scope with grounded, tactile detail.',
  },
  {
    id: 'hand-drawn-wonder',
    label: 'Hand-Drawn Wonder',
    hint: 'Painterly 2D animation, lush nature',
    descriptor:
      'Hand-drawn animation style: painterly 2D cel look, lush detailed natural backgrounds, soft warm nostalgic palette, gentle rim light, expressive character acting, whimsical wonder.',
  },
  {
    id: 'symmetrical-whimsy',
    label: 'Symmetrical Whimsy',
    hint: 'Centered symmetry, pastel, deadpan',
    descriptor:
      'Symmetrical whimsical style: dead-center symmetrical compositions, flat frontal staging, meticulous production design, pastel storybook palette, deadpan tone, precise dollhouse framing.',
  },
  {
    id: 'sci-fi-minimalist',
    label: 'Sci-Fi Minimalist',
    hint: 'Brutalist scale, monochrome haze',
    descriptor:
      'Minimalist sci-fi style: brutalist monumental scale, monochromatic muted palette, atmospheric haze and negative space, slow deliberate symmetrical compositions, cold volumetric lighting.',
  },
  {
    id: 'neo-noir',
    label: 'Neo-Noir',
    hint: 'Low-key chiaroscuro, neon, rain',
    descriptor:
      'Neo-noir style: low-key chiaroscuro lighting, deep shadows, neon practical sources, rain-slick reflective surfaces, teal-and-orange grade, moody anamorphic framing.',
  },
];

export const DEFAULT_STYLE = STYLE_PRESETS[0].id;

export const styleDescriptor = (id: string | undefined): string => {
  const preset = STYLE_PRESETS.find((s) => s.id === id) ?? STYLE_PRESETS[0];
  return preset.descriptor;
};
