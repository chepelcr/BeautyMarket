export type AccentKey = 'orange' | 'indigo' | 'teal' | 'violet';
export type CurrencyKey = 'CRC' | 'USD';
export type HeroVariant = 'centered' | 'split';
export type HaciendaVariant = 'default' | 'compact';
export type PricingVariant = 'default' | 'compact';
export type LangKey = 'es' | 'en';
export type FeatureColor = 'success' | 'warning' | 'destructive' | 'primary' | 'muted';

export interface FeatureDef {
  id:    string;
  label: string;
}

export interface PlanFeature {
  label:   string;
  enabled: boolean;
  color?:  FeatureColor;
}

export interface Plan {
  id:               string;
  name:             string;
  tagline:          string;
  priceCRC:         number;
  priceMin:         number;
  priceMax:         number;
  priceSuffix:      string;
  showPriceSlider:  boolean;
  ctaLabel:         string;
  ctaHref:          string;
  badge?:           string;
  highlighted:      boolean;
  subline?:         string;
  showAmortization: boolean;
  showMoneyBack:    boolean;
  features:         PlanFeature[];
}

export interface AccentPalette {
  primary:          string;
  primaryDark:      string;
  accent:           string;
  accentForeground: string;
  accentDark:       string;
  accentFgDark:     string;
  ring:             string;
  ringDark:         string;
}

export interface TokenConfig {
  accentPalettes: Record<AccentKey, AccentPalette>;
  neutral: {
    background:     string;
    backgroundDark: string;
    foreground:     string;
    foregroundDark: string;
    card:           string;
    cardDark:       string;
    muted:          string;
    mutedDark:      string;
    mutedFg:        string;
    mutedFgDark:    string;
    border:         string;
    borderDark:     string;
  };
  semantic: {
    success:         string;
    successDark:     string;
    warning:         string;
    warningDark:     string;
    destructive:     string;
    destructiveDark: string;
    info:            string;
    infoDark:        string;
  };
  radius: string;
  fontSans:    string;
  fontDisplay: string;
  fontMono:    string;
}

export interface SectionConfig {
  visible: boolean;
}

export interface SectionWithVariant<T extends string> extends SectionConfig {
  variant: T;
}

export interface DemoProduct {
  id:    string;
  cat:   string;
  name:  string;
  sku:   string;
  price: number;
  stock: number;
  cabys: string;
}

export interface DemoCustomer {
  id:     string;
  name:   string;
  id_doc: string;
  email:  string;
}

export interface NavTranslations {
  features:   string;
  hacienda:   string;
  pricing:    string;
  faq:        string;
  login:      string;
  cta:        string;
  home:       string;
  demo:       string;
}

export interface HeroTranslations {
  badge:        string;
  badgeSub:     string;
  headline:     string;
  subheadline:  string;
  ctaPrimary:   string;
  ctaSecondary: string;
  trustBadges:  string[];
  ticker:       string[];
  demoLabel:    string;
  statusLabel:  string;
  deviceDesktop: string;
  deviceMobile:  string;
}

export type TranslationMap = {
  nav: NavTranslations;
  hero: HeroTranslations;
  vs: {
    eyebrow:      string;
    headline:     string;
    subheadline:  string;
    cols:         string[];
    disclaimer:   string;
    rows: Array<{ feature: string; jm: string; alt1: string; alt2: string }>;
  };
  features: {
    eyebrow:  string;
    headline: string;
    groups: Array<{
      eyebrow: string;
      title:   string;
      items: Array<{ icon: string; title: string; desc: string }>;
    }>;
  };
  howItWorks: {
    eyebrow:  string;
    headline: string;
    steps: Array<{ icon: string; title: string; desc: string }>;
  };
  hacienda: {
    eyebrow:     string;
    headline:    string;
    subheadline: string;
    cards: Array<{ icon: string; title: string; desc: string }>;
    promoTitle: string;
    promoDesc:  string;
    promoBadge: string;
  };
  pricing: {
    eyebrow:           string;
    headline:          string;
    subheadline:       string;
    moneyBackLabel:    string;
    amortizationLabel: string;
    addons: Array<{ icon: string; title: string; description: string }>;
  };
  testimonials: {
    eyebrow:  string;
    headline: string;
    items: Array<{ quote: string; author: string; role: string }>;
  };
  faq: {
    eyebrow:  string;
    headline: string;
    items: Array<{ q: string; a: string }>;
  };
  finalCta: {
    eyebrow:           string;
    headline:          string;
    subheadline:       string;
    ctaPrimary:        string;
    ctaSecondary:      string;
    loginTitle:        string;
    loginSub:          string;
    loginEmailLabel:   string;
    loginEmailPlaceholder: string;
    loginPasswordLabel: string;
    loginPasswordPlaceholder: string;
    loginCta:          string;
    loginForgot:       string;
    loginCreate:       string;
  };
  footer: {
    tagline:   string;
    madeIn:    string;
    columns: Array<{ heading: string; links: string[] }>;
    copyright: string;
    version:   string;
  };
  demo: {
    searchPlaceholder: string;
    noResults:         string;
    categories:        string[];
    emptyCart:         string;
    emptyCartSub:      string;
    customers:         { pickLabel: string; defaultName: string };
    cart:              { title: string; docType: string; checkout: string; subtotal: string; iva: string; total: string; clear: string };
    checkout: {
      title:          string;
      totalLabel:     string;
      paymentTitle:   string;
      paymentMethods: { cash: string; card: string; sinpe: string };
      tenderedLabel:  string;
      changeLabel:    string;
      exactLabel:     string;
      cardNote:       string;
      sinpeNote:      string;
      confirmLabel:   string;
      processingTitle: string;
      processingSteps: string[];
      successTitle:   string;
      successSub:     string;
      newSaleLabel:   string;
    };
    receipt: {
      typeLabel:    string;
      consecLabel:  string;
      claveLabel:   string;
      clientLabel:  string;
      paymentLabel: string;
      types:        { FE: string; TE: string; NC: string };
      methods:      { cash: string; card: string; sinpe: string };
      sendXml:      string;
      printTicket:  string;
    };
    docTypes: Array<{ key: string; name: string; desc: string }>;
    onlineLabel:  string;
    branchLabel:  string;
    demoLabel:    string;
  };
};

export interface AppConfig {
  _version: number;
  meta: {
    siteTitle:       string;
    siteDescription: string;
    siteUrl:         string;
    appUrl:          string;
    lang:            LangKey;
  };
  theme: {
    accent: AccentKey;
    dark:   boolean;
  };
  tokens: TokenConfig;
  sections: {
    hero:          SectionWithVariant<HeroVariant>;
    vsCompetition: SectionConfig;
    features:      SectionConfig;
    howItWorks:    SectionConfig;
    hacienda:      SectionWithVariant<HaciendaVariant>;
    pricing:       SectionWithVariant<PricingVariant>;
    testimonials:  SectionConfig;
    faq:           SectionConfig;
    finalCta:      SectionConfig;
    footer:        SectionConfig;
  };
  pricing: {
    currency:           CurrencyKey;
    usdRateCRC:         number;
    freeDocs:           number;
    amortizationMonths: number;
    moneyBackDays:      number;
    features:           FeatureDef[];
    plans:              Plan[];
  };
  demo: {
    products:   DemoProduct[];
    customers:  DemoCustomer[];
    categories: string[];
  };
  translations: {
    es: TranslationMap;
    en: Partial<TranslationMap>;
  };
}
