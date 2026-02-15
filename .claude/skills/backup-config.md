---
description: Gateway konfigürasyonunu yedekler ve geri yükler. Zaman damgalı backup oluşturur, mevcut backup'ları listeler, seçilen backup'tan geri yükleme yapar.
user_invocable: true
---

# Backup & Restore Gateway Configuration

Gateway config'ini yedekle veya geri yükle.

## Operasyonlar

### Backup Oluştur
1. `gateway.config.json` dosyasını oku
2. Yedek dosya oluştur: `backups/gateway.config.<timestamp>.json`
   - Timestamp formatı: `YYYYMMDD-HHmmss`
3. `backups/` dizini yoksa oluştur
4. `.gitignore`'a `backups/` ekle (hassas veri içerebilir)
5. Kaç backup olduğunu bildir

### Backup Listele
1. `backups/` dizinindeki tüm `.json` dosyalarını listele
2. Tarih, boyut ile göster
3. En son backup'ı vurgula

### Geri Yükle
1. Mevcut backup'ları listele
2. Kullanıcıya hangisini geri yüklemek istediğini sor
3. Mevcut config'i önce otomatik yedekle (güvenlik)
4. Seçilen backup'ı `gateway.config.json` olarak kopyala
5. JSON geçerliliğini doğrula
6. Gateway'in yeniden başlatılması gerektiğini bildir

### Temizlik
- 30 günden eski backup'ları silmeyi öner
- En az 3 backup tutulmasını sağla

## Kullanıcıya Sor
İlk olarak hangi operasyonu yapmak istediğini sor:
- Yeni backup oluştur
- Backup'ları listele
- Backup'tan geri yükle
