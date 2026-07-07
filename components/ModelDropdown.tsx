'use client';

import React, { useSyncExternalStore } from 'react';
import { MODEL_OPTIONS, subscribeModel, readModel, writeModel, DEFAULT_MODEL } from '@/lib/settings';
import Dropdown from '@/components/Dropdown';

/** Gear-triggered dropdown for picking the AI model (persisted in localStorage). */
export default function ModelDropdown({
  align = 'right',
  openUp = false,
  triggerClassName,
  title = 'Choose AI model',
  children,
}: {
  align?: 'left' | 'right';
  openUp?: boolean;
  triggerClassName?: string;
  title?: string;
  children: React.ReactNode;
}) {
  const model = useSyncExternalStore(subscribeModel, readModel, () => DEFAULT_MODEL);
  return (
    <Dropdown
      items={MODEL_OPTIONS.map((m) => ({ id: m.id, label: m.label, hint: m.hint }))}
      value={model}
      onChange={writeModel}
      header="AI model"
      align={align}
      openUp={openUp}
      triggerClassName={triggerClassName}
      title={title}
    >
      {children}
    </Dropdown>
  );
}
