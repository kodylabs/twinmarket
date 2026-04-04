'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IDKitRequestWidget, type IDKitResult, orbLegacy } from '@worldcoin/idkit';
import type React from 'react';
import { useState } from 'react';
import { WORLD_ID_ACTION } from '@/lib/world-id';
import { useTRPC } from '@/trpc/providers';

interface WorldIdGateProps {
  children: React.ReactNode;
}

export function WorldIdGate({ children }: WorldIdGateProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data: status, isLoading: statusLoading } = useQuery(trpc.worldId.status.queryOptions());
  const { data: rpData } = useQuery(trpc.worldId.rpContext.queryOptions());

  const verifyMutation = useMutation(
    trpc.worldId.verify.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.worldId.status.queryKey() });
      },
    }),
  );

  if (statusLoading) {
    return (
      <div className='flex min-h-[calc(100vh-3.5rem)] items-center justify-center'>
        <p className='text-muted-foreground'>Loading verification status...</p>
      </div>
    );
  }

  if (status?.isVerified) {
    return <>{children}</>;
  }

  const handleVerify = async (result: IDKitResult) => {
    const response = result.responses[0];
    if (!response || !('nullifier' in response)) return;

    await verifyMutation.mutateAsync({
      nullifier: response.nullifier,
      credential: response.identifier,
    });
  };

  const appId = rpData?.appId ?? (process.env.NEXT_PUBLIC_WLD_APP_ID as `app_${string}`);

  return (
    <div className='flex min-h-[calc(100vh-3.5rem)] items-center justify-center'>
      <div className='max-w-md space-y-6 text-center'>
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>Verify your humanity</h1>
          <p className='text-muted-foreground'>
            TwinMarket requires World ID verification to ensure every user is a real, unique human.
          </p>
        </div>

        {rpData && (
          <IDKitRequestWidget
            app_id={appId}
            action={WORLD_ID_ACTION}
            rp_context={rpData.rpContext}
            allow_legacy_proofs={true}
            preset={orbLegacy()}
            open={isOpen}
            onOpenChange={setIsOpen}
            handleVerify={handleVerify}
            onSuccess={() => {}}
          />
        )}

        <button
          type='button'
          onClick={() => setIsOpen(true)}
          disabled={verifyMutation.isPending || !rpData}
          className='inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50'
        >
          {verifyMutation.isPending ? 'Verifying...' : 'Verify with World ID'}
        </button>

        {verifyMutation.isError && <p className='text-sm text-destructive'>{verifyMutation.error.message}</p>}
      </div>
    </div>
  );
}
