"use client"

import { signIn } from "next-auth/react"

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          padding: "2rem 3rem",
          borderRadius: "1.5rem",
          boxShadow: "0 20px 45px rgba(0,0,0,0.08)",
          textAlign: "center",
          maxWidth: "420px",
          background: "#fff",
        }}
      >
        <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Essencia Login</h1>
        <p style={{ marginBottom: "1.5rem", color: "#555" }}>
          Biztonságos bejelentkezés Google-fiókkal
        </p>

        <button
          onClick={() => signIn("google")}
          style={{
            padding: "0.8rem 1.6rem",
            borderRadius: "999px",
            border: "1px solid #ddd",
            cursor: "pointer",
            fontSize: "1rem",
            background: "white",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
          }}
        >
          <span>🔐</span>
          <span>Bejelentkezés Google-fiókkal</span>
        </button>

        <p style={{ fontSize: "0.8rem", marginTop: "1.5rem", color: "#777" }}>
          A Google bejelentkezést az Essencia saját biztonságos rendszere kezeli.
        </p>
      </div>
    </main>
  )
}
