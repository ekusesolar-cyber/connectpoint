'use client';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Ticket, CreditCard, Router, Monitor, BarChart3, Wifi, Check, ArrowRight, Star, Globe, DollarSign, ChevronDown } from 'lucide-react';
import '@/styles/globals.css';
import { useState } from 'react';

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const heroTitle = t.has('hero.title') ? t('hero.title') : 'Turn Any Internet Connection into a Profitable Hotspot Business';
  const heroSubtitle = t.has('hero.subtitle') ? t('hero.subtitle') : 'ConnectPoint helps schools, hostels, cafes, shops, offices, transport operators, communities, and Starlink owners monetize their internet connection with paid and free Wi-Fi access management.';
  const heroCta = t.has('hero.cta') ? t('hero.cta') : 'Start Free Trial';
  const heroLearnMore = t.has('hero.learnMore') ? t('hero.learnMore') : 'Learn More';

  const featuresTitle = t.has('features.title') ? t('features.title') : 'Everything You Need to Run Your Hotspot Business';
  const featuresSubtitle = t.has('features.subtitle') ? t('features.subtitle') : 'From package creation to revenue tracking, ConnectPoint provides a complete platform.';

  const pricingTitle = t.has('pricing.title') ? t('pricing.title') : 'Simple, Transparent Pricing';
  const pricingSubtitle = t.has('pricing.subtitle') ? t('pricing.subtitle') : 'Start free and scale as you grow.';

  const features = [
    {
      icon: Package,
      title: t.has('features.items.packages.title') ? t('features.items.packages.title') : 'Smart Packages',
      desc: t.has('features.items.packages.desc') ? t('features.items.packages.desc') : 'Create packages by time, data volume, speed, or unlimited access. Set your own prices.',
    },
    {
      icon: Ticket,
      title: t.has('features.items.vouchers.title') ? t('features.items.vouchers.title') : 'Voucher System',
      desc: t.has('features.items.vouchers.desc') ? t('features.items.vouchers.desc') : 'Generate single or bulk voucher codes. Print or share digitally with customers.',
    },
    {
      icon: CreditCard,
      title: t.has('features.items.payments.title') ? t('features.items.payments.title') : 'Mobile Money & Card',
      desc: t.has('features.items.payments.desc') ? t('features.items.payments.desc') : 'Accept Flutterwave, MTN MoMo, Orange Money, and card payments automatically.',
    },
    {
      icon: Router,
      title: t.has('features.items.radius.title') ? t('features.items.radius.title') : 'MikroTik Integration',
      desc: t.has('features.items.radius.desc') ? t('features.items.radius.desc') : 'Full RADIUS authentication with MikroTik routers. Automated user management.',
    },
    {
      icon: Monitor,
      title: t.has('features.items.portal.title') ? t('features.items.portal.title') : 'Captive Portal',
      desc: t.has('features.items.portal.desc') ? t('features.items.portal.desc') : 'Mobile-first branded login page. Customers see packages and pay instantly.',
    },
    {
      icon: BarChart3,
      title: t.has('features.items.reports.title') ? t('features.items.reports.title') : 'Revenue Reports',
      desc: t.has('features.items.reports.desc') ? t('features.items.reports.desc') : 'Track earnings, active users, data usage, and generate detailed reports.',
    },
  ];

  const stepCards = [
    {
      step: '01',
      icon: Globe,
      title: 'Register & Setup',
      desc: 'Create your account, add your hotspot location, and configure your MikroTik router or network.',
    },
    {
      step: '02',
      icon: Package,
      title: 'Create Packages',
      desc: 'Design pricing plans by time, data, speed, or offer free access with sponsorship options.',
    },
    {
      step: '03',
      icon: DollarSign,
      title: 'Start Selling',
      desc: 'Customers connect to your hotspot, select a package, pay via mobile money or card, and you earn revenue.',
    },
  ];

  const plans = [
    {
      name: t.has('pricing.free.name') ? t('pricing.free.name') : 'Free',
      desc: t.has('pricing.free.desc') ? t('pricing.free.desc') : 'Perfect for getting started',
      price: t.has('pricing.free.price') ? t('pricing.free.price') : '0',
      currency: 'XAF',
      features: t.has('pricing.free.features') ? t.raw('pricing.free.features') as string[] : ['1 Hotspot', '5 Packages', 'Basic Reports', 'Community Support'],
      cta: t.has('pricing.cta') ? t('pricing.cta') : 'Get Started',
      href: '/register',
      popular: false,
    },
    {
      name: t.has('pricing.starter.name') ? t('pricing.starter.name') : 'Starter',
      desc: t.has('pricing.starter.desc') ? t('pricing.starter.desc') : 'For growing businesses',
      price: t.has('pricing.starter.price') ? t('pricing.starter.price') : '5,000',
      currency: 'XAF/mo',
      features: t.has('pricing.starter.features') ? t.raw('pricing.starter.features') as string[] : ['3 Hotspots', 'Unlimited Packages', 'Revenue Reports', 'Email Support', 'Voucher System'],
      cta: t.has('pricing.cta') ? t('pricing.cta') : 'Get Started',
      href: '/register',
      popular: true,
    },
    {
      name: t.has('pricing.pro.name') ? t('pricing.pro.name') : 'Pro',
      desc: t.has('pricing.pro.desc') ? t('pricing.pro.desc') : 'For serious operators',
      price: t.has('pricing.pro.price') ? t('pricing.pro.price') : '15,000',
      currency: 'XAF/mo',
      features: t.has('pricing.pro.features') ? t.raw('pricing.pro.features') as string[] : ['10 Hotspots', 'All Features', 'API Access', 'Priority Support', 'Custom Domain', 'Advanced Analytics'],
      cta: t.has('pricing.cta') ? t('pricing.cta') : 'Get Started',
      href: '/register',
      popular: false,
    },
    {
      name: t.has('pricing.enterprise.name') ? t('pricing.enterprise.name') : 'Enterprise',
      desc: t.has('pricing.enterprise.desc') ? t('pricing.enterprise.desc') : 'For large networks',
      price: t.has('pricing.enterprise.price') ? t('pricing.enterprise.price') : 'Custom',
      currency: '',
      features: t.has('pricing.enterprise.features') ? t.raw('pricing.enterprise.features') as string[] : ['Unlimited Hotspots', 'White Label', 'SLA', 'Dedicated Support', 'Custom Integration', 'On-premise Option'],
      cta: t.has('pricing.contact') ? t('pricing.contact') : 'Contact Us',
      href: '/contact',
      popular: false,
    },
  ];

  const faqs = [
    {
      q: 'How long does it take to set up?',
      a: 'Most users get started in under 30 minutes. Create your account, add your hotspot, configure your MikroTik router with our auto-setup script, and start selling packages immediately.',
    },
    {
      q: 'Do I need a MikroTik router?',
      a: 'While MikroTik offers the best integration, we support other RADIUS-compatible routers. Our platform works with any device that supports RADIUS authentication or our captive portal.',
    },
    {
      q: 'How do I receive payments?',
      a: 'We integrate with Flutterwave to accept MTN MoMo, Orange Money, Airtel Money, and card payments. Funds are settled to your bank account or mobile money wallet automatically.',
    },
    {
      q: 'Can I create different package types?',
      a: 'Yes! You can create packages based on time duration (hourly, daily, weekly, monthly), data volume (MB/GB), speed tiers, or unlimited access. Set any price you want.',
    },
    {
      q: 'What support is available?',
      a: 'Free users get community support via our forum and WhatsApp group. Paid plans include email support, and Pro/Enterprise plans get priority support with dedicated account managers.',
    },
    {
      q: 'Can I upgrade or downgrade my plan?',
      a: 'Absolutely. You can change your plan at any time. Upgrades take effect immediately, and downgrades apply at the end of your billing cycle. No long-term contracts required.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Wifi className="h-4 w-4" />
            ConnectPoint v2.0
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              {heroTitle}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto mb-10 leading-relaxed">
            {heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/register">
              <Button variant="default" size="lg" className="text-base font-semibold">
                {heroCta}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="text-base font-semibold">
                {heroLearnMore}
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-text-secondary">
            <span className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              100+ Active Hotspots
            </span>
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-secondary" />
              5+ Countries
            </span>
            <span className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              10M+ XAF Revenue Processed
            </span>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 sm:py-28 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                {featuresTitle}
              </span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">{featuresSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="bg-surface/80 backdrop-blur border-border hover:border-primary/30 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">{f.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                How It Works
              </span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Get your hotspot business running in three simple steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {stepCards.map((step, i) => (
              <div key={i} className="relative">
                {i < stepCards.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/40 to-secondary/40" />
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-surface border border-border flex items-center justify-center mb-6 relative">
                    <step.icon className="h-10 w-10 text-primary" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-black text-xs font-bold flex items-center justify-center">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">{step.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed max-w-xs">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 sm:py-28 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                {pricingTitle}
              </span>
            </h2>
            <p className="text-text-secondary text-lg">{pricingSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, i) => (
              <Card
                key={i}
                className={`relative bg-surface/80 backdrop-blur border-border transition-all duration-300 hover:border-primary/30 ${
                  plan.popular ? 'border-primary/50 ring-1 ring-primary/20' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-black text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-text-primary mb-1">{plan.name}</h3>
                    <p className="text-text-secondary text-sm mb-4">{plan.desc}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-text-primary">{plan.price}</span>
                      {plan.currency && (
                        <span className="text-text-secondary text-sm">{plan.currency}</span>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, fi) => (
                      <li key={fi} className="flex items-start gap-3 text-sm text-text-secondary">
                        <Check className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href}>
                    <Button
                      variant={plan.popular ? 'default' : 'outline'}
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Frequently Asked Questions
              </span>
            </h2>
            <p className="text-text-secondary text-lg">
              Got questions? We have answers.
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-surface/80 backdrop-blur overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left text-text-primary font-medium hover:bg-surface-hover transition-colors"
                >
                  {faq.q}
                  <ChevronDown
                    className={`h-5 w-5 text-text-secondary shrink-0 ml-4 transition-transform duration-300 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === i ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-5 pb-5 text-text-secondary text-sm leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-surface/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur p-8 sm:p-12 lg:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  Ready to Start Your Hotspot Business?
                </span>
              </h2>
              <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
                Join hundreds of hotspot owners already earning revenue with ConnectPoint. No credit card required.
              </p>
              <Link href="/register">
                <Button variant="default" size="lg" className="text-base font-semibold">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
