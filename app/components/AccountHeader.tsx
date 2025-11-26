"use client";

import { useSession, signOut } from "next-auth/react";

type AccountHeaderProps = {
  active?: "profile" | "orders" | "none";
};

export default function AccountHeader({ active = "none" }: AccountHeaderProps) {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";
  const name = (session?.user as any)?.name ?? "";

  return (
    <header
      style={{
        padding: "1rem 2rem",
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
        <div
          style={{
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            fontSize: "0.8rem",
          }}
        >
          ESSENCIA Fiók
        </div>
        {email && (
          <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            {name ? `${name} · ${email}` : email}
          </div>
        )}
      </div>

      <nav
        style={{
          display: "flex",
          gap: "1rem",
          fontSize: "0.9rem",
          alignItems: "center",
        }}
      >
        <a
          href="/profile"
          style={{
            textDecoration: "none",
            color: active === "profile" ? "#111827" : "#4b5563",
            fontWeight: active === "profile" ? 600 : 400,
          }}
        >
          Profil
        </a>
        <a
          href="/orders"
          style={{
            textDecoration: "none",
            color: active === "orders" ? "#111827" : "#4b5563",
            fontWeight: active === "orders" ? 600 : 400,
          }}
        >
          Rendeléseim
        </a>
        <a
          href="https://essenciastore.com"
          style={{
            textDecoration: "none",
            color: "#4b5563",
          }}
        >
          Vásárlás folytatása
        </a>
        <button
          onClick={() =>
            signOut({
              callbackUrl: "https://essenciastore.com",
            })
          }
          style={{
            marginLeft: "0.5rem",
            padding: "0.4rem 0.9rem",
            borderRadius: "999px",
            border: "1px solid #e5e7eb",
            background: "white",
            cursor: "pointer",
            fontSize: "0.8rem",
          }}
        >
          Kijelentkezés
        </button>
      </nav>
    </header>
  );
}