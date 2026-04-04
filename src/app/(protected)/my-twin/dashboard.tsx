'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  Bot,
  Check,
  DollarSign,
  ExternalLink,
  Lock,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, XAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
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

const MOCK_RECENT_USAGE = [
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
  calls: { label: 'Calls', color: 'var(--chart-1)' },
};

const revenueChartConfig: ChartConfig = {
  revenue: { label: 'Revenue (USDC)', color: 'var(--chart-2)' },
};

export function MyTwinDashboard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: agent } = useQuery(trpc.agents.mine.queryOptions());
  const { data: worldIdStatus } = useQuery(trpc.worldId.status.queryOptions());

  const [editingPrompt, setEditingPrompt] = useState(false);
  const [promptDraft, setPromptDraft] = useState('');
  const [editingSkills, setEditingSkills] = useState(false);
  const [skillsDraft, setSkillsDraft] = useState<{ title: string; content: string }[]>([]);

  const updateMutation = useMutation(
    trpc.agents.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.agents.mine.queryOptions().queryKey });
        setEditingPrompt(false);
        setEditingSkills(false);
      },
    }),
  );

  if (!agent) return null;

  const totalWeeklyCalls = MOCK_WEEKLY_CALLS.reduce((sum, d) => sum + d.calls, 0);
  const totalWeeklyRevenue = MOCK_WEEKLY_REVENUE.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className='container mx-auto max-w-6xl space-y-6 p-6'>
      <div className='grid gap-6 lg:grid-cols-3'>
        {/* Row 1: Agent Info (col-span-2) + World ID (col-span-1) */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Bot className='size-4' />
              {agent.name}
              <Badge variant='outline' className='uppercase'>
                {agent.status}
              </Badge>
            </CardTitle>
            <CardAction>
              <Button variant='outline' size='sm' disabled>
                <Pencil className='size-3' />
                Edit
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className='flex gap-6'>
            <div className='flex size-24 shrink-0 items-center justify-center rounded-lg border bg-muted'>
              <span className='text-3xl font-bold text-muted-foreground'>{agent.name.slice(0, 2)}</span>
            </div>
            <div className='space-y-2'>
              <p className='text-sm text-muted-foreground'>{agent.description}</p>
              <div className='flex flex-wrap items-center gap-3'>
                {agent.ensName && (
                  <a
                    href={`https://sepolia.app.ens.domains/${agent.ensName}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground'
                  >
                    {agent.ensName}
                    <ExternalLink className='size-3' />
                  </a>
                )}
                {agent.walletAddress && (
                  <a
                    href={`https://worldscan.org/address/${agent.walletAddress}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground'
                  >
                    {agent.walletAddress.slice(0, 6)}...{agent.walletAddress.slice(-4)}
                    <ExternalLink className='size-3' />
                  </a>
                )}
                <a
                  href='https://worldscan.org/address/0xA23aB2712eA7BBa896930544C7d6636a96b944dA#readContract'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground'
                >
                  AgentBook
                  <ExternalLink className='size-3' />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <ShieldCheck className='size-4' />
              World ID
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <p className='text-sm text-muted-foreground'>
              {worldIdStatus?.isVerified
                ? 'Your sovereign identity is verified on-chain. Highest trust level for institutional users.'
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

        {/* Row 2: Weekly Calls + Revenue + Stats Summary */}
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
                <XAxis dataKey='day' />
                <Bar dataKey='calls' fill='var(--chart-1)' radius={4} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <DollarSign className='size-4' />
              Revenue (x402)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className='h-[200px] w-full'>
              <BarChart data={MOCK_WEEKLY_REVENUE}>
                <XAxis dataKey='day' />
                <Bar dataKey='revenue' fill='var(--chart-2)' radius={4} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='size-4' />
              Stats Summary
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-1'>
              <p className='text-xs text-muted-foreground'>Total Calls</p>
              <p className='text-2xl font-bold'>{agent.totalCalls.toLocaleString()}</p>
            </div>
            <Separator />
            <div className='space-y-1'>
              <p className='text-xs text-muted-foreground'>Price per Call</p>
              <p className='text-2xl font-bold'>{agent.pricePerCall} USDC</p>
            </div>
            <Separator />
            <div className='space-y-1'>
              <p className='text-xs text-muted-foreground'>Weekly Calls</p>
              <p className='text-2xl font-bold'>{totalWeeklyCalls}</p>
            </div>
            <Separator />
            <div className='space-y-1'>
              <p className='text-xs text-muted-foreground'>Weekly Revenue</p>
              <p className='text-2xl font-bold'>{totalWeeklyRevenue.toFixed(2)} USDC</p>
            </div>
          </CardContent>
        </Card>

        {/* Row 3: System Prompt (col-span-2) + Skills (col-span-1) */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Sparkles className='size-4' />
              System Prompt
            </CardTitle>
            <CardAction>
              {editingPrompt ? (
                <div className='flex gap-1'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setEditingPrompt(false)}
                    disabled={updateMutation.isPending}
                  >
                    <X className='size-3' />
                    Cancel
                  </Button>
                  <Button
                    size='sm'
                    onClick={() => updateMutation.mutate({ systemPrompt: promptDraft })}
                    disabled={updateMutation.isPending}
                  >
                    <Check className='size-3' />
                    Save
                  </Button>
                </div>
              ) : (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setPromptDraft(agent.systemPrompt);
                    setEditingPrompt(true);
                  }}
                >
                  <Pencil className='size-3' />
                  Edit
                </Button>
              )}
            </CardAction>
          </CardHeader>
          <CardContent>
            {editingPrompt ? (
              <Textarea
                value={promptDraft}
                onChange={(e) => setPromptDraft(e.target.value)}
                className='min-h-[200px] font-mono text-sm'
              />
            ) : (
              <pre className='whitespace-pre-wrap rounded-md border bg-muted/50 p-4 text-sm leading-relaxed'>
                {agent.systemPrompt}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Zap className='size-4' />
              Skills
            </CardTitle>
            <CardAction>
              {editingSkills ? (
                <div className='flex gap-1'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setEditingSkills(false)}
                    disabled={updateMutation.isPending}
                  >
                    <X className='size-3' />
                    Cancel
                  </Button>
                  <Button
                    size='sm'
                    onClick={() => updateMutation.mutate({ skills: skillsDraft })}
                    disabled={updateMutation.isPending}
                  >
                    <Check className='size-3' />
                    Save
                  </Button>
                </div>
              ) : (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setSkillsDraft(agent.skills.map((s) => ({ title: s.title, content: s.content })));
                    setEditingSkills(true);
                  }}
                >
                  <Pencil className='size-3' />
                  Edit
                </Button>
              )}
            </CardAction>
          </CardHeader>
          <CardContent className='space-y-3'>
            {editingSkills ? (
              <>
                {skillsDraft.map((skill, i) => (
                  <div key={i} className='space-y-2 rounded-md border p-3'>
                    <div className='flex items-center gap-2'>
                      <Input
                        value={skill.title}
                        onChange={(e) => {
                          const next = [...skillsDraft];
                          next[i] = { ...next[i], title: e.target.value };
                          setSkillsDraft(next);
                        }}
                        placeholder='Skill title'
                        className='text-sm'
                      />
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setSkillsDraft(skillsDraft.filter((_, j) => j !== i))}
                      >
                        <Trash2 className='size-3' />
                      </Button>
                    </div>
                    <Textarea
                      value={skill.content}
                      onChange={(e) => {
                        const next = [...skillsDraft];
                        next[i] = { ...next[i], content: e.target.value };
                        setSkillsDraft(next);
                      }}
                      placeholder='Skill content'
                      className='min-h-[60px] text-sm'
                    />
                  </div>
                ))}
                <Button
                  variant='outline'
                  size='sm'
                  className='w-full'
                  onClick={() => setSkillsDraft([...skillsDraft, { title: '', content: '' }])}
                >
                  <Plus className='size-3' />
                  Add Skill
                </Button>
              </>
            ) : (
              <>
                {agent.skills.length === 0 && (
                  <p className='text-sm text-muted-foreground'>No skills configured yet.</p>
                )}
                {agent.skills.map((skill) => (
                  <div key={skill.id} className='space-y-1 rounded-md border p-3'>
                    <p className='text-sm font-medium'>{skill.title}</p>
                    <p className='text-xs text-muted-foreground line-clamp-2'>{skill.content}</p>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        {/* Row 4: Recent Usage (col-span-3) */}
        <Card className='lg:col-span-3'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Activity className='size-4' />
              Recent Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {MOCK_RECENT_USAGE.map((usage) => (
                <div key={usage.id} className='flex items-start gap-4 rounded-md border p-4'>
                  <div className='min-w-0 flex-1 space-y-1'>
                    <p className='text-sm font-medium'>{usage.input}</p>
                    <p className='text-sm text-muted-foreground'>{usage.output}</p>
                  </div>
                  <div className='flex shrink-0 flex-col items-end gap-1'>
                    <div className='flex items-center gap-1'>
                      <Star className='size-3 fill-yellow-400 text-yellow-400' />
                      <span className='text-sm font-medium'>{usage.score}</span>
                    </div>
                    <span className='text-xs text-muted-foreground'>{usage.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
