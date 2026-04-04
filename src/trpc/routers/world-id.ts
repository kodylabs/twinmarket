import { TRPCError } from '@trpc/server';
import { signRequest } from '@worldcoin/idkit';
import { z } from 'zod';
import { eq, userTable } from '@/lib/db';
import { getWorldIdAppId, WORLD_ID_ACTION } from '@/lib/world-id';
import { protectedProcedure, router } from '@/trpc/init';

function getRpId(): string {
  const rpId = process.env.WLD_RP_ID;
  if (!rpId) {
    throw new Error('WLD_RP_ID must be set');
  }
  return rpId;
}

function getSigningKey(): string {
  const key = process.env.WLD_SIGNING_KEY;
  if (!key) {
    throw new Error('WLD_SIGNING_KEY must be set');
  }
  return key;
}

const verifyInput = z.object({
  nullifier: z.string(),
  credential: z.string(),
});

export const worldIdRouter = router({
  status: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await ctx.db
      .select({
        nullifierHash: userTable.nullifierHash,
        verificationLevel: userTable.verificationLevel,
      })
      .from(userTable)
      .where(eq(userTable.id, ctx.user.id));

    return {
      isVerified: !!user?.nullifierHash,
      verificationLevel: user?.verificationLevel ?? null,
    };
  }),

  rpContext: protectedProcedure.query(() => {
    const rpId = getRpId();
    const signingKey = getSigningKey();
    const rpSig = signRequest(WORLD_ID_ACTION, signingKey);

    return {
      appId: getWorldIdAppId(),
      rpContext: {
        rp_id: rpId,
        nonce: rpSig.nonce,
        created_at: rpSig.createdAt,
        expires_at: rpSig.expiresAt,
        signature: rpSig.sig,
      },
    };
  }),

  verify: protectedProcedure.input(verifyInput).mutation(async ({ ctx, input }) => {
    const [existingUser] = await ctx.db
      .select({ nullifierHash: userTable.nullifierHash })
      .from(userTable)
      .where(eq(userTable.id, ctx.user.id));

    if (existingUser?.nullifierHash) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'User is already verified' });
    }

    const [duplicateNullifier] = await ctx.db
      .select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.nullifierHash, input.nullifier));

    if (duplicateNullifier) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'This World ID is already linked to another account',
      });
    }

    await ctx.db
      .update(userTable)
      .set({
        nullifierHash: input.nullifier,
        verificationLevel: input.credential,
        verifiedAt: new Date(),
      })
      .where(eq(userTable.id, ctx.user.id));

    return { success: true, verificationLevel: input.credential };
  }),
});
