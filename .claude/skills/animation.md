---
description: Gelişmiş CSS/JS animasyonlar ve micro-interaction'lar oluşturur. Scroll-driven, GSAP-level, physics-based ve GPU-accelerated animasyonlar.
user_invocable: true
---

# Create Advanced Animations & Micro-Interactions

Performanslı, etkileyici ve purposeful animasyonlar oluştur. Her animasyonun bir amacı olmalı - dekoratif animasyon YAPMA.

## Animasyon Kategorileri

### 1. Page Transition Animasyonları
```css
/* View Transition API (modern browsers) */
@view-transition {
  navigation: auto;
}

::view-transition-old(root) {
  animation: 300ms ease-out both fade-and-scale-out;
}
::view-transition-new(root) {
  animation: 300ms ease-out both fade-and-scale-in;
}

@keyframes fade-and-scale-out {
  to { opacity: 0; transform: scale(0.95); }
}
@keyframes fade-and-scale-in {
  from { opacity: 0; transform: scale(1.05); }
}

/* Fallback: manual transition */
.page-enter {
  animation: page-in 400ms var(--ease-out-expo) both;
}
@keyframes page-in {
  from {
    opacity: 0;
    transform: translateY(20px);
    filter: blur(4px);
  }
}
```

### 2. Scroll-Driven Animasyonlar
```css
/* CSS Scroll-Driven Animations (Chrome 115+) */
.parallax-element {
  animation: parallax linear both;
  animation-timeline: scroll(root);
  animation-range: 0% 100%;
}
@keyframes parallax {
  from { transform: translateY(-100px); }
  to { transform: translateY(100px); }
}

/* Progress bar on scroll */
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: var(--color-primary);
  transform-origin: left;
  animation: progress-grow linear;
  animation-timeline: scroll(root);
}
@keyframes progress-grow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
```

**JS Fallback (IntersectionObserver + scroll position):**
```javascript
// Parallax with requestAnimationFrame
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const scrolled = window.scrollY;
      document.querySelectorAll('[data-parallax]').forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.5;
        el.style.transform = `translateY(${scrolled * speed}px)`;
      });
      ticking = false;
    });
    ticking = true;
  }
});
```

### 3. Micro-Interactions

**Button Press Effect:**
```css
.btn {
  transition:
    transform 150ms var(--ease-out-back),
    box-shadow 150ms ease,
    background-color 200ms ease;
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
.btn:active {
  transform: translateY(0) scale(0.98);
  box-shadow: var(--shadow-sm);
  transition-duration: 50ms;
}
```

**Toggle Switch:**
```css
.toggle {
  position: relative;
  width: 52px;
  height: 28px;
  background: var(--color-surface-3);
  border-radius: 14px;
  transition: background 300ms ease;
  cursor: pointer;
}
.toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  transition: transform 300ms var(--ease-spring);
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}
.toggle.active {
  background: var(--color-primary);
}
.toggle.active::after {
  transform: translateX(24px);
}
```

**Ripple Effect (Material-style):**
```javascript
function createRipple(event) {
  const button = event.currentTarget;
  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
  circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
  circle.classList.add('ripple');

  button.appendChild(circle);
  circle.addEventListener('animationend', () => circle.remove());
}
```

```css
.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  transform: scale(0);
  animation: ripple-expand 600ms ease-out;
  pointer-events: none;
}
@keyframes ripple-expand {
  to { transform: scale(4); opacity: 0; }
}
```

### 4. Loading Animasyonları

**Skeleton Loader:**
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--surface-2) 0%,
    var(--surface-3) 40%,
    var(--surface-2) 80%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite ease-in-out;
  border-radius: 4px;
}
@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Staggered List Loading:**
```css
.list-item {
  animation: list-enter 400ms var(--ease-out-expo) both;
}
.list-item:nth-child(1) { animation-delay: 0ms; }
.list-item:nth-child(2) { animation-delay: 50ms; }
.list-item:nth-child(3) { animation-delay: 100ms; }
/* ... CSS custom property ile dynamic delay */

@keyframes list-enter {
  from {
    opacity: 0;
    transform: translateX(-12px);
  }
}
```

### 5. Physics-Based Animasyonlar
```javascript
// Spring animation (GSAP alternatifi, vanilla JS)
function springAnimation(element, target, options = {}) {
  const {
    stiffness = 120,
    damping = 14,
    mass = 1,
    property = 'transform',
    onComplete = null
  } = options;

  let velocity = 0;
  let current = parseFloat(getComputedStyle(element).getPropertyValue('--spring-value')) || 0;
  let rafId;

  function tick() {
    const force = stiffness * (target - current);
    const dampingForce = damping * velocity;
    const acceleration = (force - dampingForce) / mass;

    velocity += acceleration * (1 / 60);
    current += velocity * (1 / 60);

    element.style.setProperty('--spring-value', current);

    if (Math.abs(velocity) < 0.01 && Math.abs(target - current) < 0.01) {
      element.style.setProperty('--spring-value', target);
      if (onComplete) onComplete();
      return;
    }

    rafId = requestAnimationFrame(tick);
  }

  tick();
  return () => cancelAnimationFrame(rafId);
}
```

### 6. Text Animasyonları

**Character-by-character reveal:**
```javascript
function splitTextAnimation(element, delay = 30) {
  const text = element.textContent;
  element.innerHTML = '';
  element.setAttribute('aria-label', text);

  [...text].forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.animationDelay = `${i * delay}ms`;
    span.classList.add('char-reveal');
    span.setAttribute('aria-hidden', 'true');
    element.appendChild(span);
  });
}
```

```css
.char-reveal {
  display: inline-block;
  opacity: 0;
  transform: translateY(20px) rotateX(-90deg);
  animation: char-in 500ms var(--ease-out-expo) forwards;
}
@keyframes char-in {
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }
}
```

**Typewriter effect:**
```css
.typewriter {
  overflow: hidden;
  border-right: 2px solid var(--color-primary);
  white-space: nowrap;
  animation:
    typing 3s steps(40, end),
    blink-caret 0.75s step-end infinite;
  width: 0;
}
@keyframes typing {
  to { width: 100%; }
}
@keyframes blink-caret {
  50% { border-color: transparent; }
}
```

## Performance Kuralları

1. **Sadece composite property'leri animate et:** `transform`, `opacity`, `filter`, `clip-path`
2. **`will-change` akıllıca kullan:** Sadece animasyon başlamadan hemen önce ekle, bitince kaldır
3. **Layout thrashing'den KAÇIN:** `width`, `height`, `top`, `left`, `margin`, `padding` animate etme
4. **`requestAnimationFrame` kullan:** `setInterval` veya `setTimeout` ile animasyon YAPMA
5. **`prefers-reduced-motion` ZORUNLU:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
6. **GPU katmanı:** `transform: translateZ(0)` veya `will-change: transform` ile GPU'ya taşı (ama max 10-15 element)
7. **Paint debugging:** Chrome DevTools → Rendering → Paint flashing ile kontrol et
