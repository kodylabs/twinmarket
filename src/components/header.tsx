'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useQuery } from '@tanstack/react-query';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { authClient } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import { useTRPC } from '@/trpc/providers';

const NAV_LINKS = [
  { href: '/', label: 'Home', protected: false },
  { href: '/twins', label: 'Marketplace', protected: false },
  { href: '/my-twin', label: 'My Twin', protected: true },
  { href: '/profile', label: 'Profile', protected: true },
] as const;

function VerificationBadge() {
  const trpc = useTRPC();
  const { data: status } = useQuery(trpc.worldId.status.queryOptions());

  if (!status) return null;

  if (!status.isVerified) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className='flex items-center gap-1.5 rounded-md border border-dashed px-2.5 py-1 text-xs text-muted-foreground'>
            <ShieldAlert className='size-3.5' />
            <span className='hidden sm:inline'>Not Verified</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>World ID not verified</TooltipContent>
      </Tooltip>
    );
  }

  const isOrb = status.verificationLevel === 'orb';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant='outline' className='gap-1.5 py-1'>
          {isOrb ? <ShieldCheck className='size-3.5 text-primary' /> : <Shield className='size-3.5' />}
          <span className='hidden sm:inline'>{isOrb ? 'Orb Verified' : 'Device Verified'}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        {isOrb ? 'Verified with World ID Orb (biometric)' : 'Verified with World ID Device'}
      </TooltipContent>
    </Tooltip>
  );
}

export function Header() {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();
  const isAuthenticated = !!session;

  return (
    <header className='flex h-12 items-center border-b px-6'>
      <Link href='/' className='text-lg font-bold'>
        twinmarket
      </Link>

      <nav className='ml-8 flex items-center gap-1'>
        {NAV_LINKS.map((link) => {
          const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
          const isDisabled = link.protected && !isAuthenticated;

          if (isDisabled) {
            return (
              <Tooltip key={link.href}>
                <TooltipTrigger asChild>
                  <span className='cursor-not-allowed rounded-md px-3 py-1.5 text-sm text-muted-foreground/50'>
                    {link.label}
                  </span>
                </TooltipTrigger>
                <TooltipContent>You must be connected</TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                isActive ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground',
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className='ml-auto flex items-center gap-3'>
        {isAuthenticated && <VerificationBadge />}

        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
            const ready = mounted && authenticationStatus !== 'loading';
            const connected =
              ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');

            if (!ready) {
              return <div className='h-8 w-28 animate-pulse rounded-md bg-muted' aria-hidden='true' />;
            }

            if (!connected) {
              return (
                <button
                  type='button'
                  onClick={openConnectModal}
                  className='inline-flex h-8 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90'
                >
                  Connect Wallet
                </button>
              );
            }

            if (chain.unsupported) {
              return (
                <button
                  type='button'
                  onClick={openChainModal}
                  className='inline-flex h-8 items-center rounded-md bg-destructive px-4 text-sm font-medium text-white hover:bg-destructive/90'
                >
                  Wrong network
                </button>
              );
            }

            return (
              <button
                type='button'
                onClick={openAccountModal}
                className='inline-flex h-8 items-center gap-2 rounded-md border bg-background px-3 text-sm hover:bg-accent'
              >
                {account.ensAvatar ? (
                  <Image
                    src={account.ensAvatar}
                    alt={account.displayName}
                    className='size-5 rounded-full'
                    width={20}
                    height={20}
                  />
                ) : (
                  <div className='size-5 rounded-full bg-linear-to-br from-primary/60 to-primary' />
                )}
                <span className='font-medium'>{account.displayName}</span>
              </button>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  );
}
