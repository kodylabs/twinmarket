import type { ReactNode } from 'react';

interface InfoLineProps {
  label: string;
  value: ReactNode;
  orientation?: 'horizontal' | 'vertical';
}

export function InfoLine({ label, value, orientation = 'horizontal' }: InfoLineProps) {
  if (!value) return null;

  if (orientation === 'vertical') {
    return (
      <div className='space-y-1'>
        <p className='text-xs text-muted-foreground'>{label}</p>
        <div>{value}</div>
      </div>
    );
  }

  return (
    <div className='flex items-center justify-between gap-2'>
      <span className='text-xs text-muted-foreground'>{label}</span>
      <div>{value}</div>
    </div>
  );
}
