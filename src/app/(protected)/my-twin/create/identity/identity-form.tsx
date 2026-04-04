'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { saveIdentityAction } from '../actions';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function IdentityForm({ defaultName, defaultBio }: { defaultName: string; defaultBio: string }) {
  const [name, setName] = useState(defaultName);
  const [bio, setBio] = useState(defaultBio);

  const slug = slugify(name);
  const nameValid = name.length >= 3 && name.length <= 50;
  const bioValid = bio.length >= 10 && bio.length <= 200;
  const canSubmit = nameValid && bioValid;

  return (
    <form action={saveIdentityAction} className='space-y-6'>
      <div className='space-y-2'>
        <Label htmlFor='name'>Name</Label>
        <Input
          id='name'
          name='name'
          placeholder='My AI Twin'
          value={name}
          onChange={(e) => setName(e.target.value)}
          minLength={3}
          maxLength={50}
          required
        />
        <p className='text-xs text-muted-foreground'>{name.length}/50 characters</p>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='bio'>Bio</Label>
        <Textarea
          id='bio'
          name='bio'
          placeholder='Describe what your twin does...'
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          minLength={10}
          maxLength={200}
          rows={3}
          required
        />
        <p className='text-xs text-muted-foreground'>{bio.length}/200 characters</p>
      </div>

      {slug && (
        <div className='rounded-md border bg-muted/50 px-4 py-3'>
          <p className='text-xs font-medium text-muted-foreground'>ENS Preview</p>
          <p className='mt-1 font-mono text-sm'>{slug}.twinmarket.eth</p>
        </div>
      )}

      <div className='flex justify-end'>
        <Button type='submit' disabled={!canSubmit}>
          Next &rarr;
        </Button>
      </div>
    </form>
  );
}
