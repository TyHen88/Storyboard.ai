'use client';

import React from 'react';
import { Clapperboard } from 'lucide-react';

const OPTIONS = [1, 2, 3, 4, 5, 6];

/**
 * Segmented control for choosing how many scenes to generate (1–6).
 * Shared by the Sidebar form and the first-launch ChatBar.
 */
export default function SceneCountPicker({
  value,
  onChange,
  variant = 'light',
}: {
  value: number;
  onChange: (n: number) => void;
  /** 'light' matches the sidebar form; 'dark' matches the ChatBar glass panel. */
  variant?: 'light' | 'dark';
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex items-center gap-1 text-[11px] font-medium shrink-0 ${
          variant === 'dark' ? 'text-gray-500 dark:text-zinc-400' : 'text-gray-500 dark:text-zinc-400'
        }`}
        title="How many scenes to generate"
      >
        <Clapperboard size={13} /> Scenes
      </span>
      <div className="flex rounded-md border border-gray-300 dark:border-zinc-700 overflow-hidden">
        {OPTIONS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-pressed={value === n}
            className={`w-7 py-1 text-[11px] font-semibold transition-colors ${
              value === n
                ? 'bg-black text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
