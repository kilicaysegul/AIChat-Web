// src/services/messages.js
import { api } from "../lib/api";

// Swagger'daki gerçek yolu gerekirse değiştir (çoğul/tekil)
const PATH = "http://localhost:5000/api/message"; // /api/messages ise burayı /api/messages yap

export async function listMessages() {
  const r = await api.get(PATH);
  return r.data;
}

export async function sendMessage({ text }) {
  const r = await api.post(PATH, { text });
  return r.data;
}
