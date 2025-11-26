import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { email?: string }
    | null;

  const email = body?.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Adj meg egy email címet." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Mindig success-et adunk vissza, hogy ne lehessen emailt "kitalálni".
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 óra

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://essenciastore.com/";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  // Itt majd emailt fogunk küldeni – most logoljuk a konzolba:
  console.log("🔐 Password reset link:", resetUrl);

  return NextResponse.json({ ok: true });
}
