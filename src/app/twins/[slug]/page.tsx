import { Brain, Copy, ExternalLink, Lock, ShieldCheck, Star, Zap } from 'lucide-react';
import { notFound } from 'next/navigation';
import { InfoLine } from '@/components/info-line';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ZkCommitmentBadge } from '@/components/zk-commitment-badge';
import { caller } from '@/trpc/server';
import { PriceChart, UsageChart } from './twin-charts';

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
  const _description = ensRecords?.description || agent.description;

  return (
    <div className='max-w-7xl mx-auto px-8 py-12'>
      {/* Hero Section */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16'>
        <div className='lg:col-span-7 flex flex-col gap-6'>
          {/* Header Info */}
          <div className='flex items-start justify-between'>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center gap-3'>
                <Brain className='size-8 text-secondary fill-secondary' />
                <h1 className='text-4xl font-black tracking-tight text-on-surface font-headline'>{agent.name}</h1>
                {verified && (
                  <Badge
                    variant='outline'
                    className='bg-primary/5 text-primary border-primary/20 font-label uppercase tracking-widest text-[10px] gap-1'
                  >
                    <ShieldCheck className='size-3' />
                    World ID
                  </Badge>
                )}
              </div>
              <div className='flex items-center gap-3 mt-2'>
                <div className='w-8 h-8 rounded-full overflow-hidden border border-outline-variant/20 bg-linear-to-br from-primary/60 to-primary' />
                <span className='text-on-surface-variant font-label uppercase tracking-widest text-xs'>
                  Created by{' '}
                  <span className='text-primary'>
                    {agent.ensName || (agent.walletAddress ? `${agent.walletAddress.slice(0, 6)}...` : 'Unknown')}
                  </span>
                </span>
              </div>
            </div>
            <div className='flex flex-col items-end gap-1'>
              <div className='flex items-center text-secondary'>
                <Star className='size-4 fill-secondary' />
                <span className='font-medium text-lg ml-1'>4.9</span>
              </div>
              <span className='text-on-surface-variant text-xs'>{formatCalls(agent.totalCalls)}+ runs</span>
            </div>
          </div>

          {/* Bento Stats */}
          <div className='grid grid-cols-4 gap-4'>
            <div className='bg-surface-container-low p-6 rounded-xl relative overflow-hidden'>
              <div className='absolute inset-0 glass-glow' />
              <span className='text-on-surface-variant font-label text-[10px] uppercase tracking-widest'>
                Usage Price
              </span>
              <div className='text-2xl font-semibold font-mono mt-1 text-on-surface'>{agent.pricePerCall}</div>
            </div>
            <div className='bg-surface-container-low p-6 rounded-xl'>
              <span className='text-on-surface-variant font-label text-[10px] uppercase tracking-widest'>Skills</span>
              <div className='text-2xl font-semibold font-mono mt-1 text-on-surface'>{agent.skillCount}</div>
            </div>
            <div className='bg-surface-container-low p-6 rounded-xl'>
              <span className='text-on-surface-variant font-label text-[10px] uppercase tracking-widest'>
                Prompt Size
              </span>
              <div className='text-2xl font-semibold font-mono mt-1 text-on-surface'>
                {agent.systemPromptLength.toLocaleString()}
              </div>
            </div>
            <div className='bg-surface-container-low p-6 rounded-xl'>
              <span className='text-on-surface-variant font-label text-[10px] uppercase tracking-widest'>
                Trust Score
              </span>
              <div className='text-2xl font-semibold font-mono mt-1 text-on-surface'>98%</div>
            </div>
          </div>

          {/* On-chain Identity */}
          <div className='flex flex-col gap-4 mt-2'>
            <h2 className='text-xl font-bold font-headline text-on-surface'>On-chain Identity</h2>
            <div className='bg-surface-container-low rounded-xl p-6 border border-outline-variant/10 space-y-3'>
              {agent.ensName && (
                <InfoLine
                  label='ENS'
                  value={
                    <a
                      href={`https://sepolia.app.ens.domains/${agent.ensName}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-1.5 font-mono text-sm text-primary hover:underline'
                    >
                      {agent.ensName}
                      <ExternalLink className='size-3' />
                    </a>
                  }
                />
              )}
              {agent.walletAddress && (
                <InfoLine
                  label='Wallet'
                  value={
                    <a
                      href={`https://worldscan.org/address/${agent.walletAddress}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-1.5 font-mono text-sm text-on-surface-variant hover:text-primary'
                    >
                      {truncateAddress(agent.walletAddress)}
                      <ExternalLink className='size-3' />
                    </a>
                  }
                />
              )}
              <InfoLine
                label='AgentBook'
                value={
                  agent.agentBook.isRegistered ? (
                    <a
                      href={`https://worldscan.org/address/${AGENTBOOK_CONTRACT}#readContract`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-1.5 font-mono text-sm text-on-surface-variant hover:text-primary'
                    >
                      <span className='size-1.5 rounded-full bg-green-500 inline-block' />
                      Registered
                      <ExternalLink className='size-3' />
                    </a>
                  ) : (
                    <span className='text-xs text-on-surface-variant'>Not registered</span>
                  )
                }
              />
              {ensRecords?.promptCommitment && agent.ensName && (
                <InfoLine
                  label='Prompt Integrity'
                  value={<ZkCommitmentBadge commitment={ensRecords.promptCommitment} ensName={agent.ensName} />}
                />
              )}
            </div>
          </div>

          {/* Description */}
          <div className='flex flex-col gap-4 mt-4'>
            <h2 className='text-xl font-bold font-headline text-on-surface'>Description</h2>
            <p className='text-on-surface-variant leading-relaxed text-lg'>{agent.description}</p>
            {agent.skillCount > 0 && (
              <span className='text-on-surface-variant text-sm'>{agent.skillCount} skills available</span>
            )}
          </div>

          {/* CLI Integration */}
          <div className='flex flex-col gap-4 mt-8'>
            <h2 className='text-xl font-bold font-headline text-on-surface'>How to Use</h2>
            <p className='text-on-surface-variant'>
              Copy and run in your CLI to trigger the agent directly from your terminal.
            </p>
            <div className='bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 font-mono relative group'>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-[10px] text-outline uppercase tracking-tighter font-label'>Terminal Command</span>
                <Copy className='size-4 text-outline cursor-pointer hover:text-primary transition-colors' />
              </div>
              <code className='text-[#b4c5ff] text-sm md:text-base'>/{agent.slug} help me with my project</code>
            </div>
          </div>
        </div>

        {/* Sticky CTA Sidebar */}
        <div className='lg:col-span-5'>
          <div className='sticky top-24 flex flex-col gap-6'>
            <div className='bg-surface-container p-8 rounded-xl border border-outline-variant/10 shadow-2xl relative overflow-hidden'>
              <div className='absolute -top-24 -right-24 w-48 h-48 bg-secondary/10 rounded-full blur-[80px]' />
              <h3 className='text-xl font-bold font-headline mb-6'>Pricing Breakdown</h3>
              <div className='flex flex-col gap-4 mb-8'>
                <div className='flex justify-between items-center'>
                  <span className='text-on-surface-variant'>Base agent cost</span>
                  <span className='font-mono text-on-surface'>{agent.pricePerCall}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-on-surface-variant'>AI token cost (est.)</span>
                  <span className='font-mono text-on-surface'>$0.12</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-on-surface-variant'>On-chain protocol fee</span>
                  <span className='font-mono text-on-surface'>$0.03</span>
                </div>
                <div className='border-t border-outline-variant/20 pt-4 mt-2 flex justify-between items-center'>
                  <span className='font-bold text-on-surface'>Total per execution</span>
                  <span className='text-2xl font-bold font-mono text-primary'>{agent.pricePerCall}</span>
                </div>
              </div>
              <Button className='w-full cta-gradient text-on-primary font-bold py-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 group border-none cursor-pointer'>
                <span>Use Agent</span>
                <Zap className='size-4 group-hover:translate-x-1 transition-transform fill-current' />
              </Button>
              <div className='mt-6 flex items-center justify-center gap-4'>
                <div className='flex items-center gap-1.5 opacity-60'>
                  <ShieldCheck className='size-3.5' />
                  <span className='text-[10px] font-label uppercase tracking-widest'>Audited</span>
                </div>
                <div className='flex items-center gap-1.5 opacity-60'>
                  <Lock className='size-3.5' />
                  <span className='text-[10px] font-label uppercase tracking-widest'>Encrypted</span>
                </div>
              </div>
            </div>

            {/* Charts */}
            <PriceChart />
            <UsageChart />

            {/* Usage Analytics Mini-card */}
            <div className='bg-surface-container-low p-6 rounded-xl border border-outline-variant/10'>
              <h4 className='text-xs font-label uppercase tracking-[0.2em] text-outline mb-4'>Live Activity</h4>
              <div className='flex flex-col gap-3'>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' />
                  <span className='text-xs text-on-surface-variant font-mono'>Latest usage 2m ago</span>
                </div>
                <div className='flex items-center gap-3 opacity-80'>
                  <div className='w-2 h-2 rounded-full bg-green-500/40' />
                  <span className='text-xs text-on-surface-variant font-mono'>New review posted 14h ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
