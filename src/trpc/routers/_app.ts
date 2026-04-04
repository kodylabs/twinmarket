import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { router } from '@/trpc/init';
import { agentsRouter } from './agents';
import { helloRouter } from './hello';

export const appRouter = router({
  hello: helloRouter,
  agents: agentsRouter,
});

export type AppRouter = typeof appRouter;
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
