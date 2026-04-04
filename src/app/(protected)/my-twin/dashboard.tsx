'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, Bot, DollarSign, Lock, Pencil, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Bar, BarChart, XAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useTRPC } from '@/trpc/providers';

const MOCK_WEEKLY_CALLS = [
  { day: 'Mon', calls: 12 },
  { day: 'Tue', calls: 28 },
  { day: 'Wed', calls: 45 },
  { day: 'Thu', calls: 32 },
  { day: 'Fri', calls: 67 },
  { day: 'Sat', calls: 24 },
  { day: 'Sun', calls: 18 },
];

const MOCK_WEEKLY_REVENUE = [
  { day: 'Mon', revenue: 0.12 },
  { day: 'Tue', revenue: 0.28 },
  { day: 'Wed', revenue: 0.45 },
  { day: 'Thu', revenue: 0.32 },
  { day: 'Fri', revenue: 0.67 },
  { day: 'Sat', revenue: 0.24 },
  { day: 'Sun', revenue: 0.18 },
];

const _MOCK_RECENT_USAGE = [
  {
    id: '1',
    input: 'Audit my Solidity contract for reentrancy',
    output: 'Found 2 potential vulnerabilities in withdraw()...',
    score: 4.8,
    date: '2 min ago',
  },
  {
    id: '2',
    input: 'Optimize gas usage in my ERC-721 mint',
    output: 'Reduced gas by 34% using batch minting pattern...',
    score: 4.9,
    date: '15 min ago',
  },
  {
    id: '3',
    input: 'Review my DeFi yield strategy',
    output: 'Identified 3 risk factors in your LP positions...',
    score: 4.5,
    date: '1h ago',
  },
  {
    id: '4',
    input: 'Write tests for my staking contract',
    output: 'Generated 12 test cases covering edge cases...',
    score: 5.0,
    date: '3h ago',
  },
];

const callsChartConfig: ChartConfig = {
  calls: { label: 'Calls', color: 'var(--primary)' },
};

const revenueChartConfig: ChartConfig = {
  revenue: { label: 'Revenue (USDC)', color: 'var(--secondary)' },
};

