# AI Agent Color Migration Guide

Systematic instructions for refactoring remaining landing page components to use the new blue + lime color token system.

---

## Executive Summary

**Status:** Color token system is fully implemented. Need to systematically refactor 8 remaining files to migrate from hardcoded `pink-*` Tailwind classes to new token system.

**Progress:**
- ✅ CSS variables created (landing-client/src/index.css)
- ✅ Tailwind config updated (landing-client/tailwind.config.js)
- ✅ Custom utility classes created
- ✅ Landing.tsx refactored
- ✅ Login.tsx refactored
- ⏳ 8 files remaining

---

## Files Requiring Refactoring

### Priority 1: Core Landing Pages (4 files)

1. **Register.tsx** - Multi-step registration form
   - Estimated changes: 5-7 replacements
   - Complexity: Medium

2. **ForgotPassword.tsx** - Password recovery form
   - Estimated changes: 4-5 replacements
   - Complexity: Low

3. **Examples.tsx** - Store examples showcase
   - Estimated changes: 6-8 replacements
   - Complexity: Medium

4. **client/src/pages/Landing.tsx** - Old landing page
   - Estimated changes: 15-20 replacements
   - Complexity: Medium

### Priority 2: Shared Components (3 files)

5. **components/landing-navbar.tsx** - Navigation bar
   - Estimated changes: 8-10 replacements
   - Complexity: Medium

6. **components/landing-footer.tsx** - Footer
   - Estimated changes: 10-12 replacements
   - Complexity: Low

7. **components/language-switcher.tsx** - Language dropdown
   - Estimated changes: 2-3 replacements
   - Complexity: Low

### Priority 3: UI Components (1 file)

8. **components/ui/progress-steps.tsx** - Registration progress indicator
   - Estimated changes: 5-6 replacements
   - Complexity: Low-Medium

**Total Estimated Replacements:** 55-75 changes across 8 files

---

## Systematic Refactoring Process

### Step 1: Read File
```bash
Read the file completely to understand structure and all pink color references
```

### Step 2: Identify All Color References
Create a mapping of all colors found:
```
Colors found in [filename]:
- bg-pink-50        (3 occurrences)
- bg-pink-100       (1 occurrence)
- bg-pink-500       (4 occurrences)
- text-pink-500     (2 occurrences)
- border-pink-500   (1 occurrence)
```

### Step 3: Apply Token Replacements

#### Gradient Backgrounds
```diff
- bg-gradient-to-br from-pink-50 to-pink-100
+ bg-gradient-to-br from-primary/10 to-primary/20

- dark:from-gray-900 dark:to-gray-800
+ dark:from-slate-900 dark:to-slate-800
```

#### Primary Buttons
```diff
- className="bg-pink-500 hover:bg-pink-600"
+ className="btn-primary"

- className="bg-pink-500 hover:bg-pink-600 text-white"
+ className="btn-primary"
```

#### Links/Text
```diff
- className="text-pink-500"
+ className="text-primary"

- className="hover:text-pink-500"
+ className="hover:text-primary"
```

#### Borders
```diff
- className="border-pink-500"
+ className="border-primary"

- className="border-pink-500 border-2"
+ className="border-primary border-2"
```

#### Icon Backgrounds
```diff
- className="bg-pink-100 dark:bg-pink-500/20 rounded-lg"
+ className="bg-primary/10 dark:bg-primary/20 rounded-lg"

- className="text-pink-500"
+ className="text-primary"
```

#### Badge Colors
```diff
- className="bg-pink-500"
+ className="bg-primary"
```

#### Card Backgrounds
```diff
- className="bg-white dark:bg-gray-700"
+ className="bg-card dark:bg-slate-700"

- className="bg-white dark:bg-gray-800"
+ className="bg-card dark:bg-slate-800"
```

#### Featured/Highlighted Cards
```diff
- className="ring-2 ring-pink-500"
+ className="ring-2 ring-primary"
```

#### Focus States
```diff
- className="focus:outline-none focus:ring-2 focus:ring-pink-500"
+ className="focus-primary"
```

#### Gradient CTA Sections
```diff
- className="bg-gradient-to-r from-pink-500 to-pink-600"
+ className="bg-gradient-to-r from-primary to-secondary"
```

#### Progress Indicators
```diff
- className="bg-pink-500"
+ className="bg-primary"
```

#### Hover States
```diff
- className="hover:bg-pink-50"
+ className="hover:bg-primary/5"

- className="hover:bg-pink-500/20"
+ className="hover:bg-primary/20"
```

### Step 4: Handle Special Cases

#### SVG Fill Colors
```diff
- fill="rgba(233, 30, 99, 0.05)"
+ fill="hsl(var(--primary) / 0.05)"

- fill="rgba(248, 187, 217, 0.1)"
+ fill="hsl(var(--primary) / 0.1)"
```

