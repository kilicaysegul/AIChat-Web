import os, httpx, gradio as gr
from typing import Optional, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

HF_KEY = os.getenv("HUGGINGFACE_API_KEY")
MODEL = os.getenv("HUGGINGFACE_MODEL", "savasy/bert-base-turkish-sentiment-cased")

def _norm(label: Optional[str]) -> str:
    l = (label or "").lower()
    if "pos" in l or "positive" in l or "olumlu" in l: return "positive"
    if "neg" in l or "negative" in l or "olumsuz" in l: return "negative"
    if "neutral" in l or "nötr" in l or "notr" in l:   return "neutral"
    return "neutral"

def _best(data: Any):
    arr = data[0] if isinstance(data, list) and data and isinstance(data[0], list) else data
    return max(arr, key=lambda x: x.get("score", 0)).get("label")

def infer(text: str) -> str:
    if not HF_KEY:
        return "Error: HUGGINGFACE_API_KEY is missing"
    url = f"https://api-inference.huggingface.co/models/{MODEL}"
    headers = {"Authorization": f"Bearer {HF_KEY}"}
    r = httpx.post(url, headers=headers, json={"inputs": text}, timeout=60)
    if r.status_code >= 400:
        try: msg = r.json()
        except Exception: msg = r.text
        return f"Error: Hugging Face API returned {r.status_code}: {msg}"
    return _norm(_best(r.json()))

# ---- FastAPI (JSON API) ----
api = FastAPI(title="AIChat Sentiment API", version="1.0.0")
api.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class AnalyzeReq(BaseModel): text: str
class AnalyzeResp(BaseModel): label: str

@api.get("/healthz")
def health(): return {"ok": True}

@api.post("/api/analyze", response_model=AnalyzeResp)
def analyze(req: AnalyzeReq):
    label = infer(req.text.strip())
    if label.startswith("Error:"):
        raise HTTPException(status_code=502, detail=label)
    return {"label": label}

# ---- Gradio UI ----
def analyze_sentiment(text: str) -> str:
    text = (text or "").strip()
    if not text: return "Please enter some text to analyze"
    return infer(text)

demo = gr.Interface(
    fn=analyze_sentiment,
    inputs=gr.Textbox(label="Enter text to analyze", placeholder="Türkçe metni buraya yazın...", lines=3),
    outputs=gr.Textbox(label="Sentiment Analysis Result", lines=1),
    title="AIChat Sentiment Analysis",
    description="Türkçe metinler için BERT tabanlı duygu analizi (positive / negative / neutral)",
    examples=[["Bu çok güzel bir gün!"],["Hiç beğenmedim bu filmi"],["Bugün hava normal"],["Mükemmel bir deneyimdi"],["Çok kötü bir hizmet aldık"]],
    api_name="/analyze"
)

# <<< KRİTİK: MOUNT EDİYORUZ, launch() YOK >>>
app = gr.mount_gradio_app(api, demo, path="/")