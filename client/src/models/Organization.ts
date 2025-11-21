import { z } from "zod";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  subdomain: string | null;
  customDomain: string | null;
  domainVerified: boolean | null;
  s3BucketName: string | null;
  cloudfrontDistributionId: string | null;
  cloudfrontDomain: string | null;
  settings: OrganizationSettings | null;
  plan: string;
  billingEmail: string | null;
  stripeCustomerId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertOrganization {
  name: string;
  slug: string;
  subdomain?: string | null;
  customDomain?: string | null;
  settings?: OrganizationSettings | null;
  plan?: string;
  billingEmail?: string | null;
}

export interface OrganizationSettings {
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    faviconUrl?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      whatsapp?: string;
    };
  };
  payment?: {
    currency?: string;
    stripeEnabled?: boolean;
    cashOnDeliveryEnabled?: boolean;
  };
  shipping?: {
    freeShippingThreshold?: number;
    defaultShippingCost?: number;
  };
}

export const insertOrganizationSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  slug: z.string().min(1, "El slug es requerido").regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  subdomain: z.string().min(1).regex(/^[a-z0-9-]+$/).nullable().optional(),
  customDomain: z.string().nullable().optional(),
  settings: z.any().nullable().optional(),
  plan: z.string().optional(),
  billingEmail: z.string().email().nullable().optional(),
});
