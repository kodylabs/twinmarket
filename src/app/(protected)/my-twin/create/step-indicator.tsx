'use client';

import { usePathname } from 'next/navigation';

const STEPS = [
  { label: 'Identity', path: '/my-twin/create/identity' },
  { label: 'Persona', path: '/my-twin/create/persona' },
  { label: 'Skills', path: '/my-twin/create/skills' },
  { label: 'Review', path: '/my-twin/create/review' },
] as const;

export function StepIndicator() {
  const pathname = usePathname();
  const currentStep = STEPS.findIndex((s) => pathname.startsWith(s.path));

  return (
    <div className='flex items-center justify-between'>
      {STEPS.map((step, i) => (
        <div key={step.label} className='flex flex-1 items-center'>
          <div className='flex flex-col items-center gap-1.5'>
            <div
              className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${
                i < currentStep
                  ? 'bg-primary text-primary-foreground'
                  : i === currentStep
                    ? 'border-2 border-primary bg-primary/10 text-primary'
                    : 'border border-muted-foreground/30 text-muted-foreground'
              }`}
            >
              {i < currentStep ? '✓' : i + 1}
            </div>
            <span className={`text-xs ${i <= currentStep ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`mx-2 h-px flex-1 ${i < currentStep ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
