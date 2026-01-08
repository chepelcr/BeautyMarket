export interface CreateOrganizationData {
  // Basic info (Step 1)
  name: string;
  slug: string;
  subdomain?: string;
  ownerId: string;

  // Contact settings (Step 2 & 3)
  contactSettings?: {
    phone: string;
    whatsappNumber?: string;
    businessHours: string;
    address: string;
    country: string;
    state: string;
    city: string;
    postalCode: string;
  };

  // Template selection (Step 4)
  templateId?: string;
}

export interface OrganizationFormData {
  // Step 1: Basic info
  name: string;
  slug: string;
  subdomain: string;

  // Step 2: Contact info
  phone: string;
  whatsappNumber: string;
  sameAsBusinessPhone: boolean;
  businessHours: string;

  // Step 3: Business address
  country: string;
  state: string;
  city: string;
  postalCode: string;
  fullAddress: string;

  // Step 4: Template selection
  selectedTemplateId: string;
}

export interface Template {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  thumbnailUrl?: string;
  isActive: boolean;
  sortOrder: number;
}
