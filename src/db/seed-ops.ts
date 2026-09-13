/**
 * Operational seed data: customers, orders, shipments, procurement, support, CMS, staff.
 */
import { ORDER_STATUS_FLOW } from "@/lib/format";
import { priceStoreOrder, type StoreLine } from "@/lib/pricing";
import type { Settings } from "@/lib/types";
import { ph } from "@/lib/utils";

import { buildCatalog, daysAgo, daysAhead, rng, SEED_ANCHOR } from "./seed-catalog";

export const SETTINGS_SEED: Settings = {
  brandName: "ChinaBridge BD",
  brandTagline: "One-stop global sourcing, import & customs clearance for Bangladesh",
  supportPhone: "+880 9612 345 678",
  supportEmail: "support@chinabridge.com.bd",
  whatsapp: "+8618800134455",
  address: "House 42 (4th floor), Road 11, Banani, Dhaka 1213",
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
  exchangeRateUpdatedAt: daysAgo(0, 3).toISOString(),
  maintenanceMode: false,
  guestCheckout: true,
};

const CUSTOMER_SEED = [
  ["Rakib Hasan", "01711234567", "rakib@example.com", "reseller", "gold", 4250, "Dhanmondi", "Dhaka"],
  ["Nusrat Jahan", "01812345678", "nusrat@example.com", "retail", "silver", 1200, "Mirpur 10", "Dhaka"],
  ["Tanvir Ahmed", "01913456789", "tanvir@example.com", "wholesale", "platinum", 28500, "Agrabad", "Chattogram"],
  ["Sadia Islam", "01614567890", "sadia@example.com", "retail", "bronze", 0, "Uttara Sector 7", "Dhaka"],
  ["Imran Kabir", "01515678901", "imran@example.com", "reseller", "gold", 8600, "Sylhet Sadar", "Sylhet"],
  ["Farhana Akter", "01716789012", "farhana@example.com", "retail", "silver", 950, "Bogura Sadar", "Bogura"],
  ["Mahmudul Hasan", "01817890123", "mahmud@example.com", "wholesale", "platinum", 41200, "Narayanganj", "Narayanganj"],
  ["Jannatul Ferdous", "01918901234", "jannat@example.com", "retail", "bronze", 300, "Cumilla", "Cumilla"],
  ["Shakib Al Amin", "01619012345", "shakib@example.com", "reseller", "gold", 6400, "Khulna", "Khulna"],
  ["Rima Sultana", "01520123456", "rima@example.com", "retail", "silver", 2100, "Rajshahi", "Rajshahi"],
  ["Arif Chowdhury", "01721234567", "arif@example.com", "reseller", "platinum", 15800, "Gazipur", "Gazipur"],
  ["Mitu Barua", "01822345678", "mitu@example.com", "retail", "bronze", 0, "Chattogram", "Chattogram"],
  ["Habibur Rahman", "01923456789", "habib@example.com", "wholesale", "gold", 22400, "Mymensingh", "Mymensingh"],
  ["Sabbir Hossain", "01624567890", "sabbir@example.com", "reseller", "silver", 3400, "Rangpur", "Rangpur"],
] as const;

const ORDER_STATUS_POOL = [
  "delivered",
  "delivered",
  "delivered",
  "delivered",
  "delivered",
  "delivered",
  "out_for_delivery",
  "out_for_delivery",
  "arrived_bd",
  "customs_clearance",
  "customs_clearance",
  "in_transit",
  "in_transit",
  "in_transit",
  "consolidated",
  "qc_passed",
  "china_warehouse",
  "china_warehouse",
  "purchased",
  "purchased",
  "confirmed",
  "pending_payment",
  "pending_payment",
  "cancelled",
] as const;

