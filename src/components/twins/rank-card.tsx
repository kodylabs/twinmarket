import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { TwinCardData } from '@/types/twin';

function _formatCalls(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function RankCard({ twin, rank }: { twin: TwinCardData; rank: number }) {
  return (
    <div className='bg-surface-container-low p-5 rounded-xl border border-outline-variant/10 hover:translate-y-[-4px] transition-transform'>
      <div className='flex items-center gap-4 mb-4'>
        <div className='text-2xl font-black text-outline/20 font-headline italic'>{String(rank).padStart(2, '0')}</div>
        <div className='size-12 rounded-lg overflow-hidden bg-surface-container-highest'>
          <Avatar className='w-full h-full rounded-none'>
            <AvatarFallback className='rounded-none bg-surface-container-highest text-xs font-bold'>
              {twin.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <h4 className='font-bold text-on-surface text-sm font-headline'>{twin.name}</h4>
          <p className='text-[10px] font-mono text-primary'>4.99 Rating</p>
        </div>
      </div>
      <div className='flex justify-between text-xs font-mono pt-4 border-t border-outline-variant/5'>
        <span className='text-on-surface-variant'>{twin.pricePerCall} / req</span>
        <span className='text-on-surface-variant'>v2.4.0</span>
      </div>
    </div>
  );
}
