'use client';

import React from 'react';
import { Clapperboard, ChevronDown } from 'lucide-react';
import { STYLE_PRESETS } from '@/lib/styles';
import Dropdown from '@/components/Dropdown';

/** Director-style preset picker. Value/onChange are owned by the caller. */
export default function StylePicker({
  value,
  onChange,
  align = 'left',
  openUp = false,
}: {
  value: string;
  onChange: (id: string) => void;
  align?: 'left' | 'right';
  openUp?: boolean;
}) {
  const current = STYLE_PRESETS.find((s) => s.id === value) ?? STYLE_PRESETS[0];
  return (
    <Dropdown
      items={STYLE_PRESETS.map((s) => ({ id: s.id, label: s.label, hint: s.hint }))}
      value={value}
      onChange={onChange}
      header="Visual style"
      align={align}
      openUp={openUp}
      title="Choose the visual style"
      triggerClassName="flex items-center gap-1.5 px-2 py-1 rounded-md border border-gray-300 dark:border-zinc-700 text-[11px] font-medium text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
    >
      <Clapperboard size={13} className="shrink-0" />
      <span className="truncate max-w-[110px]">{current.label}</span>
      <ChevronDown size={12} className="shrink-0 opacity-60" />
    </Dropdown>
  );
}
