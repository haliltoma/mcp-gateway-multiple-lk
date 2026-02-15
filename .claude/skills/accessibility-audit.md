---
description: Frontend accessibility (a11y) denetimi yapar. WCAG 2.1 AA/AAA uyumluluk kontrolü, screen reader testi, keyboard navigation, renk kontrastı ve otomatik düzeltme.
user_invocable: true
---

# Frontend Accessibility Audit

Kapsamlı erişilebilirlik denetimi yap ve sorunları düzelt.

## Denetim Kategorileri

### 1. Semantic HTML
Kontrol et:
- `<div>` ve `<span>` ile yapılmış interactive element var mı? → `<button>`, `<a>`, `<input>` kullan
- Heading hiyerarşisi doğru mu? (h1 → h2 → h3, seviye atlama yok)
- Landmark'lar var mı? (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`)
- Listeler `<ul>/<ol>/<li>` ile mi?
- Tablolar `<table>`, `<thead>`, `<th scope>` ile mi?
- `<article>`, `<section>` doğru kullanılmış mı?

### 2. Keyboard Navigation
Test et:
- [ ] Tab ile tüm interactive element'lere ulaşılabiliyor mu?
- [ ] Tab sırası mantıklı mı (DOM sırası ile uyumlu)?
- [ ] Focus indicator görünür mü? (`outline: none` ile kaldırılmış mı?)
- [ ] `tabindex` > 0 kullanılmış mı? (kullanılmamalı)
- [ ] Modal açıldığında focus trap var mı?
- [ ] Modal kapandığında focus trigger element'e dönüyor mu?
- [ ] Escape tuşu modal/dropdown kapatıyor mu?
- [ ] Custom component'ler keyboard desteği var mı? (dropdown: arrows, select: type-ahead)
- [ ] Skip navigation link var mı? (`<a href="#main" class="skip-link">`)

**Skip Link Pattern:**
```css
.skip-link {
  position: absolute;
  top: -100%;
  left: var(--space-4);
  padding: var(--space-2) var(--space-4);
  background: var(--bg-secondary);
  border: 2px solid var(--primary-500);
  border-radius: var(--radius-md);
  z-index: 9999;
  transition: top 200ms ease;
}
.skip-link:focus {
  top: var(--space-4);
}
```

### 3. ARIA Kullanımı
Kontrol et:
- ARIA sadece native HTML yeterli olmadığında mı kullanılmış?
- `aria-label` / `aria-labelledby` eksik element var mı?
- `aria-expanded` toggle/accordion'larda kullanılmış mı?
- `aria-hidden="true"` dekoratif element'lerde var mı?
- `role` attribute doğru mu? (gereksiz role eklenmemiş mi?)
- `aria-live` regions doğru mu? (toast, form errors, dynamic content)
- `aria-describedby` form input'larında hint/error bağlamış mı?

**Yaygın ARIA pattern'leri:**
```html
<!-- Accordion -->
<button aria-expanded="false" aria-controls="panel-1">Section Title</button>
<div id="panel-1" role="region" aria-labelledby="header-1" hidden>Content</div>

<!-- Tab -->
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="tab-panel-1">Tab 1</button>
  <button role="tab" aria-selected="false" aria-controls="tab-panel-2">Tab 2</button>
</div>
<div role="tabpanel" id="tab-panel-1" aria-labelledby="tab-1">Content</div>

<!-- Alert -->
<div role="alert" aria-live="assertive">Hata mesajı</div>

<!-- Status -->
<div role="status" aria-live="polite">3 sonuç bulundu</div>
```

### 4. Renk Kontrastı
Her text element için kontrol et:
- Normal text (< 18px): Minimum 4.5:1 kontrast oranı (AA)
- Large text (≥ 18px bold veya ≥ 24px): Minimum 3:1 (AA)
- UI components ve grafik: Minimum 3:1
- AAA hedefi: 7:1 (normal) / 4.5:1 (large)

**Test yöntemi:**
```javascript
// Contrast ratio hesaplama
function getContrastRatio(color1, color2) {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
```

Renk sorunları bulursan:
- Alternatif renk öner (minimum kontrast sağlayan en yakın shade)
- Dark mode'da da kontrol et

### 5. Görseller ve Medya
- `<img>` tag'lerinde `alt` attribute var mı?
- Dekoratif görsellerde `alt=""` (boş) mu?
- Anlamlı görsellerde `alt` açıklayıcı mı?
- `<svg>` inline kullanımda `aria-hidden="true"` veya `<title>` var mı?
- Video/audio'da altyazı (captions) var mı?
- Auto-play medya var mı? (olmamalı, veya muted olmalı)

### 6. Forms
- Her input'un `<label>` ile bağı var mı? (`for`/`id` veya wrapping)
- Placeholder tek başına label olarak kullanılmamış mı?
- Required alanlar `aria-required="true"` ile mi?
- Error mesajları `aria-describedby` ile bağlı mı?
- Error durumunda `aria-invalid="true"` ekleniyor mu?
- Form submit'te ilk hatalı alana focus ediliyor mu?
- `autocomplete` attribute'ları doğru mu?

### 7. Motion ve Animasyon
```css
/* Bu ZORUNLU kontrol */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
- `prefers-reduced-motion` respekti var mı?
- Otomatik oynayan carousel/slider var mı? (pause butonu olmalı)
- Flashing content var mı? (3 flash/saniye limiti - epilepsi riski)

### 8. Responsive & Zoom
- 200% zoom'da içerik taşıyor mu?
- 400% zoom'da (WCAG 2.1 AA gereksinim) kullanılabilir mi?
- `user-scalable=no` viewport meta'da yok mu? (olmamalı)
- `maximum-scale=1` yok mu? (olmamalı)
- Text `rem`/`em` ile mi tanımlanmış? (`px` ile zoom bozulur)

## Çıktı Formatı

Her bulgu için:
- **WCAG Kriteri**: Örn. "1.4.3 Contrast (Minimum) - AA"
- **Seviye**: A / AA / AAA
- **Sorun**: Ne tespit edildi
- **Konum**: Dosya:satır
- **Düzeltme**: Kod önerisi

Sonunda:
- Toplam sorun sayısı (A / AA / AAA bazında)
- Uyumluluk skoru
- Öncelikli düzeltme listesi (A seviyesi sorunlar önce)

## Otomatik Düzeltmeler
Şunları otomatik düzelt (onay al):
- Eksik `alt` attribute (boş ekle, kullanıcıdan açıklama iste)
- Eksik `aria-label`
- `outline: none` → `outline: none` kaldır, `:focus-visible` ekle
- `prefers-reduced-motion` eksikse ekle
- Skip navigation link eksikse ekle
- `lang` attribute HTML tag'de eksikse ekle
