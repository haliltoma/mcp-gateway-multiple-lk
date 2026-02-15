---
description: Sıfırdan tutarlı bir design system oluşturur. Renk paleti, typography scale, spacing, component library, dark mode ve tüm token'lar dahil.
user_invocable: true
---

# Create Design System from Scratch

Sıfırdan kapsamlı, tutarlı ve genişletilebilir bir design system oluştur.

## Adım 1: Foundation Tokens

### Color System

**Renk üretme yöntemi:** HSL bazlı, programatik palette

```css
:root {
  /*
   * Primary: Marka rengi
   * Hue seç, sonra 9 shade üret (50-900)
   * Lightness: 97% → 15% (eşit aralıkla DEĞİL, algısal eşitlik için)
   */
  --primary-50:  hsl(var(--hue-primary) 85% 97%);
  --primary-100: hsl(var(--hue-primary) 80% 92%);
  --primary-200: hsl(var(--hue-primary) 75% 82%);
  --primary-300: hsl(var(--hue-primary) 70% 68%);
  --primary-400: hsl(var(--hue-primary) 65% 56%);
  --primary-500: hsl(var(--hue-primary) 60% 48%);  /* BASE */
  --primary-600: hsl(var(--hue-primary) 60% 40%);
  --primary-700: hsl(var(--hue-primary) 55% 32%);
  --primary-800: hsl(var(--hue-primary) 50% 24%);
  --primary-900: hsl(var(--hue-primary) 45% 16%);

  /* Neutral: Gray tonu (saf gri KULLANMA, hafif hue kat) */
  --hue-neutral: var(--hue-primary); /* Primary hue ile tint'lenmiş gray */
  --neutral-50:  hsl(var(--hue-neutral) 10% 97%);
  --neutral-100: hsl(var(--hue-neutral) 8% 92%);
  --neutral-200: hsl(var(--hue-neutral) 8% 85%);
  --neutral-300: hsl(var(--hue-neutral) 6% 72%);
  --neutral-400: hsl(var(--hue-neutral) 5% 55%);
  --neutral-500: hsl(var(--hue-neutral) 5% 42%);
  --neutral-600: hsl(var(--hue-neutral) 6% 32%);
  --neutral-700: hsl(var(--hue-neutral) 8% 22%);
  --neutral-800: hsl(var(--hue-neutral) 10% 14%);
  --neutral-900: hsl(var(--hue-neutral) 12% 8%);

  /* Semantic Colors */
  --success-500: hsl(152 60% 42%);
  --warning-500: hsl(38 95% 55%);
  --danger-500: hsl(0 72% 55%);
  --info-500: hsl(210 85% 55%);
  /* Her semantic renk için de 50-900 shade üret */

  /* Surface & Background */
  --bg-primary: var(--neutral-50);
  --bg-secondary: white;
  --bg-tertiary: var(--neutral-100);
  --bg-inverse: var(--neutral-900);

  /* Text */
  --text-primary: var(--neutral-900);
  --text-secondary: var(--neutral-600);
  --text-tertiary: var(--neutral-400);
  --text-inverse: var(--neutral-50);
  --text-link: var(--primary-500);

  /* Border */
  --border-default: var(--neutral-200);
  --border-strong: var(--neutral-300);
  --border-focus: var(--primary-500);
}
```

