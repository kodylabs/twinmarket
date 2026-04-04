import { getWizardData } from '@/lib/wizard-storage';
import { SkillsForm } from './skills-form';

export default async function SkillsPage() {
  const data = await getWizardData();
  return <SkillsForm defaultSkills={data.skills ?? []} />;
}
