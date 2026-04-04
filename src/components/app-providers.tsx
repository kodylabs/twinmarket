'use client';

import '@rainbow-me/rainbowkit/styles.css';
import {
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type React from 'react';
import { useMemo } from 'react';
import { createSiweMessage } from 'viem/siwe';
import { WagmiProvider } from 'wagmi';
import { getAccount, getChainId } from 'wagmi/actions';
import { useMounted } from '@/hooks/use-mounted';
import { authClient } from '@/lib/auth/auth-client';
import { wagmiConfig } from '@/lib/wagmi';
import { TRPCReactProvider } from '@/trpc/providers';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const mounted = useMounted();

  const authStatus = !mounted || isPending ? 'loading' : session ? 'authenticated' : 'unauthenticated';

  const authAdapter = useMemo(() => {
    let resolvedAddress: string;
    let resolvedChainId: number;

    return createAuthenticationAdapter({
      getNonce: async () => {
        const account = getAccount(wagmiConfig);
        const chainId = getChainId(wagmiConfig);
        const { data } = await authClient.siwe.nonce({
          walletAddress: account.address ?? '',
          chainId,
        });
        return data?.nonce ?? '';
      },
      createMessage: ({ nonce, address, chainId }) => {
        resolvedAddress = address;
        resolvedChainId = chainId;
        return createSiweMessage({
          domain: window.location.host,
          address,
          statement: 'Sign in with Ethereum.',
          uri: window.location.origin,
          version: '1',
          chainId,
          nonce,
        });
      },
      verify: async ({ message, signature }) => {
        const { error } = await authClient.siwe.verify({
          message,
          signature,
          walletAddress: resolvedAddress,
          chainId: resolvedChainId,
        });
        if (!error) router.push('/protected');
        return !error;
      },
      signOut: async () => {
        await authClient.signOut();
      },
    });
  }, [router.push]);

  return (
    <WagmiProvider config={wagmiConfig}>
      <TRPCReactProvider>
        <RainbowKitAuthenticationProvider adapter={authAdapter} status={authStatus}>
          <RainbowKitProvider>
            <NextThemesProvider attribute='class' defaultTheme='system' enableSystem storageKey={'web-theme'}>
              {children}
            </NextThemesProvider>
          </RainbowKitProvider>
        </RainbowKitAuthenticationProvider>
      </TRPCReactProvider>
    </WagmiProvider>
  );
}
