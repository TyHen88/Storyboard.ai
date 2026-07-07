'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Download, FileJson, FileText, Clapperboard, Film } from 'lucide-react';
import { buildExport, downloadExport, type ExportContent, type ExportFormat } from '@/lib/export';
import type { StoryData } from '@/lib/types';

const CONTENT_OPTIONS: { value: ExportContent; label: string; hint: string; icon: React.ReactNode }[] = [
  { value: 'story', label: 'Story document', hint: 'Title, cast and full scene breakdown', icon: <Film size={15} /> },
  { value: 'video', label: 'AI video prompts', hint: 'Production-ready prompts for video generators', icon: <Clapperboard size={15} /> },
  { value: 'raw', label: 'Raw JSON data', hint: 'Exact project data, re-importable', icon: <FileJson size={15} /> },
];

const FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
  { value: 'json', label: 'JSON' },
  { value: 'md', label: 'Markdown' },
  { value: 'txt', label: 'Text' },
];

export default function ExportDialog({
  story,
  defaultScene,
  onClose,
}: {
  story: StoryData;
  defaultScene?: number | null;
  onClose: () => void;
}) {
  const [content, setContent] = useState<ExportContent>('video');
  const [format, setFormat] = useState<ExportFormat>('json');
  const [scopeKind, setScopeKind] = useState<'all' | 'scene' | 'range'>(defaultScene != null ? 'scene' : 'all');
  const numbers = story.scenes.map((s) => s.sceneNumber);
  const [sceneNumber, setSceneNumber] = useState<number>(defaultScene ?? numbers[0]);
  const [from, setFrom] = useState<number>(numbers[0]);
  const [to, setTo] = useState<number>(numbers[numbers.length - 1]);

  const effectiveFormat = content === 'raw' ? 'json' : format;

  const handleDownload = () => {
    const scope =
      scopeKind === 'all'
        ? ({ kind: 'all' } as const)
        : scopeKind === 'scene'
          ? ({ kind: 'scene', sceneNumber } as const)
          : ({ kind: 'range', from: Math.min(from, to), to: Math.max(from, to) } as const);
    downloadExport(buildExport(story, content, effectiveFormat, scope));
    onClose();
  };

  const selectCls =
    'p-1.5 text-xs border border-gray-300 dark:border-zinc-700 rounded-md bg-gray-50 dark:bg-zinc-950 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        className="w-[440px] max-w-[calc(100%-2rem)] bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download size={16} className="text-gray-500 dark:text-zinc-400" />
            <span className="text-sm font-semibold dark:text-zinc-100">Export storyboard</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {/* Content */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">What to export</label>
            <div className="flex flex-col gap-1.5">
              {CONTENT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setContent(opt.value)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-colors ${content === opt.value ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-500/10 dark:border-blue-500/50' : 'border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                >
                  <span className="text-gray-500 dark:text-zinc-400">{opt.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold dark:text-zinc-200">{opt.label}</span>
                    <span className="block text-[10px] text-gray-400 dark:text-zinc-500">{opt.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Scope */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Scenes</label>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex rounded-md border border-gray-300 dark:border-zinc-700 overflow-hidden">
                {(['all', 'scene', 'range'] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setScopeKind(k)}
                    className={`px-2.5 py-1.5 text-[11px] font-medium transition-colors ${scopeKind === k ? 'bg-black text-white dark:bg-zinc-100 dark:text-zinc-900' : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                  >
                    {k === 'all' ? 'All' : k === 'scene' ? 'Single' : 'Range'}
                  </button>
                ))}
              </div>
              {scopeKind === 'scene' && (
                <select className={selectCls} value={sceneNumber} onChange={(e) => setSceneNumber(Number(e.target.value))}>
                  {story.scenes.map((s) => (
                    <option key={s.sceneNumber} value={s.sceneNumber}>
                      Scene {s.sceneNumber} — {s.title}
                    </option>
                  ))}
                </select>
              )}
              {scopeKind === 'range' && (
                <span className="flex items-center gap-1.5">
                  <select className={selectCls} value={from} onChange={(e) => setFrom(Number(e.target.value))}>
                    {numbers.map((n) => (
                      <option key={n} value={n}>Scene {n}</option>
                    ))}
                  </select>
                  <span className="text-xs text-gray-400">to</span>
                  <select className={selectCls} value={to} onChange={(e) => setTo(Number(e.target.value))}>
                    {numbers.map((n) => (
                      <option key={n} value={n}>Scene {n}</option>
                    ))}
                  </select>
                </span>
              )}
            </div>
          </div>

          {/* Format */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Format</label>
            <div className="flex rounded-md border border-gray-300 dark:border-zinc-700 overflow-hidden w-max">
              {FORMAT_OPTIONS.map((opt) => {
                const disabled = content === 'raw' && opt.value !== 'json';
                const active = effectiveFormat === opt.value;
                return (
                  <button
                    key={opt.value}
                    disabled={disabled}
                    onClick={() => setFormat(opt.value)}
                    className={`px-3 py-1.5 text-[11px] font-medium transition-colors flex items-center gap-1 ${active ? 'bg-black text-white dark:bg-zinc-100 dark:text-zinc-900' : disabled ? 'text-gray-300 dark:text-zinc-700 cursor-not-allowed' : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                  >
                    {opt.value === 'json' ? <FileJson size={12} /> : <FileText size={12} />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="w-full py-2.5 px-4 bg-black dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md font-medium text-sm hover:bg-gray-800 dark:hover:bg-zinc-300 transition-colors flex items-center justify-center gap-2"
          >
            <Download size={15} /> Download
          </button>
        </div>
      </motion.div>
    </div>
  );
}
