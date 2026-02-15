# MCP Gateway

Birden fazla MCP sunucusunu tek bir stdio gateway üzerinden yöneten proxy. Claude Code bu gateway'i `.mcp.json` üzerinden child process olarak başlatır.

## Mimari

```
Claude Code → stdio → MCP Gateway → stdio/http → Alt MCP sunucuları
```

- `src/index.ts` → CLI giriş noktası
- `src/gateway.ts` → Ana gateway sınıfı (McpServer + proxy tool'lar)
- `src/connection-manager.ts` → Alt sunucu bağlantı yönetimi
- `src/config.ts` → Config yükleme, log yönetimi
- `src/types.ts` → TypeScript interface'leri

## Komutlar

- `npm run build` → TypeScript derle
- `npm run dev` → tsx ile development mode
- `npm start` → Derlenmiş gateway'i çalıştır
- `npm run watch` → tsc --watch (sürekli build)
- `npm run clean` → Build çıktılarını sil

## Config

- `gateway.config.json` → Sunucu tanımları
- `.mcp.json` → Claude Code MCP entegrasyonu

## Kurallar

- Tüm loglar `stderr`'e yazılır (stdout MCP protokolü için ayrılmış)
- Alt sunuculara bağlantı arka planda yapılır (stdio hemen açılır)
- Tool isimleri `serverName__toolName` formatında namespace'lenir
- Sunucu hatası diğer sunucuları etkilemez

## Systemd Watcher

Boot'ta otomatik build için `mcp-gateway-watcher` user service'i çalışır:
- `scripts/watch-build.sh` → Build watcher
- `scripts/mcp-gateway-watcher.service` → systemd unit
- `scripts/setup-watcher.sh` → Kurulum scripti
- Durum: `systemctl --user status mcp-gateway-watcher`
- Loglar: `journalctl --user -u mcp-gateway-watcher -f`

## Skills

Proje ile birlikte gelen Claude Code skill'leri (`.claude/skills/`):

| Skill | Açıklama |
|-------|----------|
| `/add-server` | Gateway'e yeni MCP sunucusu ekle |
| `/remove-server` | Sunucu kaldır |
| `/toggle-server` | Sunucuyu aktif/pasif yap |
| `/diagnose` | Tam sağlık kontrolü |
| `/scaffold-server` | Yeni custom MCP sunucu iskeleti oluştur |
| `/security-audit` | Güvenlik denetimi |
| `/optimize` | Performans optimizasyonu |
| `/update-servers` | Paket güncellemeleri |
| `/gateway-logs` | Log analizi |
| `/deploy` | Yeni makineye kurulum |
| `/backup-config` | Config yedekleme/geri yükleme |
