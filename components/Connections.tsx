'use client';

import React from 'react';
import { PAD, TITLE_W, SCENE_W, GAP } from '@/lib/constants';

/** Dashed prototype-flow connectors between the cards on the canvas. */
export default function Connections({
  sceneCount,
  hasCast,
  hasAddCard,
}: {
  sceneCount: number;
  hasCast: boolean;
  hasAddCard: boolean;
}) {
  // Card widths in row order: title, (cast), scenes..., (add-scene)
  const widths = [
    TITLE_W,
    ...(hasCast ? [SCENE_W] : []),
    ...Array.from({ length: sceneCount }, () => SCENE_W),
    ...(hasAddCard ? [SCENE_W] : []),
  ];

  const edges: { x1: number; x2: number }[] = [];
  let cursor = PAD;
  widths.forEach((w, i) => {
    const end = cursor + w;
    if (i < widths.length - 1) edges.push({ x1: end, x2: end + GAP });
    cursor = end + GAP;
  });

  const totalW = cursor - GAP + PAD;
  const Y = PAD + 140; // roughly mid-image height on the cards

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none text-gray-400 dark:text-zinc-600"
      width={totalW}
      height={Y + 60}
      aria-hidden
    >
      <defs>
        <marker id="sb-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M1,1 L6,4 L1,7" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </marker>
      </defs>
      {edges.map(({ x1, x2 }, i) => (
        <g key={i}>
          <circle cx={x1} cy={Y} r="3" fill="currentColor" />
          <path
            d={`M ${x1 + 3} ${Y} C ${x1 + GAP / 2} ${Y - 14}, ${x2 - GAP / 2} ${Y - 14}, ${x2 - 7} ${Y}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            markerEnd="url(#sb-arrow)"
          />
        </g>
      ))}
    </svg>
  );
}
