import React, { useEffect, useRef, useState } from "react";
import http from "../api/http";
import { createConnection } from "../signalr/hub";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("SignalR: bağlanıyor...");
  const connRef = useRef(null);
  const listRef = useRef(null);

  const SIGNALR_EVENT = "ReceiveMessage";
  const SEND_API_PATH = "/api/chat/send";

  useEffect(() => {
    const conn = createConnection();
    connRef.current = conn;

    conn.on(SIGNALR_EVENT, (msg) => {
      const text = typeof msg === "string" ? msg : msg?.content || JSON.stringify(msg);
      setMessages((p) => [...p, { role: "bot", content: text }]);
      scrollToBottom();
    });

    conn
      .start()
      .then(() => setStatus("SignalR: bağlı"))
      .catch((e) => setStatus("SignalR: bağlanamadı - " + (e?.message || "")));

    return () => conn.stop();
  }, []);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    });
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;
    setMessages((p) => [...p, { role: "user", content: text }]);
    setInput("");
    scrollToBottom();

    try {
      const res = await http.post(SEND_API_PATH, { text });
      const reply =
        typeof res?.data === "string" ? res.data : res?.data?.reply || res?.data?.message;
      if (reply) {
        setMessages((p) => [...p, { role: "bot", content: reply }]);
        scrollToBottom();
      }
    } catch (err) {
      setMessages((p) => [
        ...p,
        { role: "bot", content: "Hata: " + (err?.response?.data || err?.message) },
      ]);
      scrollToBottom();
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="chat" style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
      <div className="status" style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
        {status}
      </div>
      <div
        className="messages"
        ref={listRef}
        style={{
          height: 420,
          overflowY: "auto",
          padding: 8,
          background: "#fafafa",
          border: "1px solid #eee",
          borderRadius: 6,
          marginBottom: 8,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`msg ${m.role}`}
            style={{
              margin: "6px 0",
              padding: "8px 10px",
              borderRadius: 6,
              display: "inline-block",
              background: m.role === "user" ? "#e6f3ff" : "#f1f1f1",
            }}
          >
            {m.content}
          </div>
        ))}
      </div>
      <div className="row" style={{ display: "flex", gap: 8 }}>
        <input
          placeholder="Mesaj yazın..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          style={{ flex: 1, padding: 10, border: "1px solid #ccc", borderRadius: 6 }}
        />
        <button onClick={sendMessage} style={{ padding: "10px 14px", borderRadius: 6 }}>
          Gönder
        </button>
      </div>
    </div>
  );
}
