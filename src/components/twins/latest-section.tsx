'use client';

import { useQuery } from '@tanstack/react-query';
import { TwinRow } from '@/components/twins/twin-row';
import { useTRPC } from '@/trpc/providers';
import { mapAgentToTwin } from '@/types/twin';

export function LatestSection() {
  const trpc = useTRPC();
  const { data: agents = [] } = useQuery(trpc.agents.latest.queryOptions());

  return (
    <section className='py-12 px-8 max-w-7xl mx-auto'>
      <div className='mb-8'>
        <h2 className='text-2xl font-bold font-headline tracking-tight'>New Arrivals</h2>
        <p className='text-on-surface-variant text-sm mt-1'>Freshly minted twins joining the ecosystem.</p>
      </div>
      <div className='mt-6 space-y-3'>
        {agents.map((agent) => (
          <TwinRow key={agent.slug} twin={mapAgentToTwin(agent)} />
        ))}
      </div>
    </section>
  );
}
