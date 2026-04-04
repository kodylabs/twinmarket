'use server';

import { redirect } from 'next/navigation';
import { clearWizardData, setWizardData } from '@/lib/wizard-storage';

export async function saveIdentityAction(formData: FormData) {
  await setWizardData({
    name: formData.get('name') as string,
    bio: formData.get('bio') as string,
  });
  redirect('/my-twin/create/persona');
}

export async function savePersonaAction(formData: FormData) {
  await setWizardData({
    systemPrompt: formData.get('systemPrompt') as string,
  });
  redirect('/my-twin/create/skills');
}

export async function saveSkillsAction(skillsJson: string) {
  const skills = JSON.parse(skillsJson);
  await setWizardData({ skills });
  redirect('/my-twin/create/review');
}

export async function clearWizardAction() {
  await clearWizardData();
}
