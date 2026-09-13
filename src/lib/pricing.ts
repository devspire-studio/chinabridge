import type { Product, Settings, ShippingMode, ShippingRate } from "./types";

/**
 * Landed-cost engine.
 *
 * Real-world model this mirrors (China -> Bangladesh sourcing/import):
 *   goods cost (CNY -> BDT)
 * + sourcing service fee (% of goods, category dependent)
 * + international freight (air = chargeable kg, sea = CBM with 0.5 CBM minimum)
 * + customs duty (% by HS/category) + VAT 15% + AIT (advance income tax)
 * + optional insurance, optional home delivery, COD handling fee
 * - wallet / coupon discount
 */

export const SHIPPING_RATES: ShippingRate[] = [
  {
    mode: "air_express",
    label: "Air Express",
    labelBn: "এয়ার এক্সপ্রেস",
    rateBdt: 2050,
    unit: "kg",
    minChargeBdt: 800,
    transitDaysMin: 3,
    transitDaysMax: 7,
    description: "Fastest door-to-door. Best for phones, gadgets, cosmetics, urgent stock.",
  },
  {
    mode: "air_standard",
    label: "Air Standard",
    labelBn: "এয়ার স্ট্যান্ডার্ড",
    rateBdt: 1380,
    unit: "kg",
    minChargeBdt: 600,
    transitDaysMin: 7,
    transitDaysMax: 12,
    description: "Balanced cost & speed. Great for electronics accessories and apparel lots.",
  },
  {
    mode: "sea_lcl",
    label: "Sea LCL (loose cargo)",
    labelBn: "সি এলসিএল",
    rateBdt: 41000,
    unit: "cbm",
    minChargeBdt: 22000,
    transitDaysMin: 25,
    transitDaysMax: 35,
    description: "Cheapest per unit for bulky, heavy or large-volume orders.",
  },
  {
    mode: "sea_fcl",
    label: "Sea FCL (full container)",
    labelBn: "সি এফসিএল",
    rateBdt: 33000,
    unit: "cbm",
    minChargeBdt: 620000,
    transitDaysMin: 30,
    transitDaysMax: 40,
    description: "20GP / 40HQ full container for wholesale importers. Best CBM rate.",
  },
];

export const VOLUMETRIC_DIVISOR_AIR = 167; // kg per CBM, industry standard for air freight

export function shippingRate(mode: ShippingMode) {
  return SHIPPING_RATES.find((r) => r.mode === mode) ?? SHIPPING_RATES[1];
}

export interface LandedCostInput {
  costPriceCny: number;
  quantity: number;
  weightGrams: number;
  cbm: number;
  mode: ShippingMode;
  settings: Settings;
  serviceFeePct?: number;
  dutyPct?: number;
  insured?: boolean;
  homeDelivery?: boolean;
  outsideDhaka?: boolean;
  cod?: boolean;
  discountBdt?: number;
}

export interface LandedCostBreakdown {
  quantity: number;
  goodsBdt: number;
  serviceFeeBdt: number;
  freightBdt: number;
  dutyBdt: number;
  vatBdt: number;
  aitBdt: number;
  insuranceBdt: number;
  deliveryBdt: number;
  codFeeBdt: number;
  discountBdt: number;
  totalBdt: number;
  perUnitBdt: number;
  chargeableWeightGrams: number;
  chargeableCbm: number;
  totalWeightGrams: number;
  totalCbm: number;
  transitDaysMin: number;
  transitDaysMax: number;
}

