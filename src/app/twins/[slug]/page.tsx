import { Activity, Copy, Lock, Shield, ShieldCheck, Star, Zap } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MOCK_TWIN_DETAIL, MOCK_TWINS } from '@/lib/mock-data';

function formatCalls(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default async function TwinDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const twin = MOCK_TWINS.find((t) => t.slug === slug);

  if (!twin) notFound();

  const { pricing, latency, trustScore, activity, reviews } = MOCK_TWIN_DETAIL;

  return (
    <div className='container mx-auto max-w-5xl space-y-8 p-6'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            {twin.verified && <ShieldCheck className='size-6 text-primary' />}
            <h1 className='text-3xl font-bold'>{twin.name}</h1>
          </div>
          <p className='text-sm text-muted-foreground'>Created by {twin.creatorAddress}</p>
        </div>
        <div className='text-right text-sm'>
          <div className='flex items-center gap-1'>
            <Star className='size-4 fill-current text-yellow-500' />
            <span className='font-semibold'>{twin.rating}</span>
          </div>
          <p className='text-muted-foreground'>{formatCalls(twin.totalCalls)} runs</p>
        </div>
      </div>

      {/* Stats + Sidebar */}
      <div className='grid gap-6 lg:grid-cols-[1fr_320px]'>
        <div className='space-y-8'>
          {/* Stats row */}
          <div className='grid grid-cols-3 gap-4'>
            <Card>
              <CardContent className='pt-6'>
                <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Usage Price</p>
                <p className='mt-1 text-2xl font-bold'>
                  {twin.priceEth} <span className='text-sm font-normal text-muted-foreground'>ETH</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Latency</p>
                <p className='mt-1 text-2xl font-bold'>{latency}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Trust Score</p>
                <p className='mt-1 text-2xl font-bold'>{trustScore}</p>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <div className='space-y-3'>
            <h2 className='text-lg font-semibold'>Description</h2>
            <p className='leading-relaxed text-muted-foreground'>{twin.description}</p>
            <div className='flex flex-wrap gap-2'>
              {twin.tags.map((tag) => (
                <Badge key={tag} variant='outline'>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* How to Use */}
          <div className='space-y-3'>
            <h2 className='text-lg font-semibold'>How to Use</h2>
            <p className='text-sm text-muted-foreground'>
              Copy and run in your CLI to trigger the agent directly from your terminal.
            </p>
            <div className='relative rounded-lg border bg-muted/50 p-4'>
              <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Terminal Command</p>
              <code className='mt-2 block font-mono text-sm'>/{twin.slug} help me with my project</code>
              <button
                type='button'
                className='absolute right-3 top-3 rounded p-1 text-muted-foreground hover:text-foreground'
              >
                <Copy className='size-4' />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Pricing Breakdown</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Base agent cost</span>
                <span>${pricing.baseAgentCost.toFixed(2)}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>AI token cost (est.)</span>
                <span>${pricing.aiTokenCost.toFixed(2)}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>On-chain protocol fee</span>
                <span>${pricing.protocolFee.toFixed(2)}</span>
              </div>
              <Separator />
              <div className='flex justify-between font-semibold'>
                <span>Total per execution</span>
                <span className='text-lg'>${pricing.total.toFixed(2)}</span>
              </div>

              <button
                type='button'
                className='mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90'
              >
                <Zap className='size-4' />
                Use Agent
              </button>

              <div className='flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground'>
                <span className='flex items-center gap-1'>
                  <Shield className='size-3' /> Audited
                </span>
                <span className='flex items-center gap-1'>
                  <Lock className='size-3' /> Encrypted
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-sm'>
                <Activity className='size-4' />
                Live Activity
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {activity.map((item, i) => (
                <div key={i} className='flex items-start gap-2 text-sm'>
                  <span className='mt-1.5 size-2 shrink-0 rounded-full bg-green-500' />
                  <span className='text-muted-foreground'>
                    {item.text}
                    {'by' in item && <span className='font-mono'> by {item.by}</span>}
                    {'time' in item && <span> {item.time}</span>}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Reviews */}
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold'>Recent Feedback</h2>
        <div className='grid gap-4 md:grid-cols-2'>
          {reviews.map((review) => (
            <Card key={review.name}>
              <CardContent className='pt-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Avatar className='size-8'>
                      <AvatarFallback className='text-xs'>{review.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='text-sm font-medium'>{review.name}</p>
                      <p className='text-xs text-muted-foreground'>Verified User</p>
                    </div>
                  </div>
                  <div className='flex gap-0.5'>
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className='size-3 fill-current text-yellow-500' />
                    ))}
                  </div>
                </div>
                <p className='mt-3 text-sm leading-relaxed text-muted-foreground'>&ldquo;{review.text}&rdquo;</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
