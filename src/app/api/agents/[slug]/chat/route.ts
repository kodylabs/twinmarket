import { NextResponse } from 'next/server';
import { z } from 'zod';
import { buildSystemPrompt } from '@/lib/agent-prompt';
import { agentTable, db, eq, sql } from '@/lib/db';
import { chatCompletion } from '@/lib/llm/openrouter';

const chatInputSchema = z.object({
  message: z.string().min(1, 'Message is required').max(4000),
});

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1. Validate input
  const body = await request.json().catch(() => null);
  const parsed = chatInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  // 2. Load agent + skills
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

  // 3. Build system prompt and call LLM
  const systemPrompt = buildSystemPrompt(agent.systemPrompt, agent.skills);

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
}