export function estimateLandedCost(input: LandedCostInput): LandedCostBreakdown {
  const {
    costPriceCny,
    quantity,
    weightGrams,
    cbm,
    mode,
    settings,
    serviceFeePct = settings.serviceFeePct,
    dutyPct = 0,
    insured = false,
    homeDelivery = true,
    outsideDhaka = false,
    cod = false,
    discountBdt = 0,
  } = input;

  const rate = shippingRate(mode);
  const totalWeightGrams = weightGrams * quantity;
  const totalCbm = Math.max(cbm * quantity, 0.0001);

  // goods
  const goodsBdt = Math.round(costPriceCny * quantity * settings.cnyToBdt);

  // sourcing service fee
  const serviceFeeBdt = Math.max(
    Math.round((goodsBdt * serviceFeePct) / 100),
    goodsBdt > 0 ? settings.minServiceFeeBdt : 0,
  );

  // freight
  let freightBdt: number;
  let chargeableWeightGrams = totalWeightGrams;
  let chargeableCbm = totalCbm;
  if (rate.unit === "kg") {
    const volumetricGrams = Math.round(totalCbm * VOLUMETRIC_DIVISOR_AIR * 1000);
    chargeableWeightGrams = Math.max(totalWeightGrams, volumetricGrams);
    const kgs = chargeableWeightGrams / 1000;
    freightBdt = Math.max(Math.ceil(kgs * rate.rateBdt), rate.minChargeBdt);
  } else {
    chargeableCbm = Math.max(Math.ceil(totalCbm * 4) / 4, 0.5); // round up to quarter CBM, 0.5 min
    freightBdt = Math.max(Math.round(chargeableCbm * rate.rateBdt), rate.minChargeBdt);
  }

  // taxes: duty on (goods + freight-ish) assessed value, VAT on top of duty, AIT at import stage
  const assessableValue = goodsBdt + freightBdt;
  const dutyBdt = Math.round((assessableValue * dutyPct) / 100);
  const vatBdt = Math.round(((assessableValue + dutyBdt) * settings.vatPct) / 100);
  const aitBdt = Math.round((assessableValue * settings.aitPct) / 100);

  const insuranceBdt = insured ? Math.round((goodsBdt * settings.insurancePct) / 100) : 0;

  const deliveryBdt = homeDelivery
    ? outsideDhaka
      ? settings.homeDeliveryOutsideBdt
      : settings.homeDeliveryDhakaBdt
    : -settings.pickupDiscountBdt;

  const codFeeBdt = cod ? Math.round(((goodsBdt + freightBdt) * settings.codFeePct) / 100) : 0;

  const totalBdt =
    goodsBdt +
    serviceFeeBdt +
    freightBdt +
    dutyBdt +
    vatBdt +
    aitBdt +
    insuranceBdt +
    deliveryBdt +
    codFeeBdt -
    discountBdt;

  return {
    quantity,
    goodsBdt,
    serviceFeeBdt,
    freightBdt,
    dutyBdt,
    vatBdt,
    aitBdt,
    insuranceBdt,
    deliveryBdt,
    codFeeBdt,
    discountBdt,
    totalBdt: Math.max(0, totalBdt),
    perUnitBdt: Math.round(Math.max(0, totalBdt) / Math.max(1, quantity)),
    chargeableWeightGrams,
    chargeableCbm,
    totalWeightGrams,
    totalCbm,
    transitDaysMin: rate.transitDaysMin,
    transitDaysMax: rate.transitDaysMax,
  };
}

export function productLandedPreview(product: Product, settings: Settings, mode: ShippingMode = "air_standard") {
  return estimateLandedCost({
    costPriceCny: product.costPriceCny,
    quantity: 1,
    weightGrams: product.weightGrams,
    cbm: product.cbm,
    mode,
    settings,
    homeDelivery: true,
  });
}

/* ------------------------- storefront order pricing ----------------------- */

export interface StoreLine {
  productId: string;
  title: string;
  image: string;
  sku: string;
  variant?: string;
  unitPriceBdt: number;
  costPriceCny: number;
  quantity: number;
  weightGrams: number;
  cbm: number;
  dutyPct: number;
  serviceFeePct: number;
}

export interface StoreOrderPricing {
  subtotalBdt: number;
  serviceFeeBdt: number;
  freightBdt: number;
  dutyBdt: number;
  vatBdt: number;
  deliveryBdt: number;
  codFeeBdt: number;
  discountBdt: number;
  totalBdt: number;
  weightGrams: number;
  cbm: number;
  chargeableWeightGrams: number;
  transitDaysMin: number;
  transitDaysMax: number;
}

/**
 * Prices a storefront order where catalogue prices are already quoted in BDT
 * (supplier cost + our sourcing fee). Freight, duty, VAT and delivery are added on top.
 * Used by both the seed generator and the checkout API so numbers always agree.
 */
