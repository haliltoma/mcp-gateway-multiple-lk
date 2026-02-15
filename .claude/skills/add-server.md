---
description: Gateway'e yeni bir MCP sunucusu ekler. Sunucu adı, transport tipi, komut ve argümanları interaktif olarak sorar, gateway.config.json'a ekler.
user_invocable: true
---

# Add MCP Server to Gateway

Kullanıcı gateway'e yeni bir MCP sunucusu eklemek istiyor. Aşağıdaki adımları izle:

## Adımlar

1. **gateway.config.json dosyasını oku** (`/home/laserkopf/Desktop/freelance/mcp-gateway-multiple-lk/gateway.config.json`)

2. **Kullanıcıdan bilgileri al** (AskUserQuestion kullan):
   - Sunucu adı (name) - mevcut sunucularla çakışma kontrolü yap
   - NPM paketi veya komutu (örn: `@modelcontextprotocol/server-filesystem`, `npx -y some-mcp-server`)
   - Ek argümanlar varsa
   - Environment variable'lar varsa (API key vb.)
   - Timeout (varsayılan: 10000ms)

3. **Yeni sunucu config'ini oluştur**:
```json
{
  "name": "<sunucu-adi>",
  "transport": "stdio",
  "command": "npx",
  "args": ["-y", "<paket-adi>"],
  "enabled": true,
  "autoReconnect": true,
  "timeout": 10000
}
```

4. **gateway.config.json'a ekle** - `servers` dizisinin sonuna yeni sunucuyu ekle

5. **Doğrulama**:
   - JSON'ın geçerli olduğunu kontrol et
   - Sunucu adının benzersiz olduğunu doğrula
   - Varsa env değişkenlerini ekle

6. **Kullanıcıya bildir**: Gateway'in yeni sunucuyu görmesi için Claude Code'un yeniden başlatılması gerektiğini söyle. Alternatif olarak `gateway__reconnect` tool'u kullanılabilir.

## Kurallar
- Sunucu adlarında boşluk ve özel karakter kullanma, sadece lowercase alfanümerik ve tire
- Mevcut sunucu adlarıyla çakışma olmamalı
- API key gibi hassas bilgileri env alanına koy, args'a koyma
- Transport tipi varsayılan olarak "stdio" olsun, HTTP gerekiyorsa sor
