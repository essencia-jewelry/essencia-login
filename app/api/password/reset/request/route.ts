import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const email = body?.email?.toString().trim().toLowerCase() ?? "";
    if (!email) {
      return NextResponse.json(
        { error: "Hiányzó email cím." },
        { status: 400 }
      );
    }

    // 1) ellenőrizzük, hogy van-e ilyen user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // biztonság: ugyanazt válaszoljuk, mintha sikerült volna
      return NextResponse.json({
        ok: true,
        message: "Ha létezik ilyen fiók, küldtünk emailt.",
      });
    }

    // 2) token generálása
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 perc

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // 3) reset link – ÉLES DOMAIN
    const baseUrl = "https://login.essenciastore.com";
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(
      token
    )}`;

    // 4) Resend email küldés
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ Nincs RESEND_API_KEY beállítva!");
      return NextResponse.json(
        { error: "Email küldés nincs bekonfigurálva." },
        { status: 500 }
      );
    }

    const { error } = await resend.emails.send({
      from: "Essencia <no-reply@essenciastore.com>",
      to: email,
      subject: "Essencia – Jelszó visszaállítása",
      html: `
        <p>Szia!</p>
        <p>A jelszó visszaállításához kattints az alábbi gombra:</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;padding:10px 18px;background:#111827;color:#ffffff;border-radius:999px;text-decoration:none;">
            Jelszó visszaállítása
          </a>
        </p>
        <p>Ha nem te kérted, nyugodtan hagyd figyelmen kívül ezt az emailt.</p>
      `,
    });

    if (error) {
      console.error("❌ Resend hiba:", error);
      return NextResponse.json(
        { error: "Nem sikerült elküldeni az emailt." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Ha létezik ilyen fiók, küldtünk emailt.",
    });
  } catch (e: any) {
    console.error("❌ Password reset request API hiba:", e);
    return NextResponse.json(
      { error: "Váratlan hiba történt." },
      { status: 500 }
    );
  }
}