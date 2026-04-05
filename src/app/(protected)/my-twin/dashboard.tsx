'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  ArrowDownToLine,
  Bot,
  Check,
  Copy,
  ExternalLink,
  KeyRound,
  Loader2,
  Lock,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { InfoLine } from '@/components/info-line';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ZkCommitmentBadge } from '@/components/zk-commitment-badge';
import { useTRPC } from '@/trpc/providers';

const MOCK_RECENT_USAGE = [
  {
    id: '1',
    input: 'Audit my Solidity contract for reentrancy',
    output: 'Found 2 potential vulnerabilities in withdraw()...',
    score: 4.8,
    date: '2 min ago',
  },
  {
    id: '2',
    input: 'Optimize gas usage in my ERC-721 mint',
    output: 'Reduced gas by 34% using batch minting pattern...',
    score: 4.9,
    date: '15 min ago',
  },
  {
    id: '3',
    input: 'Review my DeFi yield strategy',
    output: 'Identified 3 risk factors in your LP positions...',
    score: 4.5,
    date: '1h ago',
  },
  {
    id: '4',
    input: 'Write tests for my staking contract',
    output: 'Generated 12 test cases covering edge cases...',
    score: 5.0,
    date: '3h ago',
  },
];

export function MyTwinDashboard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: agent } = useQuery(trpc.agents.mine.queryOptions());
  const { data: worldIdStatus } = useQuery(trpc.worldId.status.queryOptions());

  const { data: treasury, isLoading: treasuryLoading } = useQuery({
    ...trpc.agents.treasury.queryOptions(),
    refetchInterval: 30_000,
  });

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const withdrawMutation = useMutation(
    trpc.agents.withdraw.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: trpc.agents.treasury.queryOptions().queryKey });
        setWithdrawAmount('');
        toast.success(`Withdrew ${data.formattedAmount} USDC`, {
          description: `TX: ${data.mintTxHash.slice(0, 10)}...${data.mintTxHash.slice(-6)}`,
        });
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  const [editingPrompt, setEditingPrompt] = useState(false);
  const [promptDraft, setPromptDraft] = useState('');
  const [editingSkills, setEditingSkills] = useState(false);
  const [skillsDraft, setSkillsDraft] = useState<{ title: string; content: string }[]>([]);

  const updateMutation = useMutation(
    trpc.agents.update.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: trpc.agents.mine.queryOptions().queryKey });
        setEditingPrompt(false);
        setEditingSkills(false);
        toast.success('Agent updated — ZK commitment synced on-chain', {
          description: data.txHash ? `TX: ${data.txHash.slice(0, 10)}...${data.txHash.slice(-6)}` : undefined,
          action: data.txHash
            ? {
                label: 'View TX',
                onClick: () => window.open(`https://sepolia.etherscan.io/tx/${data.txHash}`, '_blank'),
              }
            : undefined,
        });
      },
      onError: (error) => {
        try {
          const issues = JSON.parse(error.message) as { path: string[]; message: string }[];
          const messages = issues.map((i) => `${i.path.join('.')}: ${i.message}`);
          toast.error(messages.join('\n'));
        } catch {
          toast.error(error.message);
        }
      },
    }),
  );

  if (!agent) return null;

  return (
    <div className='container mx-auto max-w-6xl space-y-6 p-6'>
      <div className='grid gap-6 lg:grid-cols-3'>
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Bot className='size-4' />
              {agent.name}
              <Badge variant='outline' className='uppercase'>
                {agent.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className='flex gap-6'>
            <div className='flex size-24 shrink-0 items-center justify-center rounded-lg border bg-muted'>
              <span className='text-3xl font-bold text-muted-foreground'>{agent.name.slice(0, 2)}</span>
            </div>
            <div className='space-y-2 w-full'>
              <p className='text-sm text-muted-foreground'>{agent.description}</p>

              <InfoLine
                label='ENS'
                value={
                  agent.ensName ? (
                    <a
                      href={`https://sepolia.app.ens.domains/${agent.ensName}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-1 font-mono text-xs'
                    >
                      {agent.ensName}
                      <ExternalLink className='size-3' />
                    </a>
                  ) : null
                }
              />
              <InfoLine
                label='Wallet'
                value={
                  agent.walletAddress ? (
                    <a
                      href={`https://worldscan.org/address/${agent.walletAddress}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-1 font-mono text-xs'
                    >
                      {agent.walletAddress.slice(0, 6)}...{agent.walletAddress.slice(-4)}
                      <ExternalLink className='size-3' />
                    </a>
                  ) : null
                }
              />
              <InfoLine
                label='AgentBook'
                value={
                  agent.agentBook.isRegistered ? (
                    <a
                      href={`https://worldscan.org/address/${agent.walletAddress}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-1 font-mono text-xs'
                    >
                      Registered
                      <ExternalLink className='size-3' />
                    </a>
                  ) : null
                }
              />
              {agent.ensRecords?.promptCommitment && agent.ensName && (
                <InfoLine
                  label='ZK Prompt'
                  value={<ZkCommitmentBadge commitment={agent.ensRecords.promptCommitment} ensName={agent.ensName} />}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <ShieldCheck className='size-4' />
              World ID
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <p className='text-sm text-muted-foreground'>
              {worldIdStatus?.isVerified
                ? 'Your sovereign identity is verified on-chain. Highest trust level for institutional users.'
                : 'Verify your identity with World ID to increase trust.'}
            </p>
            {worldIdStatus?.isVerified && (
              <div className='flex items-center gap-2 rounded-md border px-3 py-2 font-mono text-sm'>
                <span className='size-2 rounded-full bg-green-500' />
                ID_VERIFIED_SHA256
                <Lock className='ml-auto size-4 text-muted-foreground' />
              </div>
            )}
            {worldIdStatus?.isVerified && (
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <ShieldCheck className='size-3.5 text-primary' />
                {worldIdStatus.verificationLevel === 'orb' ? 'Orb Verified' : 'Device Verified'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className='lg:col-span-3'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Wallet className='size-4' />
              Treasury
            </CardTitle>
            <CardAction>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: trpc.agents.treasury.queryOptions().queryKey });
                }}
              >
                Refresh
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className='grid gap-6 md:grid-cols-3'>
              <div className='space-y-4'>
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground'>Gateway Available</p>
                  <p className='text-2xl font-bold'>
                    {treasuryLoading ? '...' : (treasury?.gateway.available ?? '0')} USDC
                  </p>
                </div>
                <Separator />
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground'>Gateway Total</p>
                  <p className='text-lg font-semibold'>
                    {treasuryLoading ? '...' : (treasury?.gateway.total ?? '0')} USDC
                  </p>
                </div>
                <Separator />
                <div className='space-y-1'>
                  <p className='text-xs text-muted-foreground'>Wallet Balance</p>
                  <p className='text-lg font-semibold'>{treasuryLoading ? '...' : (treasury?.wallet ?? '0')} USDC</p>
                </div>
              </div>

              <div className='space-y-4'>
                <p className='text-sm font-medium'>Withdraw to Wallet</p>
                <p className='text-xs text-muted-foreground'>
                  Transfer USDC from your Gateway balance to your agent&apos;s on-chain wallet.
                </p>
                <div className='flex gap-2'>
                  <Input
                    type='text'
                    inputMode='decimal'
                    placeholder='Amount (USDC)'
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    disabled={withdrawMutation.isPending}
                  />
                  <Button
                    onClick={() => withdrawMutation.mutate({ amount: withdrawAmount })}
                    disabled={!withdrawAmount || withdrawMutation.isPending}
                  >
                    {withdrawMutation.isPending ? (
                      <Loader2 className='size-4 animate-spin' />
                    ) : (
                      <ArrowDownToLine className='size-4' />
                    )}
                    Withdraw
                  </Button>
                </div>
              </div>

              <div className='space-y-4'>
                <p className='text-sm font-medium'>Export Private Key</p>
                <p className='text-xs text-muted-foreground'>
                  Reveal your agent&apos;s private key to import it into an external wallet.
                </p>
                {revealedKey ? (
                  <div className='space-y-2'>
                    <code className='block break-all rounded-md border bg-muted/50 p-3 text-xs'>{revealedKey}</code>
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          navigator.clipboard.writeText(revealedKey);
                          toast.success('Private key copied to clipboard');
                        }}
                      >
                        <Copy className='size-3' />
                        Copy
                      </Button>
                      <Button variant='outline' size='sm' onClick={() => setRevealedKey(null)}>
                        Hide
                      </Button>
                    </div>
                  </div>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant='outline'>
                        <KeyRound className='size-4' />
                        Reveal Private Key
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Export Private Key</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will reveal your agent&apos;s private key. Anyone with access to this key has full
                          control over your agent&apos;s wallet and funds. Never share it.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            const result = await queryClient.fetchQuery(trpc.agents.exportPrivateKey.queryOptions());
                            setRevealedKey(result.privateKey);
                          }}
                        >
                          I understand, reveal it
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Sparkles className='size-4' />
              System Prompt
            </CardTitle>
            <CardAction>
              {editingPrompt ? (
                <div className='flex gap-1'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setEditingPrompt(false)}
                    disabled={updateMutation.isPending}
                  >
                    <X className='size-3' />
                    Cancel
                  </Button>
                  <Button
                    size='sm'
                    onClick={() => updateMutation.mutate({ systemPrompt: promptDraft })}
                    disabled={updateMutation.isPending}
                  >
                    <Check className='size-3' />
                    Save
                  </Button>
                </div>
              ) : (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setPromptDraft(agent.systemPrompt);
                    setEditingPrompt(true);
                  }}
                >
                  <Pencil className='size-3' />
                  Edit
                </Button>
              )}
            </CardAction>
          </CardHeader>
          <CardContent>
            {editingPrompt ? (
              <Textarea
                value={promptDraft}
                onChange={(e) => setPromptDraft(e.target.value)}
                className='min-h-[200px] font-mono text-sm'
              />
            ) : (
              <pre className='whitespace-pre-wrap break-all overflow-hidden rounded-md border bg-muted/50 p-4 text-sm leading-relaxed'>
                {agent.systemPrompt}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Zap className='size-4' />
              Skills
            </CardTitle>
            <CardAction>
              {editingSkills ? (
                <div className='flex gap-1'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setEditingSkills(false)}
                    disabled={updateMutation.isPending}
                  >
                    <X className='size-3' />
                    Cancel
                  </Button>
                  <Button
                    size='sm'
                    onClick={() => updateMutation.mutate({ skills: skillsDraft })}
                    disabled={updateMutation.isPending}
                  >
                    <Check className='size-3' />
                    Save
                  </Button>
                </div>
              ) : (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setSkillsDraft(agent.skills.map((s) => ({ title: s.title, content: s.content })));
                    setEditingSkills(true);
                  }}
                >
                  <Pencil className='size-3' />
                  Edit
                </Button>
              )}
            </CardAction>
          </CardHeader>
          <CardContent className='space-y-3'>
            {editingSkills ? (
              <>
                {skillsDraft.map((skill, i) => (
                  <div key={i} className='space-y-2 rounded-md border p-3'>
                    <div className='flex items-center gap-2'>
                      <Input
                        value={skill.title}
                        onChange={(e) => {
                          const next = [...skillsDraft];
                          next[i] = { ...next[i], title: e.target.value };
                          setSkillsDraft(next);
                        }}
                        placeholder='Skill title'
                        className='text-sm'
                      />
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setSkillsDraft(skillsDraft.filter((_, j) => j !== i))}
                      >
                        <Trash2 className='size-3' />
                      </Button>
                    </div>
                    <Textarea
                      value={skill.content}
                      onChange={(e) => {
                        const next = [...skillsDraft];
                        next[i] = { ...next[i], content: e.target.value };
                        setSkillsDraft(next);
                      }}
                      placeholder='Skill content'
                      className='min-h-[60px] text-sm'
                    />
                  </div>
                ))}
                <Button
                  variant='outline'
                  size='sm'
                  className='w-full'
                  onClick={() => setSkillsDraft([...skillsDraft, { title: '', content: '' }])}
                >
                  <Plus className='size-3' />
                  Add Skill
                </Button>
              </>
            ) : (
              <>
                {agent.skills.length === 0 && (
                  <p className='text-sm text-muted-foreground'>No skills configured yet.</p>
                )}
                {agent.skills.map((skill) => (
                  <div key={skill.id} className='space-y-1 rounded-md border p-3'>
                    <p className='text-sm font-medium'>{skill.title}</p>
                    <p className='text-xs text-muted-foreground line-clamp-2'>{skill.content}</p>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        <Card className='lg:col-span-3'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Activity className='size-4' />
              Recent Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {MOCK_RECENT_USAGE.map((usage) => (
                <div key={usage.id} className='flex items-start gap-4 rounded-md border p-4'>
                  <div className='min-w-0 flex-1 space-y-1'>
                    <p className='text-sm font-medium'>{usage.input}</p>
                    <p className='text-sm text-muted-foreground'>{usage.output}</p>
                  </div>
                  <div className='flex shrink-0 flex-col items-end gap-1'>
                    <div className='flex items-center gap-1'>
                      <Star className='size-3 fill-yellow-400 text-yellow-400' />
                      <span className='text-sm font-medium'>{usage.score}</span>
                    </div>
                    <span className='text-xs text-muted-foreground'>{usage.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
