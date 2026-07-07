'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function EditableText({
  value,
  onCommit,
  multiline = false,
  className = '',
}: {
  value: string;
  onCommit: (v: string) => void;
  multiline?: boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  useEffect(() => {
    if (!editing) return;
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
    if (el instanceof HTMLTextAreaElement) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const v = draft.trim();
    if (v && v !== value) onCommit(v);
  };

  if (!editing) {
    return (
      <span
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        title="Click to edit"
        className={`block cursor-text rounded-sm -mx-1 px-1 hover:bg-blue-500/5 hover:ring-1 hover:ring-blue-300/60 dark:hover:bg-zinc-700/30 dark:hover:ring-zinc-600 transition-colors ${className}`}
      >
        {value}
      </span>
    );
  }

  const shared = {
    value: draft,
    onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
    onBlur: commit,
    className: `block w-full -mx-1 px-1 rounded-sm bg-blue-500/5 dark:bg-zinc-800 ring-1 ring-blue-400/60 dark:ring-zinc-500 focus:outline-none resize-none ${className}`,
  };

  return multiline ? (
    <textarea
      {...shared}
      ref={(el) => {
        inputRef.current = el;
      }}
      rows={1}
      onChange={(e) => {
        setDraft(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setEditing(false);
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) commit();
      }}
    />
  ) : (
    <input
      {...shared}
      ref={(el) => {
        inputRef.current = el;
      }}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setEditing(false);
        if (e.key === 'Enter') commit();
      }}
    />
  );
}
