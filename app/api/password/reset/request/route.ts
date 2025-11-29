import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Base URL: prodon login.essenciastore.com, fejlesztéskor localhost
function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  return "http://localhost:3000";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email as string | undefined)?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Hiányzó email cím." },
        { status: 400 }
      );
    }

    // 1) Felhasználó keresése
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Biztonság: ha nincs ilyen user, akkor is 200-at adunk vissza
    if (!user || !user.email) {
      return NextResponse.json({
        ok: true,
        message:
          "Ha létezik fiók ezzel az email címmel, elküldtük a jelszó-visszaállító linket.",
      });
    }

    // 2) Régi tokenek törlése
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // 3) Új token generálása
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 óra

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // 4) Reset link összeállítása
    const baseUrl = getBaseUrl().replace(/\/+$/, ""); // végéről levágjuk a /-t
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(
      token
    )}`;

    // 5) Email küldése
    if (!process.env.RESEND_API_KEY) {
      // Fejlesztés: ha nincs beállítva a kulcs, csak logolunk
      console.log(">>> PASSWORD RESET LINK:", resetUrl);
    } else {
      await resend.emails.send({
        from:
          process.env.MAIL_FROM || "Essencia Store <no-reply@essenciastore.com>",
        to: user.email,
        subject: "Jelszó visszaállítása – Essencia Store",
        html: `
          <p>Kedves ${user.name || "Felhasználó"}!</p>
          <p>Az alábbi linkre kattintva be tudsz állítani egy új jelszót az Essencia fiókodhoz:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>A link <strong>1 órán keresztül érvényes</strong>. Ha nem te kezdeményezted a jelszó-visszaállítást, egyszerűen hagyd figyelmen kívül ezt az emailt.</p>
          <p>Üdv,<br/>Essencia Store</p>
        `,
      });
    }

    return NextResponse.json({
      ok: true,
      message:
        "Ha létezik fiók ezzel az email címmel, elküldtük a jelszó-visszaállító linket.",
    });
  } catch (err) {
    console.error("Password reset request error:", err);
    return NextResponse.json(
      { error: "Váratlan hiba történt." },
      { status: 500 }
    );
  }
}