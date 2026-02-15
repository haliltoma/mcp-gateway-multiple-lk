---
description: Yüksek dönüşüm oranlı, etkileyici landing page oluşturur. Hero, features, testimonials, pricing, CTA - tüm sectionlar dahil. Scroll animasyonlar ve conversion optimization.
user_invocable: true
---

# Create High-Converting Landing Page

Profesyonel, conversion-optimized landing page oluştur. Her section stratejik bir amaca hizmet etmeli.

## Sayfa Mimarisi (Section Sırası)

### 1. HERO SECTION
Kullanıcının ilk 3 saniyede kalması veya gitmesi burada belirlenir.

**Yapı:**
- Headline: Max 8 kelime, value proposition net (benefit-driven, feature-driven DEĞİL)
- Subheadline: 1-2 cümle, headline'ı destekle
- Primary CTA: Tek, net, action-oriented (örn: "Ücretsiz Başla" > "Kayıt Ol")
- Secondary CTA: Düşük commitment (örn: "Demo İzle", "Nasıl Çalışır?")
- Social proof snippet: "500+ şirket güveniyor" veya logo bar
- Visual: Product screenshot, 3D illustration, veya abstract visual (stock photo KULLANMA)

**Tasarım:**
```css
.hero {
  min-height: 100svh; /* svh mobile safari için */
  display: grid;
  place-items: center;
  /* Gradient mesh veya animated gradient background */
  /* Text üzerinde glassmorphism card veya floating element'ler */
}

.hero-headline {
  font-size: clamp(2.5rem, 1.5rem + 5vw, 5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.05;
  /* Gradient text veya animated highlight */
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### 2. SOCIAL PROOF BAR
- Logo cloud: 5-8 tanınmış müşteri/partner logosu
- Grayscale, hover'da renkli (dikkat dağıtmasın)
- "Trusted by" veya "Used by teams at" prefix
- Infinite scroll animation (isteğe bağlı)

### 3. FEATURES / BENEFITS SECTION
Feature değil, BENEFIT sat.

**Layout seçenekleri:**
- Bento grid (modern, asimetrik)
- Alternating left-right (klasik ama etkili)
- Card grid (3-4 sütun)

Her feature card:
- Icon veya mini illustration (emoji KULLANMA, custom SVG icon)
- Kısa başlık (3-5 kelime)
- 1-2 cümle açıklama (kullanıcının hayatını nasıl kolaylaştırır)
- Opsiyonel: mini screenshot veya animation

**Bento Grid örneği:**
```css
.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto;
  gap: var(--space-4);
}
.feature-card:nth-child(1) { grid-column: span 2; grid-row: span 2; }
.feature-card:nth-child(2) { grid-column: span 2; }
.feature-card:nth-child(3) { grid-column: span 1; }
.feature-card:nth-child(4) { grid-column: span 1; }
/* Mobile'da tek sütun */
```

### 4. HOW IT WORKS
3 adımlık süreç (cognitive load düşük tutulmalı):
1. Kayıt ol / Bağla
2. Yapılandır / Özelleştir
3. Sonuç al / Başla

Her adım:
- Numara (büyük, decorative)
- Başlık
- Kısa açıklama
- Bağlayıcı çizgi veya animasyonlu arrow

### 5. TESTIMONIALS
**Layout seçenekleri:**
- Masonry grid
- Carousel (auto-play YAPMA, kullanıcı kontrollü)
- Featured testimonial (büyük) + grid (küçükler)

Her testimonial:
- Quote text
- Kişi adı + ünvan + şirket
- Avatar (yoksa initials badge)
- Yıldız rating (opsiyonel)

### 6. PRICING
**Layout:** 2-3 plan, ortadaki "Popular" badge ile vurgulu

Her pricing card:
- Plan adı
- Fiyat (büyük, net) + billing period
- Feature listesi (checkmark'lı)
- CTA button
- "Popular" plan: farklı background, scale(1.05), ekstra shadow

**Psikolojik taktikler:**
- Anchoring: En pahalıyı solda göster (ortadaki "uygun" görünsün)
- Decoy: 3 plan varsa ortadaki en iyi value olsun
- Annual vs Monthly toggle (annual'da indirim göster)

### 7. FAQ
Accordion/collapsible format:
- 5-8 soru
- İtirazları önceden yanıtla
- SEO için structured data (JSON-LD)

### 8. FINAL CTA
Son bir push:
- Headline tekrarı veya farklı açıdan value prop
- Urgency/scarcity (abartısız, gerçekçi)
- Risk reversal: "30 gün para iade garantisi", "Kredi kartı gerekmez"
- CTA button (hero ile aynı)

### 9. FOOTER
- Navigation links (4 sütun)
- Newsletter signup
- Social media icons
- Legal links (Privacy, Terms)
- Copyright

## Scroll Animasyonları
```css
/* Intersection Observer ile */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s var(--ease-out-expo), transform 0.8s var(--ease-out-expo);
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Staggered children */
.reveal-stagger > * {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s var(--ease-out-expo), transform 0.6s var(--ease-out-expo);
}
.reveal-stagger.visible > *:nth-child(1) { transition-delay: 0ms; }
.reveal-stagger.visible > *:nth-child(2) { transition-delay: 100ms; }
.reveal-stagger.visible > *:nth-child(3) { transition-delay: 200ms; }
.reveal-stagger.visible > * { opacity: 1; transform: translateY(0); }

/* prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal-stagger > * {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

**IntersectionObserver setup:**
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => observer.observe(el));
```

## Teknik Gereksinimler
- Lighthouse score: Performance 95+, Accessibility 100, SEO 100
- First Contentful Paint < 1.5s
- Cumulative Layout Shift < 0.1
- Font: system-ui stack veya 1-2 Google Font (preload)
- Images: WebP/AVIF, srcset, lazy loading
- Meta tags: OG image, Twitter card, description
- Structured data: Organization, Product/Service JSON-LD
