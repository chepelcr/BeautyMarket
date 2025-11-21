# Component Patterns Guide

Common UI patterns using the new color token system.

---

## Button Patterns

### Primary Button
```jsx
<Button className="btn-primary">Click Me</Button>
// CSS: bg-primary hover:bg-primary/90 text-primary-foreground
```

### Secondary Button
```jsx
<Button className="btn-secondary">Secondary</Button>
// CSS: bg-secondary hover:bg-secondary/90 text-secondary-foreground
```

### Outline Button
```jsx
<Button className="btn-outline">Outline</Button>
// CSS: border border-primary text-primary hover:bg-primary/10
```

### Ghost Button
```jsx
<Button className="btn-ghost">Ghost</Button>
// CSS: hover:bg-accent/10 text-foreground
```

### Link Button
```jsx
<Button variant="link" className="text-primary">Link</Button>
// CSS: text-primary underline
```

---

## Card Patterns

### Primary Card (with Blue Border)
```jsx
<Card className="card-primary">
  <CardContent>Content here</CardContent>
</Card>
// CSS: border border-primary/20 hover:border-primary/40
```

### Accent Card (with Lime Border)
```jsx
<Card className="card-accent">
  <CardContent>Content here</CardContent>
</Card>
// CSS: border border-accent/20 hover:border-accent/40
```

### Subtle Card
```jsx
<Card className="card-subtle">
  <CardContent>Content here</CardContent>
</Card>
// CSS: bg-muted/30 border border-border
```

### Highlighted Card
```jsx
<Card className="border-2 border-primary">
  <CardContent>Featured</CardContent>
</Card>
// CSS: border-2 border-primary (thick primary border)
```

---

## Background Patterns

### Light Primary Background
```jsx
<div className="bg-primary-light p-4">
  Subtle blue background
</div>
// CSS: bg-primary/10 dark:bg-primary/20
```

### Light Accent Background
```jsx
<div className="bg-accent-light p-4">
  Subtle lime background
</div>
// CSS: bg-accent/10 dark:bg-accent/20
```

### Gradient Background (Hero Section)
```jsx
<section className="bg-gradient-to-br from-primary/10 via-background to-primary/20">
  Hero content
</section>
// CSS: Gradient from blue to transparent
```

### Gradient with Primary-Accent
```jsx
<section className="bg-gradient-to-r from-primary to-secondary">
  CTA content
</section>
// CSS: Gradient from blue to lime
```

---

## Text Patterns

### Primary Text
```jsx
<p className="text-primary">Important text</p>
// CSS: color: blue
```

### Secondary/Accent Text
```jsx
<p className="text-secondary">Accent text</p>
// CSS: color: lime
```

### Muted Text
```jsx
<p className="text-muted-foreground">Helper text</p>
// CSS: color: gray
```

### Text with Opacity
```jsx
<p className="text-primary/70">Less prominent</p>
// CSS: color: blue with 70% opacity
```

---

## Border Patterns

### Primary Border
```jsx
<div className="border-2 border-primary">
  Featured element
</div>
// CSS: 2px solid blue border
```

### Subtle Primary Border
```jsx
<div className="border border-primary/20">
  Subtle blue border
</div>
// CSS: 1px solid blue with 20% opacity
```

### Accent Border on Hover
```jsx
<div className="border border-primary/20 hover:border-primary/40">
  Interactive element
</div>
// CSS: Border becomes darker on hover
```

### Bottom Border (Divider)
```jsx
<div className="border-b border-border">
  Content with divider
</div>
// CSS: Subtle bottom border
```

---

## Icon Patterns

### Colored Icon
```jsx
<Icon className="icon-primary" />
// CSS: text-primary (blue)
```

### Icon with Background
```jsx
<div className="p-3 bg-primary/10 rounded-lg">
  <Icon className="text-primary" />
</div>
// CSS: Blue icon on light blue background
```

### Accent Icon
```jsx
<Icon className="icon-accent" />
// CSS: text-accent (lime)
```

### Muted Icon
```jsx
<Icon className="icon-muted" />
// CSS: text-muted-foreground (gray)
```

---

## Input/Form Patterns

### Focus Ring (Primary)
```jsx
<input className="focus-primary" />
// CSS: focus:ring-2 focus:ring-primary focus:ring-offset-2
```

### Focus Ring (Accent)
```jsx
<input className="focus-accent" />
// CSS: focus:ring-2 focus:ring-accent focus:ring-offset-2
```

### Input with Label
```jsx
<FormField>
  <FormLabel className="text-foreground">Label</FormLabel>
  <FormControl>
    <Input className="border-border focus-primary" />
  </FormControl>
</FormField>
```

---

## Badge Patterns

### Primary Badge
```jsx
<Badge className="bg-primary">New</Badge>
// CSS: Blue background, white text
```

### Secondary Badge
```jsx
<Badge className="bg-secondary">Promo</Badge>
// CSS: Lime background, white text
```

### Outline Badge
```jsx
<Badge variant="outline">Tag</Badge>
// CSS: Transparent, border, colored text
```

---

## Progress/Status Patterns

