'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { TwinCard } from '@/components/twins/twin-card';
import { useTRPC } from '@/trpc/providers';
import { mapAgentToTwin } from '@/types/twin';

export function TrendingSection() {
  const trpc = useTRPC();
  const { data: agents = [] } = useQuery(trpc.agents.trending.queryOptions());

  return (
    <section className='py-12 px-8 max-w-7xl mx-auto'>
      <div className='flex justify-between items-end mb-8'>
        <div>
          <h2 className='text-2xl font-bold font-headline tracking-tight'>Trending Agents</h2>
          <p className='text-on-surface-variant text-sm mt-1'>Highly utilized digital entities this week.</p>
        </div>
        <Link
          href='/twins'
          className='text-primary text-sm font-label flex items-center gap-2 hover:opacity-80 transition-opacity'
        >
          VIEW ALL &rarr;
        </Link>
      </div>
      <div className='flex gap-6 overflow-x-auto pb-8 hide-scrollbar snap-x'>
        {agents.map((agent) => (
          <TwinCard key={agent.slug} twin={mapAgentToTwin(agent)} />
        ))}
      </div>
    </section>
  );
}