**Dark Mode Token Mapping:**
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: var(--neutral-900);
    --bg-secondary: var(--neutral-800);
    --bg-tertiary: var(--neutral-700);
    --bg-inverse: var(--neutral-50);

    --text-primary: var(--neutral-50);
    --text-secondary: var(--neutral-300);
    --text-tertiary: var(--neutral-500);
    --text-inverse: var(--neutral-900);

    --border-default: var(--neutral-700);
    --border-strong: var(--neutral-600);

    /* Dark mode'da saturation %20 düşür */
    --primary-500: hsl(var(--hue-primary) calc(60% - 10%) calc(48% + 10%));
  }
}
```

### Typography Scale

```css
:root {
  /* Font families */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  --font-display: var(--font-sans); /* veya ayrı display font */

  /* Modular Scale: 1.25 ratio (Major Third) */
  --text-xs:   clamp(0.64rem,  0.6rem  + 0.18vw, 0.72rem);   /* 10.24px → 11.52px */
  --text-sm:   clamp(0.8rem,   0.76rem + 0.22vw, 0.9rem);     /* 12.8px  → 14.4px  */
  --text-base: clamp(1rem,     0.95rem + 0.28vw, 1.125rem);    /* 16px    → 18px    */
  --text-lg:   clamp(1.25rem,  1.18rem + 0.35vw, 1.406rem);    /* 20px    → 22.5px  */
  --text-xl:   clamp(1.563rem, 1.45rem + 0.56vw, 1.758rem);    /* 25px    → 28.13px */
  --text-2xl:  clamp(1.953rem, 1.78rem + 0.87vw, 2.197rem);    /* 31.25px → 35.16px */
  --text-3xl:  clamp(2.441rem, 2.15rem + 1.46vw, 2.747rem);    /* 39px    → 43.95px */
  --text-4xl:  clamp(3.052rem, 2.6rem  + 2.26vw, 3.433rem);    /* 48.83px → 54.93px */

  /* Line Heights */
  --leading-tight: 1.15;
  --leading-snug: 1.3;
  --leading-normal: 1.55;
  --leading-relaxed: 1.75;

  /* Letter Spacing */
  --tracking-tighter: -0.04em;
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.02em;
  --tracking-wider: 0.04em;
  --tracking-widest: 0.08em;

  /* Font Weights */
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
  --weight-extrabold: 800;
}
```

**Typography Presets:**
```css
.heading-1 {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: var(--weight-extrabold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tighter);
  color: var(--text-primary);
}
.heading-2 {
  font-size: var(--text-3xl);
  font-weight: var(--weight-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}
/* ... heading-3 through heading-6 */

.body-lg { font-size: var(--text-lg); line-height: var(--leading-normal); }
.body-base { font-size: var(--text-base); line-height: var(--leading-normal); }
.body-sm { font-size: var(--text-sm); line-height: var(--leading-normal); }
.caption { font-size: var(--text-xs); line-height: var(--leading-normal); letter-spacing: var(--tracking-wide); }
.overline {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--text-tertiary);
}
```

### Spacing Scale

```css
:root {
  /* 4px base unit, geometric progression */
  --space-0: 0;
  --space-px: 1px;
  --space-0.5: 0.125rem;  /* 2px */
  --space-1: 0.25rem;     /* 4px */
  --space-1.5: 0.375rem;  /* 6px */
  --space-2: 0.5rem;      /* 8px */
  --space-3: 0.75rem;     /* 12px */
  --space-4: 1rem;        /* 16px */
  --space-5: 1.25rem;     /* 20px */
  --space-6: 1.5rem;      /* 24px */
  --space-8: 2rem;        /* 32px */
  --space-10: 2.5rem;     /* 40px */
  --space-12: 3rem;       /* 48px */
  --space-16: 4rem;       /* 64px */
  --space-20: 5rem;       /* 80px */
  --space-24: 6rem;       /* 96px */
  --space-32: 8rem;       /* 128px */

  /* Semantic spacing */
  --gap-xs: var(--space-1);
  --gap-sm: var(--space-2);
  --gap-md: var(--space-4);
  --gap-lg: var(--space-6);
  --gap-xl: var(--space-8);
  --gap-2xl: var(--space-12);

  /* Section spacing (responsive) */
  --section-gap: clamp(var(--space-16), 8vw, var(--space-32));
}
```

### Shadows, Borders, Radius

```css
:root {
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  /* Shadows - layered for realism */
  --shadow-xs: 0 1px 2px hsla(var(--hue-neutral) 20% 20% / 0.06);
  --shadow-sm:
    0 1px 2px hsla(var(--hue-neutral) 20% 20% / 0.04),
    0 2px 4px hsla(var(--hue-neutral) 20% 20% / 0.06);
  --shadow-md:
    0 2px 4px hsla(var(--hue-neutral) 20% 20% / 0.03),
    0 4px 8px hsla(var(--hue-neutral) 20% 20% / 0.04),
    0 8px 16px hsla(var(--hue-neutral) 20% 20% / 0.05);
  --shadow-lg:
    0 4px 8px hsla(var(--hue-neutral) 20% 20% / 0.02),
    0 8px 16px hsla(var(--hue-neutral) 20% 20% / 0.04),
    0 16px 32px hsla(var(--hue-neutral) 20% 20% / 0.06);
  --shadow-xl:
    0 8px 16px hsla(var(--hue-neutral) 20% 20% / 0.02),
    0 16px 32px hsla(var(--hue-neutral) 20% 20% / 0.04),
    0 32px 64px hsla(var(--hue-neutral) 20% 20% / 0.08);

  /* Focus ring */
  --ring-width: 2px;
  --ring-offset: 2px;
  --ring-color: var(--primary-500);
}

/* Focus utility */
.focus-ring:focus-visible {
  outline: var(--ring-width) solid var(--ring-color);
  outline-offset: var(--ring-offset);
}
```

## Adım 2: Component Patterns

Her component için şu pattern'i uygula:

### Base → Variants → Sizes → States

```css
/* BASE */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-weight: var(--weight-semibold);
  border-radius: var(--radius-md);
  transition: all 150ms ease;
  cursor: pointer;
  border: none;
}

/* VARIANTS */
.btn--primary { background: var(--primary-500); color: white; }
.btn--secondary { background: var(--neutral-100); color: var(--text-primary); }
.btn--ghost { background: transparent; color: var(--text-primary); }
.btn--danger { background: var(--danger-500); color: white; }
.btn--outline { background: transparent; border: 1.5px solid var(--border-default); }

/* SIZES */
.btn--sm { padding: var(--space-1.5) var(--space-3); font-size: var(--text-sm); }
.btn--md { padding: var(--space-2) var(--space-4); font-size: var(--text-base); }
.btn--lg { padding: var(--space-3) var(--space-6); font-size: var(--text-lg); }

/* STATES */
.btn:hover { filter: brightness(1.05); transform: translateY(-1px); }
.btn:active { transform: translateY(0) scale(0.98); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
.btn:focus-visible { outline: 2px solid var(--ring-color); outline-offset: 2px; }
```

### Zorunlu Component Listesi
Bu design system'de şu component'ler MUTLAKA olmalı:
1. Button (primary, secondary, ghost, outline, danger, icon-only)
2. Input (text, password, search, textarea, with icon, with addon)
3. Select (single, multi, searchable)
4. Checkbox & Radio
5. Toggle/Switch
6. Badge/Tag
7. Avatar (image, initials, group)
8. Card (basic, interactive, featured)
9. Modal/Dialog
10. Toast/Notification
11. Tooltip
12. Dropdown Menu
13. Tabs
14. Accordion
15. Breadcrumb
16. Pagination
17. Progress (bar, circular)
18. Skeleton loader
19. Empty state
20. Alert/Banner

## Adım 3: Dokümantasyon
Her token ve component için:
- Visual reference
- CSS custom property adı
- Kullanım kuralları (DO / DON'T)
- A11y gereksinimleri
