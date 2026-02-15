---
description: Gateway'den bir MCP sunucusunu kaldırır. Mevcut sunucuları listeler, kullanıcıya seçtirir ve gateway.config.json'dan siler.
user_invocable: true
---

# Remove MCP Server from Gateway

Kullanıcı gateway'den bir MCP sunucusunu kaldırmak istiyor.

## Adımlar

1. **gateway.config.json dosyasını oku** (`/home/laserkopf/Desktop/freelance/mcp-gateway-multiple-lk/gateway.config.json`)

2. **Mevcut sunucuları listele** ve kullanıcıya hangisini kaldırmak istediğini sor (AskUserQuestion ile)

3. **Onay al**: "X sunucusunu kaldırmak istediğinizden emin misiniz?" diye sor

4. **Sunucuyu sil**: `servers` dizisinden ilgili sunucu objesini kaldır

5. **gateway.config.json'u güncelle**

6. **Kullanıcıya bildir**: Değişikliğin etkili olması için Claude Code'un yeniden başlatılması gerektiğini söyle

## Kurallar
- Meta tool'lar (gateway__*) kaldırılamaz
- Son sunucu kaldırılırken uyar ama engelleme
- JSON formatını bozma, güzel format koru (2 space indent)
