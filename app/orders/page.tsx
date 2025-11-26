"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

type Order = {
  id: number;
  name: string;
  createdAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  totalPrice: string;
  currency: string;
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const email = session?.user?.email ?? null;

  useEffect(() => {
    if (!email) return;

    setLoading(true);
    setError(null);

    fetch(`/api/orders?email=${encodeURIComponent(email)}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Ismeretlen hiba.");
        }
        return res.json();
      })
      .then((data) => {
        setOrders(data.orders || []);
      })
      .catch((err: any) => {
        console.error(err);
        setError(err.message || "Nem sikerült betölteni a rendeléseket.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [email]);

  // 1) Session töltése
  if (status === "loading") {
    return (
      <div style={{ padding: "40px" }}>
        <p>Bejelentkezés ellenőrzése…</p>
      </div>
    );
  }

  // 2) Nincs bejelentkezve
  if (!email) {
    return (
      <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "12px" }}>
          Rendeléseid
        </h1>
        <p>Először jelentkezz be, hogy lásd a rendeléseidet.</p>
      </div>
    );
  }

  // 3) Töltés
  if (loading) {
    return (
      <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
        <p>Rendeléseid betöltése…</p>
      </div>
    );
  }

  // 4) Hiba
  if (error) {
    return (
      <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "12px" }}>
          Rendeléseid
        </h1>
        <p style={{ color: "red" }}>Hiba: {error}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          style={{
            marginTop: "16px",
            padding: "10px 18px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            background: "white",
            cursor: "pointer",
          }}
        >
          Kijelentkezés
        </button>
      </div>
    );
  }

  // 5) Nincs rendelés
  if (!orders.length) {
    return (
      <div
        style={{
          padding: "40px",
          fontFamily: "sans-serif",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <h1 style={{ fontSize: "28px", marginBottom: "16px" }}>
          Rendeléseid
        </h1>
        <p>Még nincs rendelés ehhez az email címhez.</p>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          style={{
            marginTop: "24px",
            padding: "10px 18px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            background: "white",
            cursor: "pointer",
          }}
        >
          Kijelentkezés
        </button>
      </div>
    );
  }

  // 6) Van rendelés → lista
  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: "28px", marginBottom: "16px" }}>Rendeléseid</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {orders.map((o) => (
          <div
            key={o.id}
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: "8px",
              padding: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{ fontSize: "18px", fontWeight: 600, marginBottom: 4 }}
              >
                {o.name}
              </div>
              <div style={{ fontSize: "13px", color: "#666" }}>
                {new Date(o.createdAt).toLocaleString("hu-HU")}
              </div>
              <div style={{ fontSize: "14px", marginTop: "4px" }}>
                Fizetési státusz:{" "}
                <strong>{o.financialStatus || "ismeretlen"}</strong>
                <br />
                Teljesítés:{" "}
                <strong>{o.fulfillmentStatus || "nincs teljesítve"}</strong>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "18px", fontWeight: 600 }}>
                {o.totalPrice} {o.currency}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        style={{
          marginTop: "24px",
          padding: "10px 18px",
          borderRadius: "8px",
          border: "1px solid #ddd",
          background: "white",
          cursor: "pointer",
        }}
      >
        Kijelentkezés
      </button>
    </div>
  );
}
