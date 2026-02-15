---
description: Gateway ve watcher servisinin loglarını analiz eder. Hata pattern'leri, bağlantı sorunları ve performans metrikleri çıkarır.
user_invocable: true
---

# Analyze Gateway Logs

Gateway loglarını detaylı analiz et.

## Log Kaynakları

### 1. Systemd Watcher Logları
```bash
journalctl --user -u mcp-gateway-watcher --no-pager -n 100
```
- Derleme hataları
- Watch mode durumu
- Restart olayları

### 2. Gateway Runtime Logları (stderr)
MCP Gateway çalışırken stderr'e yazdığı loglar:
- Bağlantı başarıları/hataları
- Tool çağrı hataları
- Timeout'lar
- Reconnect denemeleri

### 3. Zaman Filtreli Analiz
Kullanıcıya sor: Son kaç saat/gün loglarını görmek istiyor?
```bash
journalctl --user -u mcp-gateway-watcher --since "1 hour ago" --no-pager
```

## Analiz Noktaları

### Hata Pattern'leri
- En sık tekrarlanan hatalar
- Hangi sunucu en çok hata veriyor
- Timeout oranları

### Bağlantı Durumu
- Hangi sunucular sık kopuyor
- Reconnect başarı oranı
- Ortalama bağlantı süresi

### Build Durumu
- Son başarılı build zamanı
- Watch mode'da hata sayısı
- Derleme süresi

## Çıktı Formatı

1. **Özet**: Son X saatte kaç hata, kaç uyarı
2. **Hata Tablosu**: Sunucu bazında hata dağılımı
3. **Zaman Çizelgesi**: Önemli olaylar kronolojik sırayla
4. **Öneriler**: Tespit edilen sorunlara çözüm önerileri
