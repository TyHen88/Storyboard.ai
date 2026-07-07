'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Users, Copy, Check } from 'lucide-react';
import EditableText from './EditableText';
import { characterImageUrl } from '@/lib/constants';
import type { Character } from '@/lib/types';

/** Paste-ready text block for one character (for AI image/video tools). */
const characterText = (c: Character) =>
  [
    `${c.name} — ${c.role}`,
    `Appearance: ${c.appearance}`,
    c.age && `Age: ${c.age}`,
    c.height && `Height: ${c.height}`,
    c.face && `Face: ${c.face}`,
    c.hairstyle && `Hair: ${c.hairstyle}`,
    c.clothing && `Clothing: ${c.clothing}`,
    c.accessories && `Accessories: ${c.accessories}`,
    c.personality && `Personality: ${c.personality}`,
    c.voiceStyle && `Voice: ${c.voiceStyle}`,
  ]
    .filter(Boolean)
    .join('\n');

/** Base-characters reference card — the visual source of truth for every scene. */
export default function CastCard({
  characters,
  onUpdateCharacter,
}: {
  characters: Character[];
  onUpdateCharacter: (index: number, patch: Partial<Character>) => void;
}) {
  const [copied, setCopied] = useState<number | 'all' | null>(null);

  const copy = async (text: string, which: number | 'all') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied((c) => (c === which ? null : c)), 1500);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — ignore
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white dark:bg-zinc-900 rounded-xl shadow-md border border-gray-200 dark:border-zinc-800 w-[450px] shrink-0 flex flex-col relative"
    >
      <div className="absolute -top-6 left-0 text-[10px] font-bold text-gray-400 dark:text-zinc-600 tracking-wider">CAST.FRAME</div>

      <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2 bg-gray-50 dark:bg-zinc-950 rounded-t-xl">
        <Users size={14} className="text-gray-400 dark:text-zinc-500" />
        <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 tracking-wider">BASE CHARACTERS</span>
        <button
          onClick={() => copy(characters.map(characterText).join('\n\n'), 'all')}
          className="ml-auto p-1.5 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:text-zinc-500 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 text-[10px] font-medium"
          title="Copy all characters"
        >
          {copied === 'all' ? <Check size={13} className="text-green-600 dark:text-green-400" /> : <Copy size={13} />}
          {copied === 'all' ? 'Copied' : 'Copy all'}
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {characters.map((character, i) => (
          <div key={i} className="flex gap-3 p-2.5 rounded-lg border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-200 dark:bg-zinc-800 shrink-0 border border-gray-200 dark:border-zinc-700">
              <Image
                src={characterImageUrl(character)}
                alt={character.name}
                fill
                unoptimized
                referrerPolicy="no-referrer"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <EditableText
                    value={character.name}
                    onCommit={(v) => onUpdateCharacter(i, { name: v })}
                    className="text-sm font-bold dark:text-zinc-100"
                  />
                </div>
                <button
                  onClick={() => copy(characterText(character), i)}
                  className="p-1 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:text-zinc-500 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
                  title={`Copy ${character.name}'s profile`}
                >
                  {copied === i ? <Check size={12} className="text-green-600 dark:text-green-400" /> : <Copy size={12} />}
                </button>
              </div>
              <div className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-1">{character.role}</div>
              <EditableText
                multiline
                value={character.appearance}
                onCommit={(v) => onUpdateCharacter(i, { appearance: v })}
                className="text-[11px] text-gray-600 dark:text-zinc-400 leading-relaxed line-clamp-4"
              />
            </div>
          </div>
        ))}
        <p className="text-[10px] text-gray-400 dark:text-zinc-600 leading-relaxed">
          These descriptions are appended to every scene image so characters stay consistent. Edit an appearance to update all future images.
        </p>
      </div>
    </motion.div>
  );
}
