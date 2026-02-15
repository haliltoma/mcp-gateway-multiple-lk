---
description: Gateway'deki tüm MCP sunucu paketlerini en son sürüme günceller. npm paket versiyonlarını kontrol eder ve config'i günceller.
user_invocable: true
---

# Update All MCP Server Packages

Gateway config'indeki tüm MCP sunucu paketlerini güncelle.

## Adımlar

### 1. Mevcut Sunucu Paketlerini Listele
- `gateway.config.json` oku
- Her sunucunun `args` alanından paket adını çıkar (genelde `npx -y <paket>` formatında)
- `@latest` tag'i zaten var mı kontrol et

### 2. Paket Versiyonlarını Kontrol Et
Her paket için `npm view <paket> version` çalıştır ve güncel versiyonu al.
Paralel çalıştır (hız için).

### 3. Güncelleme Raporu Oluştur
Tablo formatında göster:
```
Sunucu             | Paket                                    | Mevcut    | Güncel
---                | ---                                      | ---       | ---
context7           | @upstash/context7-mcp                    | @latest   | 1.2.3
chrome-devtools    | chrome-devtools-mcp                      | @latest   | 0.5.1
```

### 4. Gateway Bağımlılıklarını Güncelle
- `npm update` çalıştır (gateway'in kendi bağımlılıkları için)
- `npm audit fix` çalıştır (güvenlik yamaları)

### 5. Rebuild
- `npm run build` çalıştır
- Hata varsa raporla

### 6. Watcher Servisini Yeniden Başlat
- `systemctl --user restart mcp-gateway-watcher` çalıştır

## Notlar
- `npx -y <paket>@latest` kullanılan sunucular otomatik olarak en son sürümü çeker
- Pinned version kullanan sunucuları güncelleme - sadece raporla
- Major version değişikliklerinde uyar (breaking change riski)
