import { lazy, Suspense } from 'react';
import { useConfig } from '@/hooks/useConfig';
import { Hero } from '@/components/sections/Hero';
import { PageSkeleton } from '@/components/ui/PageSkeleton';

const VsCompetition = lazy(() => import('@/components/sections/VsCompetition').then(m => ({ default: m.VsCompetition })));
const Features      = lazy(() => import('@/components/sections/Features').then(m => ({ default: m.Features })));
const HowItWorks    = lazy(() => import('@/components/sections/HowItWorks').then(m => ({ default: m.HowItWorks })));
const Hacienda      = lazy(() => import('@/components/sections/Hacienda').then(m => ({ default: m.Hacienda })));
const Pricing       = lazy(() => import('@/components/sections/Pricing').then(m => ({ default: m.Pricing })));
const Testimonials  = lazy(() => import('@/components/sections/Testimonials').then(m => ({ default: m.Testimonials })));
const FAQ           = lazy(() => import('@/components/sections/FAQ').then(m => ({ default: m.FAQ })));
const FinalCta      = lazy(() => import('@/components/sections/FinalCta').then(m => ({ default: m.FinalCta })));

export function LandingPage() {
  const { config } = useConfig();
  const s = config.sections;

  return (
    <>
      {s.hero.visible        && <Hero />}
      <Suspense fallback={<PageSkeleton />}>
        {s.vsCompetition.visible && <VsCompetition />}
        {s.features.visible      && <Features />}
        {s.howItWorks.visible    && <HowItWorks />}
        {s.hacienda.visible      && <Hacienda />}
        {s.pricing.visible       && <Pricing />}
        {s.testimonials.visible  && <Testimonials />}
        {s.faq.visible           && <FAQ />}
        {s.finalCta.visible      && <FinalCta />}
      </Suspense>
    </>
  );
}
