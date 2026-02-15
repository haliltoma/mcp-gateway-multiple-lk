---
description: Mevcut projeye dark mode ekler veya sıfırdan tema sistemi kurar. CSS custom properties, prefers-color-scheme, theme toggle, localStorage persistence ve smooth transition.
user_invocable: true
---

# Implement Dark Mode & Theme System

Mevcut projeye dark mode ekle veya sıfırdan kapsamlı tema sistemi kur.

## Strateji Seçimi

Kullanıcıya sor:
1. **System-only**: Sadece OS tercihine göre (`prefers-color-scheme`)
2. **Manual toggle**: Kullanıcı seçimi (light/dark/system)
3. **Multi-theme**: Custom temalar (light, dark, high-contrast, vb.)

## Implementasyon

### CSS Custom Properties ile Tema Katmanı

```css
/* Base: Light theme (varsayılan) */
:root {
  color-scheme: light dark;

  /* Surface colors */
  --bg-page: hsl(220 15% 97%);
  --bg-card: hsl(0 0% 100%);
  --bg-elevated: hsl(0 0% 100%);
  --bg-overlay: hsla(220 20% 10% / 0.5);

  /* Text colors */
  --text-primary: hsl(220 15% 10%);
  --text-secondary: hsl(220 10% 40%);
  --text-muted: hsl(220 8% 55%);
  --text-inverse: hsl(220 15% 97%);

  /* Border colors */
  --border-subtle: hsl(220 10% 90%);
  --border-default: hsl(220 10% 82%);
  --border-strong: hsl(220 10% 70%);

  /* Brand colors - light mode optimized */
  --primary: hsl(230 70% 55%);
  --primary-hover: hsl(230 70% 48%);
  --primary-subtle: hsl(230 70% 96%);

  /* Semantic */
  --success: hsl(152 60% 38%);
  --warning: hsl(38 92% 50%);
  --danger: hsl(0 72% 50%);

  /* Shadow - light mode uses strong shadows */
  --shadow-color: 220 10% 50%;
  --shadow-sm: 0 1px 3px hsl(var(--shadow-color) / 0.08);
  --shadow-md: 0 4px 12px hsl(var(--shadow-color) / 0.1);
  --shadow-lg: 0 8px 24px hsl(var(--shadow-color) / 0.12);
}

/* Dark theme */
[data-theme="dark"],
:root:has(input#theme-dark:checked) {
  --bg-page: hsl(220 18% 8%);
  --bg-card: hsl(220 16% 12%);
  --bg-elevated: hsl(220 14% 16%);
  --bg-overlay: hsla(220 20% 4% / 0.7);

  --text-primary: hsl(220 10% 93%);
  --text-secondary: hsl(220 8% 68%);
  --text-muted: hsl(220 6% 48%);
  --text-inverse: hsl(220 15% 10%);

  --border-subtle: hsl(220 12% 18%);
  --border-default: hsl(220 10% 25%);
  --border-strong: hsl(220 8% 35%);

  /* Dark mode'da saturation ve lightness ayarla */
  --primary: hsl(230 65% 65%);
  --primary-hover: hsl(230 65% 72%);
  --primary-subtle: hsl(230 40% 18%);

  --success: hsl(152 55% 48%);
  --warning: hsl(38 85% 58%);
  --danger: hsl(0 65% 58%);

  /* Dark mode'da shadow çok hafif veya border ile değiştir */
  --shadow-color: 220 20% 2%;
  --shadow-sm: 0 1px 3px hsl(var(--shadow-color) / 0.3);
  --shadow-md: 0 4px 12px hsl(var(--shadow-color) / 0.4);
  --shadow-lg: 0 8px 24px hsl(var(--shadow-color) / 0.5);
}

/* System preference fallback */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    /* dark theme variables tekrar */
  }
}
```

### Theme Toggle Component

```html
<button
  class="theme-toggle"
  id="theme-toggle"
  aria-label="Tema değiştir"
  title="Tema değiştir"
>
  <svg class="theme-toggle__icon theme-toggle__icon--sun" aria-hidden="true">
    <!-- Sun icon -->
  </svg>
  <svg class="theme-toggle__icon theme-toggle__icon--moon" aria-hidden="true">
    <!-- Moon icon -->
  </svg>
</button>
```

