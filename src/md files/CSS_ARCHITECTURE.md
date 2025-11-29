# BinThere - CSS Architecture Documentation

Complete overview of the styling system used in the BinThere application.

---

## 🎨 CSS Stack Overview

### Primary Technologies

```
┌─────────────────────────────────────────────────────────────┐
│                    CSS ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Tailwind CSS v4.0 (Utility-First Framework)            │
│     └─ Modern CSS with @theme and CSS variables            │
│                                                             │
│  2. CSS Custom Properties (CSS Variables)                   │
│     └─ Design tokens for colors, spacing, etc.             │
│                                                             │
│  3. Shadcn/UI Component Styling                             │
│     └─ Pre-built components with Tailwind classes          │
│                                                             │
│  4. Global CSS (/styles/globals.css)                        │
│     └─ Base styles, typography, theme system               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 CSS File Structure

```
/styles/
└── globals.css (190 lines)
    ├── Custom Variants
    ├── CSS Variables (Light Theme)
    ├── CSS Variables (Dark Theme)
    ├── @theme inline (Tailwind v4.0)
    ├── Base Styles
    └── Typography System
```

---

## 🎨 Styling Methodology

### 1. **Tailwind CSS v4.0 (Utility-First)**

**What it is:**
- Modern utility-first CSS framework
- Write styles directly in JSX using className
- No custom CSS files needed for most components

**Example Usage:**

```tsx
// Dustbin Card Example
<Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:-translate-y-1 relative">
  {/* Content */}
</Card>
```

**Common Utilities Used:**

| Category | Utilities | Example |
|----------|-----------|---------|
| **Layout** | flex, grid, absolute, relative | `flex items-center gap-4` |
| **Spacing** | p-, m-, gap- | `p-6 mb-4 gap-2` |
| **Colors** | bg-, text-, border- | `bg-white text-gray-900` |
| **Typography** | text-sm, text-lg | Avoided (use defaults) |
| **Effects** | shadow, hover, transition | `hover:shadow-xl transition-all` |
| **Sizing** | w-, h-, min-, max- | `w-full h-screen` |
| **Borders** | rounded, border | `rounded-lg border-2` |

---

### 2. **CSS Custom Properties (Design Tokens)**

Located in `/styles/globals.css`, these provide theme consistency.

#### Light Theme Variables

```css
:root {
  /* Colors */
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  --primary: #030213;
  --secondary: oklch(0.95 0.0058 264.53);
  --muted: #ececf0;
  --muted-foreground: #717182;
  --accent: #e9ebef;
  --destructive: #d4183d;
  --border: rgba(0, 0, 0, 0.1);
  
  /* Chart Colors */
  --chart-1: oklch(0.646 0.222 41.116);  /* Orange/Amber */
  --chart-2: oklch(0.6 0.118 184.704);   /* Blue */
  --chart-3: oklch(0.398 0.07 227.392);  /* Dark Blue */
  --chart-4: oklch(0.828 0.189 84.429);  /* Yellow */
  --chart-5: oklch(0.769 0.188 70.08);   /* Green */
  
  /* Layout */
  --radius: 0.625rem;  /* 10px - border radius */
  --font-size: 16px;   /* Base font size */
  
  /* Typography */
  --font-weight-medium: 500;
  --font-weight-normal: 400;
}
```

#### Dark Theme Variables

```css
.dark {
  --background: oklch(0.145 0 0);       /* Dark background */
  --foreground: oklch(0.985 0 0);       /* Light text */
  --primary: oklch(0.985 0 0);          /* Light primary */
  --destructive: oklch(0.396 0.141 25.723);
  /* ... other dark mode colors */
}
```

#### Using CSS Variables in Components

```tsx
// Via Tailwind utility classes
<div className="bg-background text-foreground">
  {/* Uses CSS variables automatically */}
</div>

// In inline styles (if needed)
<div style={{ color: 'var(--primary)' }}>
  {/* Direct CSS variable usage */}
</div>
```

---

### 3. **Tailwind v4.0 @theme System**

**What it is:**
- New Tailwind v4.0 feature for defining design tokens
- Maps CSS variables to Tailwind utilities
- Located in `/styles/globals.css`

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-destructive: var(--destructive);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  /* ... */
}
```

**Benefits:**
- Use semantic color names: `bg-background`, `text-foreground`
- Automatic dark mode support
- Consistent spacing/sizing across app

---

