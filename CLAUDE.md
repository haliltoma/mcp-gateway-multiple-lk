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

### Frontend Skills

| Skill | Açıklama |
|-------|----------|
| `/ui-component` | Production-grade UI component (design tokens, a11y, dark mode, micro-interactions) |
| `/landing-page` | High-converting landing page (hero, pricing, testimonials, scroll animations) |
| `/dashboard` | Data-driven admin dashboard (charts, KPI cards, tables, real-time) |
| `/animation` | Gelişmiş CSS/JS animasyonlar (scroll-driven, physics-based, micro-interactions) |
| `/design-system` | Sıfırdan design system (color, typography, spacing, 20+ component) |
| `/form-builder` | Multi-step form wizard (validation, drag-drop upload, auto-save) |
| `/accessibility-audit` | WCAG 2.1 AA/AAA denetimi ve otomatik düzeltme |
| `/responsive-layout` | Modern CSS layout (Grid, Container Queries, fluid design) |
| `/performance-audit` | Core Web Vitals, bundle size, caching analizi |
| `/seo-optimize` | Meta tags, structured data, sitemap, teknik SEO |
| `/dark-mode` | Tema sistemi (toggle, localStorage, FOUC önleme, smooth transition) |