#### Conditional Classes
```jsx
// Before
className={`border-2 ${store.featured ? 'ring-2 ring-pink-500' : ''}`}

// After
className={`border-2 ${store.featured ? 'ring-2 ring-primary' : ''}`}
```

#### Complex Gradients
```jsx
// Before
className="from-pink-50 via-white to-pink-50"

// After
className="from-primary/10 via-background to-primary/10"
```

### Step 5: Verify & Commit

After each file refactoring:
1. Verify all pink references replaced
2. Check dark mode compatibility
3. Ensure gradients look correct
4. Test button interactions
5. Validate form inputs

---

## File-by-File Migration Plan

### File 1: Register.tsx

**Location:** `landing-client/src/pages/Register.tsx`

**Primary Changes:**
```
Line ~30: bg-gradient-to-br from-pink-50 to-pink-100 → from-primary/10 to-primary/20
Line ~31: dark:from-gray-900 dark:to-gray-800 → dark:from-slate-900 dark:to-slate-800
Line ~90: bg-pink-500 hover:bg-pink-600 → btn-primary
Line ~95: bg-pink-500 hover:bg-pink-600 → btn-primary
Line ~130: text-pink-500 → text-primary
```

**Expected Result:** Multi-step registration form using primary blue token

---

### File 2: ForgotPassword.tsx

**Location:** `landing-client/src/pages/ForgotPassword.tsx`

**Primary Changes:**
```
Line ~20: bg-gradient-to-br from-pink-50 to-pink-100 → from-primary/10 to-primary/20
Line ~21: dark:from-gray-900 dark:to-gray-800 → dark:from-slate-900 dark:to-slate-800
Line ~60: bg-pink-500 hover:bg-pink-600 → btn-primary
Line ~80: text-pink-500 → text-primary
Line ~140: bg-pink-500 hover:bg-pink-600 → btn-primary
```

**Expected Result:** Password recovery form with consistent styling

---

### File 3: Examples.tsx

**Location:** `landing-client/src/pages/Examples.tsx`

**Primary Changes:**
```
Line ~45: bg-pink-500 hover:bg-pink-600 → btn-primary
Line ~65: ring-2 ring-pink-500 → ring-2 ring-primary
Line ~75: bg-pink-500 → bg-primary (Badge)
Line ~85: bg-pink-100 dark:bg-pink-500/20 → bg-primary/10 dark:bg-primary/20
Line ~86: text-pink-500 → text-primary
Line ~120: bg-white dark:bg-gray-700 → bg-card dark:bg-slate-700
```

**Expected Result:** Store examples with consistent blue accent

---

### File 4: client/src/pages/Landing.tsx

**Location:** `client/src/pages/Landing.tsx`

**Note:** This is the old landing page (duplicate of main Landing.tsx in landing-client)

**Primary Changes:** Same as Landing.tsx refactored earlier (~20+ changes)

**Expected Result:** Consistency between old and new landing pages

---

### File 5: landing-navbar.tsx

**Location:** `landing-client/src/components/landing-navbar.tsx`

**Primary Changes:**
```
Line ~15: text-pink-500 → text-primary (Store icon)
Line ~45: hover:text-pink-500 → hover:text-primary
Line ~50: hover:text-pink-500 → hover:text-primary
Line ~55: hover:text-pink-500 → hover:text-primary
Line ~75: bg-pink-500 hover:bg-pink-600 → btn-primary
Line ~120: bg-pink-500 hover:bg-pink-600 → btn-primary
```

**Expected Result:** Navigation with consistent primary blue accent

---

### File 6: landing-footer.tsx

**Location:** `landing-client/src/components/landing-footer.tsx`

**Primary Changes:**
```
Line ~20: text-pink-500 → text-primary (Store icon)
Line ~35: hover:text-pink-500 → hover:text-primary (10+ occurrences)
```

**Expected Result:** Footer links highlight in primary blue

---

### File 7: language-switcher.tsx

**Location:** `landing-client/src/components/language-switcher.tsx`

**Primary Changes:**
```
Line ~25: hover:bg-pink-50 dark:hover:bg-pink-500/20 → hover:bg-primary/5 dark:hover:bg-primary/20
Line ~26: bg-pink-100 dark:bg-pink-500/30 → bg-primary/10 dark:bg-primary/20
Line ~26: text-pink-600 dark:text-pink-400 → text-primary
```

**Expected Result:** Language switcher with subtle primary hover states

---

### File 8: progress-steps.tsx

**Location:** `landing-client/src/components/ui/progress-steps.tsx`

