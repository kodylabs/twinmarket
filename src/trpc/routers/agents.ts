import crypto from 'node:crypto';
import { TRPCError } from '@trpc/server';
import { createAgentBookVerifier } from '@worldcoin/agentkit';
import { z } from 'zod';
import { generateAgentWallet, getAgentBookNonce, submitAgentBookRegistration } from '@/lib/agentkit';
import { agentSkillTable, agentTable, asc, count, desc, eq, sum, userTable } from '@/lib/db';
import { getEnsRecords, registerEnsName } from '@/lib/ens';
import { computePromptCommitment } from '@/lib/zk';
import { protectedProcedure, publicProcedure, router } from '@/trpc/init';

const agentBook = createAgentBookVerifier();

async function lookupAgentBookStatus(walletAddress: string | null) {
  if (!walletAddress) return { isRegistered: false, humanId: null };
  try {
    const humanId = await agentBook.lookupHuman(walletAddress, 'eip155:480');
    return { isRegistered: !!humanId, humanId };
  } catch {
    return { isRegistered: false, humanId: null };
  }
}

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

    const { systemPrompt, privateKey, skills, ...publicAgent } = agent;
    const [agentBookStatus, ensRecords] = await Promise.all([
      lookupAgentBookStatus(agent.walletAddress),
      agent.ensName ? getEnsRecords(agent.ensName) : null,
    ]);
    return {
      ...publicAgent,
      agentBook: agentBookStatus,
      ensRecords,
      skillCount: skills.length,
      systemPromptLength: systemPrompt.length,
    };
  }),

  mine: protectedProcedure.query(async ({ ctx }) => {
    const agent = await ctx.db.query.agentTable.findFirst({
      where: eq(agentTable.creatorId, ctx.user.id),
      with: { skills: true },
    });
    if (!agent) return null;
    const [agentBookStatus, ensRecords] = await Promise.all([
      lookupAgentBookStatus(agent.walletAddress),
      agent.ensName ? getEnsRecords(agent.ensName) : null,
    ]);
    return { ...agent, agentBook: agentBookStatus, ensRecords };
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

  prepareCreate: protectedProcedure.mutation(async ({ ctx }) => {
    const existing = await ctx.db.query.agentTable.findFirst({
      where: eq(agentTable.creatorId, ctx.user.id),
    });

    if (existing) {
      throw new TRPCError({ code: 'CONFLICT', message: 'You already have an agent' });
    }

    const wallet = generateAgentWallet();
    const nonce = await getAgentBookNonce(wallet.address as `0x${string}`);

    return { walletAddress: wallet.address, privateKey: wallet.privateKey, nonce };
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
        walletAddress: z.string(),
        privateKey: z.string(),
        agentBookProof: z.object({
          merkleRoot: z.string(),
          nullifierHash: z.string(),
          proof: z.string(),
          nonce: z.string(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.agentTable.findFirst({
        where: eq(agentTable.creatorId, ctx.user.id),
      });

      if (existing) {
        return {
          id: existing.id,
          slug: existing.slug,
          walletAddress: existing.walletAddress,
          ensName: existing.ensName,
          agentBookTxHash: null,
        };
      }

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

      const promptCommitment = await computePromptCommitment(input.systemPrompt, input.skills);

      // 1. ENS registration + AgentBook relay in parallel (independent operations)
      const [ensResult, relayResult] = await Promise.all([
        registerEnsName(slug, input.walletAddress as `0x${string}`, {
          description: input.bio,
          url: `https://twinmarket.app/twins/${slug}`,
          avatar: '',
          worldVerified: dbUser?.verificationLevel ?? '',
          worldAgentbookId: '',
          promptCommitment,
        }),
        submitAgentBookRegistration(input.walletAddress, input.agentBookProof),
      ]);

      // 3. All on-chain ops succeeded — persist to DB
      await ctx.db.transaction(async (tx) => {
        await tx.insert(agentTable).values({
          id: agentId,
          slug,
          name: input.name,
          description: input.bio,
          systemPrompt: input.systemPrompt,
          creatorId: ctx.user.id,
          walletAddress: input.walletAddress,
          privateKey: input.privateKey,
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
        walletAddress: input.walletAddress,
        ensName: ensResult.ensName,
        agentBookTxHash: relayResult.txHash,
      };
    }),

  update: protectedProcedure
    .input(
      z.object({
        systemPrompt: z.string().min(50).max(4000).optional(),
        skills: z
          .array(
            z.object({
              title: z.string().min(1),
              content: z.string().min(1),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const agent = await ctx.db.query.agentTable.findFirst({
        where: eq(agentTable.creatorId, ctx.user.id),
      });

      if (!agent) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Agent not found' });
      }

      await ctx.db.transaction(async (tx) => {
        if (input.systemPrompt !== undefined) {
          await tx.update(agentTable).set({ systemPrompt: input.systemPrompt }).where(eq(agentTable.id, agent.id));
        }

        if (input.skills !== undefined) {
          await tx.delete(agentSkillTable).where(eq(agentSkillTable.agentId, agent.id));
          for (let i = 0; i < input.skills.length; i++) {
            await tx.insert(agentSkillTable).values({
              id: crypto.randomUUID(),
              agentId: agent.id,
              title: input.skills[i].title,
              content: input.skills[i].content,
              sortOrder: i,
            });
          }
        }
      });

      return { success: true };
    }),
});
