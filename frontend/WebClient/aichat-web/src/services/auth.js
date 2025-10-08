// src/services/auth.js
import { api } from "../lib/api";

// Proxy kullanmıyorsan tam URL'leri kullan:
const AUTH = {
  REGISTER: "http://localhost:5000/api/account/register",
  LOGIN: "http://localhost:5000/api/account/login",
};

// Yeni kullanıcı kaydı
export async function register({ username, email, password }) {
  const payload = { Username: username, Email: email, Password: password };
  const res = await api.post(AUTH.REGISTER, payload);

  // Token farklı adlarla gelebilir:
  const token =
    res.data?.Token ??
    res.data?.token ??
    res.data?.accessToken ??
    res.data?.jwt ??
    res.data?.data?.token;

  if (token) localStorage.setItem("token", token);
  return res.data;
}

// Giriş işlemi
export async function login({ username, password }) {
  const payload = { UserName: username.toLowerCase(), Password: password };
  const res = await api.post(AUTH.LOGIN, payload);

  // Token’ı tüm olasılıklara göre yakala:
  const token =
    res.data?.Token ??
    res.data?.token ??
    res.data?.accessToken ??
    res.data?.jwt ??
    res.data?.data?.token;

  if (!token) {
    console.log("LOGIN response:", res.status, res.data);
    throw new Error("Token bulunamadı (backend yanıtını kontrol et).");
  }

  localStorage.setItem("token", token);
  return res.data;
}

// Oturum yönetimi
export function logout() {
  localStorage.removeItem("token");
}
export function getToken() {
  return localStorage.getItem("token");
}
export function isLoggedIn() {
  return !!getToken();
}
