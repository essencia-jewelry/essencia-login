"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import AccountHeader from "../components/AccountHeader";

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

  // 1) Még tölt a session
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
        <p>Bejelentkezés ellenőrzése…</p>
      </main>
    );
  }

  // 2) Nincs bejelentkezve
  if (!email) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <p>Először jelentkezz be, hogy lásd a rendeléseidet.</p>

        <button
          onClick={() => signIn()}
          style={{
            padding: "0.6rem 1.3rem",
            borderRadius: "999px",
            border: "none",
            backgroundColor: "#111827",
            color: "white",
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          Bejelentkezés
        </button>
      </main>
    );
  }

  // 3) Normál layout
  return (
    <main
      style={{
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "#f9fafb",
      }}
    >
      {/* Felső fejléces rész */}
      <AccountHeader />

      {/* Tartalom */}
      <section
        style={{
          maxWidth: "960px",
          margin: "2rem auto",
          padding: "0 1rem",
        }}
      >
        <h1
          style={{
            fontSize: "1.6rem",
            fontWeight: 600,
            marginBottom: "0.4rem",
          }}
        >
          Rendeléseid
        </h1>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#6b7280",
            marginBottom: "1.4rem",
          }}
        >
          Itt látod az összes rendelésedet, amelyet az{" "}
          <strong>{email}</strong> címre adtál le az Essenciánál.
        </p>

        {/* Töltés */}
        {loading && <p>Rendeléseid betöltése…</p>}

        {/* Hiba */}
        {error && !loading && (
          <div
            style={{
              padding: "1rem 1.2rem",
              borderRadius: "0.9rem",
              border: "1px solid #fecaca",
              backgroundColor: "#fef2f2",
              color: "#b91c1c",
              fontSize: "0.9rem",
              marginBottom: "1.2rem",
            }}
          >
            <strong>Hiba:</strong> {error}
          </div>
        )}

        {/* Nincs rendelés */}
        {!loading && !error && orders.length === 0 && (
          <div
            style={{
              padding: "1.4rem 1.6rem",
              borderRadius: "1rem",
              border: "1px dashed #e5e7eb",
              backgroundColor: "white",
              fontSize: "0.95rem",
              color: "#4b5563",
            }}
          >
            <p style={{ marginBottom: "0.4rem" }}>
              Még nem találtunk rendelést ehhez az email címhez.
            </p>
            <a
              href="https://essenciastore.com"
              style={{
                display: "inline-flex",
                marginTop: "0.4rem",
                fontSize: "0.9rem",
                color: "#2563eb",
                textDecoration: "none",
              }}
            >
              Fedezd fel az Essencia ékszereit 🛍️
            </a>
          </div>
        )}

        {/* Van rendelés */}
        {!loading && !error && orders.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.9rem",
              marginTop: "0.4rem",
            }}
          >
            {orders.map((o) => (
              <div
                key={o.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "1rem",
                  padding: "1rem 1.2rem",
                  backgroundColor: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      marginBottom: "0.15rem",
                    }}
                  >
                    {o.name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#6b7280",
                      marginBottom: "0.35rem",
                    }}
                  >
                    {new Date(o.createdAt).toLocaleString("hu-HU")}
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#4b5563",
                    }}
                  >
                    Fizetési státusz:{" "}
                    <strong>{o.financialStatus || "ismeretlen"}</strong>
                    <br />
                    Teljesítés:{" "}
                    <strong>
                      {o.fulfillmentStatus || "nincs teljesítve"}
                    </strong>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      marginBottom: "0.1rem",
                    }}
                  >
                    {o.totalPrice} {o.currency}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#6b7280",
                    }}
                  >
                    Összeg
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alsó gombok */}
        <div
          style={{
            marginTop: "1.8rem",
            display: "flex",
            gap: "0.8rem",
            flexWrap: "wrap",
          }}
        >
          <a
            href="/profile"
            style={{
              padding: "0.6rem 1.1rem",
              borderRadius: "999px",
              border: "1px solid #e5e7eb",
              backgroundColor: "white",
              fontSize: "0.9rem",
              textDecoration: "none",
              color: "#111827",
            }}
          >
            Vissza a profilomhoz
          </a>
          <a
            href="https://essenciastore.com"
            style={{
              padding: "0.6rem 1.1rem",
              borderRadius: "999px",
              border: "none",
              backgroundColor: "#111827",
              color: "white",
              fontSize: "0.9rem",
              textDecoration: "none",
            }}
          >
            Vásárlás folytatása
          </a>
        </div>
      </section>
    </main>
  );
}
