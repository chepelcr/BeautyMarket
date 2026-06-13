# Settings Forms

This directory contains four settings form components for the admin dashboard:

## Components

### 1. ThemeSettingsForm
Customize the visual appearance of the store.

**Fields:**
- Primary Color (color picker + hex input)
- Secondary Color (color picker + hex input)
- Font Family (dropdown with 7 options)
- Logo URL (image upload, optional)
- Favicon URL (image upload, optional)

**Example Usage:**
```tsx
import { ThemeSettingsForm } from "@/components/admin/settings";

const handleThemeSubmit = async (data: ThemeSettingsFormValues) => {
  const response = await apiRequest(
    "PUT",
    buildOrgApiUrl(userId, orgId, "/settings/theme"),
    data
  );
  // Handle success
};

<ThemeSettingsForm
  initialValues={{
    primaryColor: "#e91e63",
    secondaryColor: "#9c27b0",
    fontFamily: "Inter",
  }}
  onSubmit={handleThemeSubmit}
  isLoading={false}
/>
```

### 2. ContactSettingsForm
Manage contact information and social media links.

**Fields:**
- Email
- Phone
- Address (textarea)
- Business Hours (textarea)
- Social Media (Facebook, Instagram, Twitter, WhatsApp)

**Example Usage:**
```tsx
import { ContactSettingsForm } from "@/components/admin/settings";

const handleContactSubmit = async (data: ContactSettingsFormValues) => {
  const response = await apiRequest(
    "PUT",
    buildOrgApiUrl(userId, orgId, "/settings/contact"),
    data
  );
  // Handle success
};

<ContactSettingsForm
  initialValues={{
    email: "contact@store.com",
    phone: "+506 1234-5678",
    socialMedia: {
      instagram: "https://instagram.com/store",
    }
  }}
  onSubmit={handleContactSubmit}
  isLoading={false}
/>
```

### 3. PaymentSettingsForm
Configure payment methods and settings.

**Fields:**
- Currency (dropdown: USD, CRC, EUR, GBP, MXN, CAD)
- Stripe Enabled (toggle)
  - Stripe Publishable Key (conditional)
  - Stripe Secret Key (conditional)
- Cash on Delivery Enabled (toggle)
- Bank Transfer Enabled (toggle)
  - Bank Account Details (conditional, textarea)

**Example Usage:**
```tsx
import { PaymentSettingsForm } from "@/components/admin/settings";

const handlePaymentSubmit = async (data: PaymentSettingsFormValues) => {
  const response = await apiRequest(
    "PUT",
    buildOrgApiUrl(userId, orgId, "/settings/payment"),
    data
  );
  // Handle success
};

<PaymentSettingsForm
  initialValues={{
    currency: "CRC",
    stripeEnabled: false,
    cashOnDeliveryEnabled: true,
    bankTransferEnabled: true,
    bankAccountDetails: "Banco Nacional\nCuenta: 123-456-789",
  }}
  onSubmit={handlePaymentSubmit}
  isLoading={false}
/>
```

### 4. ShippingSettingsForm
Configure shipping costs and methods.

**Fields:**
- Default Shipping Cost (number in cents, displayed as currency)
- Free Shipping Threshold (number in cents, displayed as currency)
- Local Pickup Enabled (toggle)
- Correos Shipping Enabled (toggle)
- Uber Flash Enabled (toggle)

**Note:** All monetary values are stored in cents (e.g., 5000 = ₡50.00) but displayed and inputted as decimal values for better UX.

**Example Usage:**
```tsx
import { ShippingSettingsForm } from "@/components/admin/settings";

const handleShippingSubmit = async (data: ShippingSettingsFormValues) => {
  const response = await apiRequest(
    "PUT",
    buildOrgApiUrl(userId, orgId, "/settings/shipping"),
    data
  );
  // Handle success
};

<ShippingSettingsForm
  initialValues={{
    defaultShippingCost: 150000, // ₡1,500.00 in cents
    freeShippingThreshold: 5000000, // ₡50,000.00 in cents
    localPickupEnabled: true,
    correosShippingEnabled: true,
    uberFlashEnabled: false,
  }}
  onSubmit={handleShippingSubmit}
  isLoading={false}
/>
```

## API Endpoints

The forms are designed to work with these API endpoints:

- `PUT /api/users/:userId/organizations/:orgId/settings/theme`
- `PUT /api/users/:userId/organizations/:orgId/settings/contact`
- `PUT /api/users/:userId/organizations/:orgId/settings/payment`
- `PUT /api/users/:userId/organizations/:orgId/settings/shipping`

## Validation

All forms use:
- React Hook Form for form state management
- Zod for validation schemas
- Inline error messages via FormMessage component
- Loading states on submit buttons

## Styling

Forms follow the existing design patterns:
- Shadcn/ui components (Input, Select, Button, Switch, Textarea, Label)
- Form components for proper error handling
- Consistent spacing and layout
- Responsive design (mobile-first)
