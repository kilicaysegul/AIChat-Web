import React, { useState } from "react";
import { register } from "../services/auth";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
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
      await register({ username, email, password });
      setMsg("Kayıt başarılı ✅");
      nav("/login");
    } catch (e) {
      setMsg("Kayıt hatası ❌ " + (e?.response?.data?.message || e.message));
    } finally { setBusy(false); }
  }

  return (
    <div style={{maxWidth:420, margin:"40px auto", fontFamily:"system-ui"}}>
      <h2>Kayıt ol</h2>
      <form onSubmit={onSubmit} style={{display:"grid", gap:10}}>
        <input placeholder="kullanıcı adı" value={username} onChange={e=>setUsername(e.target.value)} />
        <input placeholder="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="şifre" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button disabled={busy}>{busy ? "Bekleyin..." : "Kayıt ol"}</button>
      </form>
      <p style={{marginTop:10}}>Zaten hesabın var mı? <Link to="/login">Giriş yap</Link></p>
      <pre style={{background:"#f6f6f6", padding:10, borderRadius:8}}>{msg}</pre>
    </div>
  );
}
