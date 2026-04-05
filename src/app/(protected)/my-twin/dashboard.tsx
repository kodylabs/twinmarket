'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  ArrowDownToLine,
  Bot,
  Check,
  Copy,
  DollarSign,
  ExternalLink,
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
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

export function MyTwinDashboard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: agent } = useQuery(trpc.agents.mine.queryOptions());
  const { data: worldIdStatus } = useQuery(trpc.worldId.status.queryOptions());

  const { data: treasury, isLoading: treasuryLoading } = useQuery({
    ...trpc.agents.treasury.queryOptions(),
    refetchInterval: 30_000,
    staleTime: 25_000,
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
    <div className='max-w-7xl mx-auto p-8 space-y-8 w-full'>
      {/* Stats Overview Bento Grid */}
      <section className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        {/* Main Stat: Gateway Balance */}
        <div className='md:col-span-2 bg-surface-container rounded-xl p-8 shadow-[0_0_32px_rgba(223,226,241,0.04)] relative overflow-hidden flex flex-col justify-between min-h-[220px]'>
          <div className='relative z-10'>
            <span className='font-label text-[10px] uppercase tracking-widest text-outline'>Gateway Balance</span>
            <div className='mt-4 flex items-baseline gap-2'>
              <span className='text-5xl font-mono font-bold text-primary'>
                {treasuryLoading ? '...' : (treasury?.gateway.total ?? '0')}
              </span>
              <span className='text-xl font-mono text-on-surface-variant'>USDC</span>
            </div>
          </div>
          <div className='mt-auto relative z-10 flex items-center gap-2 text-on-surface-variant font-mono text-sm'>
            <Wallet className='size-4 text-primary' />
            <span>Wallet: {treasuryLoading ? '...' : (treasury?.wallet ?? '0')} USDC</span>
          </div>
          <div className='absolute right-0 bottom-0 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] -mr-16 -mb-16 opacity-40'></div>
        </div>

        {/* Secondary Stats */}
        <div className='bg-surface-container rounded-xl p-6 flex flex-col justify-between shadow-[0_0_32px_rgba(223,226,241,0.04)]'>
          <span className='font-label text-[10px] uppercase tracking-widest text-outline'>Total Calls</span>
          <div className='flex flex-col'>
            <span className='text-3xl font-mono font-bold text-on-surface'>{agent.totalCalls.toLocaleString()}</span>
            <span className='text-xs text-on-surface-variant mt-1'>Lifetime agent calls</span>
          </div>
        </div>

        <div className='bg-surface-container rounded-xl p-6 flex flex-col justify-between shadow-[0_0_32px_rgba(223,226,241,0.04)]'>
          <span className='font-label text-[10px] uppercase tracking-widest text-outline'>Price per Call</span>
          <div className='flex flex-col'>
            <span className='text-3xl font-mono font-bold text-on-surface'>{agent.pricePerCall}</span>
            <span className='text-xs text-on-surface-variant mt-1'>USDC via x402</span>
          </div>
        </div>
      </section>

      <section className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* My Agent Card */}
        <div className='lg:col-span-2 bg-surface-container rounded-xl overflow-hidden shadow-[0_0_32px_rgba(223,226,241,0.04)] border border-outline-variant/10 flex flex-col'>
          {/* Subtle Banner Background */}
          <div className='h-24 bg-linear-to-r from-primary/20 via-secondary/10 to-transparent' />

          <div className='px-8 pb-8 -mt-12 flex flex-col md:flex-row gap-6 items-start'>
            <div className='relative shrink-0'>
              <div className='size-24 rounded-2xl overflow-hidden border-4 border-surface-container shadow-xl bg-linear-to-br from-primary to-primary-container flex items-center justify-center'>
                <Bot className='size-10 text-white' />
              </div>
              {/* Active Status Indicator */}
              <div
                className='absolute -bottom-1 -right-1 bg-green-500 size-4 rounded-full border-2 border-surface-container'
                title='Active'
              />
            </div>

            <div className='flex-1 pt-14 space-y-3'>
              <div className='flex items-center justify-between gap-4'>
                <div className='space-y-1'>
                  <h2 className='text-2xl font-bold text-[#dfe2f1] font-headline leading-none'>{agent.name}</h2>
                </div>
                <Badge
                  variant='outline'
                  className='bg-primary/5 text-primary border-primary/20 font-label uppercase tracking-widest text-[10px] hidden sm:flex'
                >
                  v2.4.0
                </Badge>
              </div>
              <p className='text-on-surface-variant text-sm leading-relaxed max-w-2xl'>{agent.description}</p>

              {/* On-chain Identity */}
              <div className='space-y-2 pt-2'>
                <InfoLine
                  label='ENS'
                  value={
                    agent.ensName ? (
                      <a
                        href={`https://sepolia.app.ens.domains/${agent.ensName}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline'
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
                        className='inline-flex items-center gap-1 font-mono text-xs text-on-surface-variant hover:text-primary'
                      >
                        {agent.walletAddress.slice(0, 6)}...{agent.walletAddress.slice(-4)}
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
                <InfoLine
                  label='AgentBook'
                  value={
                    agent.agentBook.isRegistered ? (
                      <a
                        href={`https://worldscan.org/address/${agent.walletAddress}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1 font-mono text-xs text-on-surface-variant hover:text-primary'
                      >
                        Registered
                        <ExternalLink className='size-3' />
                      </a>
                    ) : null
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Signal Card */}
        <div className='bg-surface-container-low rounded-xl p-8 shadow-[0_0_32px_rgba(223,226,241,0.04)] border border-outline-variant/10 flex flex-col justify-between'>
          <div>
            <span className='font-label text-[10px] uppercase tracking-widest text-secondary'>Security Protocol</span>
            <h3 className='text-xl font-bold text-[#dfe2f1] mt-2 font-headline'>World ID Identity</h3>
            <p className='text-xs text-on-surface-variant mt-4 leading-relaxed'>
              {worldIdStatus?.isVerified
                ? 'Your sovereign identity is verified on-chain. Highest trust level for institutional users.'
                : 'Verify your identity with World ID to increase trust.'}
            </p>
          </div>
          {worldIdStatus?.isVerified && (
            <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
              <ShieldCheck className='size-3.5 text-primary' />
              {worldIdStatus.verificationLevel === 'orb' ? 'Orb Verified' : 'Device Verified'}
            </div>
          )}
        </div>

        <div className='lg:col-span-3 bg-surface-container rounded-xl shadow-[0_0_32px_rgba(223,226,241,0.04)] border border-outline-variant/10 overflow-hidden'>
          <div className='flex items-center justify-between px-8 pt-8 pb-2'>
            <div className='flex items-center gap-2'>
              <Wallet className='size-4 text-primary' />
              <h3 className='text-lg font-bold text-[#dfe2f1] font-headline'>Treasury</h3>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: trpc.agents.treasury.queryOptions().queryKey });
              }}
            >
              Refresh
            </Button>
          </div>
          {/* Balance stats row */}
          <div className='grid grid-cols-3 divide-x divide-outline-variant/10 border-t border-outline-variant/10'>
            <div className='px-8 py-6 space-y-1'>
              <p className='text-[10px] font-label uppercase tracking-widest text-outline'>Gateway Available</p>
              <p className='text-2xl font-mono font-bold text-primary'>
                {treasuryLoading ? (
                  <span className='text-on-surface-variant'>…</span>
                ) : (
                  (treasury?.gateway.available ?? '0')
                )}
              </p>
              <p className='text-xs text-on-surface-variant'>USDC · withdrawable</p>
            </div>
            <div className='px-8 py-6 space-y-1'>
              <p className='text-[10px] font-label uppercase tracking-widest text-outline'>Gateway Total</p>
              <p className='text-2xl font-mono font-bold text-on-surface'>
                {treasuryLoading ? (
                  <span className='text-on-surface-variant'>…</span>
                ) : (
                  (treasury?.gateway.total ?? '0')
                )}
              </p>
              <p className='text-xs text-on-surface-variant'>USDC · earned lifetime</p>
            </div>
            <div className='px-8 py-6 space-y-1'>
              <p className='text-[10px] font-label uppercase tracking-widest text-outline'>Wallet Balance</p>
              <p className='text-2xl font-mono font-bold text-on-surface'>
                {treasuryLoading ? <span className='text-on-surface-variant'>…</span> : (treasury?.wallet ?? '0')}
              </p>
              <p className='text-xs text-on-surface-variant'>USDC · on-chain</p>
            </div>
          </div>

          {/* Actions row */}
          <div className='grid md:grid-cols-2 divide-x divide-outline-variant/10 border-t border-outline-variant/10'>
            {/* Withdraw */}
            <div className='px-8 py-6 space-y-4'>
              <div className='space-y-0.5'>
                <p className='text-sm font-headline font-bold text-on-surface'>Withdraw to Wallet</p>
                <p className='text-xs text-on-surface-variant'>
                  Transfer USDC from your Gateway balance to your agent&apos;s on-chain wallet.
                </p>
              </div>
              {agent.walletAddress && (
                <div className='inline-flex items-center gap-1.5 rounded-lg bg-surface-container-low border border-outline-variant/10 px-3 py-1.5'>
                  <Wallet className='size-3 text-outline' />
                  <code className='text-xs font-mono text-on-surface-variant'>
                    {agent.walletAddress.slice(0, 6)}…{agent.walletAddress.slice(-4)}
                  </code>
                  <button
                    type='button'
                    className='text-outline hover:text-primary cursor-pointer ml-0.5'
                    onClick={() => {
                      navigator.clipboard.writeText(agent.walletAddress!);
                      toast.success('Wallet address copied');
                    }}
                  >
                    <Copy className='size-3' />
                  </button>
                  <a
                    href={`https://testnet.arcscan.app/address/${agent.walletAddress}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-outline hover:text-primary'
                  >
                    <ExternalLink className='size-3' />
                  </a>
                </div>
              )}
              <div className='flex gap-2'>
                <div className='relative flex-1'>
                  <Input
                    type='text'
                    inputMode='decimal'
                    placeholder='Amount (USDC)'
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    disabled={withdrawMutation.isPending}
                    className='font-mono pr-14'
                  />
                  <button
                    type='button'
                    className='absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-label font-bold uppercase tracking-widest text-primary hover:text-primary/80 cursor-pointer disabled:opacity-40'
                    onClick={() => {
                      if (treasury?.gateway.available) setWithdrawAmount(treasury.gateway.available);
                    }}
                    disabled={withdrawMutation.isPending || !treasury?.gateway.available}
                  >
                    Max
                  </button>
                </div>
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

            {/* Export Private Key */}
            <div className='px-8 py-6 space-y-4'>
              <div className='space-y-0.5'>
                <p className='text-sm font-headline font-bold text-on-surface'>Export Private Key</p>
                <p className='text-xs text-on-surface-variant'>
                  Reveal your agent&apos;s private key to import it into an external wallet.
                </p>
              </div>
              {revealedKey ? (
                <div className='space-y-3'>
                  <code className='block break-all rounded-xl border border-outline-variant/10 bg-surface-container-low p-3 font-mono text-xs text-on-surface-variant leading-relaxed'>
                    {revealedKey}
                  </code>
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
                        This will reveal your agent&apos;s private key. Anyone with access to this key has full control
                        over your agent&apos;s wallet and funds. Never share it.
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
        </div>
      </section>

      {/* System Prompt + Skills */}
      <section className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <Card className='lg:col-span-2 border-outline-variant/10'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 font-headline'>
              <Sparkles className='size-4 text-primary fill-primary' />
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
              <pre className='whitespace-pre-wrap overflow-hidden break-all rounded-xl border border-outline-variant/10 bg-surface-container-low p-4 text-sm leading-relaxed text-on-surface-variant'>
                {agent.systemPrompt}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card className='border-outline-variant/10'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 font-headline'>
              <Zap className='size-4 text-secondary fill-secondary' />
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
                  <div key={i} className='space-y-2 rounded-xl border border-outline-variant/10 p-3'>
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
                  <p className='text-sm text-on-surface-variant'>No skills configured yet.</p>
                )}
                {agent.skills.map((skill) => (
                  <div
                    key={skill.id}
                    className='space-y-1 rounded-xl border border-outline-variant/10 bg-surface-container-low p-3'
                  >
                    <p className='text-sm font-medium text-on-surface'>{skill.title}</p>
                    <p className='text-xs text-on-surface-variant line-clamp-2'>{skill.content}</p>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Charts + Stats Summary */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Activity className='size-4' />
              Weekly Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-[200px] w-full flex items-center justify-center'>
              <p className='text-sm text-on-surface-variant'>No data currently available.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <DollarSign className='size-4' />
              Revenue (USDC)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-[200px] w-full flex items-center justify-center'>
              <p className='text-sm text-on-surface-variant'>No data currently available.</p>
            </div>
          </CardContent>
        </Card>

        <Card className='border-outline-variant/10'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 font-headline'>
              <TrendingUp className='size-4' />
              Stats Summary
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-1'>
              <p className='text-[10px] font-label uppercase tracking-widest text-outline'>Total Calls</p>
              <p className='text-2xl font-bold font-mono text-on-surface'>{agent.totalCalls.toLocaleString()}</p>
            </div>
            <Separator className='bg-outline-variant/20' />
            <div className='space-y-1'>
              <p className='text-[10px] font-label uppercase tracking-widest text-outline'>Price per Call</p>
              <p className='text-2xl font-bold font-mono text-on-surface'>{agent.pricePerCall} USDC</p>
            </div>
            <Separator className='bg-outline-variant/20' />
            <div className='space-y-1'>
              <p className='text-[10px] font-label uppercase tracking-widest text-outline'>Weekly Calls</p>
              <p className='text-sm text-on-surface-variant'>No data currently available.</p>
            </div>
            <Separator className='bg-outline-variant/20' />
            <div className='space-y-1'>
              <p className='text-[10px] font-label uppercase tracking-widest text-outline'>Weekly Revenue</p>
              <p className='text-sm text-on-surface-variant'>No data currently available.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Usage */}
      <Card className='border-outline-variant/10'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 font-headline'>
            <Activity className='size-4' />
            Recent Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-on-surface-variant'>No usage yet.</p>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className='lg:col-span-3'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Activity className='size-4' />
            Transaction History
          </CardTitle>
          <CardAction>
            <Button variant='link' className='text-xs font-label text-primary font-bold uppercase tracking-widest p-0'>
              Export CSV
            </Button>
          </CardAction>
        </CardHeader>
        <div className='overflow-x-auto'>
          <table className='w-full text-left'>
            <thead>
              <tr className='bg-surface-container-low border-b border-outline-variant/10'>
                <th className='px-8 py-4 font-label text-[10px] text-outline tracking-widest uppercase'>
                  Transaction ID
                </th>
                <th className='px-8 py-4 font-label text-[10px] text-outline tracking-widest uppercase'>
                  Agent Version
                </th>
                <th className='px-8 py-4 font-label text-[10px] text-outline tracking-widest uppercase'>Date</th>
                <th className='px-8 py-4 font-label text-[10px] text-outline tracking-widest uppercase text-right'>
                  Amount
                </th>
                <th className='px-8 py-4 font-label text-[10px] text-outline tracking-widest uppercase text-center'>
                  Status
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-outline-variant/10'>
              <tr>
                <td colSpan={5} className='px-8 py-8 text-center text-sm text-on-surface-variant'>
                  No available transactions yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
