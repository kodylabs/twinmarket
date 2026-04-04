import { cookies } from 'next/headers';

export interface WizardSkill {
  title: string;
  content: string;
}

export interface WizardData {
  name?: string;
  bio?: string;
  systemPrompt?: string;
  skills?: WizardSkill[];
}

const COOKIE_WIZARD = 'tw-wizard';
const COOKIE_PROMPT = 'tw-wizard-prompt';

const COOKIE_OPTIONS = {
  httpOnly: true,
  path: '/my-twin/create',
  sameSite: 'lax' as const,
};

export async function getWizardData(): Promise<WizardData> {
  const jar = await cookies();
  const wizardCookie = jar.get(COOKIE_WIZARD);
  const promptCookie = jar.get(COOKIE_PROMPT);

  let data: WizardData = {};
  if (wizardCookie?.value) {
    try {
      data = JSON.parse(wizardCookie.value);
    } catch {
      data = {};
    }
  }

  if (promptCookie) {
    data.systemPrompt = promptCookie.value;
  }

  return data;
}

export async function setWizardData(data: Partial<WizardData>): Promise<void> {
  const existing = await getWizardData();
  const merged = { ...existing, ...data };

  const { systemPrompt, ...rest } = merged;

  const jar = await cookies();
  jar.set(COOKIE_WIZARD, JSON.stringify(rest), COOKIE_OPTIONS);

  if (systemPrompt !== undefined) {
    jar.set(COOKIE_PROMPT, systemPrompt, COOKIE_OPTIONS);
  }
}

export async function clearWizardData(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_WIZARD);
  jar.delete(COOKIE_PROMPT);
}
