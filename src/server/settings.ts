import { eq } from "drizzle-orm";

import { getDb, settings as settingsTable } from "@/db";

import type { Settings } from "@/lib/types";

const FALLBACK: Settings = {
  brandName: "ChinaBridge BD",
  brandTagline: "One-stop global sourcing, import & customs clearance for Bangladesh",
  supportPhone: "+880 9612 345 678",
  supportEmail: "support@chinabridge.com.bd",
  whatsapp: "+8618800134455",
  address: "House 42 (4th Floor), Road 11, Banani, Dhaka 1213",
  cnyToBdt: 17.4,
  usdToBdt: 122,
  serviceFeePct: 10,
  minServiceFeeBdt: 150,
  vatPct: 15,
  aitPct: 3,
  insurancePct: 1.5,
  freeShippingThresholdBdt: 50000,
  codFeePct: 2,
  advancePaymentPct: 50,
  warehouseStorageFreeDays: 15,
  storageFeePerCbmBdt: 2200,
  homeDeliveryDhakaBdt: 80,
  homeDeliveryOutsideBdt: 160,
  pickupDiscountBdt: 50,
  exchangeRateUpdatedAt: new Date().toISOString(),
  maintenanceMode: false,
  guestCheckout: true,
};

export async function getSettings(): Promise<Settings> {
  try {
    const db = await getDb();
    const [row] = await db.select().from(settingsTable).where(eq(settingsTable.id, "default")).limit(1);
    if (!row) return FALLBACK;
    return {
      ...FALLBACK,
      ...row,
      exchangeRateUpdatedAt:
        row.exchangeRateUpdatedAt instanceof Date
          ? row.exchangeRateUpdatedAt.toISOString()
          : String(row.exchangeRateUpdatedAt),
    } as Settings;
  } catch {
    return FALLBACK;
  }
}

export async function updateSettings(patch: Partial<Settings>) {
  const db = await getDb();
  const { exchangeRateUpdatedAt, ...rest } = patch;
  await db
    .update(settingsTable)
    .set({
      ...rest,
      ...(exchangeRateUpdatedAt ? { exchangeRateUpdatedAt: new Date(exchangeRateUpdatedAt) } : {}),
      updatedAt: new Date(),
    })
    .where(eq(settingsTable.id, "default"));
}

export { FALLBACK as FALLBACK_SETTINGS };
