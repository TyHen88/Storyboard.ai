'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Image as ImageIcon, MessageSquare, Loader2, RefreshCw, Copy, Check, Video, MapPin } from 'lucide-react';
import EditableText from './EditableText';
import { imageUrl } from '@/lib/constants';
import type { Scene, Dialogue, Character } from '@/lib/types';

const MAX_RETRIES = 2;

export default function SceneCard({
  scene,
  idx,
  seed,
  characters,
  selected,
  copied,
  onSelect,
  onCopyPrompt,
  onRegenerate,
  onUpdateScene,
  onUpdateDialogue,
}: {
  scene: Scene;
  idx: number;
  seed: number;
  characters?: Character[];
  selected: boolean;
  copied: boolean;
  onSelect: () => void;
  onCopyPrompt: () => void;
  onRegenerate: () => void;
  onUpdateScene: (patch: Partial<Scene>) => void;
  onUpdateDialogue: (index: number, patch: Partial<Dialogue>) => void;
}) {
  // Image load state, reset whenever the seed or prompt changes (render-phase derive).
  // `attempt` bumps the URL to auto-retry failed loads before showing the error state.
  const imgKey = `${seed}:${scene.imagePrompt}`;
  const [statusKey, setStatusKey] = useState(imgKey);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  if (statusKey !== imgKey) {
    setStatusKey(imgKey);
    setStatus('loading');
    setAttempt(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`bg-white dark:bg-zinc-900 rounded-xl shadow-md border w-[450px] shrink-0 flex flex-col relative transition-shadow ${selected ? 'border-blue-500 ring-2 ring-blue-500/60 shadow-lg' : 'border-gray-200 dark:border-zinc-800'}`}
    >
      <div className="absolute -top-6 left-0 text-[10px] font-bold text-gray-400 dark:text-zinc-600 tracking-wider">SCENE-{scene.sceneNumber}.FRAME</div>

      {/* Frame Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50 dark:bg-zinc-950 rounded-t-xl">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 shrink-0">SCENE {scene.sceneNumber}</span>
          <span className="text-sm font-semibold truncate dark:text-zinc-200">{scene.title}</span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={onCopyPrompt}
            className="p-1.5 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:text-zinc-500 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Copy image prompt"
          >
            {copied ? <Check size={14} className="text-green-600 dark:text-green-400" /> : <Copy size={14} />}
          </button>
          <button
            onClick={onRegenerate}
            className="p-1.5 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:text-zinc-500 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Regenerate image"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* AI Generated Image */}
      <div className="w-full aspect-video bg-gray-200 dark:bg-zinc-800 relative overflow-hidden">
        {status === 'error' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-zinc-500">
            <ImageIcon size={28} />
            <span className="text-xs">Image failed to load</span>
            <button
              onClick={onRegenerate}
              className="text-xs font-medium text-gray-600 dark:text-zinc-300 border border-gray-300 dark:border-zinc-600 rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-1"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        ) : (
          <>
            {status !== 'loaded' && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center">
                <Loader2 size={22} className="animate-spin text-gray-400 dark:text-zinc-500" />
              </div>
            )}
            <Image
              key={`${imgKey}:${attempt}`}
              src={imageUrl(scene, seed, characters, attempt)}
              alt={scene.title}
              fill
              className={`object-cover transition-opacity duration-500 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
              unoptimized
              referrerPolicy="no-referrer"
              onLoad={() => setStatus('loaded')}
              onError={() => {
                // Auto-retry with a fresh URL before surfacing the error UI
                if (attempt < MAX_RETRIES) setAttempt((a) => a + 1);
                else setStatus('error');
              }}
            />
          </>
        )}
      </div>

      {/* Camera direction strip */}
      {(scene.shotType || scene.cameraMovement || scene.location) && (
        <div className="px-4 py-2 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-1.5 flex-wrap bg-gray-50/50 dark:bg-zinc-950/50">
          {scene.shotType && (
            <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-px rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 uppercase tracking-wide">
              <Video size={9} /> {scene.shotType}
            </span>
          )}
          {scene.cameraMovement && (
            <span className="inline-flex items-center text-[9px] font-semibold px-1.5 py-px rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 uppercase tracking-wide">
              {scene.cameraMovement}
            </span>
          )}
          {scene.location && (
            <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-px rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 uppercase tracking-wide truncate max-w-[160px]">
              <MapPin size={9} /> {scene.location}{scene.timeOfDay ? ` · ${scene.timeOfDay}` : ''}
            </span>
          )}
        </div>
      )}

      {/* Frame Body */}
      <div className="p-5 flex flex-col gap-4">
        <div>
          <div className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Description</div>
          <EditableText
            multiline
            value={scene.description}
            onCommit={(v) => onUpdateScene({ description: v })}
            className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Action</div>
            <EditableText
              multiline
              value={scene.action}
              onCommit={(v) => onUpdateScene({ action: v })}
              className="text-xs text-gray-600 dark:text-zinc-400"
            />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Emotion</div>
            <EditableText
              multiline
              value={scene.emotion}
              onCommit={(v) => onUpdateScene({ emotion: v })}
              className="text-xs text-gray-600 dark:text-zinc-400"
            />
          </div>
        </div>

        {scene.dialogue && scene.dialogue.length > 0 && (
          <div className="mt-2 p-4 bg-gray-50 dark:bg-zinc-950/50 rounded-md border border-gray-100 dark:border-zinc-800/50">
            <div className="flex items-center gap-1.5 mb-3">
              <MessageSquare size={14} className="text-gray-400 dark:text-zinc-500" />
              <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider">Dialogue</span>
            </div>
            <div className="flex flex-col gap-3">
              {scene.dialogue.map((line, i) => (
                <div key={i} className="text-sm">
                  <EditableText
                    value={line.character}
                    onCommit={(v) => onUpdateDialogue(i, { character: v })}
                    className="font-semibold text-gray-800 dark:text-zinc-300 text-xs uppercase mb-0.5"
                  />
                  <EditableText
                    multiline
                    value={line.text}
                    onCommit={(v) => onUpdateDialogue(i, { text: v })}
                    className="text-gray-600 dark:text-zinc-400 italic"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
