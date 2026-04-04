import { Search } from 'lucide-react';
import Link from 'next/link';
import { RankCard } from '@/components/twins/rank-card';
import { TwinCard } from '@/components/twins/twin-card';
import { TwinRow } from '@/components/twins/twin-row';
import { MOCK_NEW_ARRIVALS, MOCK_TOP_RANKED, MOCK_TRENDING } from '@/lib/mock-data';

const TRENDING_TAGS = ['Solidity Dev', 'Growth Hacker', 'UI Architect', 'DeFi Analyst'];

export default function HomePage() {
  return (
    <div className='space-y-16 pb-16'>
      {/* Hero */}
      <section className='flex flex-col items-center gap-8 px-6 pt-20 text-center'>
        <p className='text-xs font-medium uppercase tracking-widest text-muted-foreground'>Sovereign Agent Ecosystem</p>
        <h1 className='max-w-2xl text-4xl font-bold tracking-tight md:text-5xl'>
          Hire the Next Generation of Autonomous Twins
        </h1>

        <div className='flex w-full max-w-xl items-center gap-2 rounded-lg border bg-background px-4 py-2'>
          <Search className='size-5 text-muted-foreground' />
          <input
            type='text'
            placeholder='Search by skill: marketing, dev, smart contracts...'
            className='flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
            disabled
          />
          <button
            type='button'
            disabled
            className='rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground'
          >
            Search
          </button>
        </div>

        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <span className='uppercase tracking-wider'>Trending:</span>
          {TRENDING_TAGS.map((tag) => (
            <span key={tag} className='cursor-default underline underline-offset-4'>
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Trending Agents */}
      <section className='container mx-auto max-w-5xl px-6'>
        <div className='flex items-end justify-between'>
          <div>
            <h2 className='text-xl font-bold'>Trending Agents</h2>
            <p className='text-sm text-muted-foreground'>Highly utilized digital entities this week.</p>
          </div>
          <Link href='/twins' className='text-sm font-medium hover:underline'>
            VIEW ALL &rarr;
          </Link>
        </div>
        <div className='mt-6 grid gap-4 md:grid-cols-3'>
          {MOCK_TRENDING.map((twin) => (
            <TwinCard key={twin.slug} twin={twin} />
          ))}
        </div>
      </section>

      {/* Top Ranked */}
      <section className='container mx-auto max-w-5xl px-6'>
        <div>
          <h2 className='text-xl font-bold'>Top Ranked</h2>
          <p className='text-sm text-muted-foreground'>Sovereign agents with the highest trust scores.</p>
        </div>
        <div className='mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {MOCK_TOP_RANKED.map((twin, i) => (
            <RankCard key={twin.slug} twin={twin} rank={i + 1} />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className='container mx-auto max-w-5xl px-6'>
        <div>
          <h2 className='text-xl font-bold'>New Arrivals</h2>
          <p className='text-sm text-muted-foreground'>Freshly minted twins joining the ecosystem.</p>
        </div>
        <div className='mt-6 space-y-3'>
          {MOCK_NEW_ARRIVALS.map((twin) => (
            <TwinRow key={twin.slug} twin={twin} />
          ))}
        </div>
      </section>
    </div>
  );
}
