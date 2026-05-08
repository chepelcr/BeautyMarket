// Centralized POS design tokens — import this instead of duplicating the object.
export const POS = {
  bg:          "hsl(var(--background))",
  surface:     "hsl(var(--card))",
  card:        "hsl(var(--muted) / 0.4)",
  border:      "hsl(var(--border))",
  rose:        "#D4A874",
  roseLight:   "rgba(212,168,116,0.15)",
  roseDim:     "rgba(212,168,116,0.08)",
  roseBorder:  "rgba(212,168,116,0.2)",
  text:        "hsl(var(--foreground))",
  muted:       "hsl(var(--muted-foreground))",
  success:     "#32D74B",
  info:        "#64D2FF",
  fontDisplay: "'Cormorant Garamond', Georgia, serif",
  fontUI:      "'DM Sans', 'Barlow', system-ui, sans-serif",
} as const;
