'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Wifi } from 'lucide-react';

export function Footer() {
  const t = useTranslations('footer');
  const pathname = usePathname();
  const locale = useLocale();

  const isDashboard = pathname.includes('/dashboard') || pathname.includes('/admin') || pathname.includes('/portal');
  if (isDashboard) return null;

  return (
    <footer className="border-t border-border bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Wifi className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl text-gradient">ConnectPoint</span>
            </div>
            <p className="text-text-secondary text-sm max-w-md">
              Turn any internet connection into a managed Wi-Fi hotspot business. Monetize your bandwidth with smart package management, automatic payments, and full MikroTik integration.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <div className="space-y-2 text-sm text-text-secondary">
              <Link href={`/${locale}/#features`} className="block hover:text-primary transition-colors">Features</Link>
              <Link href={`/${locale}/#pricing`} className="block hover:text-primary transition-colors">Pricing</Link>
              <Link href={`/${locale}/#faq`} className="block hover:text-primary transition-colors">FAQ</Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <div className="space-y-2 text-sm text-text-secondary">
              <Link href={`/${locale}/legal/privacy`} className="block hover:text-primary transition-colors">{t('privacy')}</Link>
              <Link href={`/${locale}/legal/terms`} className="block hover:text-primary transition-colors">{t('terms')}</Link>
              <a href="mailto:hello@connectpoint.io" className="block hover:text-primary transition-colors">{t('contact')}</a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-secondary">Â© {new Date().getFullYear()} ConnectPoint. {t('rights')}</p>
          <p className="text-xs text-text-secondary">{t('compliance')}</p>
        </div>
      </div>
    </footer>
  );
}
