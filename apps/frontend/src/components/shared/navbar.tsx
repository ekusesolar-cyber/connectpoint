'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Menu, X, Wifi, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

type LinkItem = { href: string; label: string };

export function Navbar() {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const pathname = usePathname();
  const locale = useLocale();
  const { user, isAdmin, isOwner } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links: LinkItem[] = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/#features`, label: t('features') },
    { href: `/${locale}/#pricing`, label: t('pricing') },
    { href: `/${locale}/#faq`, label: t('faq') },
  ];

  const isDashboard = pathname.includes('/dashboard') || pathname.includes('/admin') || pathname.includes('/portal');

  if (isDashboard) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <Wifi className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-gradient">ConnectPoint</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === link.href ? 'text-primary' : 'text-text-secondary'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href={`/${locale}/auth/login`}>
              <Button variant="ghost">{tc('login')}</Button>
            </Link>
            <Link href={`/${locale}/auth/register`}>
              <Button>{tc('register')}</Button>
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface p-4 space-y-4 animate-fade-in">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block text-sm text-text-secondary hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2 border-t border-border">
            <Link href={`/${locale}/auth/login`} className="flex-1" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full">{tc('login')}</Button>
            </Link>
            <Link href={`/${locale}/auth/register`} className="flex-1" onClick={() => setMobileOpen(false)}>
              <Button className="w-full">{tc('register')}</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
