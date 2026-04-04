import { eq } from 'drizzle-orm';
import { agentTable } from '@/lib/db';
import { publicProcedure, router } from '@/trpc/init';

export const agentsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        name: agentTable.name,
        slug: agentTable.slug,
        description: agentTable.description,
        avatarUrl: agentTable.avatarUrl,
        totalCalls: agentTable.totalCalls,
      })
      .from(agentTable)
      .where(eq(agentTable.status, 'active'));
  }),
});
