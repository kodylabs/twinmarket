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
    <header className='fixed top-0 z-50 w-full bg-[#0f131d]/70 backdrop-blur-xl shadow-[0_0_32px_rgba(223,226,241,0.04)] h-16 flex justify-between items-center px-8 border-none'>
      <div className='flex items-center gap-8'>
        <Link href='/' className='text-xl font-bold tracking-tighter text-[#dfe2f1] font-headline'>
          twinmarket
        </Link>

        <nav className='hidden md:flex items-center gap-6'>
          {NAV_LINKS.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            const isDisabled = link.protected && !isAuthenticated;

            if (isDisabled) {
              return (
                <Tooltip key={link.href}>
                  <TooltipTrigger asChild>
                    <span className='cursor-not-allowed text-[#c3c6d7]/50 font-headline tracking-tight headline-sm'>
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
                  'transition-colors font-headline tracking-tight headline-sm',
                  isActive ? 'text-[#b4c5ff] border-b-2 border-[#2563eb] pb-1' : 'text-[#c3c6d7] hover:text-[#dfe2f1]',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className='flex items-center gap-4 ml-auto'>
        {isAuthenticated && (
          <div className='hidden sm:flex'>
            <VerificationBadge />
          </div>
        )}

        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
            const ready = mounted && authenticationStatus !== 'loading';
            const connected =
              ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');

            if (!ready) {
              return <div className='h-8 w-28 animate-pulse rounded-xl bg-surface-container-high' aria-hidden='true' />;
            }

            if (!connected) {
              return (
                <button
                  type='button'
                  onClick={openConnectModal}
                  className='cta-gradient text-on-primary px-6 py-2 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity'
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
                  className='bg-error text-on-error px-4 py-1.5 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity'
                >
                  Wrong network
                </button>
              );
            }

            return (
              <button
                type='button'
                onClick={openAccountModal}
                className='bg-surface-container-high border border-outline-variant/20 px-4 py-1.5 rounded-xl text-primary font-mono text-sm hover:opacity-80 transition-opacity flex items-center gap-2'
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
