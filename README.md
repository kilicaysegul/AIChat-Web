# 🤖 AIChat – Çok Katmanlı Chat ve Duygu Analizi Uygulaması

Bu proje; React (frontend), .NET Core (backend), ve Python (AI servis) bileşenlerinden oluşan çok katmanlı bir **chat uygulamasıdır**.  
Kullanıcılar mesajlaşabilir, her mesajın duygu analizi Hugging Face üzerinde çalışan bir Türkçe BERT modeliyle yapılır (positive / negative / neutral).

---

## 🚀 Proje Bileşenleri

### 🧩 1. Frontend (React Web)
- Kullanıcı **giriş/kayıt** ekranı
- **Gerçek zamanlı chat arayüzü**
- Backend API ile haberleşme (Axios)
- Kullanıcı token’ı ile oturum yönetimi
- Duygu analiz sonuçlarını (pozitif/negatif/nötr) ekranda gösterir  
📍 **Konum:** `frontend/WebClient/aichat-web/`

### ⚙️ 2. Backend (.NET Core API)
- Kullanıcı kayıt/login işlemleri (JWT token üretimi)
- Mesajların SQLite veritabanına kaydı
- Python AI servisine HTTP istekleri gönderip sonucu saklar  
📍 **Konum:** `backend/AIChat.API/`

### 🧠 3. AI Servisi (Python + Gradio + FastAPI)
- Hugging Face Spaces üzerinde barındırılır
- Model: `savasy/bert-base-turkish-sentiment-cased`
- API uç noktası:  
