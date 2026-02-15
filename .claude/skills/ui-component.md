---
description: Production-grade UI component oluşturur. Design token'lar, accessibility, responsive, dark mode, animasyonlar ve tüm edge case'ler dahil.
user_invocable: true
---

# Create Production-Grade UI Component

Kullanıcının istediği UI component'ini en yüksek kalitede oluştur. Jenerik AI çıktısından KAÇIN - her component benzersiz, yaratıcı ve profesyonel olmalı.

## Tasarım Felsefesi

**ASLA yapma:**
- Düz, sıkıcı kutular ve generic border-radius
- Her yerde aynı mavi ton (#3b82f6 sendromu)
- Tailwind default renklerini olduğu gibi kullanma
- Basit drop-shadow ile "depth" illüzyonu
- Her şeye rounded-lg yapıştırma

**HER ZAMAN yap:**
- Cesur, unexpected renk kombinasyonları (complementary, split-complementary, triadic)
- Asimetrik layout'lar ve intentional whitespace
- Subtle ama hissedilen micro-interaction'lar
- Typography hierarchy (font-size, weight, letter-spacing, line-height birlikte)
- Texture ve depth (gradient mesh, glassmorphism, noise overlay, layered shadows)

## Component Oluşturma Süreci

### 1. Gereksinim Analizi
Kullanıcıdan al:
- Component türü (button, card, modal, form, nav, hero, pricing, testimonial vs.)
- Framework (React, Vue, Svelte, vanilla HTML/CSS)
- Stil yaklaşımı (CSS Modules, Tailwind, styled-components, vanilla CSS)
- Kullanım bağlamı (SaaS dashboard, e-commerce, portfolio, landing page)

### 2. Design Token'ları Belirle
```css
:root {
  /* Color Palette - HER PROJE İÇİN UNIQUE */
  --color-primary: /* HSL kullan, hex değil */;
  --color-accent: /* Primary'nin complementary'si veya split-comp */;
  --color-surface: /* Saf beyaz KULLANMA, hafif tint */;
  --color-text: /* Saf siyah KULLANMA, koyu gri + hafif tint */;

  /* Typography Scale - modular scale kullan (1.25 veya 1.333 ratio) */
  --font-xs: clamp(0.7rem, 0.66rem + 0.2vw, 0.78rem);
  --font-sm: clamp(0.875rem, 0.83rem + 0.25vw, 0.975rem);
  --font-base: clamp(1rem, 0.95rem + 0.3vw, 1.125rem);
  --font-lg: clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);
  --font-xl: clamp(1.5rem, 1.3rem + 1vw, 2.25rem);
  --font-2xl: clamp(2rem, 1.6rem + 2vw, 3.5rem);

  /* Spacing - 8px grid system */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* Shadows - layered, realistic */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06);
  --shadow-md: 0 2px 4px rgba(0,0,0,0.03), 0 4px 8px rgba(0,0,0,0.06), 0 12px 24px rgba(0,0,0,0.04);
  --shadow-lg: 0 4px 8px rgba(0,0,0,0.02), 0 8px 16px rgba(0,0,0,0.04), 0 16px 32px rgba(0,0,0,0.06), 0 32px 64px rgba(0,0,0,0.04);

  /* Motion */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-spring: cubic-bezier(0.22, 1.36, 0.36, 1);
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
}
```

### 3. Accessibility (A11y) Zorunluluklar
- Tüm interactive element'lerde `focus-visible` outline (ASLA `outline: none`)
- WCAG 2.1 AA kontrast oranı (normal text 4.5:1, large text 3:1)
- Semantic HTML (div soup YAPMA)
- ARIA label'lar (sadece gerektiğinde, native HTML semantikleri önce)
- Keyboard navigation (Tab, Enter, Space, Escape)
- `prefers-reduced-motion` media query ile animasyon kontrolü
- Screen reader test senaryosu yaz

### 4. Responsive Stratejisi
- Mobile-first yaklaşım
- `clamp()` ile fluid typography ve spacing
- Container queries (destekleniyorsa)
- Breakpoint'ler: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- Touch target minimum 44x44px (mobile)
- Hover state'ler sadece `@media (hover: hover)` içinde

### 5. Dark Mode
```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Sadece renkleri flip etme! */
    /* Dark mode'da saturation düşür, lightness ayarla */
    /* Saf siyah background KULLANMA, koyu gri + hafif tint */
  }
}
```

### 6. Micro-Interactions
Her interactive element için:
- Hover: transform + shadow + color transition (aynı anda, farklı duration'larla)
- Active/Press: scale(0.97-0.99) + shadow azalt
- Focus: ring animation veya outline offset
- Loading state: skeleton veya pulse animation
- Success/Error state: renk + icon transition

### 7. Performance
- CSS `will-change` sadece animasyon başlamadan hemen önce
- `transform` ve `opacity` dışında animasyon YAPMA (layout thrashing)
- Lazy loading için IntersectionObserver
- Critical CSS inline, geri kalanı async
- Font loading: `font-display: swap` + preload

## Kod Kalitesi
- TypeScript strict mode
- Props interface/type tanımla
- Default props ve edge case handling
- Storybook-ready: her variant ve state için props
- JSDoc ile kullanım örnekleri
