import { redirect } from 'next/navigation';
import { caller, HydrateClient, prefetch, trpc } from '@/trpc/server';
import { MyTwinDashboard } from './dashboard';

export default async function MyTwinPage() {
  const serverCaller = await caller();
  const agent = await serverCaller.agents.mine();

  if (!agent) {
    redirect('/my-twin/create/identity');
  }

  prefetch(trpc.agents.mine.queryOptions());
  prefetch(trpc.worldId.status.queryOptions());

  return (
    <HydrateClient>
      <MyTwinDashboard />
    </HydrateClient>
  );
}
