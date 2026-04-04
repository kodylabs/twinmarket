'use client';

import { useQuery } from '@tanstack/react-query';
import { Lock, Pencil, Settings, ShieldCheck, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MOCK_OWNER_DASHBOARD } from '@/lib/mock-data';
import { useTRPC } from '@/trpc/providers';

export default function MyTwinPage() {
  const trpc = useTRPC();
  const { data: worldIdStatus } = useQuery(trpc.worldId.status.queryOptions());

  const { totalRevenue, usageCount, activeUsers, agent, transactions } = MOCK_OWNER_DASHBOARD;

  return (
    <div className='container mx-auto max-w-5xl space-y-8 p-6'>
      {/* Stats row */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Total Revenue</p>
            <p className='mt-1 text-3xl font-bold'>
              {totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
              <span className='text-sm font-normal text-muted-foreground'>USDC</span>
            </p>
            <p className='mt-1 flex items-center gap-1 text-xs text-green-600'>
              <TrendingUp className='size-3' />
              +14.2% from last cycle
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Usage Count</p>
            <p className='mt-1 text-3xl font-bold'>{(usageCount / 1000).toFixed(1)}k</p>
            <p className='mt-1 text-xs text-muted-foreground'>Global agent calls</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Active Users</p>
            <p className='mt-1 text-3xl font-bold'>{activeUsers.toLocaleString()}</p>
            <p className='mt-1 text-xs text-muted-foreground'>Current sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Agent info + World ID */}
      <div className='grid gap-6 md:grid-cols-[1fr_320px]'>
        <Card>
          <CardContent className='flex gap-6 pt-6'>
            <div className='flex size-24 shrink-0 items-center justify-center rounded-lg border bg-muted'>
              <span className='text-3xl font-bold text-muted-foreground'>{agent.name.slice(0, 2)}</span>
            </div>
            <div className='flex-1 space-y-3'>
              <div className='flex items-center gap-2'>
                <h2 className='text-xl font-bold'>
                  {agent.name} {agent.version}
                </h2>
                <Badge variant='outline' className='uppercase'>
                  {agent.status}
                </Badge>
              </div>
              <p className='text-sm text-muted-foreground'>{agent.description}</p>
              <div className='flex gap-2'>
                <button
                  type='button'
                  className='inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-accent'
                >
                  <Settings className='size-4' />
                  Edit Skills
                </button>
                <button
                  type='button'
                  className='inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-accent'
                >
                  <Pencil className='size-4' />
                  Update Description
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
              Security Protocol
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <h3 className='text-lg font-bold'>World ID Identity</h3>
            <p className='text-sm text-muted-foreground'>
              {worldIdStatus?.isVerified
                ? 'Your sovereign identity is verified on-chain. This provides highest trust level for institutional users.'
                : 'Verify your identity with World ID to increase trust.'}
            </p>
            {worldIdStatus?.isVerified && (
              <div className='flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-mono'>
                <span className='size-2 rounded-full bg-green-500' />
                ID_VERIFIED_SHA256
                <Lock className='ml-auto size-4 text-muted-foreground' />
              </div>
            )}
            {worldIdStatus?.isVerified && (
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <ShieldCheck className='size-3.5 text-primary' />
                {worldIdStatus.verificationLevel === 'orb' ? 'Orb Verified' : 'Device Verified'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Transaction History */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-bold'>Transaction History</h2>
            <p className='text-sm text-muted-foreground'>Real-time settlement data from smart contracts</p>
          </div>
          <button type='button' className='text-xs font-medium uppercase tracking-wider hover:underline'>
            Export CSV &darr;
          </button>
        </div>

        <div className='overflow-x-auto rounded-lg border'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b bg-muted/50'>
                <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  Transaction ID
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  Agent Version
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  Date
                </th>
                <th className='px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  Amount
                </th>
                <th className='px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className='border-b last:border-0'>
                  <td className='px-4 py-3 font-mono'>{tx.id}</td>
                  <td className='px-4 py-3'>{tx.agentVersion}</td>
                  <td className='px-4 py-3'>{tx.date}</td>
                  <td className='px-4 py-3 text-right font-medium'>
                    {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
                  </td>
                  <td className='px-4 py-3 text-right'>
                    <Badge variant={tx.status === 'settled' ? 'outline' : 'secondary'} className='uppercase'>
                      {tx.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
