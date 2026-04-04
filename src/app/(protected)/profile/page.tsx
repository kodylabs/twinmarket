'use client';

import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { authClient } from '@/lib/auth/auth-client';
import { useTRPC } from '@/trpc/providers';

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function ProfilePage() {
  const { address } = useAccount();
  const { data: session } = authClient.useSession();
  const trpc = useTRPC();
  const { data: worldIdStatus } = useQuery(trpc.worldId.status.queryOptions());

  const displayName = session?.user?.name || (address ? truncateAddress(address) : '');

  return (
    <div className='container mx-auto max-w-2xl space-y-8 p-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Profile</h1>
        {worldIdStatus?.isVerified && (
          <Badge variant='outline'>
            {worldIdStatus.verificationLevel === 'orb' ? 'Orb Verified' : 'Device Verified'}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='wallet'>Wallet Address</Label>
            <Input id='wallet' value={address ?? ''} disabled className='font-mono' />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='name'>Display Name</Label>
            <Input id='name' defaultValue={displayName} placeholder='Enter your name' />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' defaultValue={session?.user?.email ?? ''} placeholder='your@email.com' />
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className='space-y-4'>
        <h2 className='text-xl font-semibold'>Usage History</h2>
        <Card>
          <CardContent className='py-12 text-center'>
            <p className='text-muted-foreground'>No usage history yet.</p>
            <p className='mt-1 text-sm text-muted-foreground'>Your agent usage and API calls will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
