'use client';

import { useMutation } from '@tanstack/react-query';
import { Check, Globe, Loader2, QrCode, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { type BridgeResult, useAgentBookBridge } from '@/hooks/use-agentbook-bridge';
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

type Phase = 'review' | 'preparing' | 'scanning' | 'creating' | 'done';

export function ReviewContent({ name, bio, systemPrompt, skills }: ReviewContentProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const slug = slugify(name);
  const [phase, setPhase] = useState<Phase>('review');
  const [walletData, setWalletData] = useState<{ walletAddress: string; privateKey: string; nonce: string } | null>(
    null,
  );

  const bridge = useAgentBookBridge();

  const prepareCreate = useMutation(
    trpc.agents.prepareCreate.mutationOptions({
      onSuccess: (data) => {
        setWalletData(data);
        bridge.start(data.walletAddress, data.nonce);
        setPhase('scanning');
      },
    }),
  );

  const createAgent = useMutation(
    trpc.agents.create.mutationOptions({
      onSuccess: async () => {
        setPhase('done');
        await clearWizardAction();
        router.push('/my-twin');
      },
    }),
  );

  const submitAll = useCallback(
    (proof: BridgeResult) => {
      if (!walletData) return;
      setPhase('creating');
      createAgent.mutate({
        name,
        bio,
        systemPrompt,
        skills,
        walletAddress: walletData.walletAddress,
        privateKey: walletData.privateKey,
        agentBookProof: {
          merkleRoot: proof.merkleRoot,
          nullifierHash: proof.nullifierHash,
          proof: proof.proof,
          nonce: walletData.nonce,
        },
      });
    },
    [walletData, name, bio, systemPrompt, skills, createAgent],
  );

  useEffect(() => {
    if (bridge.status !== 'verified' || !bridge.result || !walletData) return;
    submitAll(bridge.result);
  }, [bridge.status, bridge.result, walletData, submitAll]);

  function handleMint() {
    setPhase('preparing');
    prepareCreate.mutate();
  }

  const error = prepareCreate.error?.message || createAgent.error?.message || bridge.error;

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

      {/* Info card — always visible before scanning */}
      {(phase === 'review' || phase === 'preparing') && (
        <Card className='border-muted'>
          <CardContent className='flex items-start gap-3 pt-6'>
            <Shield className='mt-0.5 size-5 shrink-0 text-primary' />
            <div className='space-y-1'>
              <p className='text-sm font-medium'>World Agent Verification</p>
              <p className='text-xs text-muted-foreground'>
                Clicking "Mint" will prompt a World App scan to register your agent on-chain. This proves your twin is
                operated by a verified human — making it discoverable and trusted across the ecosystem.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR code scanning phase */}
      {phase === 'scanning' && bridge.connectorURI && (
        <Card className='border-primary/20 bg-primary/5'>
          <CardContent className='flex flex-col items-center gap-4 pt-6'>
            <div className='flex items-center gap-2'>
              <Globe className='size-5 text-primary' />
              <p className='text-sm font-medium'>Scan with World App to create your agent</p>
            </div>
            <div className='rounded-lg bg-white p-4'>
              <QRCodeSVG value={bridge.connectorURI} size={200} />
            </div>
            <p className='text-center text-xs text-muted-foreground'>
              This registers your agent on WorldChain and creates your ENS identity in a single step.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Creating — all on-chain ops happening */}
      {phase === 'creating' && (
        <Card className='border-primary/20 bg-primary/5'>
          <CardContent className='flex items-center gap-3 pt-6'>
            <Loader2 className='size-5 animate-spin text-primary' />
            <div>
              <p className='text-sm font-medium'>Creating your agent...</p>
              <p className='text-xs text-muted-foreground'>
                Registering ENS name + WorldChain AgentBook + saving to database
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Done */}
      {phase === 'done' && (
        <Card className='border-green-500/20 bg-green-500/5'>
          <CardContent className='flex items-center gap-3 pt-6'>
            <Check className='size-5 text-green-500' />
            <p className='text-sm font-medium'>Agent created and verified on WorldChain!</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <p className='rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive'>
          {error}
        </p>
      )}

      <div className='flex justify-between'>
        <Button variant='outline' asChild disabled={phase !== 'review'}>
          <Link href='/my-twin/create/skills'>&larr; Back</Link>
        </Button>

        {phase === 'review' && (
          <Button onClick={handleMint}>
            <QrCode className='size-4' />
            Mint My Twin
          </Button>
        )}
        {phase === 'preparing' && (
          <Button disabled>
            <Loader2 className='size-4 animate-spin' />
            Preparing...
          </Button>
        )}
      </div>
    </div>
  );
}
