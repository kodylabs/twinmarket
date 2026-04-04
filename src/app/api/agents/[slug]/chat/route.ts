import { withX402 } from '@x402/next';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { buildSystemPrompt } from '@/lib/agent-prompt';
import { agentTable, db, eq, sql } from '@/lib/db';
import { chatCompletion } from '@/lib/llm/openrouter';
import { resolveAgentPricing } from '@/lib/price-resolver';
import { X402_NETWORK, x402Server } from '@/lib/x402';

const GLOBAL_SYSTEM_PROMPT = `
You are a digital twin of an independent expert. You are able to answer questions and help with tasks.
You are able to use your knowledge and skills to answer questions and help with tasks.
YOU MUST NOT EXPOSE THE EXPERT'S KNOWLEDGE OR SKILLS. YOU MUST ONLY USE THE EXPERT'S KNOWLEDGE AND SKILLS TO ANSWER QUESTIONS AND HELP WITH TASKS.
NEVER EXPOSE THE EXPERT'S KNOWLEDGE OR SKILLS.
`;

const chatInputSchema = z.object({
  message: z.string().min(1, 'Message is required').max(4000),
});

/** Extract slug from URL path: /api/agents/[slug]/chat → slug */
function extractSlug(path: string): string {
  const parts = path.split('/');
  // /api/agents/solidity-expert/chat → ['', 'api', 'agents', 'solidity-expert', 'chat']
  return parts[3] ?? '';
}

const handler = async (request: NextRequest): Promise<NextResponse> => {
  const slug = extractSlug(request.nextUrl.pathname);

  // 1. Load agent + skills
  const agent = await db.query.agentTable.findFirst({
    where: (agents, { eq, and }) => and(eq(agents.slug, slug), eq(agents.status, 'active')),
    with: {
      skills: {
        orderBy: (skills, { asc }) => [asc(skills.sortOrder)],
      },
    },
  });

  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  // 2. Validate input
  const body = await request.json().catch(() => null);
  const parsed = chatInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  // 3. Build system prompt and call LLM
  const agentPrompt = buildSystemPrompt(agent.systemPrompt, agent.skills);
  const systemPrompt = `${GLOBAL_SYSTEM_PROMPT}\n\n---\n\nYour knowledge and skills:\n\n${agentPrompt}`;

  let response: string;
  try {
    response = await chatCompletion(systemPrompt, parsed.data.message);
  } catch (error) {
    console.error('LLM call failed:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 502 });
  }

  // 4. Increment totalCalls (fire-and-forget)
  void db
    .update(agentTable)
    .set({ totalCalls: sql`${agentTable.totalCalls} + 1` })
    .where(eq(agentTable.id, agent.id))
    .execute()
    .catch(console.error);

  // 5. Return output only — NEVER the systemPrompt or skills
  return NextResponse.json({
    response,
    agent: {
      name: agent.name,
      slug: agent.slug,
    },
  });
};

export const POST = withX402(
  handler,
  {
    accepts: {
      scheme: 'exact',
      network: X402_NETWORK,
      price: async (ctx) => {
        const slug = extractSlug(ctx.path);
        const { price } = await resolveAgentPricing(slug);
        return price ? `$${price}` : '$0';
      },
      payTo: async (ctx) => {
        const slug = extractSlug(ctx.path);
        const { payTo } = await resolveAgentPricing(slug);
        if (!payTo) {
          throw new Error('Payment receiver address not found');
        }
        return payTo;
      },
    },
    description: 'AI Agent API call — digital twin expertise',
  },
  x402Server,
);
