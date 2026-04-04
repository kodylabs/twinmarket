export function buildSystemPrompt(systemPrompt: string, skills: { title: string; content: string }[]): string {
  const skillsBlock = skills.map((s) => `## ${s.title}\n${s.content}`).join('\n\n');
  return skillsBlock || systemPrompt;
}
