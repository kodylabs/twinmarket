export const dynamic = 'force-dynamic';

import { MarketplaceContent } from '@/components/twins/marketplace-content';
import { HydrateClient, prefetch, trpc } from '@/trpc/server';

export default async function TwinsPage() {
  prefetch(trpc.agents.list.queryOptions());
  prefetch(trpc.agents.stats.queryOptions());

  return (
    <HydrateClient>
      <MarketplaceContent />
    </HydrateClient>
  );
}
