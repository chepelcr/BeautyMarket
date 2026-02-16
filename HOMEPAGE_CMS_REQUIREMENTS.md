# Homepage CMS Requirements

## Current Issues
1. **Hardcoded Content**: Hero, benefits, testimonials, CTA sections are hardcoded in HomePage.tsx
2. **Missing Endpoints**: No API to fetch page sections and content
3. **Incomplete Seed Data**: template-seed.ts only creates basic hero section
4. **Footer Data**: Organization info is hardcoded, should come from contact settings

## Required Changes

### 1. API Endpoints Needed

#### Template Endpoints (Demo Mode)
- `GET /api/templates/:id/pages/:pageSlug` - Get page with all sections and content
- `GET /api/templates/:id/pages/:pageSlug/sections` - Get all sections for a page

#### Organization Endpoints (Prod Mode)
- `GET /api/organizations/:orgId/pages/:pageSlug` - Get page with all sections and content
- `GET /api/organizations/:orgId/pages/:pageSlug/sections` - Get all sections for a page

### 2. HomePage Sections to Make Editable

#### Hero Section
- Badge text: "New Collection Available"
- Main heading: "Discover Your Natural Beauty"
- Subheading/description
- CTA buttons (text + links)
- Stats (3 numbers with labels)
- Hero image URL

#### Benefits Section (4 items)
- Icon name
- Title
- Description

#### Featured Products Section
- Section badge text
- Section title
- Section description
- Products (already dynamic via useProducts)

#### CTA/Newsletter Section
- Icon
- Heading: "Join Our Beauty Community"
- Description
- Button text
- Subscriber count text

#### Testimonials Section
- Section title
- Section description
- Testimonials array (name, role, text, rating)

### 3. Footer Data (from Contact Settings)
- Organization name
- Email
- Phone
- Address
- Social media links (Facebook, Instagram, Twitter, WhatsApp)
- Business hours

### 4. Database Schema (Already Exists)
```
template_pages
├── id
├── template_id
├── type (home, about, custom)
├── slug
├── title
└── meta_description

template_page_sections
├── id
├── template_page_id
├── section_type (hero, benefits, testimonials, cta, etc)
├── name
├── sort_order
└── is_active

template_section_content
├── id
├── template_section_id
├── component_id
├── key
├── value
├── value_type (string, number, json, image_url)
├── display_name
└── sort_order
```

### 5. Seed Data Structure Needed

For each template, seed:
- Home page with sections:
  - Hero (badge, heading, subheading, cta_primary, cta_secondary, stats, image)
  - Benefits (4 items with icon, title, description)
  - Featured Products (badge, title, description)
  - CTA (icon, heading, description, button_text, subscriber_count)
  - Testimonials (title, description, 3 testimonials)

### 6. Implementation Steps

1. **Create Controllers**
   - `TemplateController.getPageWithSections()`
   - `OrganizationController.getPageWithSections()`

2. **Update template-seed.ts**
   - Add all homepage sections with full content
   - Make content template-specific

3. **Create useHomePage() hook**
   - Fetch page sections and content
   - Parse and structure data for components

4. **Update HomePage.tsx**
   - Replace hardcoded content with data from useHomePage()
   - Keep styling template-specific

5. **Update Footer.tsx**
   - Use useContact() hook for org info
   - Display dynamic contact data

6. **Dashboard Integration**
   - Page builder to edit sections
   - Content editor for each section
   - Preview changes

## Priority
HIGH - This blocks dashboard CMS functionality
