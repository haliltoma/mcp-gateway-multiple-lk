---
description: Gelişmiş form oluşturur. Multi-step wizard, real-time validation, conditional fields, file upload, auto-save ve accessible error handling dahil.
user_invocable: true
---

# Create Advanced Form

Kullanıcı deneyimi odaklı, accessibility-first, gelişmiş form oluştur.

## Form Mimarisi

### Kullanıcıdan Al
1. Form amacı (kayıt, ödeme, anket, profil, iletişim vs.)
2. Alanlar listesi
3. Tek sayfa mı, multi-step wizard mı?
4. Framework (React, Vue, vanilla)
5. Validation kütüphanesi tercihi (Zod, Yup, native)

### Form Layout Patterns

**Single Column (varsayılan - mobile friendly):**
```css
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-width: 480px;
}
```

**Two Column (desktop'ta yan yana, mobile'da stack):**
```css
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}
@media (max-width: 640px) {
  .form-row { grid-template-columns: 1fr; }
}
```

### Input Component Anatomisi
```html
<div class="field" data-state="default|focus|error|success|disabled">
  <label class="field__label" for="email">
    Email adresi
    <span class="field__required" aria-hidden="true">*</span>
  </label>

  <div class="field__hint" id="email-hint">
    İş email adresinizi girin
  </div>

  <div class="field__input-wrapper">
    <span class="field__icon-left"><!-- SVG icon --></span>
    <input
      type="email"
      id="email"
      name="email"
      class="field__input"
      placeholder="ornek@sirket.com"
      aria-describedby="email-hint email-error"
      aria-invalid="false"
      aria-required="true"
      autocomplete="email"
    />
    <span class="field__icon-right"><!-- validation icon --></span>
  </div>

  <div class="field__error" id="email-error" role="alert" aria-live="polite">
    <!-- Error message appears here -->
  </div>

  <div class="field__counter">0/100</div>
</div>
```

### Input Styling
```css
.field__input {
  width: 100%;
  padding: var(--space-2.5) var(--space-3);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--text-primary);
  background: var(--bg-secondary);
  border: 1.5px solid var(--border-default);
  border-radius: var(--radius-md);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

/* Focus - ring + border color change */
.field__input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px hsla(var(--hue-primary) 60% 48% / 0.15);
}

/* Error state */
.field[data-state="error"] .field__input {
  border-color: var(--danger-500);
}
.field[data-state="error"] .field__input:focus {
  box-shadow: 0 0 0 3px hsla(0 72% 55% / 0.15);
}

/* Success state */
.field[data-state="success"] .field__input {
  border-color: var(--success-500);
}

/* Disabled */
.field__input:disabled {
  background: var(--neutral-100);
  color: var(--text-tertiary);
  cursor: not-allowed;
}

/* Error message animation */
.field__error {
  font-size: var(--text-sm);
  color: var(--danger-500);
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 200ms ease, opacity 200ms ease, margin 200ms ease;
}
.field[data-state="error"] .field__error {
  max-height: 60px;
  opacity: 1;
  margin-top: var(--space-1);
}
```

## Validation Stratejisi

### When to Validate
```javascript
// 1. LAZY validation: İlk submit'e kadar validate etme
// 2. Submit sonrası: Her blur'da validate et (eager)
// 3. Düzeltme sırasında: Her keystroke'da validate et (gerçek zamanlı)

class FormValidator {
  constructor(form) {
    this.form = form;
    this.submitted = false;
    this.touchedFields = new Set();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitted = true;
      this.validateAll();
    });

    // Blur'da validate (sadece submit sonrası)
    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('blur', () => {
        this.touchedFields.add(input.name);
        if (this.submitted || this.touchedFields.has(input.name)) {
          this.validateField(input);
        }
      });

      // Input sırasında validate (sadece hata varsa, düzeltme feedback'i)
      input.addEventListener('input', () => {
        if (input.closest('.field').dataset.state === 'error') {
          this.validateField(input);
        }
      });
    });
  }
}
```

### Validation Rules (Zod ile)
```typescript
const formSchema = z.object({
  email: z.string()
    .min(1, 'Email gereklidir')
    .email('Geçerli bir email adresi girin'),
  password: z.string()
    .min(8, 'En az 8 karakter olmalı')
    .regex(/[A-Z]/, 'En az 1 büyük harf olmalı')
    .regex(/[0-9]/, 'En az 1 rakam olmalı'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});
```

