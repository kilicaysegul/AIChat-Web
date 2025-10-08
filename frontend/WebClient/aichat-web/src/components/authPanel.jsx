// src/components/AuthPanel.jsx
import React, { useState } from "react";
import { login, register, logout, isLoggedIn, getToken } from "../services/auth";

export default function AuthPanel({ onAuthChange }) {
  const [username, setUsername]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [busy, setBusy]           = useState(false);
  const [msg, setMsg]             = useState("");

  // Identity hata gövdelerini okunaklı gösteren yardımcı
  function renderError(e) {
    const data = e?.response?.data;
    if (Array.isArray(data)) {
      // IdentityError[] -> description/code topla
      return data.map(d => d?.description || d?.code || JSON.stringify(d)).join("\n");
    }
    if (typeof data === "object" && data !== null) {
      // { message: "..."} veya modelstate vb.
      if (data.message) return data.message;
      return JSON.stringify(data, null, 2);
    }
    return e?.message || "Bilinmeyen hata";
  }

  async function doRegister() {
    setBusy(true); setMsg("");
    try {
      await register({ username, email, password });
      setMsg("Kayıt başarılı ✅");
      onAuthChange?.();
    } catch (e) {
      setMsg("Kayıt Hatası ❌\n" + renderError(e));
    } finally {
      setBusy(false);
    }
  }

  async function doLogin() {
    setBusy(true); setMsg("");
    try {
      // Backend'in LoginDto'su: UserName + Password
      await login({ username, password });
      setMsg("Giriş başarılı ✅ Token alındı.");
      onAuthChange?.();
    } catch (e) {
      setMsg("Giriş Hatası ❌\n" + renderError(e));
    } finally {
      setBusy(false);
    }
  }

  function doLogout() {
    logout();
    setMsg("Çıkış yapıldı.");
    onAuthChange?.();
  }

  const logged = isLoggedIn();

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
      <h3>Kimlik Doğrulama</h3>

      {logged ? (
        <>
          <p>Durum: <b>Giriş yapıldı</b></p>
          <p style={{ wordBreak: "break-all" }}>
            <small>Token: {getToken()}</small>
          </p>
          <button onClick={doLogout} disabled={busy}>Çıkış</button>
        </>
      ) : (
        <>
          <div style={{ display: "grid", gap: 8, maxWidth: 380 }}>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="kullanıcı adı"
              autoComplete="username"
            />
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email"
              type="email"
              autoComplete="email"
            />
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="şifre"
              type="password"
              autoComplete="current-password"
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={doRegister} disabled={busy}>Kayıt ol</button>
              <button onClick={doLogin} disabled={busy}>Giriş yap</button>
            </div>
          </div>
        </>
      )}

      <pre style={{ background: "#f6f6f6", padding: 10, borderRadius: 8, marginTop: 12, whiteSpace: "pre-wrap" }}>
{msg || "Durum burada görünecek..."}
      </pre>
    </div>
  );
}
