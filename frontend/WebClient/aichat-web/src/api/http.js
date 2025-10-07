import axios from "axios";

const http = axios.create({
  baseURL: process.env.REACT_APP_API_BASE, // .env'den geliyor
  headers: { "Content-Type": "application/json" },
});

export default http;
