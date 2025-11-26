import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
// @ts-ignore
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Nincs bejelentkezve." }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { currentPassword?: string; newPassword?: string }
    | null;

  if (!body?.currentPassword || !body?.newPassword) {
    return NextResponse.json({ error: "Hiányzó adatok." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || !user.passwordHash) {
    return NextResponse.json(
      { error: "Nem lehet jelszót cserélni ennél a fióknál." },
      { status: 400 }
    );
  }

  const isValid = await bcrypt.compare(body.currentPassword, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: "A jelenlegi jelszó nem megfelelő." }, { status: 400 });
  }

  if (body.newPassword.length < 6) {
    return NextResponse.json(
      { error: "Az új jelszónak legalább 6 karakter hosszúnak kell lennie." },
      { status: 400 }
    );
  }

  const newHash = await bcrypt.hash(body.newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  return NextResponse.json({ ok: true });
}
