import { ChevronRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { TwinCardData } from '@/types/twin';

export function TwinRow({ twin }: { twin: TwinCardData }) {
  return (
    <Link
      href={`/twins/${twin.slug}`}
      className='bg-surface-container flex flex-col md:flex-row items-center justify-between p-4 rounded-xl border border-outline-variant/10 hover:bg-surface-container-high transition-colors'
    >
      <div className='flex items-center gap-4 w-full md:w-1/3'>
        <div className='w-12 h-12 rounded-lg overflow-hidden bg-surface-container-highest'>
          <Avatar className='w-full h-full rounded-none'>
            <AvatarFallback className='rounded-none bg-surface-container-highest font-bold'>
              {twin.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <h4 className='font-bold text-on-surface'>{twin.name}</h4>
          <span className='text-xs font-mono text-on-surface-variant'>
            by {twin.ensName ?? (twin.walletAddress ? `${twin.walletAddress.slice(0, 6)}...` : 'anon.eth')}
          </span>
        </div>
      </div>

      <div className='hidden md:block w-1/4'>
        <span className='text-xs text-on-surface-variant font-body line-clamp-1'>{twin.description}</span>
      </div>

      <div className='flex items-center gap-8 justify-between w-full md:w-auto mt-4 md:mt-0'>
        <div className='text-center'>
          <p className='text-[10px] font-label text-outline uppercase'>Rate</p>
          <p className='text-sm font-mono text-on-surface'>{twin.pricePerCall}</p>
        </div>

        {twin.verified ? (
          <div className='flex items-center gap-1 bg-secondary-container/10 px-2 py-1 rounded-full border border-secondary/20'>
            <ShieldCheck className='size-3.5 text-secondary fill-secondary' />
            <span className='text-[10px] font-label text-secondary'>Verified</span>
          </div>
        ) : (
          <div className='flex items-center gap-1 bg-surface-container-highest px-2 py-1 rounded-full border border-outline-variant/20'>
            <span className='text-[10px] font-label text-outline'>Unverified</span>
          </div>
        )}

        <ChevronRight className='size-5 text-primary' />
      </div>
    </Link>
  );
}
