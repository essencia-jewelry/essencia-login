"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginClient() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  const redirectUrl =
    searchParams.get("redirect") ?? "https://essenciastore.com/account";

  // Saját email/jelszó form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogle = () => {
    signIn("google", { callbackUrl: redirectUrl });
  };

  const handleFacebook = () => {
    signIn("facebook", { callbackUrl: redirectUrl });
  };

  const handleEssenciaLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: redirectUrl,
    });

    setLoading(false);

    if (res?.error) {
      setErrorMsg("Hibás email vagy jelszó.");
      return;
    }

    // Ha sikerült, akkor manuálisan átirányítunk
    if (res?.url) {
      window.location.href = res.url;
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "https://essenciastore.com" });
  };

  // UI
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        background:
          "radial-gradient(circle at top left, #f7f0ff 0, #ffffff 45%, #f5fbff 100%)",
      }}
    >
      <div
        style={{
          padding: "2.5rem 3rem",
          borderRadius: "1.8rem",
          boxShadow: "0 24px 80px rgba(15, 23, 42, 0.18)",
          textAlign: "center",
          maxWidth: "460px",
          width: "100%",
          background: "white",
        }}
      >
        <h1
          style={{
            fontSize: "1.9rem",
            marginBottom: "0.6rem",
            letterSpacing: "0.03em",
          }}
        >
          Essencia Login
        </h1>
        <p
          style={{
            marginBottom: "1.6rem",
            color: "#6b7280",
            fontSize: "0.95rem",
          }}
        >
          Jelentkezz be Essencia fiókkal, Google-lal vagy Facebookkal.
        </p>

        {status === "loading" && <p>Betöltés…</p>}

        {status === "unauthenticated" && (
          <>
            {/* SAJÁT EMAIL/JELSZÓ ŰRLAP */}
            <form
              onSubmit={handleEssenciaLogin}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                marginBottom: "1.5rem",
                textAlign: "left",
              }}
            >
              <label style={{ fontSize: "0.85rem", color: "#4b5563" }}>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    marginTop: "0.25rem",
                    borderRadius: "999px",
                    border: "1px solid #e5e7eb",
                    padding: "0.6rem 1rem",
                    fontSize: "0.9rem",
                  }}
                />
              </label>
              <label style={{ fontSize: "0.85rem", color: "#4b5563" }}>
                Jelszó
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    marginTop: "0.25rem",
                    borderRadius: "999px",
                    border: "1px solid #e5e7eb",
                    padding: "0.6rem 1rem",
                    fontSize: "0.9rem",
                  }}
                />
              </label>

              {errorMsg && (
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#b91c1c",
                    marginTop: "0.25rem",
                  }}
                >
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "0.8rem 1.9rem",
                  borderRadius: "999px",
                  border: "none",
                  cursor: "pointer",
                  background: "#111827",
                  color: "white",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  marginTop: "0.4rem",
                }}
              >
                {loading ? "Beléptetés…" : "Belépés Essencia fiókkal"}
              </button>
            </form>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1rem",
                fontSize: "0.8rem",
                color: "#9ca3af",
              }}
            >
              <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
              <span>vagy</span>
              <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
            </div>

            {/* Google gomb */}
            <button
              onClick={handleGoogle}
              style={{
                padding: "0.8rem 1.9rem",
                borderRadius: "999px",
                border: "1px solid #e5e7eb",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.7rem",
                background: "white",
                fontSize: "0.95rem",
                fontWeight: 500,
                width: "100%",
                justifyContent: "center",
                marginBottom: "0.6rem",
              }}
            >
              <span>🔒</span>
              <span>Bejelentkezés Google-fiókkal</span>
            </button>

            {/* Facebook gomb */}
            <button
              onClick={handleFacebook}
              style={{
                padding: "0.8rem 1.6rem",
                borderRadius: "999px",
                border: "1px solid #1877f2",
                cursor: "pointer",
                fontSize: "0.95rem",
                background: "#1877f2",
                color: "white",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <span>📘</span>
              <span>Bejelentkezés Facebookkal</span>
            </button>
          </>
        )}

        {status === "authenticated" && (
          <>
            <p style={{ marginBottom: "1rem", fontSize: "0.95rem" }}>
              Bejelentkezve mint{" "}
              <strong>{session.user?.email ?? "ismeretlen felhasználó"}</strong>
            </p>
            <button
              onClick={handleSignOut}
              style={{
                padding: "0.7rem 1.4rem",
                borderRadius: "999px",
                border: "1px solid #e5e7eb",
                cursor: "pointer",
                background: "white",
                fontSize: "0.9rem",
              }}
            >
              Kijelentkezés
            </button>
          </>
        )}

        <p
          style={{
            fontSize: "0.8rem",
            marginTop: "1.6rem",
            color: "#9ca3af",
          }}
        >
          A bejelentkezést az Essencia saját biztonságos rendszere kezeli.
        </p>
      </div>
    </main>
  );
}
