'use client';

import { useQuery } from '@tanstack/react-query';
import { RankCard } from '@/components/twins/rank-card';
import { useTRPC } from '@/trpc/providers';
import { mapAgentToTwin } from '@/types/twin';

export function TopRankedSection() {
  const trpc = useTRPC();
  const { data: agents = [] } = useQuery(trpc.agents.topRanked.queryOptions());

  return (
    <section className='container mx-auto max-w-5xl px-6'>
      <div>
        <h2 className='text-xl font-bold'>Top Ranked</h2>
        <p className='text-sm text-muted-foreground'>Sovereign agents with the highest trust scores.</p>
      </div>
      <div className='mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {agents.map((agent, i) => (
          <RankCard key={agent.slug} twin={mapAgentToTwin(agent)} rank={i + 1} />
        ))}
      </div>
    </section>
  );
}
