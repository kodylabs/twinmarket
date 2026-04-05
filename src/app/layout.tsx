import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { Toaster } from 'sonner';
import { AppProviders } from '@/components/app-providers';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['300', '400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
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
    <html lang='en' suppressHydrationWarning className='dark'>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <AppProviders>
          <Header />
          <main className='flex-grow pt-16'>{children}</main>
          <Footer />
          <Toaster richColors />
        </AppProviders>
      </body>
    </html>
  );
}
