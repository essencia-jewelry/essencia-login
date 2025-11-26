"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type ProfileData = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
};

export default function ProfilePage() {
  const { data: session, status } = useSession();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setMessage(null);
  };

  useEffect(() => {
    if (status !== "authenticated") return;

    const loadProfile = async () => {
      setLoading(true);
      clearMessages();
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Nem sikerült betölteni a profilt.");
          return;
        }

        setProfile(data);
        setName(data.name ?? "");
        setPhone(data.phone ?? "");
      } catch (e) {
        console.error(e);
        setError("Váratlan hiba történt a profil betöltésekor.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [status]);

  const handleSave = async () => {
    clearMessages();
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Nem sikerült menteni a módosításokat.");
        return;
      }

      setProfile(data);
      setMessage("Profil sikeresen frissítve. ✅");
    } catch (e) {
      console.error(e);
      setError("Váratlan hiba történt mentéskor.");
    } finally {
      setSaving(false);
    }
  };

  const initialLetter = useMemo(() => {
    const src = profile?.name || profile?.email || "E";
    return src.trim().charAt(0).toUpperCase();
  }, [profile]);

  if (status === "loading" || loading) {
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
        <p>Profil betöltése…</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
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
        <p>Kérjük, jelentkezz be a profilod megtekintéséhez.</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "#f9fafb",
      }}
    >
      {/* Felső "navbar" */}
      <header
        style={{
          padding: "1rem 2rem",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontWeight: 600, letterSpacing: "0.05em" }}>
          ESSENCIA Fiók
        </div>
        <nav
          style={{
            display: "flex",
            gap: "1rem",
            fontSize: "0.9rem",
          }}
        >
          <span style={{ fontWeight: 600 }}>Profil</span>
          <a
            href="/orders"
            style={{
              color: "#4b5563",
              textDecoration: "none",
            }}
          >
            Rendeléseim
          </a>
          <a
            href="https://essenciastore.com"
            style={{
              color: "#4b5563",
              textDecoration: "none",
            }}
          >
            Vásárlás folytatása
          </a>
          <a
            href="#recommendations"
            style={{
              color: "#4b5563",
              textDecoration: "none",
            }}
          >
            Ajánlott termékek
          </a>
        </nav>
      </header>

      <section
        style={{
          maxWidth: "960px",
          margin: "2rem auto",
          padding: "0 1rem",
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.5fr)",
          gap: "1.5rem",
        }}
      >
        {/* Bal oldali: profil kártya */}
        <div
          style={{
            borderRadius: "1.25rem",
            backgroundColor: "white",
            boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
            padding: "1.8rem 1.8rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1.4rem",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "999px",
                background:
                  "radial-gradient(circle at 30% 20%, #facc15, #f97316)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: "1.4rem",
              }}
            >
              {initialLetter}
            </div>
            <div>
              <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>
                {profile?.name || "Essencia vásárló"}
              </div>
              <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                {profile?.email}
              </div>
            </div>
          </div>

          <p
            style={{
              fontSize: "0.9rem",
              color: "#6b7280",
              marginBottom: "1.2rem",
            }}
          >
            Itt módosíthatod az elérhetőségeidet. A szállítási címeket egyelőre
            a rendelés leadásakor adhatod meg, később ide is be tudjuk majd kötni.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.9rem",
              textAlign: "left",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#9ca3af",
                  marginBottom: "0.2rem",
                }}
              >
                Email (nem módosítható)
              </label>
              <input
                type="email"
                value={profile?.email ?? ""}
                disabled
                style={{
                  width: "100%",
                  padding: "0.6rem 0.9rem",
                  borderRadius: "0.7rem",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#f9fafb",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#9ca3af",
                  marginBottom: "0.2rem",
                }}
              >
                Név
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.9rem",
                  borderRadius: "0.7rem",
                  border: "1px solid #e5e7eb",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#9ca3af",
                  marginBottom: "0.2rem",
                }}
              >
                Telefonszám
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.9rem",
                  borderRadius: "0.7rem",
                  border: "1px solid #e5e7eb",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
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
                opacity: saving ? 0.75 : 1,
              }}
            >
              {saving ? "Mentés…" : "Módosítások mentése"}
            </button>

            {error && (
              <p
                style={{
                  marginTop: "0.8rem",
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
                  marginTop: "0.8rem",
                  color: "#059669",
                  fontSize: "0.85rem",
                }}
              >
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Jobb oldali: összefoglaló + CTA-k */}
        <aside
          style={{
            borderRadius: "1.25rem",
            backgroundColor: "white",
            boxShadow: "0 18px 40px rgba(15,23,42,0.10)",
            padding: "1.6rem 1.6rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              marginBottom: "0.2rem",
            }}
          >
            Fiók áttekintés
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#6b7280",
            }}
          >
            Innen eléred a rendeléseidet, profiladataidat, és visszatérhetsz
            vásárolni az Essencia ékszerekhez.
          </p>

          <a
            href="/orders"
            style={{
              marginTop: "0.4rem",
              padding: "0.7rem 1rem",
              borderRadius: "0.9rem",
              border: "1px solid #e5e7eb",
              textDecoration: "none",
              fontSize: "0.9rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#111827",
            }}
          >
            <span>Rendeléseim megtekintése</span>
            <span>→</span>
          </a>

          <a
            href="https://essenciastore.com"
            style={{
              padding: "0.7rem 1rem",
              borderRadius: "0.9rem",
              border: "1px solid #e5e7eb",
              textDecoration: "none",
              fontSize: "0.9rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#111827",
            }}
          >
            <span>Vissza a webshopra</span>
            <span>🛍️</span>
          </a>
        </aside>
      </section>

      {/* Ajánlott termékek (placeholder) */}
      <section
        id="recommendations"
        style={{
          maxWidth: "960px",
          margin: "0 auto 3rem",
          padding: "0 1rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.2rem",
            fontWeight: 600,
            marginBottom: "0.8rem",
          }}
        >
          Ajánlott termékek csak Neked
        </h2>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#6b7280",
            marginBottom: "1rem",
          }}
        >
          Itt fognak megjelenni a személyre szabott ajánlatok, ha később
          összekötjük a Shopify ajánló-rendszerével / kollekcióival.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
          }}
        >
          <div
            style={{
              borderRadius: "0.9rem",
              border: "1px solid #e5e7eb",
              padding: "0.9rem",
              backgroundColor: "white",
            }}
          >
            <div
              style={{
                height: "120px",
                borderRadius: "0.7rem",
                background:
                  "linear-gradient(135deg, #fef3c7, #fde68a, #fbbf24)",
                marginBottom: "0.6rem",
              }}
            />
            <div
              style={{
                fontSize: "0.9rem",
                fontWeight: 500,
                marginBottom: "0.2rem",
              }}
            >
              Limitált arany karkötő
            </div>
            <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
              Elegáns, mindennapi viselethez is.
            </div>
          </div>
          <div
            style={{
              borderRadius: "0.9rem",
              border: "1px solid #e5e7eb",
              padding: "0.9rem",
              backgroundColor: "white",
            }}
          >
            <div
              style={{
                height: "120px",
                borderRadius: "0.7rem",
                background:
                  "linear-gradient(135deg, #e0f2fe, #bfdbfe, #60a5fa)",
                marginBottom: "0.6rem",
              }}
            />
            <div
              style={{
                fontSize: "0.9rem",
                fontWeight: 500,
                marginBottom: "0.2rem",
              }}
            >
              Köves fülbevaló szett
            </div>
            <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
              Klasszikus, mégis modern dizájn.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
