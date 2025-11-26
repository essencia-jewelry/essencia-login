"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import LoginClient from "./LoginClient";

export default function HomePage() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawRedirect = searchParams.get("redirect");
  const target =
    rawRedirect && rawRedirect.startsWith("/") ? rawRedirect : "/profile";

  useEffect(() => {
    if (status !== "authenticated") return;
    router.replace(target);
  }, [status, target, router]);

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

  // Ha már autentikált, de még nem futott le az useEffect,
  // mutatunk egy rövid "átirányítás" üzenetet
  if (status === "authenticated") {
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
        <p>Átirányítás a fiókodhoz…</p>
      </main>
    );
  }

  // Ha nincs bejelentkezve → login felület
  return <LoginClient />;
}
