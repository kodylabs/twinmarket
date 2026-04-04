'use client';

import { useQuery } from '@tanstack/react-query';
import { TwinRow } from '@/components/twins/twin-row';
import { useTRPC } from '@/trpc/providers';
import { mapAgentToTwin } from '@/types/twin';

export function LatestSection() {
  const trpc = useTRPC();
  const { data: agents = [] } = useQuery(trpc.agents.latest.queryOptions());

  return (
    <section className='container mx-auto max-w-5xl px-6'>
      <div>
        <h2 className='text-xl font-bold'>New Arrivals</h2>
        <p className='text-sm text-muted-foreground'>Freshly minted twins joining the ecosystem.</p>
      </div>
      <div className='mt-6 space-y-3'>
        {agents.map((agent) => (
          <TwinRow key={agent.slug} twin={mapAgentToTwin(agent)} />
        ))}
      </div>
    </section>
  );
}
