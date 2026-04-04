import { redirect } from 'next/navigation';
import { getWizardData } from '@/lib/wizard-storage';
import { ReviewContent } from './review-content';

export default async function ReviewPage() {
  const data = await getWizardData();

  if (!data.name || !data.bio || !data.systemPrompt) {
    redirect('/my-twin/create/identity');
  }

  return <ReviewContent name={data.name} bio={data.bio} systemPrompt={data.systemPrompt} skills={data.skills ?? []} />;
}
