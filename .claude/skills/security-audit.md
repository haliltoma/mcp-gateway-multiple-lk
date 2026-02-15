---
description: Gateway konfigürasyonunun güvenlik denetimini yapar. Açık API anahtarları, izin sorunları, tehlikeli argümanlar ve best practice kontrolleri.
user_invocable: true
---

# Security Audit for MCP Gateway

Gateway'in güvenlik denetimini yap ve raporla.

## Kontrol Noktaları

### 1. Exposed Secrets (KRİTİK)
- `gateway.config.json` içindeki `env` alanlarını tara
- API key, token, secret, password gibi değerler düz metin mi?
- Öneriler:
  - Environment variable referansı kullan: `"BRAVE_API_KEY": "$BRAVE_API_KEY"` yerine gerçek değeri koyma
  - `.env` dosyası + dotenv kullanımı öner
  - `.gitignore`'da `gateway.config.json` var mı kontrol et (hassas veri içeriyorsa)

### 2. Dosya Sistemi Erişimi
- `filesystem` sunucusunun erişim yollarını kontrol et
- Root `/` yerine spesifik dizinler mi tanımlı?
- Home dizini tamamı mı yoksa proje dizini mi?
- Hassas dizinler açık mı? (`~/.ssh`, `~/.gnupg`, `~/.config`)

### 3. Komut Enjeksiyon Riski
- `command` ve `args` alanlarında tehlikeli pattern'ler var mı?
- Shell expansion riski var mı? (`;`, `&&`, `|`, backtick)
- `npx -y` kullanımı güvenli mi? (otomatik paket kurulumu riski)

### 4. Network Exposure
- HTTP transport kullanan sunucular var mı?
- URL'ler localhost mu yoksa uzak sunucu mu?
- TLS/HTTPS kullanılıyor mu?

### 5. Permissions
- `build/index.js` dosya izinleri (755 olmalı, 777 olmamalı)
- Servis dosyası izinleri
- Config dosyası izinleri (API key varsa 600 olmalı)

### 6. Dependency Audit
- `npm audit` çalıştır
- Bilinen güvenlik açıkları var mı?
- Outdated paketler var mı?

## Çıktı Formatı

Her bulgu için:
- **Seviye**: KRITIK / YUKSEK / ORTA / DUSUK / INFO
- **Bulgu**: Ne tespit edildi
- **Risk**: Ne olabilir
- **Oneri**: Nasıl düzeltilir

Sonunda güvenlik skoru ver (A-F arası).

## Otomatik Düzeltme
- Exposed API key'ler için `.env` dosyası oluşturmayı öner
- `.gitignore` güncellemesi öner
- Dosya izin düzeltmeleri öner
Tüm düzeltmeler için kullanıcıdan onay al.