### Progress Steps (Registration)
```jsx
<div>
  <div className="bg-primary w-full h-2 rounded-full" style={{width: '50%'}} />
</div>
// CSS: Blue progress bar at 50%
```

### Status Indicator (Active)
```jsx
<div className="w-3 h-3 bg-primary rounded-full" />
// CSS: Blue dot for active status
```

### Status Indicator (Completed)
```jsx
<div className="w-3 h-3 bg-secondary rounded-full" />
// CSS: Lime dot for completed status
```

### Status Indicator (Inactive)
```jsx
<div className="w-3 h-3 bg-muted rounded-full" />
// CSS: Gray dot for inactive status
```

---

## Section Patterns

### Hero Section
```jsx
<section className="bg-gradient-to-br from-primary/10 via-background to-primary/20 dark:from-slate-900">
  <Container>
    <h1>Hero Content</h1>
  </Container>
</section>
```

### Feature Section
```jsx
<section className="bg-background dark:bg-slate-800 py-20">
  <Container>
    <h2>Features</h2>
    {/* Feature cards */}
  </Container>
</section>
```

### CTA Section
```jsx
<section className="bg-gradient-to-r from-primary to-secondary py-20">
  <Container>
    <h2 className="text-white">Call to Action</h2>
    <Button className="bg-white text-primary hover:bg-primary-foreground">
      CTA Button
    </Button>
  </Container>
</section>
```

### Footer Section
```jsx
<footer className="bg-background dark:bg-slate-800 border-t border-border py-10">
  <Container>
    {/* Footer content */}
  </Container>
</footer>
```

---

## Dark Mode Patterns

### Auto-adapting Element
```jsx
<div className="bg-card dark:bg-slate-800 text-foreground">
  Content auto-adapts to dark mode
</div>
// CSS: Auto-switches colors based on .dark class
```

### Dark Mode Specific Color
```jsx
<div className="bg-blue-100 dark:bg-blue-900">
  Different colors in light vs dark
</div>
```

### Only in Dark Mode
```jsx
<div className="dark:bg-slate-800">
  Only visible background in dark mode
</div>
```

### Dark Mode with Opacity
```jsx
<div className="bg-primary/10 dark:bg-primary/30">
  More visible in dark mode
</div>
```

---

## Accessibility Patterns

### Sufficient Contrast
```jsx
// Good contrast combinations:
<div className="bg-primary text-primary-foreground">✓ Good</div>
<div className="bg-card text-foreground">✓ Good</div>
<div className="bg-primary/10 text-primary">⚠ Low contrast</div>

// Don't use:
<div className="bg-primary/5 text-primary">✗ Too light</div>
```

### Focus Indicators
```jsx
// Always include focus state
<button className="focus-primary">
  Keyboard accessible
</button>

// Or manually:
<button className="focus:outline-none focus:ring-2 focus:ring-primary">
  Manually styled focus
</button>
```

### Color Not Only
```jsx
// Don't rely solely on color to convey meaning:
<div className="text-primary">Required field</div>

// Better:
<div className="flex items-center gap-2">
  <span className="text-destructive">*</span>
  <label>Required field</label>
</div>
```

---

## Real World Examples

### Login Form
```jsx
<Card className="bg-card dark:bg-slate-800">
  <CardHeader>
    <CardTitle>Login</CardTitle>
  </CardHeader>
  <CardContent>
    <Form>
      <Input placeholder="Email" />
      <Input type="password" placeholder="Password" />
      <Button className="btn-primary w-full">Sign In</Button>
    </Form>
    <Button variant="link" className="text-primary mt-2">
      Forgot password?
    </Button>
  </CardContent>
</Card>
```

### Feature Card
```jsx
<Card className="card-primary">
  <CardContent className="pt-6">
    <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
      <Icon className="text-primary" />
    </div>
    <h3 className="font-semibold mb-2">Feature Name</h3>
    <p className="text-muted-foreground">Description</p>
  </CardContent>
</Card>
```

### Pricing Card (Highlighted)
```jsx
<Card className="border-2 border-primary">
  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
    <Badge className="bg-primary">Popular</Badge>
  </div>
  <CardHeader>
    <CardTitle>Pro Plan</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Pricing details */}
    <Button className="btn-primary w-full">Choose Plan</Button>
  </CardContent>
</Card>
```

### CTA Button Group
```jsx
<div className="flex gap-4">
  <Button className="btn-primary">Primary Action</Button>
  <Button className="btn-outline">Secondary Action</Button>
</div>
```

---

## Testing Checklist

- [ ] Light mode shows correct colors
- [ ] Dark mode shows correct colors
- [ ] Hover states work on interactive elements
- [ ] Focus rings visible on keyboard navigation
- [ ] Color contrast passes WCAG AA standards
- [ ] Gradients render smoothly
- [ ] Opacity variations look correct
- [ ] SVG colors inherit properly
- [ ] Badge colors match design
- [ ] Button states clear (normal, hover, active, disabled)

---

## See Also

- [COLOR_TOKENS.md](./COLOR_TOKENS.md) - Token definitions
- [AI_AGENT_COLORS.md](./AI_AGENT_COLORS.md) - Systematic migration guide
