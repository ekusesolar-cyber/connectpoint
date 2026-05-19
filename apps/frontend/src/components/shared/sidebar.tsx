'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Wifi, Package, Ticket, Users, DollarSign,
  BarChart3, Wallet, Settings, UserCheck, Shield, LogOut,
  Store, FileText, PieChart, ListOrdered, BookOpen,
} from 'lucide-react';

interface SidebarItem {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
  roles?: string[];
}

export function Sidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const adminT = useTranslations('admin');
  const tc = useTranslations('common');
  const { user, isAdmin, isOwner, logout } = useAuth();

  const ownerItems: SidebarItem[] = [
    { href: `/${locale}/dashboard`, labelKey: 'title', icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: `/${locale}/dashboard/hotspots`, labelKey: 'hotspots', icon: <Wifi className="h-4 w-4" /> },
    { href: `/${locale}/dashboard/packages`, labelKey: 'packages', icon: <Package className="h-4 w-4" /> },
    { href: `/${locale}/dashboard/vouchers`, labelKey: 'vouchers', icon: <Ticket className="h-4 w-4" /> },
    { href: `/${locale}/dashboard/users`, labelKey: 'users', icon: <Users className="h-4 w-4" /> },
    { href: `/${locale}/dashboard/revenue`, labelKey: 'revenue', icon: <DollarSign className="h-4 w-4" /> },
    { href: `/${locale}/dashboard/reports`, labelKey: 'reports', icon: <BarChart3 className="h-4 w-4" /> },
    { href: `/${locale}/dashboard/withdrawals`, labelKey: 'withdrawals', icon: <Wallet className="h-4 w-4" /> },
    { href: `/${locale}/dashboard/profile`, labelKey: 'profile', icon: <Settings className="h-4 w-4" /> },
    { href: `/${locale}/dashboard/kyc`, labelKey: 'kyc', icon: <UserCheck className="h-4 w-4" /> },
  ];

  const adminItems: SidebarItem[] = [
    { href: `/${locale}/admin`, labelKey: 'title', icon: <Shield className="h-4 w-4" /> },
    { href: `/${locale}/admin/owners`, labelKey: 'owners', icon: <Users className="h-4 w-4" /> },
    { href: `/${locale}/admin/kyc`, labelKey: 'kycManagement', icon: <UserCheck className="h-4 w-4" /> },
    { href: `/${locale}/admin/hotspots`, labelKey: 'totalHotspots', icon: <Wifi className="h-4 w-4" /> },
    { href: `/${locale}/admin/transactions`, labelKey: 'transactions', icon: <ListOrdered className="h-4 w-4" /> },
    { href: `/${locale}/admin/commission`, labelKey: 'commission', icon: <DollarSign className="h-4 w-4" /> },
    { href: `/${locale}/admin/subscriptions`, labelKey: 'subscriptions', icon: <BookOpen className="h-4 w-4" /> },
    { href: `/${locale}/admin/analytics`, labelKey: 'analytics', icon: <PieChart className="h-4 w-4" /> },
    { href: `/${locale}/admin/audit-logs`, labelKey: 'auditLogs', icon: <FileText className="h-4 w-4" /> },
  ];

  const items = isAdmin ? adminItems : ownerItems;

  const isPortal = pathname.includes('/portal');
  if (isPortal) return null;

  const isActive = (href: string) => {
    if (href === `/${locale}/dashboard` || href === `/${locale}/admin`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-surface hidden lg:flex flex-col">
      <div className="flex items-center gap-2 p-6 border-b border-border">
        <Wifi className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg text-gradient">ConnectPoint</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              isActive(item.href)
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            )}
          >
            {item.icon}
            <span>{item.labelKey === 'title' ? (isAdmin ? adminT('title') : t('title')) : t(item.labelKey)}</span>
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.fullName}</p>
            <p className="text-xs text-text-secondary truncate">{user?.email}</p>
          </div>
        </div>
        <Link href={`/${locale}/auth/login`}>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-danger hover:bg-danger/10 transition-all w-full"
          >
            <LogOut className="h-4 w-4" />
            <span>{tc('logout')}</span>
          </button>
        </Link>
      </div>
    </aside>
  );
}
