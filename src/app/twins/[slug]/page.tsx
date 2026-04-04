import { ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { notFound } from 'next/navigation';
import { InfoLine } from '@/components/info-line';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { caller } from '@/trpc/server';

const AGENTBOOK_CONTRACT = '0xA23aB2712eA7BBa896930544C7d6636a96b944dA';

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

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
  const ensRecords = agent.ensRecords;
  const description = ensRecords?.description || agent.description;

  return (
    <div className='container mx-auto flex max-w-2xl flex-col items-center gap-8 p-6'>
      {/* Pokemon Card */}
      <Card className='w-full overflow-hidden border-2'>
        <CardHeader className='space-y-4 pb-4'>
          {/* Avatar + Name */}
          <div className='flex items-center gap-4'>
            <div className='flex size-16 shrink-0 items-center justify-center rounded-xl border-2 bg-muted'>
              <span className='text-2xl font-bold text-muted-foreground'>{agent.name.slice(0, 2).toUpperCase()}</span>
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
                <h1 className='text-2xl font-bold'>{agent.name}</h1>
                {verified && (
                  <Badge variant='outline' className='gap-1'>
                    <ShieldCheck className='size-3' />
                    World ID
                  </Badge>
                )}
              </div>
              <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>{description}</p>
            </div>
          </div>
        </CardHeader>

        <Separator />

        {/* On-chain Identity */}
        <CardContent className='space-y-4'>
          <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>On-chain Identity</p>
          <InfoLine
            label='ENS'
            value={
              agent.ensName ? (
                <a
                  href={`https://sepolia.app.ens.domains/${agent.ensName}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1.5 font-mono text-sm font-medium hover:underline'
                >
                  {agent.ensName}
                  <ExternalLink className='size-3' />
                </a>
              ) : null
            }
          />

          <InfoLine
            label='Wallet'
            value={
              agent.walletAddress ? (
                <a
                  href={`https://worldscan.org/address/${agent.walletAddress}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1.5 font-mono text-sm font-medium hover:underline'
                >
                  {truncateAddress(agent.walletAddress)}
                  <ExternalLink className='size-3' />
                </a>
              ) : null
            }
          />

          <InfoLine
            label='AgentBook'
            value={
              agent.agentBook.isRegistered ? (
                <a
                  href={`https://worldscan.org/address/${AGENTBOOK_CONTRACT}#readContract`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-muted-foreground hover:text-foreground'
                >
                  <Badge variant='outline' className='gap-1 text-xs'>
                    <span className='size-1.5 rounded-full bg-green-500' />
                    Registered
                    <ExternalLink className='size-3' />
                  </Badge>
                </a>
              ) : (
                <Badge variant='secondary' className='text-xs'>
                  Not registered
                </Badge>
              )
            }
          />

          <InfoLine
            label='Verification'
            value={
              ensRecords?.worldVerified ? (
                <Badge variant='outline' className='gap-1 text-xs'>
                  <ShieldCheck className='size-3' />
                  {ensRecords.worldVerified === 'orb' ? 'Orb Verified' : 'Device Verified'}
                </Badge>
              ) : null
            }
          />

          <InfoLine
            label='URL'
            value={
              ensRecords?.url ? (
                <a
                  href={ensRecords.url}
                  className='whitespace-nowrap flex items-center gap-1.5'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {ensRecords.url.replace('https://', '')}
                  <ExternalLink className='size-3' />
                </a>
              ) : null
            }
          />
        </CardContent>

        <Separator />

        <CardFooter className='flex items-center justify-between pt-4 text-sm'>
          <div>
            <span className='text-xs uppercase text-muted-foreground'>Price</span>
            <p className='font-medium'>{agent.pricePerCall}</p>
          </div>
          <div className='text-right'>
            <span className='text-xs uppercase text-muted-foreground'>Total Calls</span>
            <p className='font-medium'>{formatCalls(agent.totalCalls)}</p>
          </div>
        </CardFooter>
      </Card>

      {/* Agent Specs */}
      <div className='grid w-full grid-cols-2 gap-4'>
        <Card>
          <CardContent className='pt-4 text-center'>
            <p className='text-2xl font-bold'>{agent.skillCount}</p>
            <p className='text-xs text-muted-foreground'>Skills</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-4 text-center'>
            <p className='text-2xl font-bold'>{agent.systemPromptLength.toLocaleString()}</p>
            <p className='text-xs text-muted-foreground'>System Prompt (chars)</p>
          </CardContent>
        </Card>
      </div>

      {/* Use Agent CTA */}
      <button
        type='button'
        className='inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90'
      >
        <Zap className='size-4' />
        Use Agent
      </button>
    </div>
  );
}
