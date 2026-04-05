import 'server-only';

import { GatewayClient } from '@circle-fin/x402-batching/client';
import { TRPCError } from '@trpc/server';
import { agentTable, type db as Db, eq } from '@/lib/db';

export async function getAgentGateway(db: typeof Db, userId: string) {
  const agent = await db.query.agentTable.findFirst({
    where: eq(agentTable.creatorId, userId),
  });

  if (!agent) throw new TRPCError({ code: 'NOT_FOUND', message: 'Agent not found' });
  if (!agent.privateKey) throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'No private key configured' });

  const gateway = new GatewayClient({
    chain: 'arcTestnet',
    privateKey: agent.privateKey as `0x${string}`,
  });

  return { agent, gateway };
}
