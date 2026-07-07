'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Wand2, Paperclip } from 'lucide-react';
import { IDEAS } from '@/lib/constants';
import SceneCountPicker from '@/components/SceneCountPicker';

/** First-launch bottom-center chat input with hero text and animated border. */
export default function ChatBar({
  prompt,
  onPromptChange,
  imageBase64,
  onRemoveImage,
  onAttach,
  sceneCount,
  onSceneCountChange,
  onGenerate,
  error,
}: {
  prompt: string;
  onPromptChange: (v: string) => void;
  imageBase64: string;
  onRemoveImage: () => void;
  onAttach: () => void;
  sceneCount: number;
  onSceneCountChange: (n: number) => void;
  onGenerate: () => void;
  error: string;
}) {
  const [ideaIdx, setIdeaIdx] = useState(0);

  // Cycle placeholder ideas
  useEffect(() => {
    const id = setInterval(() => setIdeaIdx((i) => (i + 1) % IDEAS.length), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.25 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-[640px] max-w-[calc(100%-2rem)] flex flex-col items-center gap-5"
    >
      <div className="text-center pointer-events-none select-none">
        <div className="text-[10px] font-bold tracking-[0.3em] text-gray-400 dark:text-zinc-500 mb-2">AI STORYBOARD STUDIO</div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-zinc-100">
          Lights. Camera.{' '}
          <span className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-500 bg-clip-text text-transparent">Prompt.</span>
        </h2>
        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1.5">Describe your story — AI will direct the scenes, write the dialogue, and frame the shots.</p>
      </div>

      <div className="relative w-full">
        {/* ambient glow */}
        <div className="absolute -inset-5 bg-gradient-to-r from-indigo-600/20 via-purple-600/15 to-blue-600/20 blur-3xl rounded-full pointer-events-none" />
        {/* gradient border */}
        <div className="relative rounded-2xl p-px overflow-hidden bg-gradient-to-br from-indigo-400/40 via-purple-400/15 to-blue-400/40 dark:from-indigo-500/30 dark:via-purple-500/10 dark:to-blue-500/30 shadow-2xl shadow-indigo-500/10 dark:shadow-indigo-950/40">
          {/* light beam looping around the border */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 w-[200%] aspect-square -translate-x-1/2 -translate-y-1/2">
            <div
              className="w-full h-full animate-[spin_4s_linear_infinite]"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0deg 290deg, rgba(129,140,248,0.7) 325deg, rgba(192,132,252,1) 345deg, rgba(96,165,250,0.7) 353deg, transparent 360deg)',
              }}
            />
          </div>
          <div className="relative rounded-[calc(1rem-1px)] bg-white/95 dark:bg-[#0A0E1C]/95 backdrop-blur-xl p-4 pb-3">
            {imageBase64 && (
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-white/5">
                <div className="relative w-9 h-9 rounded-md overflow-hidden border border-gray-200 dark:border-white/10 shrink-0">
                  <Image src={imageBase64} alt="Reference" fill className="object-cover" />
                </div>
                <span className="text-xs text-gray-500 dark:text-zinc-400 flex-1 truncate">Reference image attached</span>
                <button
                  onClick={onRemoveImage}
                  className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 px-1"
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            )}
            <textarea
              rows={3}
              className="w-full bg-transparent text-sm leading-relaxed focus:outline-none resize-none min-h-[76px] max-h-64 text-gray-800 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              placeholder={IDEAS[ideaIdx]}
              value={prompt}
              onChange={(e) => {
                onPromptChange(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 256)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onGenerate();
                }
              }}
            />
            <div className="flex items-center justify-between gap-2.5 mt-1">
              <SceneCountPicker value={sceneCount} onChange={onSceneCountChange} variant="dark" />
              <div className="flex items-center gap-2.5">
              <button
                onClick={onAttach}
                className="rounded-full p-px bg-gradient-to-br from-indigo-400/60 to-purple-500/60 hover:from-indigo-400 hover:to-purple-500 transition-all shrink-0"
                title="Attach reference image"
              >
                <span className="w-9 h-9 rounded-full bg-white dark:bg-[#0A0E1C] flex items-center justify-center text-gray-500 dark:text-zinc-300">
                  <Paperclip size={15} />
                </span>
              </button>
              <button
                onClick={onGenerate}
                disabled={!prompt.trim()}
                className="rounded-full p-px bg-gradient-to-r from-indigo-400/70 via-purple-400/70 to-blue-400/70 hover:from-indigo-400 hover:via-purple-400 hover:to-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                title="Generate storyboard (Enter)"
              >
                <span className="h-9 px-4 rounded-full bg-white dark:bg-[#0A0E1C] flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-zinc-100">
                  <Wand2 size={15} className="text-indigo-500 dark:text-indigo-400" />
                  Generate
                </span>
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-3 py-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs rounded-lg border border-red-100 dark:border-red-900/50">
          {error}
        </div>
      )}
    </motion.div>
  );
}
