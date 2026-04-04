'use client';

import { WorldIdGate } from '@/components/world-id-gate';

export function ProtectedGate({ children }: { children: React.ReactNode }) {
  return <WorldIdGate>{children}</WorldIdGate>;
}
