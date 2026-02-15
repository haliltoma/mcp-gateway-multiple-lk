---
description: Gateway'deki bir MCP sunucusunu hızlıca aktif/pasif yapar. Sunucuyu silmeden enabled/disabled toggle eder.
user_invocable: true
---

# Toggle MCP Server Status

Bir sunucuyu silmeden hızlıca aktif/pasif yap.

## Adımlar

1. **gateway.config.json oku**

2. **Mevcut sunucuları listele** durumlarıyla birlikte:
   - Aktif sunucular (enabled: true veya enabled alanı yok)
   - Pasif sunucular (enabled: false)

3. **Kullanıcıya sor**: Hangi sunucunun durumunu değiştirmek istiyor?

4. **Toggle yap**:
   - Aktifse → `"enabled": false` yap
   - Pasifse → `"enabled": true` yap veya `enabled` alanını kaldır

5. **gateway.config.json güncelle**

6. **Bildir**: Değişikliğin etkili olması için gateway'in yeniden başlaması gerektiğini söyle

## Kullanım Senaryoları
- Geçici olarak bir sunucuyu devre dışı bırak (bellek tasarrufu)
- Debug sırasında sadece belirli sunucuları aktif bırak
- Sorunlu sunucuyu geçici olarak kapat
