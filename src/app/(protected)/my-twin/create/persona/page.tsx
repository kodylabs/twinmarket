import { getWizardData } from '@/lib/wizard-storage';
import { PersonaForm } from './persona-form';

export default async function PersonaPage() {
  const data = await getWizardData();
  return <PersonaForm defaultValue={data.systemPrompt ?? ''} />;
}
