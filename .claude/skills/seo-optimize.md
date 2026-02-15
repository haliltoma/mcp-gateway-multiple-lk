---
description: SEO optimizasyonu yapar. Meta tags, structured data (JSON-LD), Open Graph, sitemap, semantic HTML, Core Web Vitals ve teknik SEO denetimi.
user_invocable: true
---

# SEO Optimization

Kapsamlı SEO denetimi ve optimizasyon yap.

## Teknik SEO Kontrolleri

### 1. Meta Tags (Her Sayfa İçin Zorunlu)
```html
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Primary Keyword - Brand Name</title> <!-- 50-60 karakter -->
  <meta name="description" content="Compelling description with target keywords"> <!-- 150-160 karakter -->
  <link rel="canonical" href="https://example.com/page">
  <meta name="robots" content="index, follow">

  <!-- Language -->
  <html lang="tr">
  <link rel="alternate" hreflang="en" href="https://example.com/en/page">
  <link rel="alternate" hreflang="tr" href="https://example.com/tr/page">

  <!-- Open Graph (Facebook, LinkedIn) -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="Page Title">
  <meta property="og:description" content="Page description">
  <meta property="og:image" content="https://example.com/og-image.jpg"> <!-- 1200x630 -->
  <meta property="og:url" content="https://example.com/page">
  <meta property="og:site_name" content="Brand Name">
  <meta property="og:locale" content="tr_TR">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Page Title">
  <meta name="twitter:description" content="Page description">
  <meta name="twitter:image" content="https://example.com/twitter-image.jpg"> <!-- 1200x600 -->

  <!-- Favicon set -->
  <link rel="icon" href="/favicon.ico" sizes="32x32">
  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png"> <!-- 180x180 -->
  <link rel="manifest" href="/site.webmanifest">
</head>
```

### 2. Structured Data (JSON-LD)

**Organization:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Brand Name",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "sameAs": [
    "https://twitter.com/brand",
    "https://linkedin.com/company/brand"
  ]
}
</script>
```

**Product/SaaS:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Product Name",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "29",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "150"
  }
}
</script>
```

**FAQ:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Soru metni?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Cevap metni."
      }
    }
  ]
}
</script>
```

**Breadcrumb:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": "https://example.com" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://example.com/blog" },
    { "@type": "ListItem", "position": 3, "name": "Yazı Başlığı" }
  ]
}
</script>
```

### 3. Semantic HTML & Content Structure
Kontrol et:
- Tek `<h1>` per page (target keyword içermeli)
- Heading hiyerarşisi (h1 → h2 → h3, seviye atlama yok)
- `<main>`, `<article>`, `<section>`, `<aside>` kullanımı
- `<nav>` navigation için
- Internal linking yapısı
- Image `alt` text'leri keyword-rich ama doğal

### 4. URL Yapısı
- Kısa, descriptive URL'ler: `/blog/seo-rehberi` > `/blog/post?id=123`
- Lowercase, tire ile ayrılmış
- Gereksiz parametre yok
- Trailing slash tutarlılığı
- 301 redirect'ler doğru mu?

### 5. Sitemap & Robots.txt

**robots.txt:**
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/

Sitemap: https://example.com/sitemap.xml
```

**sitemap.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

### 6. Performance (SEO Impact)
Core Web Vitals Google ranking faktörüdür:
- LCP < 2.5s
- INP < 200ms
- CLS < 0.1
- Mobile-friendly (responsive)
- HTTPS zorunlu

### 7. Crawlability
- JavaScript rendering: SSR veya SSG kullanılıyor mu?
- SPA ise: pre-rendering veya dynamic rendering var mı?
- `<a href>` ile navigation (JS-only routing değil)
- Internal link'ler crawlable mı? (`href="#"` veya `onclick` sorunları)
- Orphan pages (hiçbir yerden link verilmeyen sayfalar)
- Redirect zincirleri (max 1 hop)

## Çıktı Formatı

### SEO Skor Kartı
| Kategori | Skor | Durum |
|----------|------|-------|
| Meta Tags | 8/10 | GOOD |
| Structured Data | 4/10 | POOR |
| Content Structure | 7/10 | GOOD |
| Technical SEO | 6/10 | FAIR |
| Performance | 9/10 | GREAT |
| Mobile | 10/10 | GREAT |

### Öncelikli Aksiyonlar
Her aksiyon için tahmini SEO etkisi (HIGH/MED/LOW) belirt.
