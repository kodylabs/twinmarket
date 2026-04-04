import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { TwinCardData } from '@/types/twin';

function formatCalls(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function TwinCard({ twin }: { twin: TwinCardData }) {
  return (
    <Link href={`/twins/${twin.slug}`}>
      <Card className='transition-colors hover:bg-accent/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Avatar className='size-10'>
              <AvatarFallback>{twin.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            {twin.name}
          </CardTitle>
          <CardDescription className='flex items-center justify-between gap-2'>
            <span>
              {twin.ensName
                ? twin.ensName
                : twin.walletAddress
                  ? `${twin.walletAddress.slice(0, 8)}...${twin.walletAddress.slice(-8)}`
                  : 'Unknown'}
            </span>

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
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className='line-clamp-2 text-sm text-muted-foreground'>{twin.description}</p>
        </CardContent>

        <CardFooter className='flex items-center justify-between border-t text-sm'>
          <div>
            <span className='text-xs uppercase text-muted-foreground'>Usage</span>
            <p className='font-medium'>{formatCalls(twin.totalCalls)} reqs</p>
          </div>
          <div className='text-right'>
            <span className='text-xs uppercase text-muted-foreground'>Price</span>
            <p className='font-medium'>{twin.pricePerCall}</p>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
