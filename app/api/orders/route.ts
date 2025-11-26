import { NextResponse } from "next/server";
import { getOrdersByEmail } from "@/lib/shopify";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Missing email parameter" },
        { status: 400 }
      );
    }

    const orders = await getOrdersByEmail(email);

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("❌ API /api/orders error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
