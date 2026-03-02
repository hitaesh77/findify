"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// --- CODESPACE CONFIGURATION ---
const BACKEND_URL = "https://supreme-giggle-69rjv4vpgvrj34q7x-8000.app.github.dev";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const response = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        router.push("/"); 
      } else {
        setError("Invalid email or password.");
      }
    } catch (err) {
      setError("Network error. Is the backend running?");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Login to Findify</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "300px" }}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: "0.5rem" }}/>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: "0.5rem" }}/>
        <button type="submit" style={{ padding: "0.5rem" }}>Log In</button>
      </form>
    </div>
  );
}