'use client';

import React from 'react';
import Image from 'next/image';
import {
  Film,
  Sun,
  Moon,
  PanelLeftClose,
  Image as ImageIcon,
  Wand2,
  Loader2,
  Maximize,
  Download,
  Clapperboard,
} from 'lucide-react';
import { CLAPPER_STRIPES, imageUrl } from '@/lib/constants';
import type { StoryData } from '@/lib/types';
import SceneCountPicker from '@/components/SceneCountPicker';

export default function Sidebar({
  open,
  theme,
  onToggleTheme,
  onCollapse,
  storyData,
  prompt,
  onPromptChange,
  imageBase64,
  fileInputRef,
  onImageUpload,
  onRemoveImage,
  sceneCount,
  onSceneCountChange,
  isGenerating,
  onGenerate,
  error,
  selectedScene,
  seeds,
  onSceneClick,
  onFitView,
  onExport,
}: {
  open: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onCollapse: () => void;
  storyData: StoryData | null;
  prompt: string;
  onPromptChange: (v: string) => void;
  imageBase64: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  sceneCount: number;
  onSceneCountChange: (n: number) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  error: string;
  selectedScene: number | null;
  seeds: Record<number, number>;
  onSceneClick: (idx: number, sceneNumber: number) => void;
  onFitView: () => void;
  onExport: () => void;
}) {
  return (
    <div
      className={`${open ? 'w-80 border-r' : 'w-0 border-r-0'} transition-[width] duration-200 ease-out bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 flex flex-col z-10 shadow-sm relative overflow-hidden`}
    >
      <div className="w-80 shrink-0 h-full flex flex-col">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-black dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center">
              <Film size={18} />
            </div>
            <h1 className="font-semibold text-lg tracking-tight dark:text-zinc-100">AI Storyboard</h1>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={onCollapse}
              className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Collapse sidebar (Ctrl+\)"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>
        </div>

        <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {!storyData && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Concept / Prompt</label>
                <textarea
                  className="w-full h-32 p-3 text-sm border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50 dark:bg-zinc-950 dark:text-zinc-300"
                  placeholder="e.g. A cyberpunk detective searching for a lost AI in a neon-drenched city..."
                  value={prompt}
                  onChange={(e) => onPromptChange(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') onGenerate();
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                  Reference Image <span className="font-normal text-gray-400 lowercase">(optional)</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${imageBase64 ? 'border-gray-300 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800/50' : 'border-gray-300 hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800/50'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={onImageUpload}
                  />
                  {imageBase64 ? (
                    <div className="relative w-full aspect-video rounded overflow-hidden">
                      <Image src={imageBase64} alt="Reference" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-white text-xs font-medium">Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-gray-500">
                      <ImageIcon size={24} className="mb-2 text-gray-400" />
                      <span className="text-sm dark:text-zinc-400">Click to upload image</span>
                      <span className="text-xs text-gray-400 mt-1">Characters, settings, etc.</span>
                    </div>
                  )}
                </div>
                {imageBase64 && (
                  <button
                    onClick={onRemoveImage}
                    className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-left w-max"
                  >
                    Remove image
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Number of scenes</label>
                <SceneCountPicker value={sceneCount} onChange={onSceneCountChange} />
              </div>

              <button
                onClick={onGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-2.5 px-4 bg-black dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md font-medium text-sm hover:bg-gray-800 dark:hover:bg-zinc-300 disabled:bg-gray-300 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                title="Ctrl+Enter"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating Scenes...
                  </>
                ) : (
                  <>
                    <Wand2 size={16} />
                    Generate Storyboard
                  </>
                )}
              </button>
            </>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm rounded border border-red-100 dark:border-red-900/50">
              {error}
            </div>
          )}

          {storyData && (
            <>
              {/* Production poster card */}
              <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 shadow-sm">
                <div className="h-2.5" style={{ background: CLAPPER_STRIPES }} />
                <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700 p-4 text-white">
                  <div className="text-[9px] font-bold tracking-[0.25em] text-zinc-400 mb-1.5">NOW SHOWING</div>
                  <h2 className="text-lg font-bold leading-tight tracking-tight">{storyData.title}</h2>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed line-clamp-3">{storyData.concept}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={onFitView}
                      className="flex-1 text-[11px] font-medium py-1.5 px-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center gap-1.5"
                      title="Fit board to view"
                    >
                      <Maximize size={12} /> View board
                    </button>
                    <button
                      onClick={onExport}
                      className="flex-1 text-[11px] font-medium py-1.5 px-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center gap-1.5"
                      title="Export storyboard as JSON"
                    >
                      <Download size={12} /> Export
                    </button>
                  </div>
                </div>
              </div>

              {/* Filmstrip scene list */}
              <div className="flex flex-col gap-2">
                <div className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
                  Scenes ({storyData.scenes.length})
                </div>
                {storyData.scenes.map((scene, idx) => (
                  <button
                    key={scene.sceneNumber}
                    onClick={() => onSceneClick(idx, scene.sceneNumber)}
                    className={`group flex gap-2.5 p-1.5 rounded-lg border transition-colors text-left w-full ${selectedScene === scene.sceneNumber ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-500/10 dark:border-blue-500/50' : 'border-gray-100 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800/60'}`}
                    title="Jump to scene"
                  >
                    <div className="relative w-20 aspect-video rounded overflow-hidden bg-gray-200 dark:bg-zinc-800 shrink-0">
                      <Image src={imageUrl(scene, seeds[scene.sceneNumber] ?? 0, storyData.characters)} alt="" fill unoptimized className="object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="min-w-0 flex-1 py-0.5">
                      <div className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 tracking-widest">
                        SC {String(scene.sceneNumber).padStart(2, '0')}
                      </div>
                      <div className="text-xs font-semibold truncate dark:text-zinc-200">{scene.title}</div>
                      <span className="inline-block mt-1 text-[9px] px-1.5 py-px rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 uppercase tracking-wide truncate max-w-full">
                        {scene.emotion}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* New take */}
              <div className="mt-auto pt-4 border-t border-gray-100 dark:border-zinc-800 flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clapperboard size={12} /> New Take
                </label>
                <textarea
                  className="w-full h-20 p-3 text-sm border border-gray-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50 dark:bg-zinc-950 dark:text-zinc-300"
                  placeholder="Describe a new story..."
                  value={prompt}
                  onChange={(e) => onPromptChange(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') onGenerate();
                  }}
                />
                <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={onImageUpload} />
                <SceneCountPicker value={sceneCount} onChange={onSceneCountChange} />
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-9 h-9 rounded-md border transition-colors shrink-0 relative overflow-hidden flex items-center justify-center ${imageBase64 ? 'border-blue-400 dark:border-zinc-500' : 'border-gray-300 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                    title={imageBase64 ? 'Change reference image' : 'Attach reference image'}
                  >
                    {imageBase64 ? <Image src={imageBase64} alt="Reference" fill className="object-cover" /> : <ImageIcon size={16} />}
                  </button>
                  {imageBase64 && (
                    <button
                      onClick={onRemoveImage}
                      className="w-9 h-9 rounded-md border border-gray-300 dark:border-zinc-700 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shrink-0 flex items-center justify-center text-xs"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  )}
                  <button
                    onClick={onGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="flex-1 py-2 px-3 bg-black dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md font-medium text-sm hover:bg-gray-800 dark:hover:bg-zinc-300 disabled:bg-gray-300 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    title="Ctrl+Enter"
                  >
                    {isGenerating ? <Loader2 size={15} className="animate-spin" /> : <Clapperboard size={15} />}
                    {isGenerating ? 'Rolling...' : 'Action!'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
