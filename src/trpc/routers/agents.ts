import crypto from 'node:crypto';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { generateAgentWallet, registerAgentOnWorldChain } from '@/lib/agentkit';
import { agentSkillTable, agentTable, asc, count, desc, eq, sum, userTable } from '@/lib/db';
import { registerEnsName } from '@/lib/ens';
import { protectedProcedure, publicProcedure, router } from '@/trpc/init';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export const agentsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        name: agentTable.name,
        slug: agentTable.slug,
        description: agentTable.description,
        avatarUrl: agentTable.avatarUrl,
        totalCalls: agentTable.totalCalls,
        ensName: agentTable.ensName,
        walletAddress: agentTable.walletAddress,
        pricePerCall: agentTable.pricePerCall,
        creatorId: agentTable.creatorId,
        creatorNullifierHash: userTable.nullifierHash,
        creatorVerificationLevel: userTable.verificationLevel,
      })
      .from(agentTable)
      .leftJoin(userTable, eq(agentTable.creatorId, userTable.id))
      .where(eq(agentTable.status, 'active'));
  }),

  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ ctx, input }) => {
    const agent = await ctx.db.query.agentTable.findFirst({
      where: eq(agentTable.slug, input.slug),
      with: {
        skills: { orderBy: asc(agentSkillTable.sortOrder) },
        creator: true,
      },
    });

    if (!agent) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Agent not found' });
    }

    const { systemPrompt, privateKey, ...publicAgent } = agent;
    return publicAgent;
  }),

  mine: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.agentTable.findFirst({
      where: eq(agentTable.creatorId, ctx.user.id),
      with: { skills: true },
    });
  }),

  stats: publicProcedure.query(async ({ ctx }) => {
    const [result] = await ctx.db
      .select({
        totalAgents: count(),
        totalCalls: sum(agentTable.totalCalls),
      })
      .from(agentTable)
      .where(eq(agentTable.status, 'active'));

    return result;
  }),

  trending: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        name: agentTable.name,
        slug: agentTable.slug,
        description: agentTable.description,
        avatarUrl: agentTable.avatarUrl,
        totalCalls: agentTable.totalCalls,
        ensName: agentTable.ensName,
        walletAddress: agentTable.walletAddress,
        pricePerCall: agentTable.pricePerCall,
      })
      .from(agentTable)
      .where(eq(agentTable.status, 'active'))
      .orderBy(desc(agentTable.totalCalls))
      .limit(3);
  }),

  topRanked: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        name: agentTable.name,
        slug: agentTable.slug,
        description: agentTable.description,
        avatarUrl: agentTable.avatarUrl,
        totalCalls: agentTable.totalCalls,
        ensName: agentTable.ensName,
        walletAddress: agentTable.walletAddress,
        pricePerCall: agentTable.pricePerCall,
      })
      .from(agentTable)
      .where(eq(agentTable.status, 'active'))
      .orderBy(desc(agentTable.totalCalls))
      .limit(4)
      .offset(3);
  }),

  latest: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        name: agentTable.name,
        slug: agentTable.slug,
        description: agentTable.description,
        avatarUrl: agentTable.avatarUrl,
        totalCalls: agentTable.totalCalls,
        ensName: agentTable.ensName,
        walletAddress: agentTable.walletAddress,
        pricePerCall: agentTable.pricePerCall,
      })
      .from(agentTable)
      .where(eq(agentTable.status, 'active'))
      .orderBy(desc(agentTable.createdAt))
      .limit(3);
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3).max(50),
        bio: z.string().min(10).max(200),
        systemPrompt: z.string().min(50).max(4000),
        skills: z
          .array(
            z.object({
              title: z.string().min(1),
              content: z.string().min(1),
            }),
          )
          .default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.agentTable.findFirst({
        where: eq(agentTable.creatorId, ctx.user.id),
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'You already have an agent',
        });
      }

      const wallet = generateAgentWallet();

      let slug = slugify(input.name);
      const slugExists = await ctx.db.query.agentTable.findFirst({
        where: eq(agentTable.slug, slug),
      });
      if (slugExists) {
        slug = `${slug}-${crypto.randomUUID().slice(0, 8)}`;
      }

      const agentId = crypto.randomUUID();

      const dbUser = await ctx.db.query.userTable.findFirst({
        where: eq(userTable.id, ctx.user.id),
      });

      // On-chain ops first — if they fail, nothing is written to DB
      const ensResult = await registerEnsName(slug, wallet.address as `0x${string}`, {
        description: input.bio,
        url: `https://twinmarket.app/twins/${slug}`,
        avatar: '',
        worldVerified: dbUser?.verificationLevel ?? '',
        worldAgentbookId: '',
      });

      const agentKitResult = await registerAgentOnWorldChain(wallet.address);

      // All on-chain ops succeeded — now persist to DB atomically
      await ctx.db.transaction(async (tx) => {
        await tx.insert(agentTable).values({
          id: agentId,
          slug,
          name: input.name,
          description: input.bio,
          systemPrompt: input.systemPrompt,
          creatorId: ctx.user.id,
          walletAddress: wallet.address,
          privateKey: wallet.privateKey,
          ensName: ensResult.ensName,
          status: 'active',
        });

        for (let i = 0; i < input.skills.length; i++) {
          await tx.insert(agentSkillTable).values({
            id: crypto.randomUUID(),
            agentId,
            title: input.skills[i].title,
            content: input.skills[i].content,
            sortOrder: i,
          });
        }
      });

      return {
        id: agentId,
        slug,
        name: input.name,
        description: input.bio,
        walletAddress: wallet.address,
        ensName: ensResult.ensName,
        agentBookId: agentKitResult.agentBookId ?? null,
        status: 'active',
      };
    }),
});
