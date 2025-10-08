import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import ProtectedRoute from "./route/ProtectedRoute";

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/chat" element={
          <ProtectedRoute>
            <Chat/>
          </ProtectedRoute>
        }/>
        <Route path="*" element={<div style={{padding:24}}>404</div>} />
      </Routes>
    </BrowserRouter>
  );
}
