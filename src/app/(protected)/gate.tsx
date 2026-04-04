'use client';

import { Suspense } from 'react';
import { WorldIdGate } from '@/components/world-id-gate';

export function ProtectedGate({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-[calc(100vh-3.5rem)] items-center justify-center'>
          <p className='text-muted-foreground'>Loading verification status...</p>
        </div>
      }
    >
      <WorldIdGate>{children}</WorldIdGate>
    </Suspense>
  );
}
