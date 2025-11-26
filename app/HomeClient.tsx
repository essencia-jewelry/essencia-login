"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoginClient from "./LoginClient";

type HomeClientProps = {
  redirect: string | null;
};

export default function HomeClient({ redirect }: HomeClientProps) {
  const { status } = useSession();
  const router = useRouter();

  const target =
    redirect && redirect.startsWith("/") ? redirect : "/profile";

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
