import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { router } from '@/trpc/init';
import { helloRouter } from './hello';
import { worldIdRouter } from './world-id';

export const appRouter = router({
  hello: helloRouter,
  worldId: worldIdRouter,
});

export type AppRouter = typeof appRouter;
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
