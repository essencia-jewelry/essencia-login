const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-01";

if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
  console.warn(
    "⚠️ Shopify env változók hiányoznak. Ellenőrizd a SHOPIFY_STORE_DOMAIN és SHOPIFY_ADMIN_ACCESS_TOKEN értékeket."
  );
}

export async function getOrdersByEmail(email: string) {
  if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
    throw new Error("Shopify konfiguráció hiányzik.");
  }

  const url = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/orders.json?email=${encodeURIComponent(
    email
  )}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-Shopify-Access-Token": SHOPIFY_TOKEN,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ Shopify error:", text);
    throw new Error("Hiba történt a Shopify rendeléslekérdezésnél.");
  }

  const data = await res.json();

  const simplified = (data.orders || []).map((o: any) => ({
    id: o.id,
    name: o.name, // pl. #1001
    createdAt: o.created_at,
    financialStatus: o.financial_status,
    fulfillmentStatus: o.fulfillment_status,
    totalPrice: o.total_price,
    currency: o.currency,
  }));

  return simplified;
}
