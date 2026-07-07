'use client';

import { motion } from 'motion/react';

export default function TitleCard({ title, concept }: { title: string; concept: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-800 w-[600px] shrink-0 overflow-hidden relative group"
    >
      <div className="absolute -top-6 left-0 text-[10px] font-bold text-gray-400 dark:text-zinc-600 tracking-wider">PROJECT-TITLE.FRAME</div>
      <div className="bg-black dark:bg-zinc-100 text-white dark:text-zinc-950 p-8 pb-12">
        <h1 className="text-4xl font-bold tracking-tighter mb-4">{title}</h1>
        <div className="h-1 w-12 bg-white/30 dark:bg-black/30 rounded mb-4"></div>
        <p className="text-lg text-gray-300 dark:text-zinc-700 leading-relaxed font-light">{concept}</p>
      </div>
    </motion.div>
  );
}
