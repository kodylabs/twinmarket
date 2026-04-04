'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { savePersonaAction } from '../actions';

export function PersonaForm({ defaultValue }: { defaultValue: string }) {
  const [systemPrompt, setSystemPrompt] = useState(defaultValue);

  const valid = systemPrompt.length >= 50 && systemPrompt.length <= 4000;

  return (
    <form action={savePersonaAction} className='space-y-6'>
      <div className='space-y-2'>
        <Label htmlFor='systemPrompt'>System Prompt</Label>
        <p className='text-sm text-muted-foreground'>Define your twin&apos;s personality, knowledge, and behavior.</p>
        <Textarea
          id='systemPrompt'
          name='systemPrompt'
          placeholder='You are a helpful AI assistant specializing in...'
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          minLength={50}
          maxLength={4000}
          rows={10}
          required
        />
        <p className={`text-xs ${valid ? 'text-muted-foreground' : 'text-destructive'}`}>
          {systemPrompt.length}/4000 characters (min 50)
        </p>
      </div>

      <div className='flex justify-between'>
        <Button variant='outline' asChild>
          <Link href='/my-twin/create/identity'>&larr; Back</Link>
        </Button>
        <Button type='submit' disabled={!valid}>
          Next &rarr;
        </Button>
      </div>
    </form>
  );
}
