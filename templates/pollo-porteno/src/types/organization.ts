/**
 * Organization DTOs - mirrors the POS System template contract.
 */

export interface Organization {
  id: string;
  name: string;
  slug: string;
  subdomain?: string;
  owner_id: string;
  onboarding_step?: number;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
  template_name?: string;
}

export interface OrganizationListResponse {
  data: Organization[];
}

export interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  fontFamily?: string;
}

export interface ContactSettings {
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  googleMapsUrl?: string;
  ownerName?: string;
}
