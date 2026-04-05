import { cn } from '@/lib/utils';

interface InfoLineProps {
  label: string;
  value: React.ReactNode;
  className?: string;
  editMode?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export function InfoLine({ label, value, className, orientation = 'horizontal' }: InfoLineProps) {
  const cns = cn(
    className,
    'flex gap-2 max-lg:flex-col',
    'lg:justify-between lg:hover:bg-muted lg:rounded-md lg:p-2 lg:transition-colors lg:duration-200',
    orientation === 'horizontal' && 'flex-row lg:items-center',
    orientation === 'vertical' && 'flex-col lg:items-start',
  );

  return (
    <div className={cns}>
      <dt className='text-sm font-medium text-muted-foreground truncate'>{label}</dt>
      <dd className='text-sm text-left'>{value}</dd>
    </div>
  );
}
