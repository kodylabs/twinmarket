'use client';

import { Line, LineChart, XAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const MOCK_PRICE_DATA = [
  { day: 'Mon', price: 0.01 },
  { day: 'Tue', price: 0.01 },
  { day: 'Wed', price: 0.012 },
  { day: 'Thu', price: 0.011 },
  { day: 'Fri', price: 0.015 },
  { day: 'Sat', price: 0.013 },
  { day: 'Sun', price: 0.014 },
];

const MOCK_USAGE_DATA = [
  { day: 'Mon', calls: 12 },
  { day: 'Tue', calls: 28 },
  { day: 'Wed', calls: 45 },
  { day: 'Thu', calls: 32 },
  { day: 'Fri', calls: 67 },
  { day: 'Sat', calls: 24 },
  { day: 'Sun', calls: 18 },
];

const priceConfig: ChartConfig = {
  price: { label: 'Price (USDC)', color: 'var(--chart-2)' },
};

const usageConfig: ChartConfig = {
  calls: { label: 'Calls', color: 'var(--chart-1)' },
};

export function PriceChart() {
  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Price (7d)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={priceConfig} className='h-[120px] w-full'>
          <LineChart data={MOCK_PRICE_DATA}>
            <XAxis dataKey='day' tick={{ fontSize: 10 }} />
            <Line type='monotone' dataKey='price' stroke='var(--chart-2)' strokeWidth={2} dot={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function UsageChart() {
  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>Usage (7d)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={usageConfig} className='h-[120px] w-full'>
          <LineChart data={MOCK_USAGE_DATA}>
            <XAxis dataKey='day' tick={{ fontSize: 10 }} />
            <Line type='monotone' dataKey='calls' stroke='var(--chart-1)' strokeWidth={2} dot={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
