'use client';

import { motion } from 'motion/react';
import { Film } from 'lucide-react';

/** Template placeholder frames shown on the canvas while a storyboard generates. */
export default function SkeletonFrames() {
  return (
    <div className="p-20 flex flex-row gap-16 items-start">
      {/* Title card skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-800 w-[600px] shrink-0 overflow-hidden relative"
      >
        <div className="absolute -top-6 left-0 text-[10px] font-bold text-gray-400 dark:text-zinc-600 tracking-wider">PROJECT-TITLE.FRAME</div>
        <div className="bg-black dark:bg-zinc-100 p-8 pb-12">
          <div className="h-9 w-2/3 rounded-md bg-white/10 dark:bg-black/10 animate-pulse mb-4" />
          <div className="h-1 w-12 bg-white/20 dark:bg-black/20 rounded mb-4" />
          <div className="h-4 w-full rounded bg-white/10 dark:bg-black/10 animate-pulse mb-2" />
          <div className="h-4 w-4/5 rounded bg-white/10 dark:bg-black/10 animate-pulse" />
        </div>
      </motion.div>

      {/* Scene card skeletons */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 + i * 0.15 }}
          className="bg-white dark:bg-zinc-900 rounded-xl shadow-md border border-gray-200 dark:border-zinc-800 w-[450px] shrink-0 flex flex-col relative"
        >
          <div className="absolute -top-6 left-0 text-[10px] font-bold text-gray-400 dark:text-zinc-600 tracking-wider">SCENE-{i + 1}.FRAME</div>
          <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2 bg-gray-50 dark:bg-zinc-950 rounded-t-xl">
            <div className="h-3 w-14 rounded bg-gray-200 dark:bg-zinc-800 animate-pulse" />
            <div className="h-3 w-36 rounded bg-gray-200 dark:bg-zinc-800 animate-pulse" />
          </div>
          <div className="w-full aspect-video bg-gray-100 dark:bg-zinc-800/60 relative overflow-hidden flex items-center justify-center">
            <Film className="w-7 h-7 text-gray-300 dark:text-zinc-600 animate-pulse" />
            <motion.div
              className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 dark:via-white/[0.06] to-transparent"
              animate={{ x: ['-150%', '350%'] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'linear', delay: i * 0.3 }}
            />
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div>
              <div className="h-2.5 w-20 rounded bg-gray-200 dark:bg-zinc-800 animate-pulse mb-2" />
              <div className="h-3.5 w-full rounded bg-gray-100 dark:bg-zinc-800/70 animate-pulse mb-1.5" />
              <div className="h-3.5 w-11/12 rounded bg-gray-100 dark:bg-zinc-800/70 animate-pulse mb-1.5" />
              <div className="h-3.5 w-3/5 rounded bg-gray-100 dark:bg-zinc-800/70 animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[0, 1].map((c) => (
                <div key={c}>
                  <div className="h-2.5 w-12 rounded bg-gray-200 dark:bg-zinc-800 animate-pulse mb-2" />
                  <div className="h-3 w-full rounded bg-gray-100 dark:bg-zinc-800/70 animate-pulse mb-1" />
                  <div className="h-3 w-2/3 rounded bg-gray-100 dark:bg-zinc-800/70 animate-pulse" />
                </div>
              ))}
            </div>
            <div className="mt-2 p-4 bg-gray-50 dark:bg-zinc-950/50 rounded-md border border-gray-100 dark:border-zinc-800/50">
              <div className="h-2.5 w-16 rounded bg-gray-200 dark:bg-zinc-800 animate-pulse mb-3" />
              <div className="h-3 w-24 rounded bg-gray-200 dark:bg-zinc-800 animate-pulse mb-1.5" />
              <div className="h-3 w-full rounded bg-gray-100 dark:bg-zinc-800/70 animate-pulse" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
