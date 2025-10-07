FROM python:3.10-slim

WORKDIR /app

# Bağımlılıkları kur
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama dosyaları
COPY . /app

# Hugging Face Spaces Docker'ı 7860 portunu bekler
EXPOSE 7860

# Uygulamayı başlat (FastAPI/Gradio app = app)
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]