export function priceStoreOrder(input: {
  lines: StoreLine[];
  mode: ShippingMode;
  settings: Settings;
  insured?: boolean;
  homeDelivery?: boolean;
  outsideDhaka?: boolean;
  cod?: boolean;
  discountBdt?: number;
}): StoreOrderPricing {
  const { lines, mode, settings, insured = false, homeDelivery = true, outsideDhaka = false, cod = false } = input;
  const rate = shippingRate(mode);

  const subtotalBdt = Math.round(sum(lines.map((l) => l.unitPriceBdt * l.quantity)));
  const serviceFeeBdt = Math.round(
    sum(lines.map((l) => ((l.costPriceCny * settings.cnyToBdt * l.serviceFeePct) / 100) * l.quantity)),
  );

  const weightGrams = sum(lines.map((l) => l.weightGrams * l.quantity));
  const cbmTotal = sum(lines.map((l) => l.cbm * l.quantity));

  let freightBdt: number;
  let chargeableWeightGrams = weightGrams;
  if (rate.unit === "kg") {
    const volumetric = Math.round(cbmTotal * VOLUMETRIC_DIVISOR_AIR * 1000);
    chargeableWeightGrams = Math.max(weightGrams, volumetric);
    freightBdt = Math.max(Math.ceil((chargeableWeightGrams / 1000) * rate.rateBdt), rate.minChargeBdt);
  } else {
    freightBdt = Math.max(Math.round(Math.max(Math.ceil(cbmTotal * 4) / 4, 0.5) * rate.rateBdt), rate.minChargeBdt);
  }

  // customs assesses duty on supplier cost (goods + share of freight), not on our margin
  const costGoodsBdt = sum(lines.map((l) => l.costPriceCny * settings.cnyToBdt * l.quantity));
  const freightShare = costGoodsBdt > 0 ? freightBdt : 0;
  const dutyBdt = Math.round(
    sum(
      lines.map((l) => {
        const lineCost = l.costPriceCny * settings.cnyToBdt * l.quantity;
        const share = costGoodsBdt > 0 ? (lineCost / costGoodsBdt) * freightShare : 0;
        return ((lineCost + share) * l.dutyPct) / 100;
      }),
    ),
  );
  const assessable = costGoodsBdt + freightShare;
  const vatBdt = Math.round(((assessable + dutyBdt) * settings.vatPct) / 100);
  const insuranceBdt = insured ? Math.round(((subtotalBdt * settings.insurancePct) / 100) * 3) : 0;

  const deliveryBdt = homeDelivery
    ? outsideDhaka
      ? settings.homeDeliveryOutsideBdt
      : settings.homeDeliveryDhakaBdt
    : -settings.pickupDiscountBdt;

  const codFeeBdt = cod ? Math.round(((subtotalBdt + freightBdt) * settings.codFeePct) / 100) : 0;
  const discountBdt = input.discountBdt ?? 0;

  const totalBdt = Math.max(
    0,
    subtotalBdt + freightBdt + dutyBdt + vatBdt + insuranceBdt + deliveryBdt + codFeeBdt - discountBdt,
  );

  return {
    subtotalBdt,
    serviceFeeBdt,
    freightBdt,
    dutyBdt: dutyBdt + insuranceBdt,
    vatBdt,
    deliveryBdt,
    codFeeBdt,
    discountBdt,
    totalBdt: Math.round(totalBdt),
    weightGrams,
    cbm: Math.round(cbmTotal * 10000) / 10000,
    chargeableWeightGrams,
    transitDaysMin: rate.transitDaysMin,
    transitDaysMax: rate.transitDaysMax,
  };
}

function sum(values: number[]) {
  return values.reduce((a, b) => a + b, 0);
}

/** Estimate the CNY cost of a product back from its BDT selling price. */
export function cnyFromBdt(amountBdt: number, settings: Settings) {
  return Math.round((amountBdt / settings.cnyToBdt) * 100) / 100;
}

export function dutySummary(settings: Settings, dutyPct: number, goodsBdt: number, freightBdt: number) {
  const assessable = goodsBdt + freightBdt;
  const duty = (assessable * dutyPct) / 100;
  const vat = ((assessable + duty) * settings.vatPct) / 100;
  const ait = (assessable * settings.aitPct) / 100;
  return { assessable, duty, vat, ait, total: duty + vat + ait };
}
