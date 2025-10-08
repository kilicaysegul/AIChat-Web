import React, { useState } from "react";
import { login } from "../services/auth";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg]   = useState("");

  async function onSubmit(e){
    e.preventDefault();
    setBusy(true); setMsg("");
    try {
      await login({ username, email, password });
      setMsg("Giriş başarılı ✅");
      nav("/chat");
    } catch (e) {
      setMsg("Giriş hatası ❌ " + (e?.response?.data?.message || e.message));
    } finally { setBusy(false); }
  }

  return (
    <div style={{maxWidth:420, margin:"40px auto", fontFamily:"system-ui"}}>
      <h2>Giriş yap</h2>
      <form onSubmit={onSubmit} style={{display:"grid", gap:10}}>
        <input placeholder="kullanıcı adı" value={username} onChange={e=>setUsername(e.target.value)} />
        <input placeholder="email (opsiyonel)" value={email} onChange={e=>setEmail(e.target.value)} type="email"/>
        <input placeholder="şifre" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button disabled={busy}>{busy ? "Bekleyin..." : "Giriş"}</button>
      </form>
      <p style={{marginTop:10}}>Hesabın yok mu? <Link to="/register">Kayıt ol</Link></p>
      <pre style={{background:"#f6f6f6", padding:10, borderRadius:8}}>{msg}</pre>
    </div>
  );
}