## Multi-Step Wizard

```html
<form class="wizard">
  <nav class="wizard__steps" aria-label="Form adımları">
    <ol>
      <li class="wizard__step wizard__step--completed" aria-current="false">
        <span class="wizard__step-number">✓</span>
        <span class="wizard__step-label">Kişisel Bilgiler</span>
      </li>
      <li class="wizard__step wizard__step--active" aria-current="step">
        <span class="wizard__step-number">2</span>
        <span class="wizard__step-label">İletişim</span>
      </li>
      <li class="wizard__step">
        <span class="wizard__step-number">3</span>
        <span class="wizard__step-label">Onay</span>
      </li>
    </ol>
    <div class="wizard__progress" style="--progress: 66%"></div>
  </nav>

  <div class="wizard__panel" role="tabpanel">
    <!-- Current step content -->
  </div>

  <div class="wizard__actions">
    <button type="button" class="btn btn--secondary">Geri</button>
    <button type="button" class="btn btn--primary">İleri</button>
    <!-- Last step: -->
    <button type="submit" class="btn btn--primary">Gönder</button>
  </div>
</form>
```

**Step transition animation:**
```css
.wizard__panel {
  animation: step-enter 300ms var(--ease-out-expo);
}
@keyframes step-enter {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
}
/* Geri giderken: */
.wizard__panel--back {
  animation: step-enter-back 300ms var(--ease-out-expo);
}
@keyframes step-enter-back {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
}
```

## Özel Input Türleri

### Password Strength Meter
```css
.password-strength {
  display: flex;
  gap: var(--space-1);
  margin-top: var(--space-2);
}
.password-strength__bar {
  height: 4px;
  flex: 1;
  border-radius: 2px;
  background: var(--neutral-200);
  transition: background 300ms ease;
}
.password-strength[data-strength="1"] .password-strength__bar:nth-child(-n+1) { background: var(--danger-500); }
.password-strength[data-strength="2"] .password-strength__bar:nth-child(-n+2) { background: var(--warning-500); }
.password-strength[data-strength="3"] .password-strength__bar:nth-child(-n+3) { background: var(--success-400); }
.password-strength[data-strength="4"] .password-strength__bar:nth-child(-n+4) { background: var(--success-500); }
```

### File Upload (Drag & Drop)
```css
.file-drop {
  border: 2px dashed var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  text-align: center;
  transition: border-color 200ms ease, background 200ms ease;
  cursor: pointer;
}
.file-drop:hover,
.file-drop.dragover {
  border-color: var(--primary-500);
  background: hsla(var(--hue-primary) 60% 48% / 0.04);
}
```

### Auto-Save
```javascript
// Debounced auto-save to localStorage
function autoSave(form, key, delay = 1000) {
  let timeout;
  const save = () => {
    const data = new FormData(form);
    const obj = Object.fromEntries(data.entries());
    localStorage.setItem(key, JSON.stringify(obj));
    // Visual feedback
    showSaveIndicator();
  };

  form.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(save, delay);
  });

  // Restore on load
  const saved = localStorage.getItem(key);
  if (saved) {
    const data = JSON.parse(saved);
    Object.entries(data).forEach(([name, value]) => {
      const input = form.elements[name];
      if (input) input.value = value;
    });
  }
}
```

## Accessibility Checklist
- [ ] Tüm input'ların `label`'ı var (placeholder label DEĞİLDİR)
- [ ] Required alanlar `aria-required="true"` ile işaretli
- [ ] Hata mesajları `role="alert"` ve `aria-live="polite"` ile
- [ ] `aria-invalid="true"` hatalı alanlarda
- [ ] `aria-describedby` ile hint ve error mesajları bağlı
- [ ] `autocomplete` attribute'ları doğru (name, email, tel, address, cc-number vs.)
- [ ] Tab sırası mantıklı (tabindex kullanma, DOM sırası yeterli)
- [ ] Focus form hatalarında ilk hatalı alana scroll et
- [ ] Submit button'da loading state (disabled + spinner)
- [ ] Keyboard ile tüm form kullanılabilir
