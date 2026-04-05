export function buildSystemPrompt(systemPrompt: string, skills: { title: string; content: string }[]): string {
  const skillsBlock = skills.map((s) => `## ${s.title}\n${s.content}`).join('\n\n');
  if (!skillsBlock) return systemPrompt;
  return `${systemPrompt}\n\n---\n\nYour knowledge and skills:\n\n${skillsBlock}`;
}
