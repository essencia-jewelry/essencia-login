import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// @ts-ignore
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { token?: string; newPassword?: string }
    | null;

  const token = body?.token;
  const newPassword = body?.newPassword;

  if (!token || !newPassword) {
    return NextResponse.json({ error: "Hiányzó adatok." }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "Az új jelszónak legalább 6 karakter hosszúnak kell lennie." },
      { status: 400 }
    );
  }

  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "A jelszó-visszaállító link lejárt vagy érvénytelen." },
      { status: 400 }
    );
  }

  const hash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: tokenRecord.userId },
    data: { passwordHash: hash },
  });

  // token törlése, hogy ne lehessen újra használni
  await prisma.passwordResetToken.delete({
    where: { id: tokenRecord.id },
  });

  return NextResponse.json({ ok: true });
}
