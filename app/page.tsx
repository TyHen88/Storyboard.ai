'use client';

import React, { useState, useRef, useEffect, useCallback, useSyncExternalStore } from 'react';
import { Film, Loader2, PanelLeftOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import type { Scene, Dialogue, StoryData, Character } from '@/lib/types';
import { PAD, TITLE_W, SCENE_W, GAP, MIN_SCALE, MAX_SCALE } from '@/lib/constants';
import { THEME_KEY, THEME_EVENT, subscribeTheme, readTheme } from '@/lib/theme';
import { loadProject, saveProject } from '@/lib/storage';
import Sidebar from '@/components/Sidebar';
import Inspector from '@/components/Inspector';
import ChatBar from '@/components/ChatBar';
import CanvasToolbar from '@/components/CanvasToolbar';
import GhostFrames from '@/components/GhostFrames';
import SkeletonFrames from '@/components/SkeletonFrames';
import TitleCard from '@/components/TitleCard';
import SceneCard from '@/components/SceneCard';
import CastCard from '@/components/CastCard';
import Connections from '@/components/Connections';
import AddSceneCard from '@/components/AddSceneCard';
import ExportDialog from '@/components/ExportDialog';

export default function StoryboardApp() {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => 'light' as const);
  const [prompt, setPrompt] = useState('');
  const [imageBase64, setImageBase64] = useState<string>('');
  // How many scenes to generate (1–6)
  const [sceneCount, setSceneCount] = useState(6);
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [error, setError] = useState('');
  // Start collapsed: first launch is just the canvas with the chat bar.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Canvas State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<'pointer' | 'hand'>('pointer');

  // Per-scene image seeds: bump one to regenerate that scene's image
  const [seeds, setSeeds] = useState<Record<number, number>>({});
  const [copiedScene, setCopiedScene] = useState<number | null>(null);

  // Inspector (right panel) state
  const [selectedScene, setSelectedScene] = useState<number | null>(null);
  const [aiInstruction, setAiInstruction] = useState('');
  const [isRevising, setIsRevising] = useState(false);
  const [reviseError, setReviseError] = useState('');

  // Add-scene state
  const [isAddingScene, setIsAddingScene] = useState(false);
  const [addError, setAddError] = useState('');

  const [exportOpen, setExportOpen] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const movedRef = useRef(false);
  const toolRef = useRef(tool);
  const prevToolRef = useRef<'pointer' | 'hand'>('pointer');
  const spaceDownRef = useRef(false);

  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);

  // Auto-save (debounced, validated) whenever the project changes
  useEffect(() => {
    if (!storyData) return;
    const t = setTimeout(() => saveProject(storyData, seeds), 400);
    return () => clearTimeout(t);
  }, [storyData, seeds]);

  const toggleTheme = () => {
    localStorage.setItem(THEME_KEY, theme === 'light' ? 'dark' : 'light');
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  const updateScene = (sceneNumber: number, patch: Partial<Scene>) => {
    setStoryData((prev) =>
      prev
        ? {
            ...prev,
            scenes: prev.scenes.map((s) => (s.sceneNumber === sceneNumber ? { ...s, ...patch } : s)),
          }
        : prev
    );
  };

  const updateDialogueLine = (sceneNumber: number, index: number, patch: Partial<Dialogue>) => {
    setStoryData((prev) =>
      prev
        ? {
            ...prev,
            scenes: prev.scenes.map((s) =>
              s.sceneNumber === sceneNumber
                ? { ...s, dialogue: s.dialogue.map((d, i) => (i === index ? { ...d, ...patch } : d)) }
                : s
            ),
          }
        : prev
    );
  };

  const addDialogueLine = (sceneNumber: number) => {
    setStoryData((prev) =>
      prev
        ? {
            ...prev,
            scenes: prev.scenes.map((s) =>
              s.sceneNumber === sceneNumber
                ? { ...s, dialogue: [...s.dialogue, { character: 'CHARACTER', text: '' }] }
                : s
            ),
          }
        : prev
    );
  };

  const removeDialogueLine = (sceneNumber: number, index: number) => {
    setStoryData((prev) =>
      prev
        ? {
            ...prev,
            scenes: prev.scenes.map((s) =>
              s.sceneNumber === sceneNumber
                ? { ...s, dialogue: s.dialogue.filter((_, i) => i !== index) }
                : s
            ),
          }
        : prev
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setImageBase64('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Extra row width contributed by the cast card (when characters exist)
  const castOffset = (story?: StoryData | null) =>
    (story?.characters?.length ?? 0) > 0 ? SCENE_W + GAP : 0;

  const fitView = useCallback((data?: StoryData | null) => {
    const el = canvasRef.current;
    const story = data ?? null;
    if (!el) return;
    if (!story) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      return;
    }
    // title + (cast) + scenes + add-scene card
    const totalW =
      PAD * 2 + TITLE_W + castOffset(story) + (GAP + SCENE_W) * story.scenes.length + GAP + SCENE_W;
    const s = Math.min(Math.max(MIN_SCALE, (el.clientWidth - 80) / totalW), 1);
    setScale(s);
    setPosition({ x: (el.clientWidth - totalW * s) / 2, y: 60 - PAD * s });
  }, []);

  // Restore the last auto-saved project on load (survives refreshes/crashes)
  useEffect(() => {
    const saved = loadProject();
    if (!saved) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStoryData(saved.storyData);
    setSeeds(saved.seeds);
    setSidebarOpen(true);
    const t = setTimeout(() => fitView(saved.storyData), 60);
    return () => clearTimeout(t);
  }, [fitView]);

  const focusScene = (idx: number) => {
    const el = canvasRef.current;
    if (!el) return;
    const s = Math.max(scale, 0.7);
    const x = PAD + TITLE_W + GAP + castOffset(storyData) + idx * (SCENE_W + GAP);
    setScale(s);
    setPosition({
      x: el.clientWidth / 2 - (x + SCENE_W / 2) * s,
      y: 80 - PAD * s,
    });
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError('');
    setStoryData(null);
    setSelectedScene(null);
    setSeeds({});
    setScale(1);
    setPosition({ x: 0, y: 0 });

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, image: imageBase64, sceneCount }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate');
      }

      const data: StoryData = await res.json();
      setStoryData(data);
      setSidebarOpen(true);
      // Let the frames mount, then frame the whole board in view
      setTimeout(() => fitView(data), 60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateCharacter = (index: number, patch: Partial<Character>) => {
    setStoryData((prev) =>
      prev
        ? {
            ...prev,
            characters: (prev.characters ?? []).map((c, i) => (i === index ? { ...c, ...patch } : c)),
          }
        : prev
    );
  };

  const nextSceneNumber = (story: StoryData) =>
    Math.max(0, ...story.scenes.map((s) => s.sceneNumber)) + 1;

  const addBlankScene = () => {
    if (!storyData) return;
    const n = nextSceneNumber(storyData);
    const scene: Scene = {
      sceneNumber: n,
      title: `Scene ${n}`,
      description: 'Describe this scene...',
      imagePrompt: storyData.concept,
      action: 'Action...',
      emotion: 'Neutral',
      dialogue: [],
    };
    setStoryData((prev) => (prev ? { ...prev, scenes: [...prev.scenes, scene] } : prev));
    setSelectedScene(n);
  };

  const addSceneWithAI = async (instruction: string) => {
    if (!storyData || isAddingScene) return;
    setIsAddingScene(true);
    setAddError('');
    try {
      const res = await fetch('/api/add-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyTitle: storyData.title,
          storyConcept: storyData.concept,
          characters: storyData.characters ?? [],
          scenes: storyData.scenes.map((s) => ({
            sceneNumber: s.sceneNumber,
            title: s.title,
            description: s.description,
          })),
          instruction,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add scene');
      const n = nextSceneNumber(storyData);
      const scene: Scene = { ...data, sceneNumber: n };
      setStoryData((prev) => (prev ? { ...prev, scenes: [...prev.scenes, scene] } : prev));
      setSelectedScene(n);
    } catch (err: any) {
      setAddError(err.message);
    } finally {
      setIsAddingScene(false);
    }
  };

  const applyImagePrompt = (value: string) => {
    const v = value.trim();
    if (!v || selectedScene == null) return;
    updateScene(selectedScene, { imagePrompt: v });
    setSeeds((prev) => ({ ...prev, [selectedScene]: (prev[selectedScene] ?? 0) + 1 }));
  };

  const reviseSceneWithAI = async () => {
    if (!storyData || selectedScene == null || !aiInstruction.trim() || isRevising) return;
    const scene = storyData.scenes.find((s) => s.sceneNumber === selectedScene);
    if (!scene) return;
    setIsRevising(true);
    setReviseError('');
    try {
      const res = await fetch('/api/edit-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene,
          instruction: aiInstruction,
          storyTitle: storyData.title,
          storyConcept: storyData.concept,
          characters: storyData.characters ?? [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to revise scene');
      updateScene(selectedScene, { ...data, sceneNumber: selectedScene });
      // New visual content — reload the panel image
      setSeeds((prev) => ({ ...prev, [selectedScene]: (prev[selectedScene] ?? 0) + 1 }));
      setAiInstruction('');
    } catch (err: any) {
      setReviseError(err.message);
    } finally {
      setIsRevising(false);
    }
  };

  const regenerateImage = (sceneNumber: number) => {
    setSeeds((prev) => ({ ...prev, [sceneNumber]: (prev[sceneNumber] ?? 0) + 1 }));
  };

  const copyPrompt = async (scene: Scene) => {
    try {
      await navigator.clipboard.writeText(scene.imagePrompt);
      setCopiedScene(scene.sceneNumber);
      setTimeout(() => setCopiedScene((c) => (c === scene.sceneNumber ? null : c)), 1500);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — ignore
    }
  };

  // Pan and Zoom logic — zoom is anchored at the cursor so the point under
  // the pointer stays fixed while scaling.
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const rect = canvasRef.current?.getBoundingClientRect();
      const newScale = Math.min(Math.max(MIN_SCALE, scale * Math.exp(e.deltaY * -0.002)), MAX_SCALE);
      if (rect) {
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        setPosition((prev) => ({
          x: cx - ((cx - prev.x) / scale) * newScale,
          y: cy - ((cy - prev.y) / scale) * newScale,
        }));
      }
      setScale(newScale);
    } else {
      setPosition((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    movedRef.current = false;
    if (tool === 'hand' || e.button === 1 || (e.button === 0 && e.shiftKey)) {
      // Prevent native text-selection/image-drag so panning stays smooth
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      movedRef.current = true;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard shortcuts: V = pointer, H = hand, Space = hand while held, Ctrl+\ = sidebar
  useEffect(() => {
    const isTyping = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      return !!t && (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || t.isContentEditable);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        setSidebarOpen((o) => !o);
        return;
      }
      if (isTyping(e)) return;
      if (e.code === 'Space' && !spaceDownRef.current) {
        e.preventDefault();
        spaceDownRef.current = true;
        prevToolRef.current = toolRef.current;
        setTool('hand');
      } else if (e.key === 'v' || e.key === 'V') {
        setTool('pointer');
      } else if (e.key === 'h' || e.key === 'H') {
        setTool('hand');
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && spaceDownRef.current) {
        spaceDownRef.current = false;
        setTool(prevToolRef.current);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const inspectorScene =
    storyData && selectedScene != null
      ? storyData.scenes.find((s) => s.sceneNumber === selectedScene) ?? null
      : null;

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="flex h-screen w-full bg-[#E5E5E5] dark:bg-zinc-950 text-[#333] dark:text-zinc-200 font-sans overflow-hidden">

        {/* LEFT SIDEBAR (collapsible, Figma-style) */}
        <Sidebar
          open={sidebarOpen}
          theme={theme}
          onToggleTheme={toggleTheme}
          onCollapse={() => setSidebarOpen(false)}
          storyData={storyData}
          prompt={prompt}
          onPromptChange={setPrompt}
          imageBase64={imageBase64}
          fileInputRef={fileInputRef}
          onImageUpload={handleImageUpload}
          onRemoveImage={removeImage}
          sceneCount={sceneCount}
          onSceneCountChange={setSceneCount}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
          error={error}
          selectedScene={selectedScene}
          seeds={seeds}
          onSceneClick={(idx, sceneNumber) => {
            focusScene(idx);
            setSelectedScene(sceneNumber);
          }}
          onFitView={() => fitView(storyData)}
          onExport={() => setExportOpen(true)}
        />

        {/* MAIN CANVAS AREA — Figma-style surface: #F5F5F5 light / #1E1E1E dark */}
        <div className="flex-1 relative overflow-hidden flex flex-col bg-gray-100 dark:bg-[#1E1E1E]">
          {/* Generating status pill (canvas stays visible and interactive) */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full pl-2.5 pr-4 py-1.5 shadow-md text-xs font-medium text-gray-600 dark:text-zinc-300"
              >
                <Loader2 size={13} className="animate-spin text-indigo-500 dark:text-indigo-400" />
                Synthesizing storyboard — writing scenes &amp; dialogue…
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating reopen control (only once a board exists; first launch stays clean) */}
          <AnimatePresence>
            {!sidebarOpen && storyData && (
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.15 }}
                className="absolute top-4 left-4 z-20 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800 px-2 py-1.5 flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded bg-black dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center">
                  <Film size={13} />
                </div>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-1.5 rounded text-gray-500 hover:text-black hover:bg-gray-50 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                  title="Open sidebar (Ctrl+\)"
                >
                  <PanelLeftOpen size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top Toolbar */}
          <CanvasToolbar
            tool={tool}
            setTool={setTool}
            scale={scale}
            setScale={setScale}
            onFitView={() => fitView(storyData)}
          />

          {/* First-launch chat input (bottom center) */}
          <AnimatePresence>
            {!storyData && !isGenerating && (
              <ChatBar
                prompt={prompt}
                onPromptChange={setPrompt}
                imageBase64={imageBase64}
                onRemoveImage={removeImage}
                onAttach={() => fileInputRef.current?.click()}
                sceneCount={sceneCount}
                onSceneCountChange={setSceneCount}
                onGenerate={handleGenerate}
                error={error}
              />
            )}
          </AnimatePresence>

          {/* Canvas Workspace */}
          <div
            ref={canvasRef}
            className={`w-full h-full outline-none ${tool === 'hand' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} ${isDragging ? 'select-none' : ''} overflow-hidden relative`}
            onWheel={handleWheel}
            onClick={() => {
              if (!movedRef.current && tool === 'pointer') setSelectedScene(null);
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            tabIndex={0}
          >
            {/* Background Grid Pattern */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-100"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, ${theme === 'dark' ? '#3c3c3c' : 'black'} 1px, transparent 0)`,
                backgroundSize: `${40 * scale}px ${40 * scale}px`,
                backgroundPosition: `${position.x}px ${position.y}px`,
              }}
            />

            {!storyData && !isGenerating && <GhostFrames />}

            {/* Transform Layer — inert while the hand tool is active so panning never selects text */}
            <div
              className={`absolute origin-top-left transition-transform duration-75 ${tool === 'hand' || isDragging ? 'pointer-events-none select-none' : ''}`}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              }}
            >
              {isGenerating && <SkeletonFrames />}

              {/* Story Frames (Nodes) */}
              {storyData && (
                <>
                  {/* Prototype-flow connector lines between cards */}
                  <Connections
                    sceneCount={storyData.scenes.length}
                    hasCast={(storyData.characters?.length ?? 0) > 0}
                    hasAddCard
                  />

                  <div className="p-20 flex flex-row gap-16 items-start relative">
                    <TitleCard title={storyData.title} concept={storyData.concept} />

                    {(storyData.characters?.length ?? 0) > 0 && (
                      <CastCard characters={storyData.characters!} onUpdateCharacter={updateCharacter} />
                    )}

                    {storyData.scenes.map((scene, idx) => (
                      <SceneCard
                        key={scene.sceneNumber}
                        scene={scene}
                        idx={idx}
                        seed={seeds[scene.sceneNumber] ?? 0}
                        characters={storyData.characters}
                        selected={selectedScene === scene.sceneNumber}
                        copied={copiedScene === scene.sceneNumber}
                        onSelect={() => {
                          if (!movedRef.current) setSelectedScene(scene.sceneNumber);
                        }}
                        onCopyPrompt={() => copyPrompt(scene)}
                        onRegenerate={() => regenerateImage(scene.sceneNumber)}
                        onUpdateScene={(patch) => updateScene(scene.sceneNumber, patch)}
                        onUpdateDialogue={(i, patch) => updateDialogueLine(scene.sceneNumber, i, patch)}
                      />
                    ))}

                    <AddSceneCard
                      onGenerate={addSceneWithAI}
                      onAddBlank={addBlankScene}
                      isAdding={isAddingScene}
                      error={addError}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT INSPECTOR - Scene edit mode */}
        <AnimatePresence>
          {inspectorScene && (
            <Inspector
              scene={inspectorScene}
              seed={seeds[inspectorScene.sceneNumber] ?? 0}
              characters={storyData?.characters}
              copied={copiedScene === inspectorScene.sceneNumber}
              aiInstruction={aiInstruction}
              onAiInstructionChange={setAiInstruction}
              isRevising={isRevising}
              reviseError={reviseError}
              onRevise={reviseSceneWithAI}
              onClose={() => setSelectedScene(null)}
              onRegenerate={() => regenerateImage(inspectorScene.sceneNumber)}
              onCopyPrompt={() => copyPrompt(inspectorScene)}
              onApplyImagePrompt={applyImagePrompt}
              onUpdateScene={(patch) => updateScene(inspectorScene.sceneNumber, patch)}
              onUpdateDialogue={(i, patch) => updateDialogueLine(inspectorScene.sceneNumber, i, patch)}
              onAddDialogue={() => addDialogueLine(inspectorScene.sceneNumber)}
              onRemoveDialogue={(i) => removeDialogueLine(inspectorScene.sceneNumber, i)}
            />
          )}
        </AnimatePresence>

        {/* EXPORT DIALOG */}
        {exportOpen && storyData && (
          <ExportDialog
            story={storyData}
            defaultScene={selectedScene}
            onClose={() => setExportOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
