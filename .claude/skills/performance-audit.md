---
description: Frontend performans denetimi yapar. Core Web Vitals, bundle size, render blocking, lazy loading, caching stratejisi ve Lighthouse benzeri kapsamlı analiz.
user_invocable: true
---

# Frontend Performance Audit

Kapsamlı frontend performans denetimi yap. Core Web Vitals hedefleri:
- **LCP** (Largest Contentful Paint): < 2.5s
- **INP** (Interaction to Next Paint): < 200ms
- **CLS** (Cumulative Layout Shift): < 0.1

## Denetim Kategorileri

### 1. Loading Performance

**Critical Rendering Path:**
- Render-blocking CSS var mı? (`<link rel="stylesheet">` in `<head>`)
  - Critical CSS inline mi?
  - Non-critical CSS async yükleniyor mu?
  ```html
  <link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  ```
- Render-blocking JS var mı?
  - `<script>` tag'lerinde `defer` veya `async` var mı?
  - Third-party script'ler lazy mi?
- `<head>` içinde gereksiz `<script>` var mı?

**Resource Hints:**
```html
<!-- DNS prefetch (3rd party origins) -->
<link rel="dns-prefetch" href="//fonts.googleapis.com">
<!-- Preconnect (critical 3rd party) -->
<link rel="preconnect" href="https://api.example.com" crossorigin>
<!-- Preload (critical resources) -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<!-- Prefetch (next page resources) -->
<link rel="prefetch" href="/next-page.js">
```

### 2. JavaScript Audit

**Bundle Size:**
- Total JS boyutu (gzip sonrası) kontrol et
  - İdeal: < 100KB initial bundle
  - Kabul edilebilir: < 200KB
  - Sorunlu: > 300KB
- Source map analizi: hangi kütüphane ne kadar yer kaplıyor?
- Tree-shaking çalışıyor mu?
- Dead code var mı?

**Code Splitting:**
- Route-based splitting var mı?
- Dynamic import kullanılıyor mu?
```javascript
// Lazy loading component
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```
- Vendor chunk ayrılmış mı?

**Runtime Performance:**
- Long tasks (> 50ms) var mı?
- `requestAnimationFrame` doğru kullanılıyor mu?
- Memory leak belirtisi var mı?
  - Event listener'lar cleanup ediliyor mu?
  - setInterval/setTimeout clear ediliyor mu?

### 3. CSS Audit

- Kullanılmayan CSS oranı (coverage)
- CSS boyutu (gzip sonrası) < 50KB ideal
- `@import` kullanılıyor mu? (render blocking) → `<link>` kullan
- Specificity sorunları (`!important` count)
- Complex selector'lar (> 3 seviye nesting)
- Duplicate declaration'lar
- `contain` property kullanımı

### 4. Image Optimization

Her görsel için kontrol et:
- Format: WebP/AVIF kullanılıyor mu?
- Boyut: Gösterildiği boyuttan büyük mü?
- `loading="lazy"` var mı? (above-the-fold hariç)
- `width` ve `height` attribute var mı? (CLS önleme)
- `srcset` + `sizes` responsive images için var mı?
- `<picture>` ile art direction yapılıyor mu?
- `aspect-ratio` CSS ile CLS önlenmiş mi?
- Sprite sheet veya icon font yerine inline SVG kullanılıyor mu?

```html
<!-- Optimal image pattern -->
<img
  src="photo-800.webp"
  srcset="photo-400.webp 400w, photo-800.webp 800w, photo-1200.webp 1200w"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="Description"
  loading="lazy"
  decoding="async"
  width="800"
  height="600"
>
```

### 5. Font Optimization

- Font dosya sayısı (max 2-3 font family)
- Font format: woff2 kullanılıyor mu?
- `font-display: swap` var mı?
- Font preload var mı? (critical fonts only)
- Subsetting yapılmış mı? (sadece kullanılan character'lar)
- Variable font kullanılabilir mi? (weight range tek dosyada)
- System font stack alternatifi:
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### 6. Caching Strategy

**Static Assets:**
```
Cache-Control: public, max-age=31536000, immutable  /* hashed filename'ler için */
Cache-Control: no-cache  /* HTML için */
```

**Service Worker:**
- Offline support var mı?
- Cache-first strategy static assets için?
- Network-first strategy API calls için?
- Stale-while-revalidate strategy?

### 7. Layout Stability (CLS)

CLS'e neden olan yaygın sorunlar:
- Boyutsuz görseller (`width`/`height` eksik)
- Dinamik içerik (ads, embeds) reserved space olmadan
- Web font yüklenmesi (FOUT/FOIT)
- Animasyonlar layout property'leri değiştiriyor
- Infinite scroll content shift

Düzeltmeler:
```css
/* Reserved space for images */
img { aspect-ratio: attr(width) / attr(height); height: auto; }

/* Skeleton placeholder (CLS yok) */
.skeleton { min-height: 200px; }

/* Font swap without shift */
@font-face {
  font-family: 'Custom';
  src: url('font.woff2') format('woff2');
  font-display: swap;
  size-adjust: 105%; /* metric override */
  ascent-override: 90%;
  descent-override: 20%;
}
```

### 8. Third-Party Impact

Her 3rd party script için:
- Boyutu ne kadar?
- Loading stratejisi (async, defer, lazy)?
- Main thread blocking süresi?
- Gerekli mi? Alternatif var mı?
- Facade pattern kullanılabilir mi? (YouTube → thumbnail, Maps → static image)

```javascript
// YouTube facade pattern
const playButton = document.querySelector('.video-facade');
playButton.addEventListener('click', () => {
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  playButton.replaceWith(iframe);
}, { once: true });
```

## Çıktı Formatı

### Skor Tablosu
| Metrik | Mevcut | Hedef | Durum |
|--------|--------|-------|-------|
| LCP | 3.2s | < 2.5s | FAIL |
| INP | 150ms | < 200ms | PASS |
| CLS | 0.05 | < 0.1 | PASS |
| Total JS | 450KB | < 200KB | FAIL |
| Total CSS | 80KB | < 50KB | WARN |
| Images | 2.1MB | < 500KB | FAIL |

### Öncelikli Aksiyon Listesi
1. [HIGH] Image optimization → tahmini kazanç: -1.5MB, LCP -1s
2. [HIGH] Code splitting → tahmini kazanç: -250KB initial JS
3. [MED] Font subsetting → tahmini kazanç: -100KB
4. [LOW] CSS purge → tahmini kazanç: -30KB
