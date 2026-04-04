export const dynamic = 'force-dynamic';

import { Search } from 'lucide-react';
import { LatestSection } from '@/components/twins/latest-section';
import { TopRankedSection } from '@/components/twins/top-ranked-section';
import { TrendingSection } from '@/components/twins/trending-section';
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

          <div className='flex w-full max-w-xl items-center gap-2 rounded-lg border bg-background px-4 py-2'>
            <Search className='size-5 text-muted-foreground' />
            <input
              type='text'
              placeholder='Search by skill: marketing, dev, smart contracts...'
              className='flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
              disabled
            />
            <button
              type='button'
              disabled
              className='rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground'
            >
              Search
            </button>
          </div>

          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <span className='uppercase tracking-wider'>Trending:</span>
            {TRENDING_TAGS.map((tag) => (
              <span key={tag} className='cursor-default underline underline-offset-4'>
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
