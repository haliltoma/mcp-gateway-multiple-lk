---
description: MCP Gateway'i yeni bir makinede sıfırdan kurar. Node.js, bağımlılıklar, build, systemd servisi ve Claude Code entegrasyonu dahil.
user_invocable: true
---

# Deploy MCP Gateway to New Machine

MCP Gateway'i yeni bir makinede sıfırdan kurma rehberi ve otomatik kurulum.

## Ön Koşullar Kontrolü

1. **İşletim Sistemi**: Linux (systemd destekli) kontrol et
2. **Node.js**: v18+ gerekli, `node --version` kontrol et
3. **npm**: Mevcut mu? `npm --version`
4. **Git**: Repo klonlamak için `git --version`
5. **systemd**: `systemctl --version` kontrol et

## Kurulum Adımları

### 1. Repo Klonla
```bash
git clone <repo-url> ~/mcp-gateway
cd ~/mcp-gateway
```

### 2. Bağımlılıkları Yükle
```bash
npm install
```

### 3. İlk Build
```bash
npm run build
```

### 4. Config Oluştur
- `gateway.config.json` dosyasını oluştur veya kopyala
- API key'leri environment variable olarak ayarla
- Sunucu listesini ortama göre düzenle

### 5. Test Et
```bash
npm start
```
Gateway çalışıyor mu kontrol et.

### 6. Systemd Watcher Kurulumu
```bash
bash scripts/setup-watcher.sh
```
Bu script:
- Service dosyasını kopyalar
- Servisi etkinleştirir ve başlatır
- Linger'ı etkinleştirir (boot'ta otomatik başlatma)

### 7. Claude Code Entegrasyonu
`.mcp.json` dosyasını proje dizinine kopyala veya oluştur:
```json
{
  "mcpServers": {
    "mcp-gateway": {
      "type": "stdio",
      "command": "node",
      "args": ["<proje-dizini>/build/index.js", "--config=<proje-dizini>/gateway.config.json"]
    }
  }
}
```

### 8. Doğrulama
- `systemctl --user status mcp-gateway-watcher` - watcher aktif mi?
- Claude Code'u başlat ve gateway tool'larını kontrol et
- `gateway__status` tool'unu çağır

## Path Güncelleme
`scripts/watch-build.sh` ve `scripts/mcp-gateway-watcher.service` dosyalarındaki hardcoded path'leri yeni makineye göre güncelle:
- NODE_DIR path
- PROJECT_DIR path
- ExecStart path
- WorkingDirectory path

## Rollback
Sorun olursa:
```bash
systemctl --user stop mcp-gateway-watcher
systemctl --user disable mcp-gateway-watcher
rm ~/.config/systemd/user/mcp-gateway-watcher.service
systemctl --user daemon-reload
```
