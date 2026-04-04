import { Copy, ShieldCheck, Zap } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { caller } from '@/trpc/server';

function formatCalls(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default async function TwinDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const api = await caller();
  let agent: Awaited<ReturnType<typeof api.agents.getBySlug>>;
  try {
    agent = await api.agents.getBySlug({ slug });
  } catch {
    notFound();
  }

  const verified = !!agent.creator?.nullifierHash;

  return (
    <div className='container mx-auto max-w-5xl space-y-8 p-6'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            {verified && <ShieldCheck className='size-6 text-primary' />}
            <h1 className='text-3xl font-bold'>{agent.name}</h1>
          </div>
          <p className='text-sm text-muted-foreground'>
            Created by {agent.ensName ?? agent.walletAddress ?? 'Unknown'}
          </p>
        </div>
        <div className='text-right text-sm'>
          {verified ? (
            <Badge variant='outline' className='gap-1'>
              <ShieldCheck className='size-3' />
              World ID
            </Badge>
          ) : (
            <Badge variant='secondary'>Unverified</Badge>
          )}
        </div>
      </div>

      {/* Stats + Content */}
      <div className='grid gap-6 lg:grid-cols-[1fr_320px]'>
        <div className='space-y-8'>
          {/* Stats row */}
          <div className='grid grid-cols-2 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  Price per Call
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-2xl font-bold'>{agent.pricePerCall}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  Total Calls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-2xl font-bold'>{formatCalls(agent.totalCalls)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <div className='space-y-3'>
            <h2 className='text-lg font-semibold'>Description</h2>
            <p className='leading-relaxed text-muted-foreground'>{agent.description}</p>
          </div>

          {/* Skills */}
          {agent.skills.length > 0 && (
            <div className='space-y-3'>
              <h2 className='text-lg font-semibold'>Skills</h2>
              <div className='space-y-3'>
                {agent.skills.map((skill) => (
                  <Card key={skill.id}>
                    <CardHeader>
                      <CardTitle className='text-sm'>{skill.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='text-sm text-muted-foreground'>{skill.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* How to Use */}
          <div className='space-y-3'>
            <h2 className='text-lg font-semibold'>How to Use</h2>
            <p className='text-sm text-muted-foreground'>
              Copy and run in your CLI to trigger the agent directly from your terminal.
            </p>
            <div className='relative rounded-lg border bg-muted/50 p-4'>
              <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Terminal Command</p>
              <code className='mt-2 block font-mono text-sm'>/{agent.slug} help me with my project</code>
              <button
                type='button'
                className='absolute right-3 top-3 rounded p-1 text-muted-foreground hover:text-foreground'
              >
                <Copy className='size-4' />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className='space-y-4'>
          <Card>
            <CardContent>
              <button
                type='button'
                className='inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90'
              >
                <Zap className='size-4' />
                Use Agent
              </button>
            </CardContent>
            <CardFooter className='flex-col items-stretch gap-2 border-t text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Price</span>
                <span className='font-medium'>{agent.pricePerCall}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Total calls</span>
                <span className='font-medium'>{formatCalls(agent.totalCalls)}</span>
              </div>
              {agent.ensName && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>ENS</span>
                  <span className='font-medium'>{agent.ensName}</span>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
