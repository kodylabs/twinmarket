import OpenAI from 'openai';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'google/gemini-2.5-flash-lite';
const DEFAULT_PROMPT_PRICE = '$0.05';

function getClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }
  return new OpenAI({
    apiKey,
    baseURL: OPENROUTER_BASE_URL,
  });
}

export async function chatCompletion(systemPrompt: string, userMessage: string): Promise<string> {
  const client = getClient();
  const model = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('LLM returned empty response');
  }
  return content;
}

export function estimatePromptPrice(): string {
  return DEFAULT_PROMPT_PRICE;
}
