# 🧠 AIChat – Multi-Layer Chat and Sentiment Analysis Application

This project is a multi-layer chat system built with **React (frontend)**, **.NET Core (backend)**, and **Python (AI service)**.  
Users can chat with each other, and each message is analyzed by a **Turkish BERT model** hosted on **Hugging Face Spaces** to determine its sentiment (**positive / negative / neutral**).  

---

## 🚀 Project Components

### 🧩 1. Frontend (React Web)
- User **registration / login** system  
- Session management with **JWT tokens**  
- Real-time **chat interface** (SignalR supported)  
- Communication with the backend via **Axios**  
- Displays sentiment analysis results (positive / negative / neutral) with colored tags  
- Error handling for failed API calls  

📍 **Location:** `frontend/WebClient/aichat-web/`  
📁 **Key Files:**
- `Chat.jsx` → Chat screen and message rendering  
- `auth.js` → Login and registration logic  
- `messages.js` → Message send and fetch services  
- `.env.local` → Stores API endpoint configuration  

---

### ⚙️ 2. Backend (.NET Core API)
- **User registration and authentication** (`AccountController.cs`)  
- **JWT token generation and validation**  
- **Message storage and retrieval** (`MessageController.cs`)  
- Sends messages to the **AI service** for sentiment analysis  
- Configures **CORS**, **Authorization**, and **SignalR**  
- Database: **SQLite** (via Entity Framework Core)  

📍 **Location:** `backend/AIChat.API/`  
📁 **Key Files:**
- `Program.cs` → Service configuration (CORS, JWT, DbContext)  
- `ApplicationDbContext.cs` → Database connection (SQLite)  
- `MessageController.cs` → Message CRUD operations  
- `TokenService.cs` → Token generation and validation  

---

### 🧠 3. AI Service (Python + Gradio + FastAPI)
- Hosted on **Hugging Face Spaces**  
- Model: [`savasy/bert-base-turkish-sentiment-cased`](https://huggingface.co/savasy/bert-base-turkish-sentiment-cased)  
- **API Endpoint:**  

- Model: `savasy/bert-base-turkish-sentiment-cased`
- API uç noktası:  
