/**
 * Pricing Tab Types
 * Shared types for pricing components
 */

import type { Plan, PlanFeature, FeatureColor, FeatureDef } from '@/types';

export type { Plan, PlanFeature, FeatureColor, FeatureDef };

export const COLORS: Array<{ value: FeatureColor; bg: string; label: string }> = [
  { value: 'success',     bg: '#16a34a', label: 'Éxito' },
  { value: 'primary',     bg: '#e0640a', label: 'Primario' },
  { value: 'warning',     bg: '#ea9c1a', label: 'Advertencia' },
  { value: 'destructive', bg: '#d63d3d', label: 'Destructivo' },
  { value: 'muted',       bg: '#888888', label: 'Apagado' },
];

export function genId(prefix = 'plan'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 7)}`;
}

export const EMPTY_PLAN = (): Plan => ({
  id:               genId('plan'),
  name:             'Nuevo Plan',
  tagline:          'Descripción del plan aquí',
  priceMonthly:     0,
  priceAnnual:      0,
  priceCRC:         0,
  priceMin:         0,
  priceMax:         0,
  priceSuffix:      '/ mes',
  showPriceSlider:  false,
  ctaLabel:         'Empezar',
  ctaHref:          '#',
  badge:            '',
  highlighted:      false,
  subline:          '',
  showAmortization: false,
  showMoneyBack:    false,
  features:         [],
});
