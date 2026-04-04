'use client';

import { useQuery } from '@tanstack/react-query';
import { Lock, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
          <CardHeader>
            <CardTitle className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
              Total Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{agent.totalCalls.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
              Price per Call
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{agent.pricePerCall}</p>
          </CardContent>
        </Card>
      </div>

      {/* Agent info + World ID */}
      <div className='grid gap-6 md:grid-cols-[1fr_320px]'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              {agent.name}
              <Badge variant='outline' className='uppercase'>
                {agent.status}
              </Badge>
            </CardTitle>
            <CardDescription>
              {agent.ensName && <span className='font-mono'>{agent.ensName}</span>}
              {!agent.ensName && agent.walletAddress && (
                <span className='truncate font-mono'>{agent.walletAddress}</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className='flex gap-6'>
            <div className='flex size-24 shrink-0 items-center justify-center rounded-lg border bg-muted'>
              <span className='text-3xl font-bold text-muted-foreground'>{agent.name.slice(0, 2)}</span>
            </div>
            <p className='text-sm text-muted-foreground'>{agent.description}</p>
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
                  <CardHeader>
                    <CardTitle>{skill.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm text-muted-foreground'>{skill.content}</p>
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
