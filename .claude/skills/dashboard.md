---
description: Data-driven admin/analitik dashboard oluşturur. Chart'lar, KPI kartları, tablo, filtreler, real-time güncelleme ve responsive sidebar layout dahil.
user_invocable: true
---

# Create Admin/Analytics Dashboard

Profesyonel, data-driven dashboard oluştur. Her element bilgi hiyerarşisine göre konumlandırılmalı.

## Layout Sistemi

### Sidebar + Main Content
```css
.dashboard {
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-template-rows: 64px 1fr;
  grid-template-areas:
    "sidebar header"
    "sidebar main";
  min-height: 100dvh;
}

/* Collapsible sidebar */
.dashboard.collapsed {
  grid-template-columns: 72px 1fr;
}

/* Mobile: bottom navigation */
@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
    grid-template-rows: 64px 1fr 64px;
    grid-template-areas:
      "header"
      "main"
      "sidebar";
  }
}
```

### Sidebar
- Logo/branding (üstte)
- Navigation links (icon + label)
- Collapsible: sadece icon göster, hover'da tooltip
- Active state: sol kenar highlight + background tint
- User avatar + dropdown (altta)
- Keyboard navigasyonu: Arrow keys ile menü dolaşımı

### Header Bar
- Breadcrumb navigation
- Search bar (Cmd+K shortcut)
- Notification bell (badge count)
- User menu dropdown
- Sticky: `position: sticky; top: 0; z-index: 10;`

## Dashboard Content Bileşenleri

### 1. KPI Cards (En üstte, 4 sütun grid)
```css
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-4);
}
```

Her KPI card:
- Metric label (küçük, muted)
- Değer (büyük, bold - tabular-nums font-feature)
- Trend indicator: up/down arrow + yüzde değişim (yeşil/kırmızı)
- Sparkline mini chart (son 7 gün)
- Opsiyonel: comparison period ("vs. geçen ay")

```css
.kpi-value {
  font-variant-numeric: tabular-nums;
  font-size: var(--font-2xl);
  font-weight: 700;
  letter-spacing: -0.02em;
}
.kpi-trend--up { color: var(--color-success); }
.kpi-trend--down { color: var(--color-danger); }
```

### 2. Chart Section
**Chart türleri ve kullanım alanları:**
- **Line chart**: Zaman serisi veriler (revenue, traffic)
- **Bar chart**: Karşılaştırma (aylık satış, kategori bazlı)
- **Area chart**: Volume/hacim gösterimi
- **Donut/Pie**: Dağılım (max 5-6 dilim)
- **Heatmap**: Yoğunluk/zaman pattern'i (aktivite saatleri)

**Chart kütüphanesi seçimi:**
- Lightweight: Chart.js veya uPlot
- Full-featured: Recharts (React) veya D3.js
- Vanilla: SVG + CSS animations

**Chart tasarım kuralları:**
- Y-axis label'lar solda, X-axis altta
- Grid lines: çok hafif, dashed veya dotted
- Tooltip: hover'da değer göster (mouse follow)
- Legend: chart üstünde veya sağında (altta DEĞİL)
- Color palette: max 6 renk, hepsi birbirinden ayırt edilebilir
- Responsive: küçük ekranda legend gizle, axis label döndür

### 3. Data Table
```css
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}
.data-table th {
  position: sticky;
  top: 0;
  background: var(--color-surface);
  font-weight: 600;
  font-size: var(--font-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  cursor: pointer; /* sortable */
}
.data-table tr:hover {
  background: var(--color-surface-hover);
}
```

Table özellikleri:
- Sortable columns (click header → asc/desc)
- Pagination veya infinite scroll
- Row selection (checkbox)
- Bulk actions toolbar (seçim yapıldığında)
- Column resize (drag)
- Search/filter per column
- Empty state: illustration + "Veri bulunamadı" mesajı
- Loading state: skeleton rows
- Responsive: horizontal scroll veya card view'a dönüşüm

### 4. Filter Bar
- Date range picker (preset'ler: Son 7 gün, 30 gün, 90 gün, Custom)
- Dropdown filter'lar (multi-select)
- Search input
- Active filter badge'leri (x ile kaldırılabilir)
- "Filtreleri Temizle" butonu

### 5. Activity Feed / Timeline
- Son işlemler listesi
- Avatar + isim + action + zaman
- Relative time ("2 dk önce", "dün")
- Infinite scroll veya "Daha fazla yükle"

## Real-Time Güncellemeler
```javascript
// WebSocket veya SSE ile
const eventSource = new EventSource('/api/dashboard/stream');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateKPI(data.kpis);
  updateChart(data.chartData);
};

// Smooth number transition
function animateValue(element, start, end, duration) {
  const range = end - start;
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    element.textContent = Math.floor(start + range * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
```

## Renk Sistemi (Dashboard-specific)
```css
:root {
  /* Surface hierarchy - depth ile */
  --surface-0: hsl(220 20% 97%);   /* page background */
  --surface-1: hsl(0 0% 100%);     /* cards */
  --surface-2: hsl(220 15% 96%);   /* nested elements */
  --surface-3: hsl(220 15% 93%);   /* hover states */

  /* Semantic colors */
  --color-success: hsl(152 60% 42%);
  --color-warning: hsl(38 95% 55%);
  --color-danger: hsl(0 72% 55%);
  --color-info: hsl(210 85% 55%);

  /* Chart palette */
  --chart-1: hsl(230 70% 58%);
  --chart-2: hsl(170 65% 45%);
  --chart-3: hsl(280 60% 58%);
  --chart-4: hsl(35 90% 55%);
  --chart-5: hsl(350 70% 55%);
}

/* Dark mode dashboard */
@media (prefers-color-scheme: dark) {
  :root {
    --surface-0: hsl(220 20% 10%);
    --surface-1: hsl(220 18% 14%);
    --surface-2: hsl(220 16% 18%);
    --surface-3: hsl(220 14% 22%);
  }
}
```

## Performance
- Chart'ları viewport'a girdiğinde render et (IntersectionObserver)
- Büyük tablolarda virtual scrolling (react-virtual veya tanstack-virtual)
- Debounce: filter/search input'larında 300ms debounce
- Memoization: hesaplanan metrikleri cache'le
- Skeleton loading: her bileşen için content-aware skeleton
