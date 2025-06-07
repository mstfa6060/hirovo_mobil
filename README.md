# 📘 AGENTS.md

Bu döküman, **Hirovo Platformu** içerisinde yer alan backend mimarisi, background worker servisleri (agents), API endpoint yapısı ve mobil entegrasyon stratejisini kapsamlı şekilde tanımlar.

---

## 🎯 Projenin Amacı

Hirovo, işverenlerle mavi yaka çalışanları dijital ortamda bir araya getirerek hızlı eşleşme sağlayan bir platformdur. Temel hedefleri:

- Lokasyon tabanlı iş eşleştirme
- Anlık bildirim ile kullanıcı etkileşimi
- Esnek üyelik sistemleri (B2C + B2B)
- Çok dilli destek (Global pazara uygunluk)
- Mobil ve Web'den kesintisiz erişim

---

## 🧱 Mimari Yapı

- **Backend Framework**: .NET 8 + ArfBlocks
- **Frontend**: React (Web), React Native + Expo (Mobil)
- **Veritabanı**: SQL Server (EF Core)
- **Mesajlaşma**: RabbitMQ (Fanout Exchange)
- **Deploy**: Docker + GitHub Actions + Jenkins
- **Container Orkestrasyonu**: docker-compose

---

## 🧩 Modül Yapısı

### 📦 `BaseModules`
Ortak altyapı servislerini barındırır:
- Kimlik Doğrulama (IAM)
- Şirket yönetimi
- Dosya yönetimi (MongoDB tabanlı)
- Ortak doğrulama ve hata mesajları

### 🧠 `BusinessModules.Hirovo`
Domain'e özel modüller burada geliştirilir:
- İşveren, İşçi, İş ilanı
- Lokasyon, Bildirim, Eşleşme mekanizması

---

## 📌 Endpoint Yapısı (ArfBlocks)

Her endpoint aşağıdaki yapıya uygun olarak geliştirilmektedir:

```

RequestHandlers
└── \<Modül>
├── Commands
│   ├── Create
│   ├── Update
│   ├── Delete
└── Queries
├── All
├── Detail
└── Pick

````

Her klasör şunları içerir:
- `DataAccess.cs`
- `Handler.cs`
- `Mapper.cs`
- `Models.cs`
- `Validator.cs`
- `Verificator.cs`

Tüm endpoint'ler **POST** metodu ile çalışır.

---

## ⚙️ Agent (Background Worker) Servisleri

Platform içinde event-driven çalışan 3 adet background servis bulunmaktadır:

### 1. **SmsSender**
- 📂 `BusinessModules.Hirovo.Workers.SmsSender`
- Görev: `JobCreatedEvent` alındığında SMS bildirimi simüle eder.
- Queue: `hirovo.notification.sms`
- Exchange: `hirovo.notification.exchange` (Fanout)

### 2. **MailSender**
- 📂 `BusinessModules.Hirovo.Workers.MailSender`
- Görev: E-posta bildirimi gönderir/loglar.

### 3. **NotificationSender**
- 📂 `BusinessModules.Hirovo.Workers.NotificationSender`
- Görev: In-app veya push notification gönderir.

Tüm worker’lar `IHostedService` ile `Program.cs` dosyasında `AddHostedService<T>()` olarak kaydedilir.

---

## 📱 Mobil Uygulama Entegrasyonu

Hirovo'nun React Native tabanlı mobil uygulaması, tüm API'leri tüketir ve aşağıdaki entegrasyonları içerir:

### 📡 Kullanılan API'ler

| Modül | Açıklama |
|-------|----------|
| Auth | Login, token alma |
| Workers | Profil görüntüleme/güncelleme |
| Jobs | İş ilanlarını listeleme |
| JobApplications | Başvuru yapma/detay görüntüleme |
| Location | Konum güncelleme/yakın kullanıcı |
| Notification | Bildirimlerin listelenmesi |

### 🔐 Kimlik Doğrulama

- Token bazlı JWT sistemi kullanılmaktadır.
- Giriş işlemi sonrası `access_token` alınır ve tüm API isteklerinde header olarak gönderilir.

```http
Authorization: Bearer {{access_token}}
````

---

## 📦 Mobil API CLI Çıktısı

Mobil uygulama için API tanımları ArfBlocks CLI ile oluşturulmaktadır:

```bash
arfblocks-cli exec --config=hirovo-mobile.arfblocks-cli.json
```

### Oluşan Klasörler:

```
/mobileapp/hirovo-mobileapp/common/hirovo-api/src/api/
└── index.ts
└── errors/locales/modules/
```

Bu klasörler otomatik olarak GitHub üzerinden mobil frontend reposuna push edilir.

---

## 🌐 Localization (Çok Dilli Destek)

Hirovo backend tarafında tüm hata mesajları `.resx` dosyaları ile yönetilir ve ArfBlocks CLI ile frontend & mobil tarafa taşınır.

Desteklenen Diller:

* `tr`, `en`, `fr`, `de`, `es`, `ar`, `ru`, `pt`, `id`, `hi`, `zh`

---

## 🚀 Deployment Süreci

Mobil, web ve backend için CI/CD pipeline yapılandırılmıştır:

* **GitHub Action** `docker-all.yml` dosyası ile image’lar build edilir.
* DockerHub’a gönderilir.
* Sunucuda Jenkins üzerinden çekilip `docker-compose up` ile çalıştırılır.

---

## 🧪 Test Ortamı

### Local

* Mobil: `Expo Go` + `eas build --profile development`
* Backend: `dotnet run` + `Postman` veya `.http` dosyaları

### Production

* Docker image → Jenkins → Linux (Dehost VDS)
* Portlar: `8080` (API), `1433` (SQL Server)

---

## 🔖 Ek Bilgiler

* `AGENTS.md` her yeni modül eklenince güncellenmelidir.
* Mobil frontend projesi: `mobileapp/hirovo-mobileapp`
* API Gateway yönlendirmeleri `nginx + ocelot.json` ile yapılır.
* API path'leri: `/hirovo/<modül>/<işlem>` şeklindedir.

---

```
