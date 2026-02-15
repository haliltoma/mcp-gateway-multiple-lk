---
description: Ralph Loop - Otonom iteratif geliştirme döngüsü. Bir görevi tamamlanana kadar tekrar tekrar çalıştırır. TDD, build-fix-test, refactoring ve greenfield projeler için ideal. Anthropic'in resmi Ralph Wiggum tekniğinden uyarlanmıştır.
user_invocable: true
---

# Ralph Loop - Autonomous Iterative Development

Ralph Loop, bir görevi completion promise'e ulaşana veya max iteration'a kadar iteratif olarak çalıştıran otonom geliştirme tekniğidir. Her iterasyonda önceki çalışmayı gözlemleyip iyileştirir.

> "Ralph is a Bash loop" - Geoffrey Huntley

## Nasıl Çalışır

1. Kullanıcı bir prompt ve tamamlanma kriterleri verir
2. Claude task üzerinde çalışır
3. Her iterasyonda: dosyaları oku → değişiklikleri gör → test çalıştır → sonuçlara göre iyileştir
4. Tamamlanma kriteri sağlanana kadar tekrarla

## Kullanıcıdan Al

1. **Task description**: Ne yapılacak?
2. **Completion criteria**: Ne zaman bitmiş sayılır?
3. **Max iterations**: Kaç iterasyonda dur? (varsayılan: 10)
4. **Validation command**: Başarıyı nasıl doğruluyoruz? (test komutu, build komutu, vs.)

## Uygulama

### Adım 1: Prompt Yapısını Kur
```
Task: [Kullanıcının görevi]

Completion Criteria:
- [Kriter 1]
- [Kriter 2]
- [Kriter 3]

Validation: [Test/build komutu]

Rules:
- Her iterasyonda önce mevcut durumu kontrol et (git diff, test results)
- Önceki iterasyonlarda yapılan çalışmayı tekrarlama
- Hata varsa root cause analizi yap, random fix deneme
- Her iterasyonu kısa bir status log'u ile bitir
```

### Adım 2: Iterasyon Döngüsü

Her iterasyonda şu sırayı izle:

```
ITERATION N:
┌─────────────────────────────────┐
│ 1. ASSESS - Mevcut durumu kontrol│
│    - git status / git diff       │
│    - Test sonuçları              │
│    - Build durumu                │
│    - Önceki iterasyon logları    │
├─────────────────────────────────┤
│ 2. PLAN - Bu iterasyonda ne yap  │
│    - Kalan sorunları listele     │
│    - Öncelik sırala              │
│    - En etkili değişikliği seç   │
├─────────────────────────────────┤
│ 3. IMPLEMENT - Kodu yaz/düzelt   │
│    - Tek bir odaklı değişiklik   │
│    - Minimal, targeted fix       │
├─────────────────────────────────┤
│ 4. VALIDATE - Test et            │
│    - Validation command çalıştır │
│    - Sonuçları analiz et         │
├─────────────────────────────────┤
│ 5. REPORT - Status raporla       │
│    - Ne yapıldı                  │
│    - Ne kaldı                    │
│    - Completion'a ne kadar yakın │
└─────────────────────────────────┘
```

### Adım 3: Tamamlanma Kontrolü

Her iterasyon sonunda:
- Tüm completion criteria sağlandı mı?
- Validation komutu başarılı mı?
- Max iteration'a ulaşıldı mı?

Eğer tamamlandıysa:
```
✅ RALPH LOOP COMPLETE
- Total iterations: N
- Changes made: [özet]
- All criteria met: [liste]
```

Eğer max iteration'a ulaşıldıysa:
```
⚠️ RALPH LOOP MAX ITERATIONS REACHED
- Completed: [tamamlanan kriterler]
- Remaining: [kalan kriterler]
- Blocking issues: [engeller]
- Suggested next steps: [öneriler]
```

## İyi Prompt Örnekleri

### TDD Loop
```
Task: REST API for todo management

Completion Criteria:
- CRUD endpoints (GET, POST, PUT, DELETE) working
- Input validation (empty title, invalid ID)
- All tests passing (minimum 10 tests)
- Test coverage > 80%

Validation: npm test

Max iterations: 15
```

### Bug Fix Loop
```
Task: Fix failing CI pipeline

Completion Criteria:
- All 47 tests passing
- No TypeScript errors (tsc --noEmit clean)
- Linting passes (eslint . clean)

Validation: npm run ci

Max iterations: 10
```

### Refactoring Loop
```
Task: Refactor monolithic UserService into separate modules

Completion Criteria:
- AuthService, ProfileService, NotificationService extracted
- No circular dependencies
- All existing tests still pass
- No new any types introduced

Validation: npm test && npm run typecheck

Max iterations: 12
```

### Frontend Build Loop
```
Task: Build responsive dashboard page

Completion Criteria:
- All components render without errors
- Lighthouse accessibility score >= 95
- Mobile responsive (works at 375px width)
- Dark mode support
- No console errors

Validation: npm run build && npm run test:e2e

Max iterations: 20
```

## Kurallar

1. **Iteration > Perfection**: İlk seferde mükemmel olmak zorunda değil, döngü iyileştirir
2. **Failures are Data**: Her hata bilgi verir, random fix deneme
3. **One Change at a Time**: Her iterasyonda tek odaklı değişiklik yap
4. **Never Repeat**: Önceki iterasyonda denenen ve başarısız olan şeyi tekrar deneme
5. **Exit Gracefully**: Max iteration'da dur ve durum raporu ver
6. **Self-Awareness**: Her iterasyonda "ben neredeyim, ne kaldı?" sorusunu sor

## İdeal Kullanım Senaryoları

- ✅ Net başarı kriterleri olan görevler
- ✅ Otomatik doğrulama olan görevler (testler, linter, build)
- ✅ Greenfield projeleri
- ✅ TDD geliştirme
- ✅ CI/CD fix'leri
- ✅ Refactoring (testler korunarak)

## Uygunsuz Senaryolar

- ❌ Subjektif tasarım kararları (net kriter yok)
- ❌ Tek seferlik operasyonlar
- ❌ Production debugging (targeted debugging kullan)
- ❌ Tamamlanma kriteri belirsiz görevler

## Kaynak

Bu skill [Anthropic'in resmi Ralph Wiggum plugin'inden](https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum) uyarlanmıştır. Orijinal teknik: [ghuntley.com/ralph](https://ghuntley.com/ralph/)
