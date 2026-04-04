import { StepIndicator } from './step-indicator';

export default function CreateWizardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='container mx-auto max-w-2xl px-4 py-10'>
      <h1 className='text-center text-2xl font-bold'>Create Your Twin</h1>
      <div className='mt-8'>
        <StepIndicator />
      </div>
      <div className='mt-10'>{children}</div>
    </div>
  );
}
