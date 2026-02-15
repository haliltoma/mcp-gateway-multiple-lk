---
description: Gateway performansını analiz eder ve optimizasyon önerileri sunar. Timeout ayarları, bellek kullanımı, bağlantı stratejisi ve config iyileştirmeleri.
user_invocable: true
---

# Optimize MCP Gateway Performance

Gateway'in performansını analiz et ve iyileştirme önerileri sun.

## Analiz Alanları

### 1. Timeout Optimizasyonu
- Her sunucunun mevcut timeout değerini kontrol et
- Lokal sunucular (filesystem, sequential-thinking) için düşük timeout öner (5000ms)
- Ağ gerektiren sunucular (brave-search, fetch) için uygun timeout öner (15000ms)
- npx ile başlatılan sunucular ilk sefer yavaş olabilir (paket indirme) - bunu hesaba kat

### 2. Bellek Kullanımı
- `systemctl --user status mcp-gateway-watcher` ile watcher bellek kullanımı
- `ps aux | grep mcp` ile çalışan MCP process'leri
- Her sunucunun ayrı bir node process'i olduğunu hatırlat
- Gereksiz sunucuları devre dışı bırakmayı öner

### 3. Startup Hızı
- Kaç sunucu aktif? Hepsi gerekli mi?
- Background connection stratejisi doğru mu?
- npx cache durumu: `npm cache ls` ile kontrol

### 4. Config İyileştirmeleri
- `useNamespace` açık mı? (tool isim çakışması için önemli)
- `autoReconnect` gereksiz sunucularda kapalı olabilir
- `logLevel` production'da "warn" veya "error" olmalı

### 5. Build Optimizasyonu
- tsconfig.json ayarları optimal mi?
- Source map'ler production'da gerekli mi?
- `declaration` ve `declarationMap` gerekli mi?

### 6. Sunucu Kullanım Analizi
- Hangi sunucular en çok kullanılıyor?
- Hiç kullanılmayan sunucu var mı?
- Kullanılmayan sunucuları `"enabled": false` yapmayı öner

## Çıktı

Her öneri için:
- **Mevcut Durum**: Şu an ne var
- **Öneri**: Ne yapılmalı
- **Etki**: Tahmini iyileşme (hız, bellek, stabilite)
- **Risk**: Değişiklik riski

Önceliklendirme: Yüksek etki + düşük risk olanlar önce.
