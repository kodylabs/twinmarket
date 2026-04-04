'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, Copy, Lock, Shield, Star, Zap } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { authClient } from '@/lib/auth/auth-client';
import { useTRPC } from '@/trpc/providers';

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const MOCK_STATS = {
  usagePrice: '$0.50',
  latency: '1.2s',
  trustScore: '98%',
  totalRuns: '2,400+',
  rating: 4.9,
};

const MOCK_PRICING = {
  baseAgentCost: '$0.35',
  aiTokenCost: '$0.12',
  protocolFee: '$0.03',
  total: '$0.50',
};

const MOCK_TAGS = ['AI Strategy', 'Research', 'Analysis'];

const MOCK_ACTIVITY = [
  { text: 'Latest usage 2m ago', by: '0x71...f3a' },
  { text: 'New review posted', time: '14h ago' },
];

const MOCK_REVIEWS = [
  {
    name: 'saturn_v.eth',
    rating: 5,
    text: "Incredible nuance. It didn't just give generic advice; it pointed out exactly where my monetization model was leaking. Worth 10x the USDC fee.",
  },
  {
    name: 'cryptomama.eth',
    rating: 5,
    text: 'Fast responses and high precision. Used it for our seed round deck and got great feedback from VCs on the structure it suggested.',
  },
];

export default function MyTwinPage() {
  const { address } = useAccount();
  const { data: session } = authClient.useSession();
  const trpc = useTRPC();
  const { data: worldIdStatus } = useQuery(trpc.worldId.status.queryOptions());

  const displayName = session?.user?.name || 'My Digital Twin';
  const walletDisplay = address ? truncateAddress(address) : '';
  const verificationLevel = worldIdStatus?.verificationLevel;

  return (
    <div className='container mx-auto max-w-5xl space-y-8 p-6'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            {verificationLevel === 'orb' && <Shield className='size-6 text-primary' />}
            <h1 className='text-3xl font-bold'>{displayName}</h1>
          </div>
          <p className='flex items-center gap-2 text-sm text-muted-foreground'>Created by {walletDisplay}</p>
        </div>
        <div className='text-right text-sm'>
          <div className='flex items-center gap-1'>
            <Star className='size-4 fill-current text-yellow-500' />
            <span className='font-semibold'>{MOCK_STATS.rating}</span>
          </div>
          <p className='text-muted-foreground'>{MOCK_STATS.totalRuns} runs</p>
        </div>
      </div>

      {/* Stats row + Pricing sidebar */}
      <div className='grid gap-6 lg:grid-cols-[1fr_320px]'>
        <div className='space-y-8'>
          {/* Stats cards */}
          <div className='grid grid-cols-3 gap-4'>
            <Card>
              <CardContent className='pt-6'>
                <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Usage Price</p>
                <p className='mt-1 text-2xl font-bold'>
                  {MOCK_STATS.usagePrice} <span className='text-sm font-normal text-muted-foreground'>USDC</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Latency</p>
                <p className='mt-1 text-2xl font-bold'>{MOCK_STATS.latency}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Trust Score</p>
                <p className='mt-1 text-2xl font-bold'>{MOCK_STATS.trustScore}</p>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <div className='space-y-3'>
            <h2 className='text-lg font-semibold'>Description</h2>
            <p className='leading-relaxed text-muted-foreground'>
              This is your digital twin agent. Configure your expertise, set your pricing, and let buyers access your
              knowledge through autonomous API calls. Your system prompt stays encrypted — only the output is returned.
            </p>
            <div className='flex flex-wrap gap-2'>
              {MOCK_TAGS.map((tag) => (
                <Badge key={tag} variant='outline'>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* How to Use */}
          <div className='space-y-3'>
            <h2 className='text-lg font-semibold'>How to Use</h2>
            <p className='text-sm text-muted-foreground'>
              Copy and run in your CLI to trigger the agent directly from your terminal.
            </p>
            <div className='relative rounded-lg border bg-muted/50 p-4'>
              <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Terminal Command</p>
              <code className='mt-2 block font-mono text-sm'>/my-twin help me build a pitch deck</code>
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
          {/* Pricing Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Breakdown</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Base agent cost</span>
                <span>{MOCK_PRICING.baseAgentCost}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>AI token cost (est.)</span>
                <span>{MOCK_PRICING.aiTokenCost}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>On-chain protocol fee</span>
                <span>{MOCK_PRICING.protocolFee}</span>
              </div>
              <Separator />
              <div className='flex justify-between font-semibold'>
                <span>Total per execution</span>
                <span className='text-lg'>{MOCK_PRICING.total}</span>
              </div>

              <button
                type='button'
                className='mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90'
              >
                <Zap className='size-4' />
                Use Agent
              </button>

              <div className='flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground'>
                <span className='flex items-center gap-1'>
                  <Shield className='size-3' /> Audited
                </span>
                <span className='flex items-center gap-1'>
                  <Lock className='size-3' /> Encrypted
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Live Activity */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-sm'>
                <Activity className='size-4' />
                Live Activity
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {MOCK_ACTIVITY.map((item, i) => (
                <div key={i} className='flex items-start gap-2 text-sm'>
                  <span className='mt-1.5 size-2 shrink-0 rounded-full bg-green-500' />
                  <span className='text-muted-foreground'>
                    {item.text}
                    {item.by && <span className='font-mono'> by {item.by}</span>}
                    {item.time && <span> {item.time}</span>}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Recent Feedback */}
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold'>Recent Feedback</h2>
        <div className='grid gap-4 md:grid-cols-2'>
          {MOCK_REVIEWS.map((review) => (
            <Card key={review.name}>
              <CardContent className='pt-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Avatar className='size-8'>
                      <AvatarFallback className='text-xs'>{review.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='text-sm font-medium'>{review.name}</p>
                      <p className='text-xs text-muted-foreground'>Verified User</p>
                    </div>
                  </div>
                  <div className='flex gap-0.5'>
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className='size-3 fill-current text-yellow-500' />
                    ))}
                  </div>
                </div>
                <p className='mt-3 text-sm leading-relaxed text-muted-foreground'>&ldquo;{review.text}&rdquo;</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
