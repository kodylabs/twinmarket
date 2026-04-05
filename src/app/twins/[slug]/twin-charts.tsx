'use client';

import { Bar, BarChart, XAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const MOCK_PRICE_DATA = [
  { day: 'Mon', price: 0.01 },
  { day: 'Tue', price: 0.01 },
  { day: 'Wed', price: 0.01 },
  { day: 'Thu', price: 0.01 },
  { day: 'Fri', price: 0.01 },
  { day: 'Sat', price: 0.01 },
  { day: 'Sun', price: 0.01 },
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

const priceChartConfig: ChartConfig = {
  price: { label: 'Price (USDC)', color: 'var(--primary)' },
};

const usageChartConfig: ChartConfig = {
  calls: { label: 'Calls', color: 'var(--secondary)' },
};

export function PriceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-sm'>Price History</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={priceChartConfig} className='h-[140px] w-full'>
          <BarChart data={MOCK_PRICE_DATA}>
            <XAxis dataKey='day' hide />
            <Bar dataKey='price' fill='var(--primary)' radius={4} />
            <ChartTooltip content={<ChartTooltipContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function UsageChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-sm'>Usage This Week</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={usageChartConfig} className='h-[140px] w-full'>
          <BarChart data={MOCK_USAGE_DATA}>
            <XAxis dataKey='day' hide />
            <Bar dataKey='calls' fill='var(--secondary)' radius={4} />
            <ChartTooltip content={<ChartTooltipContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
