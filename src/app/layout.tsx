import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Inter, Space_Grotesk } from 'next/font/google';
import { AppProviders } from '@/components/app-providers';
import { Header } from '@/components/header';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | twinmarket',
    default: 'Home | twinmarket',
  },
  description: 'twinmarket - Initialized with https://github.com/plvo/create-faster',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased`} suppressHydrationWarning>
        <AppProviders>
          <Header />
          <main>{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
