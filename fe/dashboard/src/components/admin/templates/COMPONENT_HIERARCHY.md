# Template Gallery Component Hierarchy

## Visual Component Tree

```
┌─────────────────────────────────────────────────────────────────┐
│                      TemplateGallery                            │
│  Props: onSelectTemplate(templateId: string | null) => void    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   ┌─────────┐         ┌──────────┐         ┌──────────┐
   │ Header  │         │  Filters │         │   Grid   │
   │ Section │         │  Section │         │  Section │
   └─────────┘         └──────────┘         └──────────┘
        │                     │                     │
        ▼                     │                     │
   - Title                    │                     │
   - Description              │                     │
                              │                     │
                              ▼                     │
                         ┌─────────┐               │
                         │ Search  │               │
                         │  Input  │               │
                         └─────────┘               │
                              │                     │
                              ▼                     │
                         ┌─────────┐               │
                         │Category │               │
                         │ Badges  │               │
                         └─────────┘               │
                              │                     │
                              ▼                     │
                         ┌─────────┐               │
                         │ Active  │               │
                         │ Filters │               │
                         └─────────┘               │
                                                    │
                                                    ▼
                            ┌────────────────────────────────────┐
                            │         Grid Container             │
                            │  (md:2 columns, lg:3 columns)     │
                            └────────────────────────────────────┘
                                                    │
                    ┌───────────────────────────────┼────────────┐
                    │                               │            │
                    ▼                               ▼            ▼
            ┌───────────────┐             ┌─────────────┐   ┌─────────────┐
            │ PlaygroundCard│             │TemplateCard │···│TemplateCard │
            │               │             │             │   │             │
            └───────────────┘             └─────────────┘   └─────────────┘
                    │                               │
                    │                               │
                    ▼                               ▼
            onClick={() =>              ┌──────────┴──────────┐
            onSelectTemplate(null)      │                     │
                                         ▼                     ▼
                                  onPreview(template)  onSelect(templateId)
                                         │                     │
                                         ▼                     │
                                ┌─────────────────┐           │
                                │ TemplatePreview │           │
                                │     (Modal)     │           │
                                └─────────────────┘           │
                                         │                     │
                                         ├─────────────────────┘
                                         │
                                         ▼
                                onSelectTemplate(templateId)
```

## Component Interaction Flow

### 1. Initial Load
```
User navigates to page
    ↓
TemplateGallery mounts
    ↓
useQuery fetches GET /api/templates?activeOnly=true
    ↓
Loading state displays
    ↓
Data arrives
    ↓
Renders grid with PlaygroundCard + TemplateCards
```

### 2. Search Flow
```
User types in search input
    ↓
searchQuery state updates
    ↓
useMemo recalculates filteredTemplates
    ↓
Grid re-renders with filtered results
    ↓
Shows "Showing X templates" indicator
```

### 3. Category Filter Flow
```
User clicks category badge
    ↓
selectedCategory state updates
    ↓
Badge visual state changes (default vs outline)
    ↓
useMemo recalculates filteredTemplates
    ↓
Grid re-renders with filtered results
```

### 4. Template Selection Flow
```
User clicks "Select Template" button on TemplateCard
    ↓
onSelect(templateId) called
    ↓
TemplateGallery.handleSelectTemplate(templateId) called
    ↓
onSelectTemplate prop callback fired
    ↓
Parent component receives templateId
    ↓
Parent updates form state / proceeds to next step
```

### 5. Playground Selection Flow
```
User clicks "Start from Scratch" on PlaygroundCard
    ↓
onSelect() called
    ↓
TemplateGallery.handleSelectPlayground() called
    ↓
onSelectTemplate(null) prop callback fired
    ↓
Parent component receives null
    ↓
Parent updates form state / proceeds to next step
```

### 6. Preview Flow
```
User clicks "Preview" button on TemplateCard
    ↓
onPreview(template) called
    ↓
TemplateGallery.handlePreview(template) called
    ↓
previewTemplate state set to template object
    ↓
isPreviewOpen state set to true
    ↓
TemplatePreview modal opens
    ↓
User can:
  - View details
  - Open live demo (external link)
  - Click "Use This Template" → triggers selection
  - Click "Cancel" → closes modal
```

## State Management

### TemplateGallery State
```tsx
const [searchQuery, setSearchQuery] = useState("");
  // User's search input

const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Currently active category filter

const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  // Template being previewed

const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  // Preview modal open/closed state
```

### React Query State
```tsx
const { data: templates, isLoading, isError, error } = useQuery<Template[]>({
  queryKey: [`${API_BASE_URL}/api/templates?activeOnly=true`],
});
  // Server state managed by React Query
  // - templates: Array of template objects
  // - isLoading: Boolean loading indicator
  // - isError: Boolean error indicator
  // - error: Error object if fetch failed
```

### Derived State (useMemo)
```tsx
const categories = useMemo(() => {
  // Extract unique categories from templates
  // Sorted alphabetically
}, [templates]);

const filteredTemplates = useMemo(() => {
  // Filter templates by:
  //   1. selectedCategory (if set)
  //   2. searchQuery (if set)
  // Sort by sortOrder
}, [templates, selectedCategory, searchQuery]);
```

