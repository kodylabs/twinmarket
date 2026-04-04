import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { TwinCardData } from '@/lib/mock-data';

export function RankCard({ twin, rank }: { twin: TwinCardData; rank: number }) {
  const totalEth = (twin.totalCalls * twin.priceEth).toFixed(1);

  return (
    <div className='flex items-center gap-3 rounded-lg border p-4'>
      <span className='text-2xl font-bold text-muted-foreground/50'>{String(rank).padStart(2, '0')}</span>

      <Avatar className='size-9'>
        <AvatarFallback className='text-xs'>{twin.name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className='min-w-0 flex-1'>
        <p className='text-sm font-semibold'>{twin.name}</p>
        <p className='text-xs text-muted-foreground'>{twin.rating} Rating</p>
      </div>

      <div className='text-right text-xs text-muted-foreground'>
        <p>{totalEth} ETH Total</p>
        <p>v{(rank * 0.4 + 0.8).toFixed(1)}.0</p>
      </div>
    </div>
  );
}
