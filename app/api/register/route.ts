import { NextResponse } from "next/server";
// @ts-ignore - Vercel TS nem talál típusokat, de runtime-ban működik
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { identifier, phone, password, name } = (await req.json()) as {
      identifier?: string; // email VAGY telefon
      phone?: string;
      password?: string;
      name?: string;
    };

    // --- VALIDÁCIÓK ---

    if (!identifier || identifier.trim() === "") {
      return NextResponse.json(
        { error: "Adj meg email címet vagy telefonszámot." },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "A jelszó megadása kötelező." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A jelszónak legalább 6 karakter hosszúnak kell lennie." },
        { status: 400 }
      );
    }

    const trimmedIdentifier = identifier.trim();
    const isEmail = trimmedIdentifier.includes("@");

    const email = isEmail ? trimmedIdentifier : undefined;

    // Telefonszám normalizálás
    let normalizedPhone: string | undefined = undefined;

    if (!isEmail) {
      // ha az identifier telefon
      normalizedPhone = trimmedIdentifier.replace(/\s+/g, "");
    } else if (phone && phone.trim() !== "") {
      // ha az identifier email, de adtak meg külön telefont
      normalizedPhone = phone.trim().replace(/\s+/g, "");
    }

    if (!email && !normalizedPhone) {
      return NextResponse.json(
        { error: "Adj meg érvényes email címet vagy telefonszámot." },
        { status: 400 }
      );
    }

    // --- DUPLIKÁTUM ELLENŐRZÉS ---

    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        return NextResponse.json(
          { error: "Ezzel az email címmel már létezik fiók." },
          { status: 400 }
        );
      }
    }

    if (normalizedPhone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone: normalizedPhone },
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: "Ezzel a telefonszámmal már létezik fiók." },
          { status: 400 }
        );
      }
    }

    // --- JELSZÓ HASH + USER LÉTREHOZÁS ---

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email ?? null,
        phone: normalizedPhone ?? null,
        name: name ?? null,
        passwordHash,
      },
    });

    return NextResponse.json(
      { message: "Sikeres regisztráció.", userId: user.id },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json(
      {
        error: "Váratlan hiba történt.",
        detail: err?.message ?? null, // <-- itt látni fogjuk a valódi hibát is
      },
      { status: 500 }
    );
  }
}
