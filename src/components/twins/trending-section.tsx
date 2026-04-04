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
    <section className='container mx-auto max-w-5xl px-6'>
      <div className='flex items-end justify-between'>
        <div>
          <h2 className='text-xl font-bold'>Trending Agents</h2>
          <p className='text-sm text-muted-foreground'>Highly utilized digital entities this week.</p>
        </div>
        <Link href='/twins' className='text-sm font-medium hover:underline'>
          VIEW ALL &rarr;
        </Link>
      </div>
      <div className='mt-6 grid gap-4 md:grid-cols-3'>
        {agents.map((agent) => (
          <TwinCard key={agent.slug} twin={mapAgentToTwin(agent)} />
        ))}
      </div>
    </section>
  );
}