## Props Interface

### TemplateGallery
```tsx
interface TemplateGalleryProps {
  onSelectTemplate: (templateId: string | null) => void;
  // Called when user selects a template or playground
  // null = playground, string = template ID
}
```

### TemplateCard
```tsx
interface TemplateCardProps {
  template: Template;
  // Template object to display

  onSelect: (templateId: string) => void;
  // Called when "Select Template" is clicked

  onPreview: (template: Template) => void;
  // Called when "Preview" is clicked
}
```

### PlaygroundCard
```tsx
interface PlaygroundCardProps {
  onSelect: () => void;
  // Called when "Start from Scratch" is clicked
}
```

### TemplatePreview
```tsx
interface TemplatePreviewProps {
  template: Template | null;
  // Template to preview (null if none)

  open: boolean;
  // Modal open state

  onOpenChange: (open: boolean) => void;
  // Called when modal state changes

  onSelectTemplate: (templateId: string) => void;
  // Called when "Use This Template" is clicked
}
```

## Data Flow

### 1. From API to Display
```
API Response (GET /api/templates?activeOnly=true)
    ↓
React Query Cache
    ↓
templates state
    ↓
filteredTemplates (useMemo)
    ↓
TemplateCard components (map)
    ↓
Rendered UI
```

### 2. From User Action to Parent
```
User clicks button
    ↓
Event handler in child component
    ↓
Callback prop fired
    ↓
Parent component event handler
    ↓
Parent state update
    ↓
Application logic continues
```

## Conditional Rendering Logic

### Grid Display
```tsx
{!isLoading && !isError && (
  filteredTemplates.length === 0 && !searchQuery && !selectedCategory ? (
    <EmptyStateNoTemplates />
  ) : filteredTemplates.length === 0 ? (
    <EmptyStateNoResults />
  ) : (
    <Grid>
      {/* Show playground only if no filters active */}
      {!searchQuery && !selectedCategory && <PlaygroundCard />}

      {/* Show filtered templates */}
      {filteredTemplates.map(template => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </Grid>
  )
)}
```

### Loading State
```tsx
{isLoading && <LoadingSpinner />}
```

### Error State
```tsx
{isError && <ErrorMessage error={error} />}
```

## Event Handlers

### TemplateGallery
```tsx
handleSelectTemplate(templateId: string)
  → onSelectTemplate(templateId)

handleSelectPlayground()
  → onSelectTemplate(null)

handlePreview(template: Template)
  → setPreviewTemplate(template)
  → setIsPreviewOpen(true)

handleClearFilters()
  → setSearchQuery("")
  → setSelectedCategory(null)
```

### TemplateCard
```tsx
onClick (Select button)
  → onSelect(template.id)

onClick (Preview button)
  → onPreview(template)
```

### PlaygroundCard
```tsx
onClick (Start from Scratch button)
  → onSelect()
```

### TemplatePreview
```tsx
onClick (Use This Template button)
  → onSelectTemplate(template.id)
  → onOpenChange(false)

onClick (Cancel button)
  → onOpenChange(false)

onClick (View Demo button)
  → window.open(demoUrl, '_blank')
```

## CSS Classes & Styling

### Layout Classes
- `grid md:grid-cols-2 lg:grid-cols-3 gap-6` - Responsive grid
- `space-y-6` - Vertical spacing between sections
- `flex flex-col sm:flex-row gap-4` - Responsive flex layout

### Component Classes
- `transition-all duration-300` - Smooth transitions
- `hover:shadow-xl hover:scale-[1.02]` - Hover effects
- `group-hover:scale-110` - Nested hover effects
- `line-clamp-3` - Text truncation

### Color Classes
- `bg-primary/10 text-primary-700` - Category-specific colors
- `bg-gradient-to-br from-primary/5 to-secondary/5` - Playground gradient
- `border-2 border-dashed border-primary/50` - Playground border

## Performance Optimizations

1. **useMemo for filtering**: Prevents unnecessary recalculations
2. **React Query caching**: Reduces API calls
3. **Lazy image loading**: Images load on-demand
4. **Component memoization**: Child components can be memoized if needed
5. **Debouncing search**: Can be added if search becomes slow

## Accessibility Features

1. **Keyboard Navigation**: All buttons are keyboard accessible
2. **ARIA Labels**: Proper labeling on interactive elements
3. **Focus Management**: Modal traps focus when open
4. **Screen Reader Support**: Semantic HTML structure
5. **Alt Text**: All images have alt attributes

## Testing Hooks

### Data-testid Attributes (can be added)
```tsx
data-testid="template-gallery"
data-testid="template-card-{id}"
data-testid="playground-card"
data-testid="template-preview-modal"
data-testid="search-input"
data-testid="category-filter-{category}"
```

### Query Hooks for Testing
```tsx
screen.getByRole('button', { name: /select template/i })
screen.getByRole('textbox', { name: /search/i })
screen.getByRole('dialog')
screen.getByText('Playground')
```

---

This hierarchy document provides a complete visual and logical map of how the Template Gallery components work together.
