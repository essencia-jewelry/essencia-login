"use client";

import { useState } from "react";
import { signIn, useSession, signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginClient() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  const redirectUrl =
    searchParams.get("redirect") ?? "https://essenciastore.com/account";

  // Email/jelszó state-ek
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Üzenetek + loading
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clearMessages = () => {
    setMessage(null);
    setError(null);
  };

  // Google login
  const handleGoogleSignIn = () => {
    clearMessages();
    signIn("google", {
      callbackUrl: redirectUrl,
    });
  };

  // Facebook login
  const handleFacebookSignIn = () => {
    clearMessages();
    signIn("facebook", {
      callbackUrl: redirectUrl,
    });
  };

  const handleCredentialsSignIn = async () => {
    clearMessages();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        identifier, // email VAGY telefon
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Hibás belépési adatok.");
      } else {
        setMessage("Sikeres bejelentkezés, átirányítás…");
        window.location.href = redirectUrl;
      }
    } catch (e) {
      console.error(e);
      setError("Váratlan hiba történt bejelentkezéskor.");
    } finally {
      setLoading(false);
    }
  };

  // Regisztráció (API /api/register)
  const handleRegister = async () => {
    clearMessages();
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier, // itt küldjük tovább az "Email vagy telefonszám" mezőt
          phone,
          password,
          name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Regisztrációs hiba");
        return;
      }

      setMessage("Sikeres regisztráció! Most már be tudsz jelentkezni.");
    } catch (e) {
      console.error(e);
      setError("Váratlan hiba történt regisztrációkor.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    clearMessages();
    signOut({
      callbackUrl: "https://essenciastore.com",
    });
  };

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
          Biztonságos bejelentkezés Google-, Facebook-fiókkal vagy email/jelszóval.
        </p>

        {status === "loading" && <p>Betöltés…</p>}

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

        {status === "unauthenticated" && (
          <>
            {/* Social login gombok */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
                marginBottom: "1.4rem",
              }}
            >
              <button
                onClick={handleGoogleSignIn}
                style={{
                  padding: "0.9rem 1.9rem",
                  borderRadius: "999px",
                  border: "1px solid #e5e7eb",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.7rem",
                  background: "white",
                  fontSize: "0.98rem",
                  fontWeight: 500,
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <span role="img" aria-label="G">
                  🔒
                </span>
                <span>Bejelentkezés Google-fiókkal</span>
              </button>

              <button
                onClick={handleFacebookSignIn}
                style={{
                  padding: "0.8rem 1.6rem",
                  borderRadius: "999px",
                  border: "1px solid #1877f2",
                  cursor: "pointer",
                  fontSize: "1rem",
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
            </div>

            {/* Szeparátor */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
                marginBottom: "1rem",
                color: "#9ca3af",
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  flex: 1,
                  height: 1,
                  background: "#e5e7eb",
                }}
              />
              <span>vagy emaillel</span>
              <span
                style={{
                  flex: 1,
                  height: 1,
                  background: "#e5e7eb",
                }}
              />
            </div>

            {/* Email + jelszó form */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
                textAlign: "left",
              }}
            >
              <input
                type="text"
                placeholder="Név (opcionális)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  padding: "0.6rem 0.9rem",
                  borderRadius: "0.7rem",
                  border: "1px solid #e5e7eb",
                  fontSize: "0.9rem",
                }}
              />
              <input
                type="text"
                placeholder="Email vagy telefonszám"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                style={{
                  padding: "0.6rem 0.9rem",
                  borderRadius: "0.7rem",
                  border: "1px solid #e5e7eb",
                  fontSize: "0.9rem",
                }}
              />
              <input
                type="tel"
                placeholder="Telefonszám (opcionális)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  padding: "0.6rem 0.9rem",
                  borderRadius: "0.7rem",
                  border: "1px solid #e5e7eb",
                  fontSize: "0.9rem",
                }}
              />
              <input
                type="password"
                placeholder="Jelszó"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  padding: "0.6rem 0.9rem",
                  borderRadius: "0.7rem",
                  border: "1px solid #e5e7eb",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "0.6rem",
                marginTop: "0.9rem",
              }}
            >
              <button
                onClick={handleCredentialsSignIn}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "0.7rem 1.2rem",
                  borderRadius: "999px",
                  border: "none",
                  cursor: "pointer",
                  background: "#111827",
                  color: "white",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                Belépés
              </button>
              <button
                onClick={handleRegister}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "0.7rem 1.2rem",
                  borderRadius: "999px",
                  border: "1px solid #e5e7eb",
                  cursor: "pointer",
                  background: "white",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                Regisztráció
              </button>
            </div>
          </>
        )}

        {error && (
          <p
            style={{
              color: "#b91c1c",
              fontSize: "0.85rem",
              marginTop: "1rem",
            }}
          >
            {error}
          </p>
        )}
        {message && (
          <p
            style={{
              color: "#059669",
              fontSize: "0.85rem",
              marginTop: "1rem",
            }}
          >
            {message}
          </p>
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
