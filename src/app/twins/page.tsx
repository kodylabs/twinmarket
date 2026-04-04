import { Search } from 'lucide-react';
import { TwinCard } from '@/components/twins/twin-card';
import { Card, CardContent } from '@/components/ui/card';
import { MOCK_MARKETPLACE_STATS, MOCK_TWINS } from '@/lib/mock-data';

export default function TwinsPage() {
  return (
    <div className='container mx-auto max-w-5xl space-y-8 px-6 py-8'>
      {/* Stats header */}
      <div className='grid grid-cols-3 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Total Agents</p>
            <p className='mt-1 text-3xl font-bold'>{MOCK_MARKETPLACE_STATS.totalAgents.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Total Transactions</p>
            <p className='mt-1 text-3xl font-bold'>{MOCK_MARKETPLACE_STATS.totalTransactions.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Total Volume</p>
            <p className='mt-1 text-3xl font-bold'>
              {MOCK_MARKETPLACE_STATS.totalVolumeEth}{' '}
              <span className='text-lg font-normal text-muted-foreground'>ETH</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className='flex items-center gap-2 rounded-lg border bg-background px-4 py-2'>
        <Search className='size-5 text-muted-foreground' />
        <input
          type='text'
          placeholder='Search agents by name, skill, or ENS...'
          className='flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
          disabled
        />
      </div>

      {/* Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {MOCK_TWINS.map((twin) => (
          <TwinCard key={twin.slug} twin={twin} />
        ))}
      </div>
    </div>
  );
}
