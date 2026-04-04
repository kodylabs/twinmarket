import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { TwinCardData } from '@/types/twin';

function formatCalls(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function TwinCard({ twin }: { twin: TwinCardData }) {
  return (
    <Link href={`/twins/${twin.slug}`}>
      <Card className='transition-colors hover:bg-accent/50'>
        <CardContent className='pt-6'>
          <div className='flex items-start justify-between'>
            <Avatar className='size-10'>
              <AvatarFallback>{twin.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            {twin.verified ? (
              <Badge variant='outline' className='gap-1 text-xs'>
                <ShieldCheck className='size-3' />
                World ID
              </Badge>
            ) : (
              <Badge variant='secondary' className='text-xs'>
                Unverified
              </Badge>
            )}
          </div>

          <div className='mt-3'>
            <h3 className='font-semibold'>{twin.name}</h3>
            <p className='mt-0.5 text-xs text-muted-foreground'>{twin.ensName ?? twin.walletAddress ?? 'Unknown'}</p>
          </div>

          <p className='mt-2 line-clamp-2 text-sm text-muted-foreground'>{twin.description}</p>

          <div className='mt-4 flex items-center justify-between border-t pt-3 text-sm'>
            <div>
              <span className='text-xs uppercase text-muted-foreground'>Usage</span>
              <p className='font-medium'>{formatCalls(twin.totalCalls)} reqs</p>
            </div>
            <div className='text-right'>
              <span className='text-xs uppercase text-muted-foreground'>Price</span>
              <p className='font-medium'>{twin.pricePerCall}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
