import { ChevronRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { TwinCardData } from '@/lib/mock-data';

export function TwinRow({ twin }: { twin: TwinCardData }) {
  return (
    <Link
      href={`/twins/${twin.slug}`}
      className='flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50'
    >
      <Avatar className='size-10'>
        <AvatarFallback>{twin.name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className='min-w-0 flex-1'>
        <p className='font-semibold'>{twin.name}</p>
        <p className='text-xs text-muted-foreground'>by {twin.creatorAddress}</p>
      </div>

      <p className='hidden flex-1 text-sm text-muted-foreground md:block'>{twin.description}</p>

      <div className='text-right text-sm'>
        <span className='text-xs uppercase text-muted-foreground'>Rate</span>
        <p className='font-medium'>{twin.priceEth} ETH</p>
      </div>

      {twin.verified ? (
        <Badge variant='outline' className='gap-1 text-xs'>
          <ShieldCheck className='size-3' />
          Verified
        </Badge>
      ) : (
        <Badge variant='secondary' className='text-xs'>
          Unverified
        </Badge>
      )}

      <ChevronRight className='size-4 text-muted-foreground' />
    </Link>
  );
}