## 📐 Typography System

### Base Typography Rules

**Important:** The project uses a custom typography system that sets default styles for HTML elements. You should **NOT** use Tailwind typography utilities unless explicitly changing the design.

```css
/* From globals.css */
h1 { font-size: var(--text-2xl); font-weight: 500; }
h2 { font-size: var(--text-xl); font-weight: 500; }
h3 { font-size: var(--text-lg); font-weight: 500; }
h4 { font-size: var(--text-base); font-weight: 500; }
p  { font-size: var(--text-base); font-weight: 400; }
label { font-size: var(--text-base); font-weight: 500; }
button { font-size: var(--text-base); font-weight: 500; }
input { font-size: var(--text-base); font-weight: 400; }
```

### Typography Guidelines

✅ **DO:**
```tsx
<h3>Dustbin #001</h3>  // Uses default h3 styling
<p>Some content</p>    // Uses default p styling
```

❌ **DON'T:**
```tsx
<h3 className="text-2xl font-bold">Dustbin #001</h3>  // Overrides defaults
<p className="text-lg">Some content</p>               // Unnecessary
```

**Exception:** Only use text utilities when you need to deviate from defaults:
```tsx
<span className="text-sm text-gray-500">Updated 5 mins ago</span>
```

---

## 🎨 Color System

### Environmental Green Palette (BinThere Theme)

The application uses an environmental green color palette with consistent thresholds:

```tsx
// Fill Level Colors
Green:   0-60%   (Healthy)     → text-green-600 / bg-green-600
Yellow:  60-80%  (Warning)     → text-yellow-600 / bg-yellow-600
Red:     80-100% (Critical)    → text-red-600 / bg-red-600

// Battery Level Colors
Green:   41-100% (Healthy)     → text-green-600 / bg-green-100
Yellow:  21-40%  (Low)         → text-yellow-600 / bg-yellow-100
Red:     0-20%   (Critical)    → text-red-600 / bg-red-100
```

### Usage in Components

```tsx
// dustbin-card.tsx example
function getFillLevelColor(percentage: number): string {
  if (percentage >= 80) return 'text-red-600';
  if (percentage >= 60) return 'text-yellow-600';
  return 'text-green-600';
}

function getBatteryBgColor(percentage: number): string {
  if (percentage <= 20) return 'bg-red-100';
  if (percentage <= 40) return 'bg-yellow-100';
  return 'bg-green-100';
}
```

### Gray Scale for UI Elements

```
text-gray-900   → Primary text (headings, titles)
text-gray-600   → Secondary text (labels)
text-gray-500   → Tertiary text (metadata)
bg-gray-50      → App background
bg-gray-100     → Section backgrounds
border-gray-200 → Borders
```

---

## 🧩 Shadcn/UI Component Styling

### What is Shadcn/UI?

- **NOT a component library** - Components are copied into your project
- Built with Tailwind CSS
- Fully customizable
- Located in `/components/ui/`

### How Components Are Styled

**Example: Button Component**

```tsx
// /components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
  }
);
```

**Usage:**

```tsx
<Button variant="default" size="lg">
  View Dashboard
</Button>
```

### Customizing Shadcn Components

You can add additional classes:

```tsx
<Button className="bg-green-600 hover:bg-green-700">
  Custom Green Button
</Button>
```

---

## 🎭 Animation & Transitions

### Tailwind Transition Utilities

```tsx
// Hover effects
className="hover:shadow-xl transition-all duration-300"

// Transform on hover
className="hover:-translate-y-1 transition-transform"

// Opacity transitions
className="opacity-0 animate-fade-in"

// Custom animations
className="animate-pulse"  // For critical alerts
```

### Custom Animations Example

```tsx
// Battery indicator with slide animation
<div className={`absolute -top-2 transition-all duration-300 ${
  hasAlert ? '-left-2' : 'left-4'
}`}>
  {/* Smoothly slides left when alert appears */}
</div>
```

### Common Animation Patterns

| Effect | Tailwind Classes |
|--------|-----------------|
| Smooth color change | `transition-colors duration-200` |
| Slide up on hover | `hover:-translate-y-1 transition-transform` |
| Fade in | `transition-opacity duration-300` |
| Scale on hover | `hover:scale-105 transition-transform` |
| Pulse (attention) | `animate-pulse` |
| Spin (loading) | `animate-spin` |

---

## 📱 Responsive Design

### Breakpoint System

