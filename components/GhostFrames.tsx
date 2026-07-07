'use client';

import { motion } from 'motion/react';

/** Dashed floating frames hinting where the board will appear (first launch only). */
export default function GhostFrames() {
  return (
    <div className="absolute inset-0 -mt-24 flex items-center justify-center gap-8 pointer-events-none select-none">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -10, 0], rotate: i === 0 ? -3 : i === 2 ? 3 : 0 }}
          transition={{ duration: 5 + i * 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
          className={`w-52 aspect-video rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-700 bg-white/50 dark:bg-white/[0.02] flex items-center justify-center ${i !== 1 ? 'opacity-60' : ''}`}
        >
          <span className="text-[10px] font-bold tracking-[0.25em] text-gray-300 dark:text-zinc-600">
            SCENE {String(i + 1).padStart(2, '0')}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