export function MyTwinDashboard() {
  const trpc = useTRPC();
  const { data: agent } = useQuery(trpc.agents.mine.queryOptions());
  const { data: worldIdStatus } = useQuery(trpc.worldId.status.queryOptions());

  if (!agent) return null;

  return (
    <div className='max-w-7xl mx-auto p-8 space-y-8 w-full'>
      {/* Stats Overview Bento Grid */}
      <section className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        {/* Main Stat: Total Revenue */}
        <div className='md:col-span-2 bg-surface-container rounded-xl p-8 shadow-[0_0_32px_rgba(223,226,241,0.04)] relative overflow-hidden flex flex-col justify-between min-h-[220px]'>
          <div className='relative z-10'>
            <span className='font-label text-[10px] uppercase tracking-widest text-outline'>Total Revenue</span>
            <div className='mt-4 flex items-baseline gap-2'>
              <span className='text-5xl font-mono font-bold text-primary'>
                {(agent.totalCalls * 0.5).toLocaleString()}
              </span>
              <span className='text-xl font-mono text-on-surface-variant'>USDC</span>
            </div>
          </div>
          <div className='mt-auto relative z-10 flex items-center gap-2 text-primary font-mono text-sm'>
            <TrendingUp className='size-4' />
            <span>+14.2% from last cycle</span>
          </div>
          <div className='absolute right-0 bottom-0 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] -mr-16 -mb-16 opacity-40'></div>
        </div>

        {/* Secondary Stats */}
        <div className='bg-surface-container rounded-xl p-6 flex flex-col justify-between shadow-[0_0_32px_rgba(223,226,241,0.04)]'>
          <span className='font-label text-[10px] uppercase tracking-widest text-outline'>Usage Count</span>
          <div className='flex flex-col'>
            <span className='text-3xl font-mono font-bold text-on-surface'>
              {(agent.totalCalls / 1000).toFixed(1)}k
            </span>
            <span className='text-xs text-on-surface-variant mt-1'>Global agent calls</span>
          </div>
        </div>

        <div className='bg-surface-container rounded-xl p-6 flex flex-col justify-between shadow-[0_0_32px_rgba(223,226,241,0.04)]'>
          <span className='font-label text-[10px] uppercase tracking-widest text-outline'>Active Users</span>
          <div className='flex flex-col'>
            <span className='text-3xl font-mono font-bold text-on-surface'>1,204</span>
            <span className='text-xs text-on-surface-variant mt-1'>Current sessions</span>
          </div>
        </div>
      </section>

      <section className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* My Agent Card - Reworked for better UI logic */}
        <div className='lg:col-span-2 bg-surface-container rounded-xl overflow-hidden shadow-[0_0_32px_rgba(223,226,241,0.04)] border border-outline-variant/10 flex flex-col'>
          {/* Subtle Banner Background */}
          <div className='h-24 bg-linear-to-r from-primary/20 via-secondary/10 to-transparent' />

          <div className='px-8 pb-8 -mt-12 flex flex-col md:flex-row gap-6 items-start'>
            <div className='relative shrink-0'>
              <div className='size-24 rounded-2xl overflow-hidden border-4 border-surface-container shadow-xl bg-linear-to-br from-primary to-primary-container flex items-center justify-center'>
                <Bot className='size-10 text-white' />
              </div>
              {/* Active Status Indicator */}
              <div
                className='absolute -bottom-1 -right-1 bg-green-500 size-4 rounded-full border-2 border-surface-container'
                title='Active'
              />
            </div>

            <div className='flex-1 pt-14 space-y-3'>
              <div className='flex items-center justify-between gap-4'>
                <div className='space-y-1'>
                  <h2 className='text-2xl font-bold text-[#dfe2f1] font-headline leading-none'>{agent.name}</h2>
                  <div className='flex items-center gap-2 text-xs font-mono text-on-surface-variant'>
                    <span className='text-primary'>{agent.ensName || 'anon.eth'}</span>
                    <span className='text-outline-variant/40'>•</span>
                    <span>
                      {agent.walletAddress
                        ? `${agent.walletAddress.slice(0, 6)}...${agent.walletAddress.slice(-4)}`
                        : 'No wallet'}
                    </span>
                  </div>
                </div>
                <Badge
                  variant='outline'
                  className='bg-primary/5 text-primary border-primary/20 font-label uppercase tracking-widest text-[10px] hidden sm:flex'
                >
                  v2.4.0
                </Badge>
              </div>
              <p className='text-on-surface-variant text-sm leading-relaxed max-w-2xl'>{agent.description}</p>
            </div>
          </div>
        </div>

        {/* Security Signal Card */}
        <div className='bg-surface-container-low rounded-xl p-8 shadow-[0_0_32px_rgba(223,226,241,0.04)] border border-outline-variant/10 flex flex-col justify-between'>
          <div>
            <span className='font-label text-[10px] uppercase tracking-widest text-secondary'>Security Protocol</span>
            <h3 className='text-xl font-bold text-[#dfe2f1] mt-2 font-headline'>World ID Identity</h3>
            <p className='text-xs text-on-surface-variant mt-4 leading-relaxed'>
              {worldIdStatus?.isVerified
                ? 'Your sovereign identity is verified on-chain. Highest trust level for institutional users.'
                : 'Verify your identity with World ID to increase trust.'}
            </p>
          </div>
          {worldIdStatus?.isVerified && (
            <div className='mt-8 flex items-center justify-between p-4 bg-surface-container rounded-xl border border-outline-variant/20'>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]'></div>
                <span className='text-sm font-mono'>ID_VERIFIED_SHA256</span>
              </div>
              <Lock className='size-4 text-on-surface-variant' />
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card className='hover:bg-surface-container-high transition-colors cursor-pointer border-outline-variant/10 group'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 font-headline'>
              <Zap className='size-4 text-secondary fill-secondary' />
              Edit Skills
            </CardTitle>
            <CardAction>
              <Pencil className='size-4 text-outline group-hover:text-secondary transition-colors' />
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-on-surface-variant'>
              Manage your agent's technical capabilities and specialized knowledge bases.
            </p>
          </CardContent>
        </Card>
        <Card className='hover:bg-surface-container-high transition-colors cursor-pointer border-outline-variant/10 group'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 font-headline'>
              <Sparkles className='size-4 text-primary fill-primary' />
              Update Description
            </CardTitle>
            <CardAction>
              <Pencil className='size-4 text-outline group-hover:text-primary transition-colors' />
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-on-surface-variant'>
              Refine your twin's personality, tone of voice, and operational guidelines.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Row 2: Weekly Calls + Revenue */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Activity className='size-4' />
              Weekly Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={callsChartConfig} className='h-[200px] w-full'>
              <BarChart data={MOCK_WEEKLY_CALLS}>
                <XAxis dataKey='day' hide />
                <Bar dataKey='calls' fill='var(--primary)' radius={4} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <DollarSign className='size-4' />
              Revenue (USDC)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className='h-[200px] w-full'>
              <BarChart data={MOCK_WEEKLY_REVENUE}>
                <XAxis dataKey='day' hide />
                <Bar dataKey='revenue' fill='var(--secondary)' radius={4} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Recent Usage */}
      <Card className='lg:col-span-3'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Activity className='size-4' />
            Transaction History
          </CardTitle>
          <CardAction>
            <Button variant='link' className='text-xs font-label text-primary font-bold uppercase tracking-widest p-0'>
              Export CSV
            </Button>
          </CardAction>
        </CardHeader>
        <div className='overflow-x-auto'>
          <table className='w-full text-left'>
            <thead>
              <tr className='bg-surface-container-low border-b border-outline-variant/10'>
                <th className='px-8 py-4 font-label text-[10px] text-outline tracking-widest uppercase'>
                  Transaction ID
                </th>
                <th className='px-8 py-4 font-label text-[10px] text-outline tracking-widest uppercase'>
                  Agent Version
                </th>
                <th className='px-8 py-4 font-label text-[10px] text-outline tracking-widest uppercase'>Date</th>
                <th className='px-8 py-4 font-label text-[10px] text-outline tracking-widest uppercase text-right'>
                  Amount
                </th>
                <th className='px-8 py-4 font-label text-[10px] text-outline tracking-widest uppercase text-center'>
                  Status
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-outline-variant/10'>
              <tr className='hover:bg-surface-container-highest/30 transition-colors'>
                <td className='px-8 py-5 font-mono text-xs text-on-surface-variant'>0x3f...91d2</td>
                <td className='px-8 py-5 text-sm font-headline'>Atlas v2.4</td>
                <td className='px-8 py-5 text-sm text-on-surface-variant'>2024.05.21</td>
                <td className='px-8 py-5 text-right font-mono text-primary font-bold'>1,240.00 USDC</td>
                <td className='px-8 py-5 text-center'>
                  <span className='px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-label font-bold'>
                    SETTLED
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
