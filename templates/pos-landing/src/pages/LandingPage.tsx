import { lazy, Suspense, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

interface LandingPageProps {
  scrollTo?: string;
}

// Map section IDs to their routes
const SECTION_ROUTES: Record<string, string> = {
  'top': '/',
  'vs': '/vs',
  'caracteristicas': '/caracteristicas',
  'como': '/como',
  'hacienda': '/hacienda',
  'precios': '/precios',
  'testimonios': '/testimonios',
  'preguntas': '/preguntas',
  'login': '/',
};

export function LandingPage({ scrollTo }: LandingPageProps) {
  const { config } = useConfig();
  const s = config.sections;
  const navigate = useNavigate();
  const location = useLocation();

  // Handle direct URL navigation (when page loads with a section in URL)
  useEffect(() => {
    if (scrollTo) {
      // Wait for page to render completely
      const timer = setTimeout(() => {
        const element = document.getElementById(scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [scrollTo]);

  // Simple, reliable scroll spy - update URL based on scroll position
  useEffect(() => {
    let ticking = false;

    const updateURL = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const sections = Object.keys(SECTION_ROUTES);
        const scrollPosition = window.scrollY + 150; // Account for fixed nav

        let currentSection = 'top';

        for (const sectionId of sections) {
          const element = document.getElementById(sectionId);
          if (element) {
            const rect = element.getBoundingClientRect();
            const elementTop = window.scrollY + rect.top;

            if (scrollPosition >= elementTop) {
              currentSection = sectionId;
            }
          }
        }

        const expectedPath = SECTION_ROUTES[currentSection];
        if (expectedPath && location.pathname !== expectedPath) {
          navigate(expectedPath, { replace: true });
        }

        ticking = false;
      });
    };

    window.addEventListener('scroll', updateURL, { passive: true });
    return () => window.removeEventListener('scroll', updateURL);
  }, [navigate, location.pathname]);

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
