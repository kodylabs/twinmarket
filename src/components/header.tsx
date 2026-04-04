'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { authClient } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Home', protected: false },
  { href: '/my-twin', label: 'My Twin', protected: true },
  { href: '/profile', label: 'Profile', protected: true },
] as const;

export function Header() {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();
  const isAuthenticated = !!session;

  return (
    <header className='flex h-14 items-center border-b px-6'>
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
                isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground',
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className='ml-auto'>
        <ConnectButton />
      </div>
    </header>
  );
}
