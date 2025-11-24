"use client";

import { signIn, useSession, signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  // Ha a Shopify-tól jövünk: ?redirect=https://essenciastore.com/account
  const redirectUrl =
    searchParams.get("redirect") ?? "https://essenciastore.com/account";

  const handleGoogleSignIn = () => {
    signIn("google", {
      callbackUrl: redirectUrl,
    });
  };

  const handleFacebookSignIn = () => {
    signIn("facebook", {
      callbackUrl: redirectUrl,
    });
  };

  const handleSignOut = () => {
    signOut({
      callbackUrl: "https://essenciastore.com", // kijelentkezés után főoldal
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
          maxWidth: "420px",
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
          Biztonságos bejelentkezés Google- vagy Facebook-fiókkal.
        </p>

        {status === "loading" && <p>Betöltés…</p>}

        {status === "unauthenticated" && (
          <>
            {/* Google gomb */}
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
                marginBottom: "0.75rem",
              }}
            >
              <span role="img" aria-label="lock">
                🔒
              </span>
              <span>Bejelentkezés Google-fiókkal</span>
            </button>

            {/* Facebook gomb */}
            <button
              onClick={handleFacebookSignIn}
              style={{
                padding: "0.9rem 1.9rem",
                borderRadius: "999px",
                border: "1px solid #1877f2",
                cursor: "pointer",
                fontSize: "0.98rem",
                fontWeight: 500,
                background: "#1877f2",
                color: "white",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.7rem",
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
              <strong>{session?.user?.email ?? "ismeretlen felhasználó"}</strong>
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
