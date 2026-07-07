'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Sparkles, Loader2 } from 'lucide-react';

/** Dashed "add scene" card at the end of the board — AI-generated or blank. */
export default function AddSceneCard({
  onGenerate,
  onAddBlank,
  isAdding,
  error,
}: {
  onGenerate: (instruction: string) => void;
  onAddBlank: () => void;
  isAdding: boolean;
  error: string;
}) {
  const [instruction, setInstruction] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      onClick={(e) => e.stopPropagation()}
      className="w-[450px] shrink-0 rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-700 bg-white/50 dark:bg-white/[0.02] flex flex-col items-center justify-center gap-4 p-8 min-h-[360px] relative"
    >
      <div className="absolute -top-6 left-0 text-[10px] font-bold text-gray-400 dark:text-zinc-600 tracking-wider">NEXT-SCENE.FRAME</div>

      <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 dark:border-zinc-600 flex items-center justify-center text-gray-400 dark:text-zinc-500">
        <Plus size={22} />
      </div>
      <div className="text-center">
        <div className="text-sm font-semibold text-gray-600 dark:text-zinc-300">Add Scene</div>
        <div className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">Continue the story with AI or start blank</div>
      </div>

      <textarea
        className="w-full h-16 p-2.5 text-xs border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-white dark:bg-zinc-950 dark:text-zinc-300 placeholder:text-gray-400 dark:placeholder:text-zinc-600"
        placeholder="What happens next? (optional)"
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') onGenerate(instruction);
        }}
      />

      <div className="flex flex-col gap-2 w-full">
        <button
          onClick={() => onGenerate(instruction)}
          disabled={isAdding}
          className="w-full py-2 px-3 rounded-md text-xs font-medium bg-indigo-500 text-white hover:bg-indigo-600 disabled:bg-gray-200 dark:disabled:bg-zinc-800 disabled:text-gray-400 dark:disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
        >
          {isAdding ? (
            <>
              <Loader2 size={13} className="animate-spin" /> Writing next scene...
            </>
          ) : (
            <>
              <Sparkles size={13} /> Generate next scene
            </>
          )}
        </button>
        <button
          onClick={onAddBlank}
          disabled={isAdding}
          className="w-full py-2 px-3 rounded-md text-xs font-medium border border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus size={13} /> Add blank scene
        </button>
      </div>

      {error && <div className="text-[11px] text-red-500 dark:text-red-400 text-center">{error}</div>}
    </motion.div>
  );
}
