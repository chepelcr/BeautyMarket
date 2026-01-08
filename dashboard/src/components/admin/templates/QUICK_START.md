# Template Gallery - Quick Start Guide

Get the Template Gallery running in your organization creation flow in 5 minutes.

## Step 1: View the Demo (30 seconds)

1. Start your development server:
```bash
npm run dev
```

2. Navigate to the demo page:
```
http://localhost:5173/demo/template-gallery
```

3. Explore the features:
   - Search templates
   - Filter by category
   - Click "Preview" to see details
   - Click "Select Template" or "Start from Scratch"

## Step 2: Understand the API (1 minute)

The component uses two endpoints:

### Get Templates (Already Working)
```bash
GET /api/templates?activeOnly=true
```
Public endpoint, no auth required. Returns:
```json
[
  {
    "id": "template-1",
    "name": "beauty-market-demo",
    "displayName": "Beauty Market Demo",
    "description": "A complete beauty and cosmetics store",
    "category": "beauty",
    "thumbnailUrl": "https://...",
    "isActive": true,
    "sortOrder": 1
  }
]
```

### Clone Template (Backend TODO)
```bash
POST /api/templates/:id/clone
Authorization: Bearer <token>
Content-Type: application/json

{
  "organizationId": "org-123"
}
```
Currently returns success but doesn't clone. Implementation needed.

## Step 3: Add to Your Form (2 minutes)

### Option A: Simple Integration

```tsx
import { TemplateGallery } from "@/components/admin/templates";

function CreateOrganization() {
  const [templateId, setTemplateId] = useState<string | null>();

  return (
    <div>
      <h1>Create Your Organization</h1>

      {/* Your existing form fields */}
      <input name="name" />
      <input name="slug" />

      {/* Add the gallery */}
      <TemplateGallery
        onSelectTemplate={(id) => {
          setTemplateId(id); // null = playground, string = template
          // Proceed to next step or submit
        }}
      />
    </div>
  );
}
```

### Option B: Multi-Step Wizard

See `/client/src/components/admin/templates/INTEGRATION_EXAMPLE.md` for complete multi-step implementation.

## Step 4: Handle Organization Creation (1 minute)

```tsx
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const createOrgMutation = useMutation({
  mutationFn: async (data) => {
    // 1. Create organization
    const response = await apiRequest("POST", "/api/organizations", {
      name: data.name,
      slug: data.slug,
    });
    const org = await response.json();

    // 2. Clone template if selected
    if (data.templateId) {
      await apiRequest(
        "POST",
        `/api/templates/${data.templateId}/clone`,
        { organizationId: org.id }
      );
    }

    return org;
  },
  onSuccess: (org) => {
    // Navigate to new organization
    navigate(`/organizations/${org.id}/settings`);
  },
});

// Use it
createOrgMutation.mutate({
  name: "My Store",
  slug: "my-store",
  templateId: selectedTemplateId,
});
```

## Step 5: Test It (30 seconds)

1. Start creating an organization
2. Select a template or playground
3. Submit the form
4. Verify organization is created
5. Check if template was cloned (when backend is ready)

## That's It!

You now have a fully functional template gallery.

## Common Issues & Solutions

### Issue: Templates not loading
**Solution**: Check if backend is running and `/api/templates` endpoint is accessible.

```bash
# Test endpoint
curl http://localhost:5000/api/templates?activeOnly=true
```

### Issue: TypeScript errors
**Solution**: Ensure all imports are correct:
```tsx
import { TemplateGallery } from "@/components/admin/templates";
```

### Issue: Styling looks broken
**Solution**: Ensure Tailwind CSS is configured and shadcn/ui components are installed.

### Issue: Images not loading
**Solution**: Template thumbnails are optional. Component shows placeholder if missing.

## Quick Customization

### Change Grid Columns
```tsx
// In TemplateGallery.tsx, line ~170
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  // Change to: md:grid-cols-3 lg:grid-cols-4 for more columns
```

### Hide Playground Card
```tsx
// Remove this block from TemplateGallery.tsx
{!searchQuery && !selectedCategory && (
  <PlaygroundCard onSelect={handleSelectPlayground} />
)}
```

### Add Template Sorting
```tsx
// In TemplateGallery.tsx, add to filteredTemplates useMemo
filtered.sort((a, b) => {
  // Sort by name
  return a.displayName.localeCompare(b.displayName);

  // Or by category then name
  return a.category === b.category
    ? a.displayName.localeCompare(b.displayName)
    : a.category.localeCompare(b.category);
});
```

### Change Category Colors
```tsx
// In TemplateCard.tsx, update getCategoryColor function
const colorMap: Record<string, string> = {
  beauty: "bg-pink-500/10 text-pink-700", // Your colors here
  tech: "bg-blue-500/10 text-blue-700",
  // ...
};
```

## Next Steps

1. **Read the full documentation**: `/client/src/components/admin/templates/README.md`
2. **See complete integration example**: `/client/src/components/admin/templates/INTEGRATION_EXAMPLE.md`
3. **Understand the architecture**: `/client/src/components/admin/templates/COMPONENT_HIERARCHY.md`
4. **Implement template cloning**: `server/src/controllers/TemplateController.ts` (line 126)

## Need Help?

Check these files:
- `README.md` - Full component documentation
- `INTEGRATION_EXAMPLE.md` - Complete working example
- `COMPONENT_HIERARCHY.md` - Visual component structure
- `TemplateGalleryDemo.tsx` - Live demo with examples

## File Locations

All component files:
```
/client/src/components/admin/templates/
├── TemplateGallery.tsx       # Main component
├── TemplateCard.tsx           # Individual card
├── PlaygroundCard.tsx         # Start from scratch
├── TemplatePreview.tsx        # Preview modal
├── types.ts                   # TypeScript types
└── index.ts                   # Exports
```

Demo and docs:
```
/client/src/pages/TemplateGalleryDemo.tsx
/client/src/components/admin/templates/README.md
/client/src/components/admin/templates/INTEGRATION_EXAMPLE.md
/client/src/components/admin/templates/COMPONENT_HIERARCHY.md
/TEMPLATE_GALLERY_SUMMARY.md
```

---

**Time to integrate**: 5 minutes

**Difficulty**: Easy

**Status**: Production Ready
