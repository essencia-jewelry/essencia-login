import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/profile  → aktuális user adatai
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json(
      { error: "Nincs bejelentkezve." },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Felhasználó nem található." },
      { status: 404 }
    );
  }

  return NextResponse.json(user);
}

// PUT /api/profile  → név + telefon frissítése
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json(
      { error: "Nincs bejelentkezve." },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null) as
    | { name?: string; phone?: string }
    | null;

  if (!body) {
    return NextResponse.json({ error: "Érvénytelen kérés." }, { status: 400 });
  }

  const { name, phone } = body;

  try {
    const updated = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name ?? undefined,
        phone: phone ?? undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("Profil frissítési hiba:", e);
    return NextResponse.json(
      { error: "Nem sikerült frissíteni a profilt." },
      { status: 500 }
    );
  }
}