Tailwind uses these breakpoints:

```
sm:  640px   (Small tablets)
md:  768px   (Tablets)
lg:  1024px  (Laptops)
xl:  1280px  (Desktops)
2xl: 1536px  (Large desktops)
```

### Usage Examples

```tsx
// Grid that changes columns by screen size
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* Dustbin cards */}
</div>

// Hide on mobile, show on desktop
<div className="hidden md:block">
  {/* Desktop only content */}
</div>

// Padding changes by screen size
<div className="p-4 md:p-6 lg:p-8">
  {/* Responsive padding */}
</div>
```

---

## 🎯 Common CSS Patterns in BinThere

### 1. Card Styling Pattern

```tsx
<Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:-translate-y-1 relative">
  {/* Content */}
</Card>
```

**Breakdown:**
- `p-6` - Padding
- `bg-white` - White background
- `hover:shadow-xl` - Shadow on hover
- `transition-all duration-300` - Smooth transitions
- `cursor-pointer` - Pointer cursor
- `border border-gray-200` - Light border
- `hover:-translate-y-1` - Lift effect on hover
- `relative` - Positioning context

### 2. Badge/Pill Styling Pattern

```tsx
<div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 border border-gray-200 shadow-sm">
  <Battery className="w-3 h-3 text-green-600" />
  <span className="text-xs text-green-600">85%</span>
</div>
```

### 3. Icon + Text Pattern

```tsx
<div className="flex items-center gap-1 text-gray-500">
  <Clock className="w-4 h-4" />
  <span className="text-sm">Updated 5 mins ago</span>
</div>
```

### 4. Grid Layout Pattern

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {dustbins.map(dustbin => (
    <DustbinCard key={dustbin.id} {...dustbin} />
  ))}
</div>
```

### 5. Absolute Positioning Pattern

```tsx
<div className="relative">
  {/* Parent container */}
  
  <div className="absolute -top-2 -right-2">
    {/* Top-right badge */}
  </div>
  
  <div className="absolute -top-2 left-4">
    {/* Top-left badge */}
  </div>
</div>
```

---

## 🔧 CSS Organization Best Practices

### 1. **Use Tailwind Utilities First**

✅ **Preferred:**
```tsx
<div className="flex items-center justify-between p-4">
```

❌ **Avoid:**
```tsx
<div style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>
```

### 2. **Group Related Classes**

```tsx
// Layout → Spacing → Colors → Effects → States
className="flex items-center gap-2 p-4 bg-white text-gray-900 rounded-lg shadow-md hover:shadow-xl"
```

### 3. **Extract Repeated Patterns to Components**

If you use the same class combination 3+ times, create a component:

```tsx
// Instead of repeating:
<div className="flex items-center gap-1 text-gray-500">...</div>
<div className="flex items-center gap-1 text-gray-500">...</div>

// Create:
function MetadataRow({ icon, text }) {
  return (
    <div className="flex items-center gap-1 text-gray-500">
      {icon}
      <span className="text-sm">{text}</span>
    </div>
  );
}
```

### 4. **Conditional Classes Pattern**

```tsx
// Use template literals for conditional styling
className={`px-2 py-1 rounded-full ${
  hasAlert ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
}`}

// Or use libraries like clsx/cn
import { cn } from './lib/utils';
className={cn(
  "px-2 py-1 rounded-full",
  hasAlert && "bg-red-100 text-red-600",
  !hasAlert && "bg-green-100 text-green-600"
)}
```

---

## 🌈 Color Reference Table

### Background Colors

| Class | Usage | Example |
|-------|-------|---------|
| `bg-white` | Card backgrounds | Dustbin cards |
| `bg-gray-50` | Page backgrounds | Main app background |
| `bg-gray-100` | Section backgrounds | Header, footer |
| `bg-green-600` | Primary actions | Fill level bars (healthy) |
| `bg-yellow-600` | Warning states | Fill level bars (warning) |
| `bg-red-600` | Critical states | Fill level bars (critical), alerts |
| `bg-green-100` | Light green accents | Battery indicator (healthy) |
| `bg-yellow-100` | Light yellow accents | Battery indicator (low) |
| `bg-red-100` | Light red accents | Battery indicator (critical) |

### Text Colors

| Class | Usage | Example |
|-------|-------|---------|
| `text-gray-900` | Primary text | Headings, titles |
| `text-gray-600` | Secondary text | Labels |
| `text-gray-500` | Tertiary text | Timestamps, metadata |
| `text-green-600` | Success/healthy | Fill levels 0-60% |
| `text-yellow-600` | Warning | Fill levels 60-80% |
| `text-red-600` | Error/critical | Fill levels 80-100% |
| `text-white` | On dark backgrounds | Badge text |

### Border Colors

| Class | Usage | Example |
|-------|-------|---------|
| `border-gray-200` | Default borders | Cards, inputs |
| `border-gray-300` | Emphasized borders | Active states |
| `border-red-600` | Error borders | Validation errors |

---

## 🚫 CSS Anti-Patterns (Things to Avoid)

### ❌ Don't Override Typography Defaults

```tsx
// BAD - Overrides default h3 styling
<h3 className="text-2xl font-bold">Title</h3>

