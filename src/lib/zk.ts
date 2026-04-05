import { buildPoseidon } from 'circomlibjs';
import { buildSystemPrompt } from './agent-prompt';

const CHUNK_SIZE = 31; // bytes per BN254 field element
const POSEIDON_ARITY = 16; // max inputs per Poseidon call

function textToFieldElements(text: string): bigint[] {
  const bytes = new TextEncoder().encode(text);
  const elements: bigint[] = [];
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.slice(i, i + CHUNK_SIZE);
    let value = BigInt(0);
    for (const byte of chunk) {
      value = (value << BigInt(8)) | BigInt(byte);
    }
    elements.push(value);
  }
  return elements;
}

function poseidonTree(poseidon: Awaited<ReturnType<typeof buildPoseidon>>, elements: bigint[]): bigint {
  if (elements.length <= POSEIDON_ARITY) {
    return poseidon.F.toObject(poseidon(elements));
  }

  const reduced: bigint[] = [];
  for (let i = 0; i < elements.length; i += POSEIDON_ARITY) {
    const group = elements.slice(i, i + POSEIDON_ARITY);
    reduced.push(poseidon.F.toObject(poseidon(group)));
  }

  return poseidonTree(poseidon, reduced);
}

export async function computePromptCommitment(
  systemPrompt: string,
  skills: { title: string; content: string }[],
): Promise<`0x${string}`> {
  const fullPrompt = buildSystemPrompt(systemPrompt, skills);
  const elements = textToFieldElements(fullPrompt);
  const poseidon = await buildPoseidon();
  const hash = poseidonTree(poseidon, elements);
  return `0x${hash.toString(16).padStart(64, '0')}`;
}
