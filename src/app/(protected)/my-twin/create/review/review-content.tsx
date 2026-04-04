'use client';

import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { WizardSkill } from '@/lib/wizard-storage';
import { useTRPC } from '@/trpc/providers';
import { clearWizardAction } from '../actions';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface ReviewContentProps {
  name: string;
  bio: string;
  systemPrompt: string;
  skills: WizardSkill[];
}

export function ReviewContent({ name, bio, systemPrompt, skills }: ReviewContentProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const slug = slugify(name);

  const createAgent = useMutation(
    trpc.agents.create.mutationOptions({
      onSuccess: async () => {
        await clearWizardAction();
        router.push('/my-twin');
      },
    }),
  );

  function handleMint() {
    createAgent.mutate({ name, bio, systemPrompt, skills });
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-lg font-medium'>{name}</h2>
        <p className='font-mono text-sm text-muted-foreground'>{slug}.twinmarket.eth</p>
      </div>

      <p className='text-sm'>{bio}</p>

      <Separator />

      <div className='space-y-2'>
        <h3 className='text-sm font-medium'>System Prompt</h3>
        <pre className='max-h-48 overflow-auto whitespace-pre-wrap rounded-md border bg-muted/50 p-4 font-mono text-xs'>
          {systemPrompt}
        </pre>
      </div>

      {skills.length > 0 && (
        <>
          <Separator />
          <div className='space-y-3'>
            <h3 className='text-sm font-medium'>Skills</h3>
            <div className='space-y-2'>
              {skills.map((skill, i) => (
                <div key={i} className='flex items-start gap-3 rounded-md border p-3'>
                  <Badge variant='secondary' className='mt-0.5'>
                    {i + 1}
                  </Badge>
                  <div>
                    <p className='text-sm font-medium'>{skill.title}</p>
                    <p className='text-xs text-muted-foreground'>{skill.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator />

      {createAgent.error && (
        <p className='rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive'>
          {createAgent.error.message}
        </p>
      )}

      <div className='flex justify-between'>
        <Button variant='outline' asChild>
          <Link href='/my-twin/create/skills'>&larr; Back</Link>
        </Button>
        <Button onClick={handleMint} disabled={createAgent.isPending}>
          {createAgent.isPending && <Loader2 className='size-4 animate-spin' />}
          {createAgent.isPending ? 'Minting...' : 'Mint My Twin'}
        </Button>
      </div>
    </div>
  );
}