// GOOD - Uses default h3 styling
<h3>Title</h3>
```

### ❌ Don't Use Inline Styles Unless Necessary

```tsx
// BAD
<div style={{ width: '100%', padding: '20px' }}>

// GOOD
<div className="w-full p-5">
```

### ❌ Don't Create Custom CSS Classes for Simple Things

```tsx
// BAD - Creating custom CSS
<div className="my-custom-flex-class">

// GOOD - Use Tailwind utilities
<div className="flex items-center gap-4">
```

### ❌ Don't Use Hard-coded Colors

```tsx
// BAD
<div style={{ color: '#123456' }}>

// GOOD - Use theme colors
<div className="text-gray-900">
```

---

## 📦 CSS File Sizes

```
/styles/globals.css          ~6 KB
All Tailwind utilities       Generated on-demand (optimized)
Shadcn UI components         Inline (no separate CSS)
Total CSS bundle             ~15-20 KB (production, gzipped)
```

---

## 🔍 Debugging CSS

### Tailwind CSS DevTools

Use browser DevTools to inspect Tailwind classes:

```html
<!-- In browser inspector -->
<div class="p-6 bg-white hover:shadow-xl">
  <!-- You'll see computed styles from Tailwind -->
</div>
```

### Common Issues

**Issue:** Styles not applying
```
Solution: Check if Tailwind classes are correct
          Verify no conflicting CSS
          Clear cache and rebuild
```

**Issue:** Dark mode not working
```
Solution: Ensure .dark class is on parent element
          Check CSS variable definitions in globals.css
```

**Issue:** Custom colors not working
```
Solution: Use predefined Tailwind colors
          Or add custom colors to tailwind.config
```

---

## 📚 CSS Learning Resources

### Official Documentation

- **Tailwind CSS v4.0:** https://tailwindcss.com/
- **Shadcn/UI:** https://ui.shadcn.com/
- **CSS Variables:** https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties

### Tailwind Utilities Cheat Sheet

Common utilities used in BinThere:

```
Layout:       flex, grid, block, inline-flex
Flexbox:      items-center, justify-between, gap-4
Grid:         grid-cols-4, gap-6
Spacing:      p-6, m-4, space-y-4
Sizing:       w-full, h-screen, min-h-0
Typography:   text-sm, text-lg (use sparingly)
Colors:       bg-white, text-gray-900, border-gray-200
Borders:      rounded-lg, border, border-2
Effects:      shadow-lg, opacity-50
Transitions:  transition-all, duration-300
Transforms:   -translate-y-1, scale-105
Positioning:  absolute, relative, -top-2, left-4
```

---

## 🎯 Summary

**BinThere uses:**

1. ✅ **Tailwind CSS v4.0** - Primary styling method (utility-first)
2. ✅ **CSS Custom Properties** - Design tokens and theming
3. ✅ **Shadcn/UI Components** - Pre-styled component primitives
4. ✅ **Global CSS** - Base styles and typography system
5. ❌ **NO custom CSS files** - Everything is Tailwind utilities
6. ❌ **NO CSS-in-JS libraries** - Uses Tailwind only
7. ❌ **NO preprocessors** - No SASS/LESS/Stylus

**Key Principles:**

- Use Tailwind utilities directly in className
- Respect default typography (don't override unless needed)
- Use semantic color tokens from theme
- Keep responsive design in mind
- Leverage Shadcn components for complex UI
- Maintain consistent color thresholds across app

---

**Last Updated:** October 27, 2025  
**Tailwind Version:** 4.0  
**Main CSS File:** `/styles/globals.css` (190 lines)
