import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import StoreProvider from '@/store/Provider';
import AuthInitializer from '@/store/AuthInitializer';
import { CartInitializer } from '@/store/CartInitializer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Fornomenu',
  description: 'A melhor da região',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          <AuthInitializer>
            <CartInitializer />
            {children}
          </AuthInitializer>
        </StoreProvider>
      </body>
    </html>
  );
}