**Primary Changes:**
```
Line ~40: bg-pink-500 border-pink-500 → bg-primary border-primary
Line ~45: border-pink-500 text-pink-500 bg-pink-50 → border-primary text-primary bg-primary/10
Line ~46: dark:bg-pink-600/40 → dark:bg-primary/40
Line ~50: text-pink-500 → text-primary
Line ~55: text-pink-500 → text-primary
Line ~60: bg-pink-500 → bg-primary
```

**Expected Result:** Progress indicator circles use primary blue

---

## Quick Reference: Search/Replace Patterns

Use these patterns in IDE Find/Replace to speed up migration:

### Find/Replace 1: Primary Button Background
```
Find: bg-pink-500 hover:bg-pink-600
Replace: btn-primary
```

### Find/Replace 2: Gradient Backgrounds
```
Find: from-pink-50 to-pink-100
Replace: from-primary/10 to-primary/20
```

### Find/Replace 3: Text Color
```
Find: text-pink-500
Replace: text-primary
```

### Find/Replace 4: Border Color
```
Find: border-pink-500
Replace: border-primary
```

### Find/Replace 5: Icon Background
```
Find: bg-pink-100 dark:bg-pink-500/20
Replace: bg-primary/10 dark:bg-primary/20
```

### Find/Replace 6: Card Dark Background
```
Find: dark:bg-gray-700
Replace: dark:bg-slate-700
```

### Find/Replace 7: Dark Gradient
```
Find: dark:from-gray-900 dark:to-gray-800
Replace: dark:from-slate-900 dark:to-slate-800
```

---

## Validation Checklist

After refactoring each file, verify:

- [ ] All `pink-*` color classes replaced
- [ ] No hardcoded hex colors like `#ec4899`
- [ ] Dark mode classes use `slate-*` not `gray-*`
- [ ] Button classes use `.btn-primary` or equivalent
- [ ] Gradients use `from-primary/10` and `to-primary/20`
- [ ] Text links use `text-primary`
- [ ] All gradient sections updated
- [ ] SVG fill colors use `hsl(var(--primary))`
- [ ] Focus rings use new token system
- [ ] Badge colors updated to `bg-primary`

---

## Testing After Each File

1. **Light Mode Check:**
   - All blue accents visible
   - White backgrounds clear
   - Text readable

2. **Dark Mode Check:**
   - All blue accents visible (same as light)
   - Dark slate backgrounds
   - Text readable

3. **Interactive Check:**
   - Hover states work
   - Buttons clickable
   - Links understandable

4. **Cross-browser Check:**
   - Chrome/Firefox/Safari
   - Mobile view responsive
   - Gradients render

---

## Performance Notes

- No performance impact from token system
- CSS variables are native browser support
- Tailwind compilation same
- Dark mode switching smooth (0.8s transition)

---

## Common Issues & Solutions

### Issue: Pink color still visible after replacement
**Solution:** Check you replaced ALL instances in the file, including:
- Inline styles
- Dynamic classes
- Conditional renders
- SVG attributes

### Issue: Dark mode shows wrong color
**Solution:** Ensure you also updated `dark:from-gray-*` → `dark:from-slate-*`

### Issue: Gradient doesn't look right
**Solution:** Use `from-primary/10 to-primary/20` for subtle, `from-primary to-secondary` for bold

### Issue: Text not readable on background
**Solution:** Adjust opacity: `/10` (very light) to `/30` (medium)

---

## Next Steps After Refactoring

1. ✅ Refactor all 8 remaining files
2. ✅ Run visual regression tests
3. ✅ Test on mobile devices
4. ✅ Verify dark mode throughout
5. ✅ Check accessibility (color contrast)
6. ✅ Deploy to staging
7. ✅ Final QA approval

---

## Related Documentation

- [COLOR_TOKENS.md](./COLOR_TOKENS.md) - Complete token reference
- [COMPONENT_PATTERNS.md](./COMPONENT_PATTERNS.md) - UI pattern examples
- `landing-client/src/index.css` - CSS variable definitions
- `landing-client/tailwind.config.js` - Tailwind configuration

---

## Questions During Migration

For implementation questions:
- Check COLOR_TOKENS.md for token definitions
- Check COMPONENT_PATTERNS.md for UI examples
- Review refactored files (Landing.tsx, Login.tsx) as reference
- Test in browser dev tools before committing

---

## Completion Checklist

- [ ] All 8 files refactored
- [ ] No pink-* colors remain in landing-client
- [ ] All dark mode variants use slate-*
- [ ] Button utilities used consistently
- [ ] Gradients updated
- [ ] SVG colors updated
- [ ] Focus rings use token system
- [ ] Documentation reviewed
- [ ] Visual testing passed
- [ ] Ready for production deployment
