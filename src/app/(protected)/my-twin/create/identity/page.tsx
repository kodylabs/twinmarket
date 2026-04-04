import { getWizardData } from '@/lib/wizard-storage';
import { IdentityForm } from './identity-form';

export default async function IdentityPage() {
  const data = await getWizardData();
  return <IdentityForm defaultName={data.name ?? ''} defaultBio={data.bio ?? ''} />;
}
