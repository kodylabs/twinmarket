'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Check, Globe, Loader2, QrCode } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAgentBookBridge } from '@/hooks/use-agentbook-bridge';
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

type Phase = 'review' | 'minting' | 'agentbook' | 'scanning' | 'submitting' | 'done';

export function ReviewContent({ name, bio, systemPrompt, skills }: ReviewContentProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const slug = slugify(name);
  const [phase, setPhase] = useState<Phase>('review');
  const [mintError, setMintError] = useState<string | null>(null);

  const bridge = useAgentBookBridge();

  const { data: nonceData } = useQuery({
    ...trpc.agents.agentBookNonce.queryOptions(),
    enabled: phase === 'agentbook' || phase === 'scanning',
  });

  const createAgent = useMutation(
    trpc.agents.create.mutationOptions({
      onSuccess: () => setPhase('agentbook'),
      onError: (err) => {
        setMintError(err.message);
        setPhase('review');
      },
    }),
  );

  const submitProof = useMutation(
    trpc.agents.submitAgentBookProof.mutationOptions({
      onSuccess: async () => {
        setPhase('done');
        await clearWizardAction();
        router.push('/my-twin');
      },
    }),
  );

  // When bridge verification completes, submit proof to relay
  useEffect(() => {
    if (bridge.status === 'verified' && bridge.result && nonceData) {
      setPhase('submitting');
      submitProof.mutate({
        merkleRoot: bridge.result.merkleRoot,
        nullifierHash: bridge.result.nullifierHash,
        proof: bridge.result.proof,
        nonce: nonceData.nonce,
      });
    }
  }, [bridge.status, bridge.result, nonceData, submitProof.mutate]);

  function handleMint() {
    setMintError(null);
    setPhase('minting');
    createAgent.mutate({ name, bio, systemPrompt, skills });
  }

  function handleShowQR() {
    if (!nonceData) return;
    bridge.start(nonceData.walletAddress, nonceData.nonce);
    setPhase('scanning');
  }

  async function handleSkip() {
    await clearWizardAction();
    router.push('/my-twin');
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

      {/* AgentBook registration — show after creation */}
      {phase === 'agentbook' && (
        <Card className='border-primary/20 bg-primary/5'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Check className='size-5 text-green-500' />
              Twin created with ENS name
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-2'>
              <Globe className='size-4 text-primary' />
              <p className='text-sm font-medium'>Register on WorldChain AgentBook</p>
            </div>
            <p className='text-xs text-muted-foreground'>
              Scan with World App to prove your agent is human-backed. This registers it on-chain for discoverability.
            </p>
            <div className='flex gap-2'>
              <Button onClick={handleShowQR} disabled={!nonceData || bridge.status === 'connecting'}>
                {bridge.status === 'connecting' && <Loader2 className='size-4 animate-spin' />}
                <QrCode className='size-4' />
                Show QR Code
              </Button>
              <Button variant='ghost' onClick={handleSkip}>
                Skip for now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR code + waiting */}
      {phase === 'scanning' && bridge.connectorURI && (
        <Card className='border-primary/20 bg-primary/5'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Globe className='size-4 text-primary' />
              Scan with World App
            </CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col items-center gap-4'>
            <div className='rounded-lg bg-white p-4'>
              <QRCodeSVG value={bridge.connectorURI} size={200} />
            </div>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Loader2 className='size-4 animate-spin' />
              Waiting for verification...
            </div>
            <Button variant='ghost' size='sm' onClick={handleSkip}>
              Skip for now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Submitting to relay */}
      {phase === 'submitting' && (
        <div className='flex items-center gap-2 rounded-md border p-4'>
          <Loader2 className='size-4 animate-spin' />
          <p className='text-sm'>Registering on WorldChain...</p>
        </div>
      )}

      {/* Done */}
      {phase === 'done' && (
        <div className='flex items-center gap-2 rounded-md border border-green-500/20 bg-green-500/5 p-4'>
          <Check className='size-5 text-green-500' />
          <p className='text-sm font-medium'>Agent registered on WorldChain!</p>
        </div>
      )}

      {/* Errors */}
      {mintError && (
        <p className='rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive'>
          {mintError}
        </p>
      )}
      {bridge.error && (
        <p className='rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive'>
          AgentBook: {bridge.error}
        </p>
      )}
      {submitProof.error && (
        <p className='rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive'>
          Relay: {submitProof.error.message}
        </p>
      )}

      <div className='flex justify-between'>
        <Button variant='outline' asChild disabled={phase !== 'review'}>
          <Link href='/my-twin/create/skills'>&larr; Back</Link>
        </Button>

        {phase === 'review' && <Button onClick={handleMint}>Mint My Twin</Button>}
        {phase === 'minting' && (
          <Button disabled>
            <Loader2 className='size-4 animate-spin' />
            Creating...
          </Button>
        )}
      </div>
    </div>
  );
}
