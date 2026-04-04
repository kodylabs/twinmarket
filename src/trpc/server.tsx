import 'server-only';

/**
 * Used to query inside RSC components with some helper functions.
 */

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createTRPCOptionsProxy, type TRPCQueryOptions } from '@trpc/tanstack-react-query';
import type React from 'react';
import { cache } from 'react';
import { createTRPCContext } from '@/trpc/init';
import { makeQueryClient } from '@/trpc/query-client';
import { appRouter } from '@/trpc/routers/_app';

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

// Helpers for RSC

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const state = dehydrate(queryClient);
  return <HydrationBoundary state={state}>{props.children}</HydrationBoundary>;
}

export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(queryOptions: T) {
  const queryClient = getQueryClient();
  if (queryOptions.queryKey[1]?.type === 'infinite') {
    void queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    void queryClient.prefetchQuery(queryOptions);
  }
}