export function buildOps() {
  const random = rng(77123);
  const { products, categories, suppliers } = buildCatalog();
  const settings = SETTINGS_SEED;

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const customers = CUSTOMER_SEED.map((c, i) => {
    const [name, phone, email, type, tier, wallet, area, city] = c;
    const orderCount = type === "wholesale" ? 14 + Math.floor(random() * 20) : 3 + Math.floor(random() * 12);
    const spent = wallet * 6 + Math.floor(random() * 400000);
    return {
      id: `cus_${String(1001 + i)}`,
      name,
      phone,
      email,
      avatar: null as string | null,
      type: type as "retail" | "wholesale" | "reseller",
      tier: tier as "bronze" | "silver" | "gold" | "platinum",
      walletBalanceBdt: wallet,
      totalOrders: orderCount,
      totalSpentBdt: spent,
      dueBdt: type === "retail" ? 0 : Math.floor(random() * 45000),
      status: "active" as const,
      notes: i === 2 ? "Buys container loads of apparel every quarter." : "",
      joinedAt: daysAgo(420 - i * 22),
      lastOrderAt: daysAgo(Math.floor(random() * 30)),
    };
  });

  const addresses = customers.flatMap((c, i) => {
    const seed = CUSTOMER_SEED[i];
    const [, , , , , , area, city] = seed;
    return [
      {
        id: `adr_${c.id}_1`,
        customerId: c.id,
        label: "Home",
        fullName: c.name,
        phone: c.phone,
        altPhone: null,
        addressLine: `House ${10 + i}, Road ${2 + (i % 12)}`,
        area,
        city,
        district: city,
        postcode: "1200",
        isDefault: true,
      },
      {
        id: `adr_${c.id}_2`,
        customerId: c.id,
        label: "Shop",
        fullName: c.name,
        phone: c.phone,
        altPhone: null,
        addressLine: `Shop ${100 + i}, ${area} Bazar`,
        area,
        city,
        district: city,
        postcode: "1200",
        isDefault: false,
      },
    ];
  });

  /* ------------------------------- shipments ------------------------------ */
  const shipmentSpecs = [
    ["CB-AIR-2418", "air_express", "in_transit", 3, 4],
    ["CB-AIR-2417", "air_standard", "customs", 9, 3],
    ["CB-AIR-2416", "air_standard", "released", 15, 0],
    ["CB-SEA-1180", "sea_lcl", "in_transit", 22, 11],
    ["CB-SEA-1179", "sea_lcl", "at_port", 31, 2],
    ["CB-SEA-1178", "sea_fcl", "received_warehouse", 44, 0],
    ["CB-AIR-2415", "air_express", "received_warehouse", 26, 0],
    ["CB-SEA-1177", "sea_fcl", "loading", 8, 32],
    ["CB-AIR-2414", "air_standard", "booking", 2, 9],
    ["CB-SEA-1176", "sea_lcl", "customs", 27, 4],
  ] as const;

  const shipments = shipmentSpecs.map(([ref, mode, status, ago, eta], i) => {
    const weight = mode === "air_express" ? 42000 + i * 3600 : 210000 + i * 18000;
    const cbmValue = mode.startsWith("sea") ? 6.5 + i * 1.4 : Math.round((weight / 1000 / 167) * 100) / 100;
    const ratePerKg = mode === "air_express" ? 2050 : mode === "air_standard" ? 1380 : 0;
    const freight = ratePerKg ? Math.round((weight / 1000) * ratePerKg) : Math.round(cbmValue * 41000);
    return {
      id: `shp_${ref.toLowerCase().replace(/-/g, "_")}`,
      ref,
      mode: mode as "air_express" | "air_standard" | "sea_lcl" | "sea_fcl",
      status: status as "booking" | "in_transit" | "customs" | "released" | "at_port" | "received_warehouse" | "loading",
      originCity: mode.startsWith("sea") ? "Shenzhen (Yantian)" : "Guangzhou (CAN)",
      destinationCity: mode.startsWith("sea") ? "Chattogram Port" : "Dhaka (DAC)",
      carrier: mode.startsWith("sea") ? ["Maersk", "MSC", "COSCO"][i % 3] : ["China Southern Cargo", "SF Airlines", "Emirates SkyCargo"][i % 3],
      awbOrBl: mode.startsWith("sea") ? `BL-${784512 + i * 37}` : `AWB-${160 + i}-${45781230 + i * 91}`,
      containerNo: mode.startsWith("sea") ? `MRKU${4 + i}${387412 + i}` : null,
      cbm: cbmValue,
      weightGrams: weight,
      chargeableWeightGrams: mode.startsWith("air") ? Math.round(Math.max(weight, cbmValue * 167 * 1000)) : weight,
      freightCostBdt: freight,
      dutyPaidBdt: Math.round(freight * 1.4),
      orderCount: 4 + Math.floor(random() * 14),
      notes: status === "customs" ? "Duty assessment in progress at Dhaka Customs House." : "",
      departedAt: status === "booking" ? null : daysAgo(ago),
      etaAt: daysAhead(eta),
      arrivedAt: ["released", "received_warehouse", "at_port"].includes(status) ? daysAgo(Math.max(0, ago - 4)) : null,
      clearedAt: status === "received_warehouse" ? daysAgo(Math.max(0, ago - 6)) : null,
      createdAt: daysAgo(ago + 3),
    };
  });

  const shipmentByMode = {
    air_express: shipments[0],
    air_standard: shipments[1],
    sea_lcl: shipments[3],
    sea_fcl: shipments[5],
  };

  /* -------------------------------- orders -------------------------------- */
  const orders: (typeof import("./schema").orders.$inferInsert)[] = [];
  const orderItems: (typeof import("./schema").orderItems.$inferInsert)[] = [];
  const orderEvents: (typeof import("./schema").orderEvents.$inferInsert)[] = [];
  const orderPayments: (typeof import("./schema").orderPayments.$inferInsert)[] = [];

  const channels = ["store", "store", "store", "link_order", "link_order", "rfq", "group_buy", "wholesale"] as const;
  const modes = ["air_standard", "air_standard", "air_express", "air_express", "sea_lcl", "sea_lcl", "sea_fcl"] as const;
  const actors = ["Ops · Sohana", "Procurement · Rifat", "China warehouse · Li Wei", "Support · Nabila", "System"];

  const orderPlan = [...ORDER_STATUS_POOL, ...ORDER_STATUS_POOL.slice(0, 14)];

  orderPlan.forEach((rawStatus, index) => {
    const status = index > ORDER_STATUS_POOL.length && index % 9 === 0 ? ("returned" as const) : rawStatus;
    const customer = customers[index % customers.length];
    const channel = channels[index % channels.length];
    const mode = channel === "wholesale" || channel === "rfq" ? (index % 2 ? "sea_lcl" : "sea_fcl") : modes[index % modes.length];
    const lineCount = channel === "wholesale" ? 3 : 1 + (index % 3);
    const picked = Array.from({ length: lineCount }).map((_, k) => products[(index * 5 + k * 7) % products.length]);
    const wholesale = channel === "wholesale" || channel === "rfq" || channel === "group_buy";

    const lines: StoreLine[] = picked.map((p) => {
      const category = categoryById.get(p.categoryId)!;
      const qty = wholesale ? Math.max(p.moq, 6 + Math.floor(random() * 30)) : 1 + Math.floor(random() * 3);
      return {
        productId: p.id,
        title: p.title,
        image: p.images?.[0] ?? ph({ seed: p.slug, label: p.title.slice(0, 18), icon: "📦" }),
        sku: p.sku,
        variant: p.moq > 100 ? "Custom print" : "Standard",
        unitPriceBdt: p.priceBdt,
        costPriceCny: p.costPriceCny,
        quantity: qty,
        weightGrams: p.weightGrams,
        cbm: p.cbm,
        dutyPct: category.dutyPct,
        serviceFeePct: category.serviceFeePct,
      };
    });

    const createdDaysAgo = Math.max(1, 62 - index * 2.2 + random() * 2);
    const pricing = priceStoreOrder({ lines, mode, settings, homeDelivery: true, cod: index % 7 === 0 });
    const orderStatusIndex = ORDER_STATUS_FLOW.findIndex((s) => s.status === status);
    const isCancelled = status === "cancelled";
    const isReturned = status === "returned";
    const advance = Math.round((pricing.totalBdt * settings.advancePaymentPct) / 100);
    const paymentStatus = isCancelled || isReturned
      ? ("refunded" as const)
      : status === "delivered"
        ? ("paid" as const)
        : status === "pending_payment"
          ? ("unpaid" as const)
          : ("partial" as const);
    const paidBdt = paymentStatus === "paid" ? pricing.totalBdt : paymentStatus === "partial" ? advance : 0;

    const id = `ord_${2600 + index}`;
    const orderNo = `CB-${25000 + index * 7}`;
    const address = addresses.find((a) => a.customerId === customer.id && a.isDefault)!;
    const inTransitOrLater = ["in_transit", "customs_clearance", "arrived_bd", "out_for_delivery", "delivered"].includes(status);
    const shipment = inTransitOrLater ? shipmentByMode[mode as keyof typeof shipmentByMode] : undefined;

    orders.push({
      id,
      orderNo,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      channel,
      status,
      paymentStatus,
      shippingMode: mode,
      subtotalBdt: pricing.subtotalBdt,
      serviceFeeBdt: pricing.serviceFeeBdt,
      shippingFeeBdt: pricing.freightBdt,
      dutyBdt: pricing.dutyBdt,
      vatBdt: pricing.vatBdt,
      discountBdt: pricing.discountBdt,
      totalBdt: pricing.totalBdt,
      paidBdt,
      weightGrams: pricing.weightGrams,
      cbm: pricing.cbm,
      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        addressLine: address.addressLine,
        area: address.area,
        city: address.city,
        district: address.district,
        postcode: address.postcode ?? "",
      },
      shipmentId: shipment?.id ?? null,
      consignmentRef: shipment?.ref ?? null,
      chinaTrackingNo: index % 3 === 0 ? `SF${45780123 + index * 977}` : null,
      courier: inTransitOrLater ? ["Pathao", "Steadfast", "RedX", "Sundarban"][index % 4] : null,
      courierTrackingNo: inTransitOrLater ? `${["PTH", "STD", "RDX", "SDB"][index % 4]}${88451230 + index * 131}` : null,
      couponCode: index % 6 === 0 ? "FIRST500" : null,
      sourceUrl: channel === "link_order" ? `https://detail.tmall.com/item.htm?id=${700000000 + index * 421}` : null,
      notes: channel === "rfq" ? "Customer requested quote-matched pricing." : "",
      createdAt: daysAgo(createdDaysAgo),
      updatedAt: daysAgo(Math.max(0.2, createdDaysAgo - 2)),
      etaAt: daysAhead(Math.max(1, 12 - index / 3)),
    });

    lines.forEach((line, k) => {
      orderItems.push({
        id: `${id}_it${k + 1}`,
        orderId: id,
        productId: line.productId,
        title: line.title,
        image: line.image,
        sku: line.sku,
        variant: line.variant ?? null,
        unitPriceBdt: line.unitPriceBdt,
        quantity: line.quantity,
        weightGrams: line.weightGrams,
        cbm: line.cbm,
      });
    });

    const flow = isCancelled
      ? ORDER_STATUS_FLOW.slice(0, 2)
      : isReturned
        ? ORDER_STATUS_FLOW
        : ORDER_STATUS_FLOW.slice(0, orderStatusIndex + 1);
    flow.forEach((step, k) => {
      orderEvents.push({
        id: `${id}_ev${k + 1}`,
        orderId: id,
        status: step.status as (typeof ORDER_STATUS_FLOW)[number]["status"] as never,
        title: step.label,
        note: step.hint,
        location:
          k < 3 ? "Dhaka office" : k < 6 ? "Guangzhou consolidation hub" : k < 8 ? "Dhaka Customs House" : "ChinaBridge BD hub, Tejgaon",
        actor: actors[k % actors.length],
        at: daysAgo(Math.max(0.5, createdDaysAgo - k * 1.8)),
      });
    });

    if (isReturned) {
      orderEvents.push({
        id: `${id}_evr`,
        orderId: id,
        status: "returned" as never,
        title: "Returned & refunded",
        note: "Customer returned 2 pcs (size mismatch). Refund issued to wallet.",
        location: "Dhaka Hub · Tejgaon",
        actor: "Support · Nabila",
        at: daysAgo(0.8),
      });
    }

    if (isCancelled) {
      orderEvents.push({
        id: `${id}_evc`,
        orderId: id,
        status: "cancelled" as never,
        title: "Order cancelled",
        note: "Customer changed mind before supplier purchase. Advance refunded to wallet.",
        location: "Dhaka office",
        actor: "Support · Nabila",
        at: daysAgo(Math.max(0.2, createdDaysAgo - 2)),
      });
    }

    if (paymentStatus !== "unpaid") {
      orderPayments.push({
        id: `${id}_pay1`,
        orderId: id,
        amountBdt: paidBdt,
        method: (["bkash", "nagad", "bank_transfer", "card", "wallet"] as const)[index % 5],
        reference: `TRX${8845120 + index * 733}`,
        status: paymentStatus === "refunded" ? "refunded" : "success",
        at: daysAgo(Math.max(0.4, createdDaysAgo - 0.6)),
      });
    }
    if (paymentStatus === "paid" && index % 3 === 0) {
      orderPayments.push({
        id: `${id}_pay2`,
        orderId: id,
        amountBdt: pricing.totalBdt - paidBdt,
        method: "cod",
        reference: `COD${55120 + index * 41}`,
        status: "success",
        at: daysAgo(Math.max(0.2, createdDaysAgo - 12)),
      });
    }
  });

  /* ----------------------------- procurement ------------------------------ */
  const purchaseOrders = suppliers.slice(0, 8).map((supplier, i) => {
    const supplierProducts = products.filter((p) => p.supplierId === supplier.id).slice(0, 4);
    const totalCny = supplierProducts.reduce((acc, p) => acc + p.costPriceCny * (6 + i * 2), 0);
    const status = (["received", "shipped", "paid", "placed", "paid", "shipped", "received", "draft"] as const)[i];
    return {
      id: `po_${3001 + i}`,
      ref: `PO-${2026}-${120 + i}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      orderIds: orders.slice(i * 2, i * 2 + 3).map((o) => o.id),
      totalCny,
      paidCny: status === "draft" ? 0 : status === "placed" ? Math.round(totalCny * 0.3) : totalCny,
      status,
      warehouse: i % 2 === 0 ? "Guangzhou DC-1" : "Yiwu DC-2",
      notes: i === 0 ? "Urgent restock for air express batch." : "",
      placedAt: daysAgo(6 + i * 4),
      expectedAt: daysAhead(4 + i),
    };
  });

  const purchaseOrderItems = purchaseOrders.flatMap((po) =>
    products
      .filter((p) => p.supplierId === po.supplierId)
      .slice(0, 4)
      .map((p, k) => ({
        id: `${po.id}_i${k + 1}`,
        purchaseOrderId: po.id,
        productId: p.id,
        title: p.title,
        quantity: 6 + k * 4,
        unitCostCny: p.costPriceCny,
      })),
  );

  /* -------------------------------- quotes -------------------------------- */
  const quoteSeeds = [
    ["Sajid Traders", "01722001122", "https://detail.1688.com/offer/623451879012.html", "1688", "Stainless steel water bottle 750ml", 500],
    ["Dhaka Fashion House", "01833002233", "https://item.taobao.com/item.htm?id=712345678901", "Taobao", "Designer three-piece kurti (new arrival)", 200],
    ["Gadget Bazar BD", "01944003344", "https://www.alibaba.com/product-detail/wholesale-tws-earbuds", "Alibaba", "TWS earbuds with ANC, custom logo", 1000],
    ["Sylhet Home Decor", "01655004455", "https://detail.1688.com/offer/598771234561.html", "1688", "Ceramic dinner set 24 pcs", 120],
    ["Chattogram Cycle Mart", "01566005566", "https://detail.1688.com/offer/612209871234.html", "1688", "Electric bicycle 350W", 20],
    ["Baby Care Corner", "01777006677", "https://item.taobao.com/item.htm?id=689012345678", "Taobao", "Baby feeding bottle set (BPA free)", 600],
    ["Narayanganj Textile", "01888007788", "https://detail.1688.com/offer/633112244556.html", "1688", "Grey fabric roll 180 GSM", 3000],
    ["Uttara Sports", "01999008899", "https://detail.1688.com/offer/644558877112.html", "1688", "Adjustable dumbbell set 20kg", 60],
    ["Khulna Mobile Point", "01611009900", "https://detail.1688.com/offer/655441122334.html", "1688", "Phone repair tool kit", 150],
    ["Rajshahi Solar", "01512001122", "https://www.alibaba.com/product-detail/600w-solar-panel", "Alibaba", "600W mono solar panel", 40],
  ] as const;

  const quotes = quoteSeeds.map(([name, phone, url, platform, productName, quantity], i) => {
    const status = (["new", "new", "reviewing", "quoted", "quoted", "won", "lost", "reviewing", "won", "quoted"] as const)[i];
    const unitPrice = Math.round((1200 + i * 3400) * (i % 3 === 0 ? 1.4 : 1));
    return {
      id: `qte_${4001 + i}`,
      ref: `RFQ-${2500 + i}`,
      customerName: name,
      phone,
      email: `${name.split(" ")[0].toLowerCase()}@example.com`,
      sourceUrl: url,
      sourcePlatform: platform,
      productName,
      quantity,
      targetPriceBdt: Math.round(unitPrice * 0.85),
      notes: i % 3 === 0 ? "Need landed cost breakdown with duty before confirming." : "",
      status,
      quotedUnitPriceBdt: status === "new" || status === "reviewing" ? null : unitPrice,
      quotedTotalBdt: status === "new" || status === "reviewing" ? null : unitPrice * quantity,
      assignedTo: status === "new" ? null : ["Sohana Akter", "Rifat Karim", "Nabila Yeasmin"][i % 3],
      createdAt: daysAgo(i + 1),
    };
  });

  /* ------------------------------ group buys ------------------------------ */
  const groupProducts = products.filter((p) => p.featured).slice(0, 6);
  const groupBuys = groupProducts.map((p, i) => ({
    id: `grp_${5001 + i}`,
    title: `Group deal: ${p.title.split(" ").slice(0, 5).join(" ")}`,
    slug: `group-${p.slug}`,
    productId: p.id,
    image: p.images?.[0] ?? "",
    unitPriceBdt: p.priceBdt,
    groupPriceBdt: Math.round(p.priceBdt * (0.78 + i * 0.02)),
    minMembers: [10, 20, 15, 25, 30, 12][i],
    joined: [14, 8, 19, 11, 22, 5][i],
    expiresAt: daysAhead(6 + i * 3),
    status: i === 5 ? "scheduled" : "live",
  }));

  /* -------------------------------- coupons ------------------------------- */
  const coupons = [
    ["FIRST500", "fixed", 500, 3000, 500],
    ["AIRFREE", "free_shipping", 0, 25000, 200],
    ["EID10", "percent", 10, 15000, 300],
    ["WHOLESALE5", "percent", 5, 100000, 100],
    ["NEWUSER300", "fixed", 300, 2000, 1000],
    ["SEA15", "percent", 15, 200000, 50],
  ].map(([code, type, value, minOrder, limit], i) => ({
    id: `cpn_${6001 + i}`,
    code: code as string,
    type: type as string,
    value: value as number,
    minOrderBdt: minOrder as number,
    usageLimit: limit as number,
    used: Math.floor((limit as number) * (0.1 + i * 0.12)),
    appliesTo: i === 0 ? "first_order" : "all",
    status: i === 5 ? "expired" : "active",
    startsAt: daysAgo(30 - i * 3),
    expiresAt: i === 5 ? daysAgo(2) : daysAhead(20 + i * 5),
  }));

  /* --------------------------- wallet transactions ------------------------ */
  const walletTransactions: (typeof import("./schema").walletTransactions.$inferInsert)[] = [];
  customers.forEach((c, ci) => {
    let balance = 0;
    const txns = 2 + (ci % 3);
    for (let t = 0; t < txns; t++) {
      const type = (["topup", "order_payment", "refund", "cashback", "topup"] as const)[(ci + t) % 5];
      const amount =
        type === "order_payment" ? -(5000 + Math.floor(random() * 40000)) : 1500 + Math.floor(random() * 25000);
      balance += amount;
      walletTransactions.push({
        id: `wtx_${c.id}_${t + 1}`,
        customerId: c.id,
        customerName: c.name,
        type,
        amountBdt: amount,
        balanceAfterBdt: balance,
        method: (["bkash", "nagad", "bank_transfer", "card", null] as const)[(ci + t) % 5] ?? null,
        reference: `WTX${71204500 + ci * 137 + t * 11}`,
        note: type === "cashback" ? "2% cashback on delivered order" : "",
        at: daysAgo(3 + t * 5 + ci),
      });
    }
  });

  /* -------------------------------- reviews ------------------------------- */
  const reviewTexts = [
    ["Exactly as described", "QC photos matched the 1688 listing. Landed cost was within ৳200 of the quote — will order again."],
    ["Great for resellers", "Bought 30 pcs for my Facebook page. Packaging was intact and the air batch arrived in 8 days."],
    ["Worth the wait", "Sea freight took 29 days but the per-unit cost was unbeatable. Duty breakdown was transparent."],
    ["Solid quality", "Supplier sent a slightly different colour for 2 pcs, ChinaBridge replaced them free of cost."],
    ["Fast response on WhatsApp", "The team answered my supplier questions in Bangla within minutes and shared video QC."],
    ["My go-to importer", "Third order this year. Container cleared customs without any extra hidden charge."],
  ] as const;

  const reviews: (typeof import("./schema").reviews.$inferInsert)[] = [];
  products.slice(0, 34).forEach((p, i) => {
    const count = 1 + (i % 2);
    for (let k = 0; k < count; k++) {
      const [title, body] = reviewTexts[(i + k) % reviewTexts.length];
      const customer = customers[(i + k * 3) % customers.length];
      reviews.push({
        id: `rev_${p.id}_${k + 1}`,
        productId: p.id,
        productTitle: p.title,
        customerId: customer.id,
        customerName: customer.name,
        rating: [5, 5, 5, 4, 4, 5, 3][(i + k) % 7],
        title,
        body,
        images: k === 0 ? [ph({ seed: `${p.slug}-rev`, label: "QC photo", icon: "📷" })] : [],
        status: i % 11 === 0 ? "pending" : i % 17 === 0 ? "rejected" : "published",
        helpful: Math.floor(random() * 40),
        createdAt: daysAgo(2 + i + k * 3),
      });
    }
  });

  /* -------------------------------- tickets ------------------------------- */
  const ticketSeeds = [
    ["Where is my consignment CB-SEA-1180?", "shipping", "high", "open", "Please share the vessel ETA. I need stock before Eid."],
    ["Advance payment not showing", "payment", "urgent", "pending", "I sent ৳12,000 by bKash at 4:12pm but the order still shows unpaid."],
    ["Wrong colour delivered", "product", "normal", "resolved", "Received navy instead of black hoodie lot. Can you exchange?"],
    ["Customs duty higher than quoted", "refund", "high", "open", "Duty was ৳4,300 but your estimate showed ৳3,600. Need clarification."],
    ["Can I add items to an open order?", "other", "low", "open", "Order is still in China warehouse, can I add 5 more pcs?"],
    ["Storage fee question", "shipping", "normal", "resolved", "Goods are 20 days at your Dhaka hub, will I be charged storage?"],
    ["Create a wholesale account", "other", "normal", "pending", "We are a Chattogram importer, need B2B pricing tier."],
    ["Refund to wallet not received", "refund", "high", "open", "Order CB-25035 was cancelled 3 days ago."],
  ] as const;

  const tickets: (typeof import("./schema").tickets.$inferInsert)[] = ticketSeeds.map(
    ([subject, category, priority, status], i) => {
    const customer = customers[i % customers.length];
    return {
      id: `tkt_${7001 + i}`,
      ref: `TKT-${3100 + i}`,
      customerId: customer.id,
      customerName: customer.name,
      orderNo: i % 2 === 0 ? orders[(i * 3) % orders.length].orderNo : null,
      subject,
      category,
      priority,
      status: status as "open" | "pending" | "resolved" | "closed",
      assignedTo: i % 3 === 0 ? null : ["Nabila Yeasmin", "Sohana Akter"][i % 2],
      createdAt: daysAgo(i + 1),
    };
    },
  );

  const ticketMessages: (typeof import("./schema").ticketMessages.$inferInsert)[] = tickets.flatMap((t, i) => {
    const first = ticketSeeds[i][4];
    const msgs: (typeof import("./schema").ticketMessages.$inferInsert)[] = [
      {
        id: `${t.id}_m1`,
        ticketId: t.id,
        author: t.customerName ?? "Customer",
        role: "customer",
        body: first,
        at: daysAgo(i + 1),
      },
    ];
    if (t.status !== "open") {
      msgs.push({
        id: `${t.id}_m2`,
        ticketId: t.id,
        author: t.assignedTo ?? "Support desk",
        role: "agent",
        body:
          t.category === "shipping"
            ? "Thanks for reaching out! I have pulled the consignment status and shared the latest milestone on your order timeline."
            : "We are checking this with the finance team and will update you within 4 working hours.",
        at: daysAgo(Math.max(0.3, i + 1 - 0.4)),
      });
    }
    if (t.status === "resolved") {
      msgs.push({
        id: `${t.id}_m3`,
        ticketId: t.id,
        author: t.assignedTo ?? "Support desk",
        role: "agent",
        body: "This has been resolved and closed. Reply any time to reopen the ticket.",
        at: daysAgo(Math.max(0.2, i + 1 - 0.8)),
      });
    }
    return msgs;
  });

  /* --------------------------------- CMS ---------------------------------- */
  const banners = [
    {
      id: "bnr_1",
      title: "Import anything from 1688 & Taobao — we handle the rest",
      subtitle: "Sourcing · QC · Air & sea freight · Customs clearance · Door delivery across Bangladesh",
      image: ph({ seed: "hero-1", label: "Import from China", icon: "🚢" }),
      ctaLabel: "Browse the store",
      ctaHref: "/shop",
      placement: "hero" as const,
      status: "active",
      sortOrder: 1,
    },
    {
      id: "bnr_2",
      title: "Air express in 5-7 days",
      subtitle: "From ৳2,050/kg door to door — ideal for gadgets, beauty and fast-moving stock",
      image: ph({ seed: "hero-2", label: "Air Express", icon: "✈️" }),
      ctaLabel: "Get a quote",
      ctaHref: "/quote",
      placement: "hero" as const,
      status: "active",
      sortOrder: 2,
    },
    {
      id: "bnr_3",
      title: "Sea cargo from ৳41,000 per CBM",
      subtitle: "For bulky wholesale lots — full container consolidation every week from Shenzhen",
      image: ph({ seed: "hero-3", label: "Sea Cargo", icon: "🚚" }),
      ctaLabel: "Calculate cost",
      ctaHref: "/shipping-calculator",
      placement: "hero" as const,
      status: "active",
      sortOrder: 3,
    },
    {
      id: "bnr_4",
      title: "Group deals: save up to 22%",
      subtitle: "Join forces with other importers and unlock wholesale pricing",
      image: ph({ seed: "mid-1", label: "Group Deals", icon: "🤝" }),
      ctaLabel: "See live deals",
      ctaHref: "/group-buy",
      placement: "home_mid" as const,
      status: "active",
      sortOrder: 1,
    },
    {
      id: "bnr_5",
      title: "Paste a 1688 link, get a landed-cost quote",
      subtitle: "Our procurement desk replies with duty, freight and delivery included",
      image: ph({ seed: "mid-2", label: "Link order", icon: "🔗" }),
      ctaLabel: "Submit a link",
      ctaHref: "/quote",
      placement: "checkout" as const,
      status: "active",
      sortOrder: 1,
    },
  ];

  const posts = [
    ["how-to-import-from-1688-bangladesh", "How to import from 1688 to Bangladesh: the complete 2026 guide", "Sourcing guide", ["1688", "Import", "Bangladesh", "Customs"]],
    ["air-vs-sea-freight-bangladesh", "Air vs sea freight from China to Bangladesh: which one should you pick?", "Logistics", ["Freight", "Air cargo", "Sea cargo", "Cost"]],
    ["customs-duty-vat-explained-bd", "Bangladesh customs duty, VAT and AIT explained for importers", "Compliance", ["Duty", "VAT", "AIT", "HS code"]],
    ["moq-negotiation-playbook", "MOQ negotiation playbook: how Bangladeshi resellers get factory pricing", "Sourcing guide", ["MOQ", "Negotiation", "Wholesale"]],
    ["qc-checklist-before-shipping", "The 12-point QC checklist we run before anything leaves China", "Quality", ["QC", "Inspection", "Risk"]],
    ["ecommerce-packaging-import", "Importing custom packaging for your e-commerce brand", "Business", ["Packaging", "E-commerce", "Branding"]],
  ].map(([slug, title, category, tags], i) => ({
    id: `pst_${8001 + i}`,
    title: title as string,
    slug: slug as string,
    excerpt: `Everything Bangladeshi importers ask us about — with real landed-cost numbers, documents and timelines from our ${[ "1688 sourcing desk", "freight team", "customs brokerage", "procurement unit", "QC warehouse", "packaging suppliers" ][i]}.`,
    body: [
      `## Why this matters for Bangladeshi importers`,
      `Most buyers in Dhaka, Chattogram and Sylhet lose money at three points: paying the wrong supplier, underestimating landed cost, and getting stuck at customs. This guide walks through each one with numbers from our own consignments.`,
      ``,
      `### 1. Verify the supplier before you pay`,
      `Check the 1688/Taobao shop's 30-day repurchase rate, factory license (营业执照) and response time. We keep a vetted supplier list per category — you can shop it directly from our store.`,
      ``,
      `### 2. Model the landed cost, not the product price`,
      `Landed cost = goods + service fee + international freight + customs duty + VAT + AIT + delivery. A ¥42 charger is never just ৳730 — it is roughly ৳1,020 landed on air express for a single unit, and much less per unit once you ship 50 pcs together.`,
      ``,
      `### 3. Consolidate before you ship`,
      `Consolidating 6-8 small orders into one air batch or one CBM cuts freight per unit by 30-45%, because the minimum charge is shared.`,
      ``,
      `### 4. Budget for duty by HS code`,
      `Electronics and mobile accessories carry 15-25% customs duty, then 15% VAT on the assessable value plus duty, plus 3% AIT. Machinery and solar carry 5% or less. Use our duty calculator before you commit.`,
    ].join("\n"),
    cover: ph({ seed: `blog-${slug}`, label: (title as string).split(" ").slice(0, 3).join(" "), icon: "📰" }),
    author: ["Rifat Karim", "Sohana Akter", "ChinaBridge Team", "Nabila Yeasmin"][i % 4],
    category: category as string,
    tags: (tags as string[]).map((t) => t.toLowerCase()),
    status: "published",
    readMinutes: 6 + i,
    views: 820 + i * 431,
    publishedAt: daysAgo(4 + i * 9),
  }));

  const warehouses = [
    ["Guangzhou DC-1", "GZ-01", "China", "Guangzhou", "Baiyun District, Shijing Industrial Zone, Building 7", "china_consolidation", 900, 612, 18],
    ["Yiwu DC-2", "YW-02", "China", "Yiwu", "Futian Market District, Logistics Park B, Unit 12", "china_consolidation", 600, 268, 11],
    ["Dhaka Hub (Tejgaon)", "DAC-01", "Bangladesh", "Dhaka", "Tejgaon I/A, Road 5, Warehouse 14", "bd_hub", 420, 233, 14],
    ["Chattogram Port Bond", "CTG-01", "Bangladesh", "Chattogram", "Port Bond Area, Block C, Shed 6", "bd_customs_bond", 800, 514, 9],
    ["Sylhet Pickup Point", "SYL-P1", "Bangladesh", "Sylhet", "Zindabazar, Amberkhana Road 3", "pickup_point", 60, 18, 3],
  ].map(([name, code, country, city, address, type, capacity, used, staffNo], i) => ({
    id: `wh_${code}`,
    name: name as string,
    code: code as string,
    country: country as string,
    city: city as string,
    address: address as string,
    type: type as "china_consolidation" | "bd_hub" | "bd_customs_bond" | "pickup_point",
    capacityCbm: capacity as number,
    usedCbm: used as number,
    staff: staffNo as number,
    status: "active",
    contact: ["Li Wei", "Chen Hao", "Jamal Uddin", "Faruk Mia", "Rasel Ahmed"][i],
  }));

  const staffSeeds = [
    ["Md. Imran Kabir", "admin@chinabridge.com.bd", "super_admin", "Management", "+8801711000111"],
    ["Sohana Akter", "ops@chinabridge.com.bd", "ops_manager", "Operations", "+8801811000222"],
    ["Rifat Karim", "procurement@chinabridge.com.bd", "procurement", "Procurement", "+8801911000333"],
    ["Nabila Yeasmin", "support@chinabridge.com.bd", "support", "Customer care", "+8801611000444"],
    ["Farhan Reza", "finance@chinabridge.com.bd", "finance", "Finance", "+8801511000555"],
    ["Tahmina Rahman", "content@chinabridge.com.bd", "content", "Marketing", "+8801711000666"],
    ["Li Wei", "liwei@chinabridge.cn", "ops_manager", "China warehouse", "+8613800112233"],
  ] as const;

  const staff = staffSeeds.map(([name, email, role, department, phone], i) => ({
    id: `stf_${9001 + i}`,
    name,
    email,
    phone,
    role,
    department,
    permissions: ["dashboard"],
    status: "active" as const,
    lastActiveAt: daysAgo(i * 0.2, i),
    createdAt: daysAgo(360 - i * 10),
  }));

  const authUsers = [
    {
      id: "usr_admin",
      name: "Md. Imran Kabir",
      email: "admin@chinabridge.com.bd",
      phone: "+8801711000111",
      role: "super_admin",
      customerId: null as string | null,
      password: "Admin@1234",
      createdAt: daysAgo(360),
    },
    {
      id: "usr_ops",
      name: "Sohana Akter",
      email: "ops@chinabridge.com.bd",
      phone: "+8801811000222",
      role: "ops_manager",
      customerId: null,
      password: "Ops@12345",
      createdAt: daysAgo(300),
    },
    {
      id: "usr_support",
      name: "Nabila Yeasmin",
      email: "support@chinabridge.com.bd",
      phone: "+8801611000444",
      role: "support",
      customerId: null,
      password: "Support@123",
      createdAt: daysAgo(220),
    },
    {
      id: "usr_procurement",
      name: "Rifat Karim",
      email: "procurement@chinabridge.com.bd",
      phone: "+8801911000333",
      role: "procurement",
      customerId: null,
      password: "Buy@12345",
      createdAt: daysAgo(200),
    },
    {
      id: "usr_customer_1",
      name: "Rakib Hasan",
      email: "rakib@example.com",
      phone: "01711234567",
      role: "customer",
      customerId: "cus_1001",
      password: "Customer@123",
      createdAt: daysAgo(420),
    },
    {
      id: "usr_customer_2",
      name: "Tanvir Ahmed",
      email: "tanvir@example.com",
      phone: "01913456789",
      role: "customer",
      customerId: "cus_1003",
      password: "Customer@123",
      createdAt: daysAgo(400),
    },
  ];

  const auditActions = [
    ["order.status.update", "orders", "ord_2600"],
    ["order.create", "orders", "ord_2611"],
    ["shipment.create", "shipments", "shp_cb_air_2418"],
    ["product.update", "products", "prd_anc_earbuds"],
    ["settings.update", "settings", "default"],
    ["customer.wallet.credit", "customers", "cus_1003"],
    ["quote.status.update", "quotes", "qte_4004"],
    ["staff.login", "auth", "usr_admin"],
    ["purchase_order.approve", "purchase_orders", "po_3001"],
    ["coupon.create", "coupons", "cpn_6003"],
    ["ticket.reply", "tickets", "tkt_7002"],
    ["product.delete", "products", "prd_phone_case_lot"],
  ] as const;

  const auditLogs = Array.from({ length: 28 }).map((_, i) => {
    const [action, entity, entityId] = auditActions[i % auditActions.length];
    const member = staff[i % staff.length];
    return {
      id: `aud_${i + 1}`,
      actor: member.name,
      actorRole: member.role,
      action,
      entity,
      entityId,
      ip: `103.${108 + (i % 40)}.${12 + i}.${20 + i}`,
      meta: action === "settings.update" ? "cnyToBdt: 17.25 → 17.40" : "",
      at: daysAgo(i * 0.35, (i * 7) % 24),
    };
  });

  return {
    settings,
    customers,
    addresses,
    orders,
    orderItems,
    orderEvents,
    orderPayments,
    shipments,
    purchaseOrders,
    purchaseOrderItems,
    quotes,
    groupBuys,
    coupons,
    walletTransactions,
    reviews,
    tickets,
    ticketMessages,
    banners,
    posts,
    warehouses,
    staff,
    authUsers,
    auditLogs,
  };
}

export { SEED_ANCHOR };
