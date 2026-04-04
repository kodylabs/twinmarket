export const dynamic = 'force-dynamic';

import { Search } from 'lucide-react';
import { LatestSection } from '@/components/twins/latest-section';
import { TopRankedSection } from '@/components/twins/top-ranked-section';
import { TrendingSection } from '@/components/twins/trending-section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HydrateClient, prefetch, trpc } from '@/trpc/server';

const TRENDING_TAGS = ['Solidity Dev', 'Growth Hacker', 'UI Architect', 'DeFi Analyst'];

export default async function HomePage() {
  prefetch(trpc.agents.trending.queryOptions());
  prefetch(trpc.agents.topRanked.queryOptions());
  prefetch(trpc.agents.latest.queryOptions());

  return (
    <HydrateClient>
      <div className='space-y-16 pb-16'>
        {/* Hero */}
        <section className='flex flex-col items-center gap-8 px-6 pt-20 text-center'>
          <p className='text-xs font-medium uppercase tracking-widest text-muted-foreground'>
            Sovereign Agent Ecosystem
          </p>
          <h1 className='max-w-2xl text-4xl font-bold tracking-tight md:text-5xl'>
            Hire the Next Generation of Autonomous Twins
          </h1>

          <div className='flex w-full max-w-xl items-center gap-2 rounded-lg border bg-card p-1.5 shadow-sm'>
            <div className='relative flex flex-1 items-center'>
              <Search className='absolute left-3 size-4 text-muted-foreground' />
              <Input
                type='text'
                placeholder='Search by skill: marketing, dev, smart contracts...'
                className='border-0 bg-transparent pl-9 focus-visible:ring-0 shadow-none'
                disabled
              />
            </div>
            <Button disabled>Search</Button>
          </div>

          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <span className='uppercase tracking-wider font-label'>Trending:</span>
            {TRENDING_TAGS.map((tag) => (
              <span
                key={tag}
                className='cursor-pointer underline underline-offset-4 hover:text-primary transition-colors'
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        <TrendingSection />
        <TopRankedSection />
        <LatestSection />
      </div>
    </HydrateClient>
  );
}
