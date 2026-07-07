'use client';

import React, { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Check } from 'lucide-react';
import { MODEL_OPTIONS, subscribeModel, readModel, writeModel, DEFAULT_MODEL } from '@/lib/settings';

const MENU_W = 240;

/**
 * Gear-triggered dropdown for picking the AI model. The menu is rendered in a
 * portal with fixed positioning so it's never clipped by an ancestor's
 * overflow-hidden or transform (sidebar panel / animated ChatBar).
 */
export default function ModelDropdown({
  align = 'right',
  openUp = false,
  triggerClassName,
  title = 'Choose AI model',
  children,
}: {
  /** Which edge of the menu lines up with the trigger. */
  align?: 'left' | 'right';
  /** Open above the trigger (for bottom-of-screen placements). */
  openUp?: boolean;
  triggerClassName?: string;
  title?: string;
  children: React.ReactNode;
}) {
  const model = useSyncExternalStore(subscribeModel, readModel, () => DEFAULT_MODEL);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ left: number; top?: number; bottom?: number }>({ left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const place = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const left = Math.max(
      8,
      Math.min(align === 'right' ? r.right - MENU_W : r.left, window.innerWidth - MENU_W - 8)
    );
    setCoords(openUp ? { left, bottom: window.innerHeight - r.top + 8 } : { left, top: r.bottom + 8 });
  };

  const toggle = () => {
    if (!open) place();
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onReflow = () => setOpen(false);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onReflow);
    window.addEventListener('scroll', onReflow, true);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onReflow);
      window.removeEventListener('scroll', onReflow, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        title={title}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={triggerClassName}
      >
        {children}
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            style={{ position: 'fixed', left: coords.left, top: coords.top, bottom: coords.bottom, width: MENU_W, zIndex: 60 }}
            className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl p-1"
          >
            <div className="px-2 py-1.5 text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
              AI model
            </div>
            {MODEL_OPTIONS.map((opt) => {
              const isActive = opt.id === model;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    writeModel(opt.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-start gap-2 px-2 py-2 rounded-md text-left transition-colors ${
                    isActive ? 'bg-blue-50 dark:bg-blue-500/10' : 'hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold dark:text-zinc-200">{opt.label}</span>
                    <span className="block text-[10px] text-gray-400 dark:text-zinc-500">{opt.hint}</span>
                  </span>
                  {isActive && <Check size={14} className="text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}
