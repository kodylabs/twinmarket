'use client';

import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { TwinCard } from '@/components/twins/twin-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTRPC } from '@/trpc/providers';
import { mapAgentToTwin } from '@/types/twin';

export function MarketplaceContent() {
  const trpc = useTRPC();
  const { data: agents = [] } = useQuery(trpc.agents.list.queryOptions());
  const { data: stats } = useQuery(trpc.agents.stats.queryOptions());

  return (
    <div className='container mx-auto max-w-5xl space-y-8 px-6 py-8'>
      {/* Stats header */}
      <div className='grid grid-cols-2 gap-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
              Total Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{(stats?.totalAgents ?? 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
              Total Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{Number(stats?.totalCalls ?? 0).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className='flex items-center gap-2 rounded-lg border bg-background px-4 py-2'>
        <Search className='size-5 text-muted-foreground' />
        <input
          type='text'
          placeholder='Search agents by name, skill, or ENS...'
          className='flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
          disabled
        />
      </div>

      {/* Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {agents.map((agent) => (
          <TwinCard key={agent.slug} twin={mapAgentToTwin(agent)} />
        ))}
      </div>
    </div>
  );
}
