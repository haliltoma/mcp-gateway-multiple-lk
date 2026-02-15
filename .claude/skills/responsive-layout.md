---
description: Modern CSS layout oluşturur. CSS Grid, Flexbox, Container Queries, fluid typography, clamp() ve mobile-first responsive tasarım.
user_invocable: true
---

# Create Modern Responsive Layout

Modern CSS ile responsive, performanslı layout oluştur. Media query spam'i yerine intrinsic design kullan.

## Layout Yaklaşımı Seçimi

Kullanıcıdan al:
- Layout tipi (single page, app shell, blog, e-commerce, portfolio)
- Breakpoint ihtiyaçları
- Sidebar var mı? (fixed, collapsible, overlay)
- Header tipi (sticky, transparent, shrink-on-scroll)

## CSS Grid Patterns

### Holy Grail Layout
```css
.layout {
  display: grid;
  grid-template:
    "header  header  header" auto
    "sidebar content aside"  1fr
    "footer  footer  footer" auto
    / 240px  1fr     200px;
  min-height: 100dvh;
}

@media (max-width: 1024px) {
  .layout {
    grid-template:
      "header"  auto
      "content" 1fr
      "footer"  auto
      / 1fr;
  }
  .sidebar, .aside { display: none; }
}
```

### Auto-Fill Grid (Responsive Card Grid)
```css
/* Breakpoint GEREKMİYOR - tamamen fluid */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
  gap: var(--space-6);
}
```

### Masonry-Like Grid (CSS)
```css
.masonry {
  columns: min(3, calc((100% - 2 * var(--space-4)) / 300));
  column-gap: var(--space-4);
}
.masonry > * {
  break-inside: avoid;
  margin-bottom: var(--space-4);
}
```

### Asymmetric Bento Grid
```css
.bento {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: 120px;
  gap: var(--space-4);
}
.bento-item--wide { grid-column: span 4; grid-row: span 2; }
.bento-item--tall { grid-column: span 2; grid-row: span 3; }
.bento-item--small { grid-column: span 2; grid-row: span 2; }
.bento-item--full { grid-column: span 6; grid-row: span 2; }

@media (max-width: 768px) {
  .bento {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 100px;
  }
  .bento-item--wide,
  .bento-item--full { grid-column: span 2; }
  .bento-item--tall,
  .bento-item--small { grid-column: span 1; grid-row: span 2; }
}
```

## Flexbox Patterns

### Navbar
```css
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-6);
  gap: var(--space-4);
}
.nav__links {
  display: flex;
  gap: var(--space-1);
}

/* Mobile: hamburger menu */
@media (max-width: 768px) {
  .nav__links {
    position: fixed;
    inset: 0;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--bg-primary);
    transform: translateX(100%);
    transition: transform 300ms var(--ease-out-expo);
    z-index: 100;
  }
  .nav__links.open { transform: translateX(0); }
}
```

### Centering (Her Durum İçin)
```css
/* Flex center */
.center-flex { display: flex; align-items: center; justify-content: center; }

/* Grid center */
.center-grid { display: grid; place-items: center; }

/* Absolute center (overlay/modal) */
.center-absolute {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
}

/* Text + icon inline center */
.inline-center {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}
```

## Container Queries

```css
/* Component-level responsive (parent boyutuna göre) */
.card-container {
  container-type: inline-size;
  container-name: card;
}

/* Card: dar container'da vertical, geniş container'da horizontal */
.card {
  display: flex;
  flex-direction: column;
}

@container card (min-width: 500px) {
  .card {
    flex-direction: row;
  }
  .card__image {
    width: 40%;
    aspect-ratio: 1;
  }
}

@container card (min-width: 800px) {
  .card__title {
    font-size: var(--text-xl);
  }
}
```

## Fluid Design (Clamp Everywhere)

```css
/* Fluid spacing - breakpoint'siz responsive */
.section {
  padding-block: clamp(var(--space-8), 6vw, var(--space-20));
  padding-inline: clamp(var(--space-4), 4vw, var(--space-16));
}

/* Fluid gap */
.grid {
  gap: clamp(var(--space-3), 2vw, var(--space-8));
}

/* Fluid max-width container */
.container {
  width: min(100% - 2 * clamp(var(--space-4), 5vw, var(--space-16)), 1200px);
  margin-inline: auto;
}

/* Fluid border-radius */
.hero-card {
  border-radius: clamp(var(--radius-lg), 2vw, var(--radius-2xl));
}
```

## Responsive Images

```html
<picture>
  <!-- Art direction: farklı crop'lar farklı ekranlar için -->
  <source media="(max-width: 640px)" srcset="hero-mobile.webp" type="image/webp">
  <source media="(max-width: 1024px)" srcset="hero-tablet.webp" type="image/webp">
  <source srcset="hero-desktop.webp" type="image/webp">

  <!-- Fallback -->
  <img
    src="hero-desktop.jpg"
    alt="Açıklayıcı metin"
    loading="lazy"
    decoding="async"
    width="1200"
    height="600"
    style="aspect-ratio: 2/1; object-fit: cover; width: 100%; height: auto;"
  >
</picture>
```

```css
/* Responsive video/embed */
.video-wrapper {
  position: relative;
  aspect-ratio: 16/9;
  overflow: hidden;
  border-radius: var(--radius-lg);
}
.video-wrapper iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
```

## Scroll Behavior

```css
/* Smooth scroll (keyboard/anchor only, JS scroll'u etkilemez) */
html {
  scroll-behavior: smooth;
  scroll-padding-top: 80px; /* Sticky header height */
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}

/* Scroll snap (carousel, section-based pages) */
.snap-container {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.snap-container::-webkit-scrollbar { display: none; }
.snap-item {
  scroll-snap-align: start;
  flex-shrink: 0;
}
```

## Mobile-Specific Patterns

```css
/* Safe area (notch/island) */
.footer {
  padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom));
}

/* Touch-friendly targets */
.btn, .link, .nav-item {
  min-height: 44px;
  min-width: 44px;
}

/* Prevent iOS zoom on input focus */
input, select, textarea {
  font-size: max(16px, 1rem); /* 16px minimum prevents zoom */
}

/* Bottom sheet pattern (mobile menu) */
.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-secondary);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  transform: translateY(100%);
  transition: transform 300ms var(--ease-out-expo);
  max-height: 85dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.bottom-sheet.open { transform: translateY(0); }
```

## Performance Rules
- `content-visibility: auto` uzun sayfalarda off-screen section'lar için
- `contain: layout style paint` izole component'ler için
- CSS `@layer` ile specificity yönetimi
- `@import` KULLANMA, tek CSS dosyası veya CSS-in-JS
- Critical CSS: above-the-fold stillerini inline `<style>` ile