```css
.theme-toggle {
  position: relative;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: var(--radius-full);
  display: grid;
  place-items: center;
  transition: background 200ms ease;
}
.theme-toggle:hover {
  background: var(--bg-elevated);
}

.theme-toggle__icon {
  position: absolute;
  width: 20px;
  height: 20px;
  transition: transform 300ms var(--ease-spring), opacity 200ms ease;
}

/* Light mode: sun visible, moon hidden */
.theme-toggle__icon--sun { opacity: 1; transform: rotate(0) scale(1); }
.theme-toggle__icon--moon { opacity: 0; transform: rotate(-90deg) scale(0.5); }

/* Dark mode: moon visible, sun hidden */
[data-theme="dark"] .theme-toggle__icon--sun { opacity: 0; transform: rotate(90deg) scale(0.5); }
[data-theme="dark"] .theme-toggle__icon--moon { opacity: 1; transform: rotate(0) scale(1); }
```

### JavaScript: Theme Manager

```javascript
class ThemeManager {
  #storageKey = 'theme-preference';
  #theme;

  constructor() {
    // 1. localStorage'dan oku
    // 2. Yoksa system preference
    // 3. Yoksa 'light'
    this.#theme = this.#getStoredTheme() || this.#getSystemTheme();
    this.#apply(this.#theme);

    // System preference değişikliğini dinle
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!this.#getStoredTheme()) {
        this.#apply(e.matches ? 'dark' : 'light');
      }
    });
  }

  toggle() {
    this.#theme = this.#theme === 'dark' ? 'light' : 'dark';
    this.#apply(this.#theme);
    localStorage.setItem(this.#storageKey, this.#theme);
  }

  setTheme(theme) {
    if (theme === 'system') {
      localStorage.removeItem(this.#storageKey);
      this.#theme = this.#getSystemTheme();
    } else {
      this.#theme = theme;
      localStorage.setItem(this.#storageKey, theme);
    }
    this.#apply(this.#theme);
  }

  #apply(theme) {
    // FOUC önleme: transition'ı geçici kapat
    document.documentElement.style.setProperty('--theme-transition', 'none');
    document.documentElement.setAttribute('data-theme', theme);

    // Force reflow sonra transition'ı geri aç
    document.documentElement.offsetHeight;
    document.documentElement.style.removeProperty('--theme-transition');
  }

  #getStoredTheme() {
    return localStorage.getItem(this.#storageKey);
  }

  #getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}

// Singleton
const themeManager = new ThemeManager();
document.getElementById('theme-toggle')?.addEventListener('click', () => themeManager.toggle());
```

### FOUC (Flash of Unstyled Content) Önleme

**`<head>` içine inline script (ZORUNLU):**
```html
<script>
  // Sayfa render'dan ÖNCE tema uygula
  (function() {
    const stored = localStorage.getItem('theme-preference');
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', stored || system);
  })();
</script>
```

### Smooth Theme Transition
```css
/* Tema değişirken smooth transition */
:root {
  transition:
    background-color 300ms ease,
    color 200ms ease;
}

/* Yalnız tema değişiminde transition, sayfa yüklemede DEĞİL */
:root[style*="--theme-transition: none"],
:root[style*="--theme-transition: none"] * {
  transition: none !important;
}
```

## Dark Mode Tasarım Kuralları

1. **Saf siyah KULLANMA**: `#000` yerine `hsl(220 18% 8%)` (hafif mavi tint)
2. **Light mode'u ters çevirme**: Dark mode ayrı tasarlanmalı
3. **Saturation düşür**: Parlak renkler dark'ta göz yorar
4. **Elevation = lightness**: Dark mode'da yüksek element daha açık olmalı (shadow yerine)
5. **White text on dark**: `hsl(0 0% 93%)` kullan, `#fff` değil (göz yormaz)
6. **Image handling**:
```css
/* Dark mode'da resimlerin parlaklığını hafif düşür */
[data-theme="dark"] img:not([data-no-dim]) {
  filter: brightness(0.9);
}
/* SVG icon'ları current color kullan */
svg { fill: currentColor; }
```
7. **Shadow'lar dark'ta etkisiz**: Border veya elevated surface kullan
8. **Input alanları**: Background'u page background'dan farklı olmalı
