'use client';

import { useQuery } from '@tanstack/react-query';
import { RankCard } from '@/components/twins/rank-card';
import { useTRPC } from '@/trpc/providers';
import { mapAgentToTwin } from '@/types/twin';

export function TopRankedSection() {
  const trpc = useTRPC();
  const { data: agents = [] } = useQuery(trpc.agents.topRanked.queryOptions());

  return (
    <section className='py-12 px-8 max-w-7xl mx-auto'>
      <div className='mb-12'>
        <h2 className='text-2xl font-bold font-headline tracking-tight'>Top Ranked</h2>
        <p className='text-on-surface-variant text-sm mt-1'>Sovereign agents with the highest trust scores.</p>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {agents.map((agent, i) => (
          <RankCard key={agent.slug} twin={mapAgentToTwin(agent)} rank={i + 1} />
        ))}
      </div>
    </section>
  );
}
