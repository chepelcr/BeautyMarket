# Template Gallery Components

A set of React components for browsing and selecting templates during organization creation.

## Components

### TemplateGallery

Main gallery component that displays all available templates with search and filter functionality.

**Props:**
- `onSelectTemplate: (templateId: string | null) => void` - Callback when a template is selected. `null` indicates playground/start from scratch.

**Features:**
- Fetches templates from `GET /api/templates?activeOnly=true`
- Search by template name, description, or category
- Filter by category
- Displays playground option prominently
- Responsive grid layout
- Loading and error states
- Empty states

**Example:**
```tsx
import { TemplateGallery } from "@/components/admin/templates";

<TemplateGallery
  onSelectTemplate={(templateId) => {
    if (templateId === null) {
      // User selected playground
      console.log("Starting from scratch");
    } else {
      // User selected a template
      console.log("Selected template:", templateId);
    }
  }}
/>
```

### TemplateCard

Individual template card displaying template information with preview and select actions.

**Props:**
- `template: Template` - Template object
- `onSelect: (templateId: string) => void` - Callback when select button is clicked
- `onPreview: (template: Template) => void` - Callback when preview button is clicked

**Features:**
- Shows thumbnail, name, description, category
- Category-based icon and color coding
- Hover effects with scale animation
- Preview and Select buttons
- Responsive layout

### PlaygroundCard

Special card for the "start from scratch" option with distinct styling.

**Props:**
- `onSelect: () => void` - Callback when playground is selected

**Features:**
- Gradient background with dashed border
- "Start Fresh" badge
- Icon animations on hover
- Lists playground benefits
- Stands out visually from templates

### TemplatePreview

Modal dialog showing detailed template information.

**Props:**
- `template: Template | null` - Template to preview
- `open: boolean` - Modal open state
- `onOpenChange: (open: boolean) => void` - Modal state change callback
- `onSelectTemplate: (templateId: string) => void` - Callback when template is selected

**Features:**
- Large preview image
- Full description
- Live demo link with open button
- "What's Included" feature list
- "Use This Template" action button

## Types

```typescript
interface Template {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  thumbnailUrl?: string;
  isActive: boolean;
  sortOrder: number;
}
```

## API Integration

### Get Templates (Public)
```
GET /api/templates?activeOnly=true
```

No authentication required. Returns array of active templates.

### Clone Template (Authenticated)
```
POST /api/templates/:id/clone
Content-Type: application/json
Authorization: Bearer <token>

{
  "organizationId": "org-id-here"
}
```

Clones the template's pages and content to the specified organization.

## Category Icons and Colors

The components use category-specific icons and colors:

| Category | Icon | Color |
|----------|------|-------|
| beauty | Sparkles | Pink |
| organic | Leaf | Green |
| cosmetics | Sparkles | Purple |
| haircare | Crown | Amber |
| skincare | Heart | Rose |
| nails | Star | Fuchsia |
| salon | Scissors | Violet |
| tech | Store | Blue |
| fashion | Star | Indigo |
| starter | Store | Gray |

## Usage in Organization Creation Flow

### Step 1: Add TemplateGallery to your wizard/form

```tsx
import { TemplateGallery } from "@/components/admin/templates";
import { useState } from "react";

function CreateOrganizationWizard() {
  const [templateId, setTemplateId] = useState<string | null | undefined>();

  return (
    <div>
      {/* Other form steps */}

      <TemplateGallery
        onSelectTemplate={(selectedTemplateId) => {
          setTemplateId(selectedTemplateId);
          // Proceed to next step
        }}
      />
    </div>
  );
}
```

### Step 2: Clone template after organization creation

```tsx
// Create organization first
const response = await fetch('/api/organizations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'My Store',
    slug: 'my-store',
    // ... other fields
  })
});

const organization = await response.json();

// If template was selected, clone it
if (templateId !== null && templateId !== undefined) {
  await fetch(`/api/templates/${templateId}/clone`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      organizationId: organization.id
    })
  });
}
```

## Styling

Components use:
- Shadcn/ui components (Card, Dialog, Badge, Button, Input)
- Tailwind CSS for styling
- Lucide icons
- CSS transitions for animations
- Responsive breakpoints (md, lg)

## Demo

See `/client/src/pages/TemplateGalleryDemo.tsx` for a working demonstration of all components.

## Files

```
client/src/components/admin/templates/
├── README.md                 # This file
├── types.ts                  # TypeScript interfaces
├── TemplateGallery.tsx       # Main gallery component
├── TemplateCard.tsx          # Individual template card
├── PlaygroundCard.tsx        # Playground/scratch option
├── TemplatePreview.tsx       # Preview modal dialog
└── index.ts                  # Exports
```

## Dependencies

- React 18
- @tanstack/react-query
- lucide-react
- Shadcn/ui components
- Tailwind CSS

## Future Enhancements

- [ ] Template categories as tabs instead of badges
- [ ] More detailed template previews (multiple screenshots)
- [ ] Template popularity/rating indicators
- [ ] Recently viewed templates
- [ ] Favorite/bookmark templates
- [ ] Template comparison feature
- [ ] Video previews for templates
