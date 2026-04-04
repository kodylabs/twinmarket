import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { TwinCardData } from '@/types/twin';

function formatCalls(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function TwinCard({ twin }: { twin: TwinCardData }) {
  return (
    <Link href={`/twins/${twin.slug}`}>
      <div className='snap-start glass-card p-6 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all group flex flex-col h-full'>
        <div className='flex justify-between items-start mb-4'>
          <div className='w-14 h-14 rounded-xl overflow-hidden bg-surface-container-highest'>
            <Avatar className='w-full h-full rounded-none'>
              <AvatarFallback className='rounded-none bg-surface-container-highest font-bold'>
                {twin.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className='flex flex-col items-end'>
            {twin.verified ? (
              <div className='flex items-center gap-1 bg-secondary-container/20 px-2 py-0.5 rounded-full border border-secondary/20'>
                <ShieldCheck className='size-3 text-secondary fill-secondary' />
                <span className='text-[10px] font-label text-on-secondary-container'>WORLD ID</span>
              </div>
            ) : (
              <div className='flex items-center gap-1 bg-surface-container-highest px-2 py-0.5 rounded-full border border-outline-variant/20'>
                <span className='text-[10px] font-label text-outline uppercase tracking-wider'>UNVERIFIED</span>
              </div>
            )}
            <span className='text-xs font-mono text-primary mt-2'>4.9 ★</span>
          </div>
        </div>

        <h3 className='text-xl font-bold text-on-surface font-headline mb-1'>{twin.name}</h3>

        <div className='flex items-center gap-2 mb-4'>
          <div className='w-5 h-5 rounded-full bg-linear-to-br from-primary/60 to-primary' />
          <span className='text-xs font-mono text-on-surface-variant'>
            {twin.ensName ||
              (twin.walletAddress ? `${twin.walletAddress.slice(0, 6)}...${twin.walletAddress.slice(-4)}` : 'anon.eth')}
          </span>
        </div>

        <p className='text-sm text-on-surface-variant line-clamp-2 mb-6 flex-grow'>{twin.description}</p>

        <div className='flex justify-between items-center border-t border-outline-variant/10 pt-4'>
          <div>
            <p className='text-[10px] font-label text-outline uppercase tracking-wider'>Usage</p>
            <p className='font-mono text-sm text-on-surface'>{formatCalls(twin.totalCalls)} reqs</p>
          </div>
          <div className='text-right'>
            <p className='text-[10px] font-label text-outline uppercase tracking-wider'>Price</p>
            <p className='font-mono text-sm text-primary'>{twin.pricePerCall}</p>
          </div>
        </div>

        <button
          type='button'
          className='w-full mt-6 py-2.5 rounded-xl border border-outline-variant/20 text-on-surface font-medium text-sm hover:bg-surface-container-highest transition-colors group-hover:border-primary/50'
        >
          View Agent
        </button>
      </div>
    </Link>
  );
}
