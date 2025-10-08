// src/pages/Chat.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { listMessages, sendMessage } from "../services/messages";
import { logout } from "../services/auth";
import { useNavigate } from "react-router-dom";

// Gelen veriyi tek tipe indir: { id, userName, text, sentiment, score, createdAt }
function normalizeMessage(m, currentUserName) {
  // farklı casing'leri toparla
  const userName =
    m.userName ?? m.UserName ?? m.username ?? m.user ?? "Anonim";

  // text alanı farklı isimlerde olabilir
  const text = m.text ?? m.Text ?? m.content ?? m.Content ?? m.message ?? m.Message ?? "";

  // sentiment string veya obje olabilir; ayrıca casing farkı olabilir
  let sentiment =
    m.sentiment ?? m.Sentiment ?? (typeof m.label === "string" ? m.label : undefined);
  let score = m.score ?? m.Score ?? undefined;

  if (!sentiment && typeof m.sentiment === "object" && m.sentiment) {
    sentiment = m.sentiment.label ?? m.sentiment.Label ?? "neutral";
    score = m.sentiment.score ?? m.sentiment.Score ?? score;
  }

  if (!sentiment && typeof m.Sentiment === "object" && m.Sentiment) {
    sentiment = m.Sentiment.label ?? m.Sentiment.Label ?? "neutral";
    score = m.Sentiment.score ?? m.Sentiment.Score ?? score;
  }

  // olası LABEL_0/LABEL_1 map'i (her ihtimale karşı)
  const low = String(sentiment || "").toLowerCase();
  if (low.includes("label_0")) sentiment = "negative";
  else if (low.includes("label_1")) sentiment = "positive";
  else if (low.includes("label_2")) sentiment = "neutral";

  // güvenli fallback
  if (!sentiment) sentiment = "neutral";

  return {
    id: m.id ?? m.Id ?? m.createdAt ?? m.CreatedAt ?? crypto.randomUUID?.() ?? Math.random().toString(36),
    userName,
    text,
    sentiment,
    score,
    createdAt: m.createdAt ?? m.CreatedAt ?? new Date().toISOString(),
    mine: userName === currentUserName,
  };
}

export default function Chat() {
  const nav = useNavigate();
  const scrollerRef = useRef(null);
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const currentUser = localStorage.getItem("username") || "";

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollerRef.current?.scrollTo({
        top: scrollerRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  const load = useCallback(async () => {
    setErr("");
    try {
      const data = await listMessages();
      const raw = Array.isArray(data) ? data : (data?.items || []);
      const norm = raw.map(m => normalizeMessage(m, currentUser));
      setItems(norm);
      scrollToBottom();
    } catch (e) {
      const msg = e?.response?.status
        ? `${e.response.status} ${JSON.stringify(e.response.data)}`
        : e.message;
      setErr("Listeleme hatası: " + msg);
    }
  }, [currentUser]);

  useEffect(() => {
    load();
  }, [load]); // eslint uyarısı çözüldü

  async function onSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setErr("");
    try {
      const created = await sendMessage({ text });
      // backend ne dönerse dönsün normalize edip ekle
      const norm = normalizeMessage(created, currentUser);
      console.log("Gönderilen mesaj:", norm);
      setItems((s) => [...s, norm]);
      setText("");
      scrollToBottom();
    } catch (e) {
      const msg = e?.response?.status
        ? `${e.response.status} ${JSON.stringify(e.response.data)}`
        : e.message;
      setErr("Gönderme hatası: " + msg);
    } finally {
      setLoading(false);
    }
  }

  function onLogout() {
    logout();
    nav("/login");
  }

  return (
    <div style={{ maxWidth: 820, margin: "20px auto", fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>
          Chat — <span style={{ fontSize: 16, opacity: 0.8 }}>{currentUser}</span>
        </h2>
        <button onClick={onLogout}>Çıkış</button>
      </div>

      <div
        ref={scrollerRef}
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 12,
          minHeight: 320,
          maxHeight: 420,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginTop: 12,
        }}
      >
        {items.length === 0 && <div>Mesaj yok.</div>}

        {items.map((m) => {
          const sentimentText =
            m.sentiment + (typeof m.score === "number" ? ` ${Math.round(m.score * 100)}%` : "");

          return (
            <div
              key={m.id}
              style={{
                alignSelf: m.mine ? "flex-end" : "flex-start",
                maxWidth: "70%",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#666",
                  margin: m.mine ? "0 6px 4px 0" : "0 0 4px 6px",
                  textAlign: m.mine ? "right" : "left",
                }}
              >
                <b>{m.userName}</b> · {sentimentText}
              </div>

              <div
                style={{
                  background: m.mine ? "#cfe9ff" : "#f4f4f4",
                  color: "#111",
                  display: "inline-block",
                  padding: "10px 12px",
                  borderRadius: m.mine ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                  boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
                  wordBreak: "break-word",
                }}
              >
                {m.text}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={onSend} style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="mesaj yaz…"
          style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
        />
        <button disabled={loading} style={{ minWidth: 96 }}>
          {loading ? "Gönderiliyor…" : "Gönder"}
        </button>
      </form>

      {err && (
        <pre
          style={{
            background: "#fff3f3",
            padding: 10,
            borderRadius: 8,
            marginTop: 12,
            whiteSpace: "pre-wrap",
          }}
        >
          {err}
        </pre>
      )}
    </div>
  );
}
