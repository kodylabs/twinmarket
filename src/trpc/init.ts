import { initTRPC, TRPCError } from '@trpc/server';
import { headers } from 'next/headers';
import superjson from 'superjson';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';

export async function createTRPCContext(opts?: { headers: Headers }) {
  const requestHeaders = opts?.headers ?? (await headers());
  const session = await auth.api.getSession({ headers: requestHeaders });

  return {
    session,
    headers: requestHeaders,
    db,
  };
}

type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = publicProcedure.use(async (opts) => {
  if (!opts.ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  return opts.next({
    ctx: {
      ...opts.ctx,
      session: opts.ctx.session,
      user: opts.ctx.session.user,
    },
  });
});
