import React from 'react';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth';
import { QueryProvider } from '@/lib/query-provider';
import { Navbar } from '@/components/shared/navbar';
import { Sidebar } from '@/components/shared/sidebar';
import { Footer } from '@/components/shared/footer';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'ConnectPoint - Hotspot Monetization Platform',
  description: 'Turn any internet connection into a managed Wi-Fi hotspot business. Monetize with smart packages, automatic payments, and MikroTik integration.',
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-text-primary antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <QueryProvider>
              <AuthProvider>
                <div className="flex min-h-screen">
                  <Sidebar />
                  <div className="flex-1 flex flex-col lg:pl-64">
                    <Navbar />
                    <main className="flex-1">{children}</main>
                    <Footer />
                  </div>
                </div>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#131829',
                      color: '#f8fafc',
                      border: '1px solid #1e293b',
                      borderRadius: '12px',
                    },
                    success: { iconTheme: { primary: '#22c55e', secondary: '#f8fafc' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#f8fafc' } },
                  }}
                />
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
