'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { X, RefreshCw, Copy, Check, Sparkles, Loader2, Plus } from 'lucide-react';
import { imageUrl } from '@/lib/constants';
import type { Scene, Dialogue, Character } from '@/lib/types';

// Cinematography / production fields editable in the inspector
const CINE_FIELDS: { key: keyof Scene; label: string }[] = [
  { key: 'location', label: 'Location' },
  { key: 'timeOfDay', label: 'Time of day' },
  { key: 'shotType', label: 'Shot type' },
  { key: 'cameraPosition', label: 'Camera position' },
  { key: 'cameraAngle', label: 'Camera angle' },
  { key: 'cameraMovement', label: 'Camera movement' },
  { key: 'composition', label: 'Composition' },
  { key: 'lighting', label: 'Lighting' },
  { key: 'mood', label: 'Mood' },
  { key: 'cinematicStyle', label: 'Cinematic style' },
  { key: 'visualDetails', label: 'Visual details' },
  { key: 'transition', label: 'Transition to next' },
  { key: 'soundEffects', label: 'Sound effects' },
  { key: 'backgroundMusic', label: 'Music mood' },
  { key: 'negativePrompt', label: 'Negative prompt' },
];

/** Figma-style right panel for editing the selected scene, incl. AI revision. */
export default function Inspector({
  scene,
  seed,
  characters,
  copied,
  aiInstruction,
  onAiInstructionChange,
  isRevising,
  reviseError,
  onRevise,
  onClose,
  onRegenerate,
  onCopyPrompt,
  onApplyImagePrompt,
  onUpdateScene,
  onUpdateDialogue,
  onAddDialogue,
  onRemoveDialogue,
}: {
  scene: Scene;
  seed: number;
  characters?: Character[];
  copied: boolean;
  aiInstruction: string;
  onAiInstructionChange: (v: string) => void;
  isRevising: boolean;
  reviseError: string;
  onRevise: () => void;
  onClose: () => void;
  onRegenerate: () => void;
  onCopyPrompt: () => void;
  onApplyImagePrompt: (v: string) => void;
  onUpdateScene: (patch: Partial<Scene>) => void;
  onUpdateDialogue: (index: number, patch: Partial<Dialogue>) => void;
  onAddDialogue: () => void;
  onRemoveDialogue: (index: number) => void;
}) {
  const promptDraftRef = useRef<HTMLTextAreaElement>(null);

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 320, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-800 flex flex-col z-10 shadow-sm overflow-hidden shrink-0"
    >
      <div className="w-80 shrink-0 h-full flex flex-col">
        {/* Inspector header */}
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 tracking-widest shrink-0">
              SC {String(scene.sceneNumber).padStart(2, '0')}
            </span>
            <span className="text-sm font-semibold truncate dark:text-zinc-100">Inspector</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Close inspector"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Image preview */}
          <div className="flex flex-col gap-2">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
              <Image
                src={imageUrl(scene, seed, characters)}
                alt={scene.title}
                fill
                unoptimized
                referrerPolicy="no-referrer"
                className="object-cover"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={onRegenerate}
                className="flex-1 text-[11px] font-medium py-1.5 px-2 rounded-md border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={12} /> Regenerate
              </button>
              <button
                onClick={onCopyPrompt}
                className="flex-1 text-[11px] font-medium py-1.5 px-2 rounded-md border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-green-600 dark:text-green-400" /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={12} /> Copy prompt
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Assist */}
          <div className="flex flex-col gap-2 p-3 rounded-lg border border-indigo-200/70 dark:border-indigo-500/25 bg-indigo-50/50 dark:bg-indigo-500/5">
            <label className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={11} /> Edit with AI
            </label>
            <textarea
              className="w-full h-16 p-2 text-xs border border-indigo-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-white dark:bg-zinc-950 dark:text-zinc-300 placeholder:text-gray-400 dark:placeholder:text-zinc-600"
              placeholder="e.g. Make it more dramatic, set it at night, add tension to the dialogue..."
              value={aiInstruction}
              onChange={(e) => onAiInstructionChange(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') onRevise();
              }}
            />
            <button
              onClick={onRevise}
              disabled={isRevising || !aiInstruction.trim()}
              className="w-full py-1.5 px-3 rounded-md text-xs font-medium bg-indigo-500 text-white hover:bg-indigo-600 disabled:bg-gray-200 dark:disabled:bg-zinc-800 disabled:text-gray-400 dark:disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
            >
              {isRevising ? (
                <>
                  <Loader2 size={12} className="animate-spin" /> Revising scene...
                </>
              ) : (
                <>
                  <Sparkles size={12} /> Revise scene
                </>
              )}
            </button>
            {reviseError && (
              <div className="text-[11px] text-red-500 dark:text-red-400">{reviseError}</div>
            )}
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Title</label>
            <input
              className="w-full p-2 text-xs border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-zinc-950 dark:text-zinc-300"
              value={scene.title}
              onChange={(e) => onUpdateScene({ title: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Description</label>
            <textarea
              className="w-full h-20 p-2 text-xs border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50 dark:bg-zinc-950 dark:text-zinc-300"
              value={scene.description}
              onChange={(e) => onUpdateScene({ description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Action</label>
              <textarea
                className="w-full h-16 p-2 text-xs border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50 dark:bg-zinc-950 dark:text-zinc-300"
                value={scene.action}
                onChange={(e) => onUpdateScene({ action: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Emotion</label>
              <textarea
                className="w-full h-16 p-2 text-xs border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50 dark:bg-zinc-950 dark:text-zinc-300"
                value={scene.emotion}
                onChange={(e) => onUpdateScene({ emotion: e.target.value })}
              />
            </div>
          </div>

          {/* Cinematography */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Cinematography</label>
            <div className="grid grid-cols-2 gap-2">
              {CINE_FIELDS.map((f) => (
                <div key={f.key} className="flex flex-col gap-1">
                  <span className="text-[9px] font-semibold text-gray-400 dark:text-zinc-600 uppercase tracking-wide">{f.label}</span>
                  <input
                    className="w-full p-1.5 text-[11px] border border-gray-300 dark:border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 dark:bg-zinc-950 dark:text-zinc-300"
                    value={(scene[f.key] as string) ?? ''}
                    placeholder="—"
                    onChange={(e) => onUpdateScene({ [f.key]: e.target.value } as Partial<Scene>)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Image prompt (draft + apply so the image doesn't reload per keystroke) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Image Prompt</label>
            <textarea
              key={`${scene.sceneNumber}:${scene.imagePrompt}`}
              ref={promptDraftRef}
              defaultValue={scene.imagePrompt}
              className="w-full h-24 p-2 text-xs border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50 dark:bg-zinc-950 dark:text-zinc-300"
            />
            <button
              onClick={() => {
                const v = promptDraftRef.current?.value ?? '';
                onApplyImagePrompt(v);
              }}
              className="w-full py-1.5 px-3 rounded-md text-[11px] font-medium border border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={11} /> Apply &amp; regenerate image
            </button>
          </div>

          {/* Dialogue */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Dialogue</label>
              <button
                onClick={onAddDialogue}
                className="p-1 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:text-zinc-500 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Add dialogue line"
              >
                <Plus size={13} />
              </button>
            </div>
            {scene.dialogue.length === 0 && (
              <div className="text-[11px] text-gray-400 dark:text-zinc-600 italic">No dialogue in this scene.</div>
            )}
            {scene.dialogue.map((line, i) => (
              <div key={i} className="flex flex-col gap-1 p-2 rounded-md border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50">
                <div className="flex items-center gap-1">
                  <input
                    className="flex-1 p-1.5 text-[11px] font-semibold uppercase border border-gray-200 dark:border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-zinc-950 dark:text-zinc-300"
                    value={line.character}
                    onChange={(e) => onUpdateDialogue(i, { character: e.target.value })}
                  />
                  <button
                    onClick={() => onRemoveDialogue(i)}
                    className="p-1 rounded text-gray-300 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 transition-colors shrink-0"
                    title="Remove line"
                  >
                    <X size={12} />
                  </button>
                </div>
                <textarea
                  className="w-full h-12 p-1.5 text-[11px] border border-gray-200 dark:border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none bg-white dark:bg-zinc-950 dark:text-zinc-300"
                  value={line.text}
                  onChange={(e) => onUpdateDialogue(i, { text: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
