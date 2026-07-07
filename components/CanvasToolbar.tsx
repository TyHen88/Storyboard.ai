'use client';

import React from 'react';
import { MousePointer2, Hand, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { MIN_SCALE, MAX_SCALE } from '@/lib/constants';

export default function CanvasToolbar({
  tool,
  setTool,
  scale,
  setScale,
  onFitView,
}: {
  tool: 'pointer' | 'hand';
  setTool: (t: 'pointer' | 'hand') => void;
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  onFitView: () => void;
}) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800 px-2 py-1.5 flex items-center gap-1 z-20">
      <button
        onClick={() => setTool('pointer')}
        className={`p-1.5 rounded ${tool === 'pointer' ? 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-zinc-200' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:text-zinc-200 dark:hover:bg-zinc-800'}`}
        title="Move Tool (V)"
      >
        <MousePointer2 size={18} />
      </button>
      <button
        onClick={() => setTool('hand')}
        className={`p-1.5 rounded ${tool === 'hand' ? 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-zinc-200' : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:text-zinc-200 dark:hover:bg-zinc-800'}`}
        title="Hand Tool (H, hold Space, or Shift+Drag)"
      >
        <Hand size={18} />
      </button>

      <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700 mx-1"></div>

      <button
        onClick={() => setScale((s) => Math.max(MIN_SCALE, s - 0.1))}
        className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 rounded"
        title="Zoom out"
      >
        <ZoomOut size={18} />
      </button>
      <button
        onClick={() => setScale(1)}
        className="text-xs font-medium w-12 text-center text-gray-700 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200"
        title="Reset zoom to 100%"
      >
        {Math.round(scale * 100)}%
      </button>
      <button
        onClick={() => setScale((s) => Math.min(MAX_SCALE, s + 0.1))}
        className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 rounded"
        title="Zoom in"
      >
        <ZoomIn size={18} />
      </button>

      <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700 mx-1"></div>

      <button
        onClick={onFitView}
        className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 rounded"
        title="Fit board to view"
      >
        <Maximize size={18} />
      </button>
    </div>
  );
}
