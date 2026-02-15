---
description: MCP Gateway'in tam sağlık kontrolünü yapar. Build durumu, systemd watcher, sunucu bağlantıları, config doğrulaması ve log analizi.
user_invocable: true
---

# Diagnose MCP Gateway

Gateway'in tam bir sağlık teşhisi yap. Tüm kontrolleri paralel çalıştır ve sonuçları raporla.

## Kontrol Listesi

### 1. Build Durumu
- `build/` dizini var mı? İçinde `index.js` var mı?
- Son build zamanını kontrol et: `stat build/index.js`
- TypeScript derleme hatası var mı: `npx tsc --noEmit` çalıştır

### 2. Systemd Watcher Servisi
- `systemctl --user status mcp-gateway-watcher` çalıştır
- Servis aktif mi? Hata var mı?
- Son logları kontrol et: `journalctl --user -u mcp-gateway-watcher --no-pager -n 30`

### 3. Config Doğrulaması
- `gateway.config.json` dosyasını oku ve parse et
- Her sunucu için zorunlu alanları kontrol et (name, transport, command/url)
- Duplicate sunucu adı var mı?
- Timeout değerleri makul mü? (1000-60000ms arası)

### 4. Node.js Ortamı
- `node --version` kontrol et
- `npm ls @modelcontextprotocol/sdk` bağımlılık durumu
- `node_modules/` dizini mevcut mu?

### 5. MCP Bağlantı Testi
- Gateway meta tool'larını kullanarak durum kontrol et:
  - `gateway__status` tool'unu çağır
  - `gateway__list_servers` tool'unu çağır
- Bağlanamayan sunucuları raporla

### 6. Disk & Bellek
- `du -sh node_modules/ build/` boyutları
- Watcher servisinin bellek kullanımı

## Çıktı Formatı

Her kategori için durum emojisi kullan:
- Sorunsuz: [OK]
- Uyarı: [WARN]
- Hata: [FAIL]

Sonunda özet tablo ve varsa düzeltme önerileri ver.

## Otomatik Düzeltme
Eğer basit sorunlar bulursan (eksik build, durmuş servis, eksik node_modules) kullanıcıya düzeltme öner ve onay al.
