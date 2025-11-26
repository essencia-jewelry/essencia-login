"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function PasswordChangePage() {
  const { status } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clear = () => {
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async () => {
    clear();
    setLoading(true);
    try {
      const res = await fetch("/api/password/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Nem sikerült a jelszócsere.");
        return;
      }

      setMessage("Jelszó sikeresen megváltoztatva. ✅");
      setCurrentPassword("");
      setNewPassword("");
    } catch (e) {
      console.error(e);
      setError("Váratlan hiba történt.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
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
        <p>Betöltés…</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "#f9fafb",
      }}
    >
      <div
        style={{
          padding: "2.5rem 3rem",
          borderRadius: "1.5rem",
          boxShadow: "0 20px 60px rgba(15, 23, 42, 0.18)",
          maxWidth: "480px",
          width: "100%",
          background: "white",
        }}
      >
        <h1
          style={{
            fontSize: "1.6rem",
            marginBottom: "0.8rem",
          }}
        >
          Jelszó módosítása
        </h1>
        <p
          style={{
            marginBottom: "1.4rem",
            color: "#6b7280",
            fontSize: "0.95rem",
          }}
        >
          Add meg a jelenlegi jelszavad és az újat.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.7rem",
            textAlign: "left",
          }}
        >
          <input
            type="password"
            placeholder="Jelenlegi jelszó"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={{
              padding: "0.6rem 0.9rem",
              borderRadius: "0.7rem",
              border: "1px solid #e5e7eb",
              fontSize: "0.9rem",
            }}
          />
          <input
            type="password"
            placeholder="Új jelszó (min. 6 karakter)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{
              padding: "0.6rem 0.9rem",
              borderRadius: "0.7rem",
              border: "1px solid #e5e7eb",
              fontSize: "0.9rem",
            }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            marginTop: "1.2rem",
            padding: "0.8rem 1.4rem",
            borderRadius: "999px",
            border: "none",
            cursor: "pointer",
            background: "#111827",
            color: "white",
            fontSize: "0.95rem",
            fontWeight: 500,
            opacity: loading ? 0.75 : 1,
          }}
        >
          {loading ? "Mentés…" : "Jelszó mentése"}
        </button>

        {error && (
          <p
            style={{
              marginTop: "1rem",
              color: "#b91c1c",
              fontSize: "0.85rem",
            }}
          >
            {error}
          </p>
        )}
        {message && (
          <p
            style={{
              marginTop: "1rem",
              color: "#059669",
              fontSize: "0.85rem",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
