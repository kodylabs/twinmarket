'use client';

import { useQuery } from '@tanstack/react-query';
import { Lock, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTRPC } from '@/trpc/providers';

export function MyTwinDashboard() {
  const trpc = useTRPC();
  const { data: agent } = useQuery(trpc.agents.mine.queryOptions());
  const { data: worldIdStatus } = useQuery(trpc.worldId.status.queryOptions());

  if (!agent) return null;

  return (
    <div className='container mx-auto max-w-5xl space-y-8 p-6'>
      {/* Stats */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Total Calls</p>
            <p className='mt-1 text-3xl font-bold'>{agent.totalCalls.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Price per Call</p>
            <p className='mt-1 text-3xl font-bold'>{agent.pricePerCall}</p>
          </CardContent>
        </Card>
      </div>

      {/* Agent info + World ID */}
      <div className='grid gap-6 md:grid-cols-[1fr_320px]'>
        <Card>
          <CardContent className='flex gap-6 pt-6'>
            <div className='flex size-24 shrink-0 items-center justify-center rounded-lg border bg-muted'>
              <span className='text-3xl font-bold text-muted-foreground'>{agent.name.slice(0, 2)}</span>
            </div>
            <div className='flex-1 space-y-3'>
              <div className='flex items-center gap-2'>
                <h2 className='text-xl font-bold'>{agent.name}</h2>
                <Badge variant='outline' className='uppercase'>
                  {agent.status}
                </Badge>
              </div>
              <p className='text-sm text-muted-foreground'>{agent.description}</p>
              {agent.ensName && <p className='font-mono text-sm text-muted-foreground'>{agent.ensName}</p>}
              {agent.walletAddress && (
                <p className='truncate font-mono text-xs text-muted-foreground'>{agent.walletAddress}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
              Security Protocol
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <h3 className='text-lg font-bold'>World ID Identity</h3>
            <p className='text-sm text-muted-foreground'>
              {worldIdStatus?.isVerified
                ? 'Your sovereign identity is verified on-chain. This provides highest trust level for institutional users.'
                : 'Verify your identity with World ID to increase trust.'}
            </p>
            {worldIdStatus?.isVerified && (
              <div className='flex items-center gap-2 rounded-md border px-3 py-2 font-mono text-sm'>
                <span className='size-2 rounded-full bg-green-500' />
                ID_VERIFIED_SHA256
                <Lock className='ml-auto size-4 text-muted-foreground' />
              </div>
            )}
            {worldIdStatus?.isVerified && (
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <ShieldCheck className='size-3.5 text-primary' />
                {worldIdStatus.verificationLevel === 'orb' ? 'Orb Verified' : 'Device Verified'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Skills */}
      {agent.skills.length > 0 && (
        <>
          <Separator />
          <div className='space-y-4'>
            <h2 className='text-xl font-bold'>Skills</h2>
            <div className='grid gap-4 md:grid-cols-2'>
              {agent.skills.map((skill) => (
                <Card key={skill.id}>
                  <CardContent className='pt-6'>
                    <h3 className='font-semibold'>{skill.title}</h3>
                    <p className='mt-1 text-sm text-muted-foreground'>{skill.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
