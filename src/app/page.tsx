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
      <div className='pb-16'>
        {/* Hero Section */}

        <section className='relative py-24 px-8 overflow-hidden'>
          <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none'>
            <div className='absolute top-0 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-[120px]'></div>

            <div className='absolute bottom-0 right-1/4 w-64 h-64 bg-secondary-container/10 rounded-full blur-[100px]'></div>
          </div>

          <div className='max-w-4xl mx-auto text-center relative z-10'>
            <span className='font-label uppercase text-primary tracking-[0.3em] text-[11px] mb-4 block'>
              Sovereign Agent Ecosystem
            </span>

            <h1 className='text-5xl md:text-7xl font-bold tracking-tighter text-on-surface mb-8 font-headline leading-tight'>
              Hire the Next Generation of{' '}
              <span className='inline-block text-transparent bg-clip-text gradient-primary pb-2'>Autonomous Twins</span>
            </h1>

            <div className='relative max-w-2xl mx-auto group'>
              <div className='absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500'></div>

              <div className='relative flex items-center bg-surface-container-lowest border border-outline-variant/20 rounded-2xl px-6 py-4'>
                <Search className='size-5 text-outline mr-4' />

                <Input
                  type='text'
                  placeholder='Search by skill: marketing, dev, smart contracts...'
                  className='border-0 bg-transparent focus-visible:ring-0 shadow-none p-0 text-on-surface placeholder:text-outline/50 font-body'
                  disabled
                />

                <Button
                  className='gradient-primary text-on-primary px-6 py-2 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity ml-4'
                  disabled
                >
                  Search
                </Button>
              </div>
            </div>

            <div className='mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground'>
              <span className='text-xs font-label text-on-surface-variant uppercase tracking-wider'>Trending:</span>

              {TRENDING_TAGS.map((tag) => (
                <span key={tag} className='text-xs font-label text-primary hover:underline cursor-pointer'>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className='space-y-16'>
          <TrendingSection />

          <TopRankedSection />

          <LatestSection />
        </div>
      </div>
    </HydrateClient>
  );
}
