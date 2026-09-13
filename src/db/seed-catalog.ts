/**
 * Catalog seed data. Kept dependency-free so it can run in the app bootstrap
 * and from the `db:seed` CLI script.
 */
import type { products as productsTable } from "./schema";
import { ph } from "@/lib/utils";

/** Concrete row shape produced by buildCatalog (all hot fields are required). */
export type SeedProductRow = typeof productsTable.$inferInsert & {
  id: string;
  slug: string;
  sku: string;
  title: string;
  categoryId: string;
  supplierId: string;
  images: string[];
  tags: string[];
  costPriceCny: number;
  priceBdt: number;
  weightGrams: number;
  cbm: number;
  moq: number;
  stock: number;
  rating: number;
  soldCount: number;
  featured: boolean;
};

export const SEED_ANCHOR = new Date("2026-09-13T09:00:00.000Z");

export function daysAgo(days: number, hours = 0) {
  return new Date(SEED_ANCHOR.getTime() - days * 86400000 - hours * 3600000);
}

export function daysAhead(days: number, hours = 0) {
  return new Date(SEED_ANCHOR.getTime() + days * 86400000 + hours * 3600000);
}

/** Deterministic RNG so every rebuild produces identical demo data. */
export function rng(seed = 20260913) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export interface CategorySeed {
  slug: string;
  name: string;
  nameBn: string;
  icon: string;
  description: string;
  dutyPct: number;
  serviceFeePct: number;
  featured: boolean;
}

export const CATEGORY_SEED: CategorySeed[] = [
  {
    slug: "mobile-accessories",
    name: "Mobile & Accessories",
    nameBn: "মোবাইল ও এক্সেসরিজ",
    icon: "📱",
    description: "Power banks, chargers, cases, cables and screen protection — the highest volume import line.",
    dutyPct: 25,
    serviceFeePct: 10,
    featured: true,
  },
  {
    slug: "electronics",
    name: "Electronics & Computers",
    nameBn: "ইলেকট্রনিক্স ও কম্পিউটার",
    icon: "💻",
    description: "Projectors, mini PCs, routers, printers and computer peripherals from Shenzhen.",
    dutyPct: 15,
    serviceFeePct: 10,
    featured: true,
  },
  {
    slug: "audio-wearables",
    name: "Audio & Wearables",
    nameBn: "অডিও ও ওয়্যারেবল",
    icon: "🎧",
    description: "TWS earbuds, ANC headphones, smartwatches and Bluetooth speakers.",
    dutyPct: 25,
    serviceFeePct: 10,
    featured: true,
  },
  {
    slug: "home-kitchen",
    name: "Home & Kitchen",
    nameBn: "হোম ও কিচেন",
    icon: "🏠",
    description: "Air fryers, cookware, vacuum cleaners and small home appliances.",
    dutyPct: 25,
    serviceFeePct: 8,
    featured: true,
  },
  {
    slug: "fashion-apparel",
    name: "Fashion & Apparel",
    nameBn: "ফ্যাশন ও পোশাক",
    icon: "👕",
    description: "Wholesale lots of polos, kurtis, hoodies and denim straight from Guangzhou malls.",
    dutyPct: 25,
    serviceFeePct: 10,
    featured: true,
  },
  {
    slug: "shoes-bags",
    name: "Shoes, Bags & Luggage",
    nameBn: "জুতা, ব্যাগ ও লাগেজ",
    icon: "👟",
    description: "Sneakers, ladies shoes, backpacks, wallets and trolley luggage.",
    dutyPct: 25,
    serviceFeePct: 10,
    featured: true,
  },
  {
    slug: "beauty-care",
    name: "Beauty & Personal Care",
    nameBn: "বিউটি ও পার্সোনাল কেয়ার",
    icon: "💄",
    description: "Skincare, LED therapy devices, hair stylers and salon equipment.",
    dutyPct: 25,
    serviceFeePct: 10,
    featured: false,
  },
  {
    slug: "watches-jewelry",
    name: "Watches & Jewelry",
    nameBn: "ঘড়ি ও গহনা",
    icon: "⌚",
    description: "Skeleton automatics, smartwatch clones and silver-plated jewelry sets.",
    dutyPct: 25,
    serviceFeePct: 12,
    featured: false,
  },
  {
    slug: "toys-baby",
    name: "Toys & Baby Care",
    nameBn: "খেলনা ও শিশু পণ্য",
    icon: "🧸",
    description: "RC toys, STEM blocks, strollers and baby essentials.",
    dutyPct: 25,
    serviceFeePct: 8,
    featured: false,
  },
  {
    slug: "tools-machinery",
    name: "Tools & Machinery",
    nameBn: "টুলস ও মেশিনারি",
    icon: "🔧",
    description: "Power tools and light industrial machines for workshops and factories.",
    dutyPct: 5,
    serviceFeePct: 8,
    featured: true,
  },
  {
    slug: "auto-parts",
    name: "Auto Parts & Bikes",
    nameBn: "অটো পার্টস ও বাইক",
    icon: "🏍️",
    description: "LED headlights, helmets, car stereos and motorcycle spares.",
    dutyPct: 15,
    serviceFeePct: 8,
    featured: false,
  },
  {
    slug: "sports-outdoor",
    name: "Sports & Outdoor",
    nameBn: "স্পোর্টস ও আউটডোর",
    icon: "🏀",
    description: "Treadmills, tents, yoga gear and fitness equipment.",
    dutyPct: 25,
    serviceFeePct: 8,
    featured: false,
  },
  {
    slug: "office-stationery",
    name: "Office & Stationery",
    nameBn: "অফিস ও স্টেশনারি",
    icon: "✏️",
    description: "Label printers, laminators, bulk stationery and office supplies.",
    dutyPct: 15,
    serviceFeePct: 8,
    featured: false,
  },
  {
    slug: "solar-power",
    name: "Solar & Power Backup",
    nameBn: "সোলার ও পাওয়ার",
    icon: "☀️",
    description: "Panels, hybrid inverters and LiFePO4 batteries for load-shedding backup.",
    dutyPct: 5,
    serviceFeePct: 8,
    featured: true,
  },
  {
    slug: "packaging-printing",
    name: "Packaging & Printing",
    nameBn: "প্যাকেজিং ও প্রিন্টিং",
    icon: "📦",
    description: "Mailer boxes, bubble mailers and brand packaging for online sellers.",
    dutyPct: 15,
    serviceFeePct: 8,
    featured: false,
  },
  {
    slug: "building-hardware",
    name: "Building & Hardware",
    nameBn: "বিল্ডিং ও হার্ডওয়্যার",
    icon: "🚿",
    description: "LED panel lights, faucets, smart locks and construction fittings.",
    dutyPct: 25,
    serviceFeePct: 8,
    featured: false,
  },
];

export const SUPPLIER_SEED = [
  { id: "sup_shenzhen_tech", name: "Shenzhen Yuxin Technology", nameCn: "深圳市宇信科技", platform: "1688", city: "Shenzhen", categories: ["mobile-accessories", "audio-wearables"], rating: 4.8, onTimeRate: 97.4, totalOrders: 412, totalSpendCny: 1284000 },
  { id: "sup_gz_electronics", name: "Guangzhou Kaida Electronics", nameCn: "广州凯达电子", platform: "1688", city: "Guangzhou", categories: ["electronics", "audio-wearables"], rating: 4.6, onTimeRate: 94.1, totalOrders: 366, totalSpendCny: 2145000 },
  { id: "sup_yiwu_apparel", name: "Yiwu Hongyuan Garment", nameCn: "义乌宏源服饰", platform: "Taobao", city: "Yiwu", categories: ["fashion-apparel", "shoes-bags"], rating: 4.7, onTimeRate: 95.8, totalOrders: 288, totalSpendCny: 1620000 },
  { id: "sup_foshan_home", name: "Foshan Homeplus Appliance", nameCn: "佛山家佳电器", platform: "1688", city: "Foshan", categories: ["home-kitchen", "building-hardware"], rating: 4.5, onTimeRate: 92.6, totalOrders: 194, totalSpendCny: 2760000 },
  { id: "sup_dongguan_tools", name: "Dongguan Zhongwei Machinery", nameCn: "东莞中威机械", platform: "Alibaba", city: "Dongguan", categories: ["tools-machinery", "solar-power"], rating: 4.9, onTimeRate: 98.2, totalOrders: 121, totalSpendCny: 4310000 },
  { id: "sup_ningbo_auto", name: "Ningbo Auto Star Parts", nameCn: "宁波汽车星配件", platform: "1688", city: "Ningbo", categories: ["auto-parts"], rating: 4.4, onTimeRate: 90.7, totalOrders: 158, totalSpendCny: 890000 },
  { id: "sup_qingdao_beauty", name: "Qingdao Meili Beauty Supply", nameCn: "青岛美丽美妆", platform: "Taobao", city: "Qingdao", categories: ["beauty-care", "watches-jewelry"], rating: 4.6, onTimeRate: 93.3, totalOrders: 205, totalSpendCny: 1450000 },
  { id: "sup_shantou_pack", name: "Shantou Jinyuan Packaging", nameCn: "汕头金源包装", platform: "Direct factory", city: "Shantou", categories: ["packaging-printing", "office-stationery"], rating: 4.7, onTimeRate: 96.5, totalOrders: 176, totalSpendCny: 1180000 },
];

type ProductTuple = [
  slug: string,
  title: string,
  catSlug: string,
  brand: string,
  costCny: number,
  priceBdt: number,
  weightG: number,
  cbm: number,
  icon: string,
  tags: string,
  featured: 0 | 1,
  moq: number,
];

/** slug, title, category, brand, cost ¥, price ৳, weight g, cbm, icon, tags, featured, moq */
export const PRODUCT_SEED: ProductTuple[] = [
  ["magnetic-wireless-powerbank", "Anker MagGo 10000mAh Magnetic Wireless Power Bank", "mobile-accessories", "Anker", 118, 2450, 320, 0.0006, "🔋", "hot,wireless,fast-charge", 1, 1],
  ["65w-gan-charger", "Baseus 65W GaN 3-Port Fast Charger", "mobile-accessories", "Baseus", 42, 990, 180, 0.0003, "🔌", "gan,usb-c,travel", 1, 2],
  ["tempered-glass-pack", "9H Tempered Glass Screen Protector (Bundle of 10)", "mobile-accessories", "Generic", 18, 520, 220, 0.0004, "📱", "reseller,bulk,wholesale", 0, 10],
  ["phone-case-lot", "Shockproof Silicone Phone Case Bundle (20 pcs)", "mobile-accessories", "Generic", 96, 2350, 900, 0.002, "🛡️", "reseller,bulk", 0, 5],
  ["braided-usb-c-cable", "UGREEN 100W USB-C Braided Cable 2m", "mobile-accessories", "UGREEN", 24, 640, 120, 0.0002, "🔗", "usb-c,cable,durable", 0, 3],
  ["mini-projector", "Magcubic HY320 4K Portable Projector", "electronics", "Magcubic", 385, 8900, 1200, 0.0035, "📽️", "hot,projector,android", 1, 1],
  ["mini-pc", "Beelink Mini S12 Pro Intel N100 Mini PC", "electronics", "Beelink", 1180, 24500, 900, 0.0022, "💻", "mini-pc,business", 1, 1],
  ["dashcam", "1080P Dual-Lens Car Dash Camera with Night Vision", "electronics", "Generic", 210, 4900, 400, 0.0012, "🎥", "car,camera", 0, 2],
  ["wifi-router", "Xiaomi AX3000 WiFi 6 Dual Band Router", "electronics", "Xiaomi", 320, 6900, 700, 0.003, "📶", "wifi6,xiaomi,networking", 1, 1],
  ["thermal-printer", "80mm Bluetooth Thermal Receipt Printer", "electronics", "Generic", 245, 5600, 1400, 0.004, "🧾", "pos,restaurant,printer", 0, 2],
  ["anc-earbuds", "Soundcore Life P3 Active Noise Cancelling Earbuds", "audio-wearables", "Soundcore", 195, 4300, 180, 0.0006, "🎧", "hot,anc,tws", 1, 1],
  ["tws-earbuds-budget", "TWS Bluetooth 5.3 Earbuds with LED Battery Display", "audio-wearables", "Generic", 62, 1490, 120, 0.0004, "🎵", "budget,tws,reseller", 1, 10],
  ["smartwatch-amoled", "Amazfit GTS 4 Mini AMOLED Smartwatch", "audio-wearables", "Amazfit", 470, 9900, 220, 0.0008, "⌚", "hot,amoled,health", 1, 1],
  ["bluetooth-speaker", "JBL Go 4 Portable Waterproof Bluetooth Speaker", "audio-wearables", "JBL", 210, 4750, 400, 0.001, "🔊", "speaker,jbl,party", 0, 2],
  ["bone-conduction", "Bone Conduction Open-Ear Sports Headphones", "audio-wearables", "Shokz", 340, 7900, 150, 0.0005, "🦻", "sports,open-ear", 0, 2],
  ["air-fryer", "Xiaomi Mijia 6L Digital Air Fryer Oven", "home-kitchen", "Xiaomi", 420, 9800, 6500, 0.045, "🍳", "hot,air-fryer,kitchen", 1, 1],
  ["rice-cooker", "3L Electric Multi-function Rice Cooker with Steamer", "home-kitchen", "Generic", 190, 4300, 3200, 0.02, "🍚", "kitchen,appliance", 0, 2],
  ["robotic-vacuum", "Xiaomi Robot Vacuum S20+ with Self-Empty Dock", "home-kitchen", "Xiaomi", 1450, 32900, 5200, 0.05, "🤖", "hot,robot-vacuum,smart-home", 1, 1],
  ["cookware-set", "Non-stick Granite Cookware Gift Set (8 pcs)", "home-kitchen", "Generic", 680, 14500, 6800, 0.055, "🍲", "cookware,wedding-gift", 0, 5],
  ["led-mirror-lamp", "LED Vanity Makeup Mirror with Dimmable Lamp", "home-kitchen", "Generic", 240, 5200, 2100, 0.02, "🪞", "vanity,led", 0, 2],
  ["mens-polo-lot", "Men's Cotton Pique Polo Shirt (Lot of 12)", "fashion-apparel", "Generic", 420, 8900, 3600, 0.018, "👕", "wholesale,apparel,cotton", 1, 12],
  ["womens-kurti-lot", "Printed Three-Piece Kurti Set (Lot of 10)", "fashion-apparel", "Generic", 890, 17500, 4200, 0.022, "🥻", "hot,wholesale,kurti", 1, 10],
  ["hoodie-blank", "Blank Fleece Hoodie Wholesale (Lot of 6)", "fashion-apparel", "Generic", 540, 11500, 3200, 0.02, "🧥", "winter,wholesale,print-ready", 0, 6],
  ["denim-jeans-lot", "Men's Stretch Slim Denim Jeans (Lot of 8)", "fashion-apparel", "Generic", 720, 15600, 4800, 0.026, "👖", "denim,wholesale", 0, 8],
  ["sneakers-lot", "Fashion Chunky Sneakers (Lot of 6)", "shoes-bags", "Generic", 620, 13500, 5400, 0.05, "👟", "hot,sneakers,wholesale", 1, 6],
  ["leather-wallet", "RFID Blocking Genuine Leather Wallet", "shoes-bags", "Generic", 38, 890, 120, 0.0003, "👛", "gift,leather,wallet", 0, 5],
  ["laptop-backpack", "Anti-theft Laptop Backpack 15.6\" with USB Port", "shoes-bags", "Generic", 96, 2250, 900, 0.008, "🎒", "backpack,office,usb", 1, 3],
  ["travel-trolley", "ABS Hardshell Trolley Luggage 24 inch", "shoes-bags", "Generic", 520, 11800, 4200, 0.09, "🧳", "luggage,travel", 0, 2],
  ["led-face-mask", "7-Color LED Photon Face Mask with Neck Piece", "beauty-care", "Generic", 620, 13900, 800, 0.002, "💆", "hot,beauty,led", 1, 1],
  ["skincare-set", "Hyaluronic Acid Skincare Gift Set (5 pcs)", "beauty-care", "Generic", 180, 3900, 1200, 0.004, "🧴", "skincare,gift,reseller", 0, 6],
  ["hair-styler", "5-in-1 Ionic Hair Dryer & Styler Brush", "beauty-care", "Generic", 260, 5900, 900, 0.004, "💇", "hair,salon,ionic", 0, 3],
  ["nail-lamp", "48W UV LED Nail Curing Lamp for Salon", "beauty-care", "Generic", 88, 1990, 600, 0.003, "💅", "salon,nail", 0, 4],
  ["smartwatch-ultra", "T900 Ultra Smartwatch Series 9 (Reseller Pack)", "watches-jewelry", "Generic", 96, 2150, 180, 0.0006, "⌚", "hot,reseller,smartwatch", 1, 10],
  ["stainless-watch", "Skeleton Automatic Mechanical Wrist Watch", "watches-jewelry", "Generic", 560, 12500, 300, 0.001, "⏱️", "mechanical,gift,premium", 0, 2],
  ["jewelry-set", "Sterling Silver Plated Zircon Jewelry Set", "watches-jewelry", "Generic", 420, 9200, 80, 0.0002, "💎", "jewelry,bridal,gift", 0, 5],
  ["rc-car", "1:16 4WD High Speed RC Drift Car 40km/h", "toys-baby", "Generic", 180, 4100, 1400, 0.006, "🚗", "hot,toys,rc", 1, 3],
  ["baby-stroller", "Foldable Cabin Size Baby Stroller with Recliner", "toys-baby", "Generic", 640, 14500, 7200, 0.12, "🍼", "baby,stroller", 0, 2],
  ["building-blocks", "STEM Educational Building Blocks (1000 pcs)", "toys-baby", "Generic", 210, 4600, 1900, 0.008, "🧱", "stem,educational,toys", 0, 4],
  ["impact-drill", "21V Brushless Cordless Impact Drill Kit", "tools-machinery", "Generic", 380, 8900, 2600, 0.012, "🔧", "hot,power-tool,drill", 1, 1],
  ["embroidery-machine", "Single Head Computerized Embroidery Machine", "tools-machinery", "Generic", 4200, 88000, 62000, 0.5, "🪡", "factory,industrial,embroidery", 1, 1],
  ["heat-press", "38x38cm Pneumatic Heat Press Machine", "tools-machinery", "Generic", 1350, 29500, 28000, 0.24, "🔥", "t-shirt-printing,heat-press", 0, 1],
  ["sewing-machine", "Jack F4 Industrial Lockstitch Sewing Machine", "tools-machinery", "Jack", 2600, 56000, 34000, 0.28, "🧵", "garments,sewing,industrial", 1, 1],
  ["led-headlight", "H4 LED Headlight Bulb 12000LM (Pair)", "auto-parts", "Generic", 62, 1490, 300, 0.001, "💡", "auto,led,headlight", 0, 5],
  ["motorcycle-helmet", "Full Face Motorcycle Helmet DOT Certified", "auto-parts", "Generic", 165, 3800, 1600, 0.02, "🏍️", "helmet,safety,bike", 0, 6],
  ["car-android-player", "7 inch Android Car Stereo with CarPlay & Android Auto", "auto-parts", "Generic", 420, 9500, 1200, 0.006, "🚙", "car-stereo,carplay,camera", 1, 1],
  ["treadmill-foldable", "Foldable Motorized Treadmill 2.5HP with Incline", "sports-outdoor", "Generic", 1980, 44000, 42000, 0.35, "🏃", "hot,fitness,home-gym", 1, 1],
  ["camping-tent", "4-Person Automatic Pop-up Camping Tent", "sports-outdoor", "Generic", 340, 7900, 3400, 0.03, "⛺", "camping,outdoor", 0, 2],
  ["yoga-mat-lot", "TPE Yoga Mat 8mm Anti-slip (Lot of 10)", "sports-outdoor", "Generic", 380, 8500, 8000, 0.09, "🧘", "yoga,wholesale,gym", 0, 10],
  ["label-printer", "Niimbot B21 Portable Thermal Label Printer", "office-stationery", "Niimbot", 210, 4800, 700, 0.003, "🏷️", "label,reseller,barcode", 1, 2],
  ["laminator", "A4 Thermal Laminator Machine for Office", "office-stationery", "Generic", 145, 3300, 2200, 0.01, "📄", "office,laminator", 0, 2],
  ["solar-panel-550", "550W Monocrystalline Solar Panel (Tier-1 Cell)", "solar-power", "Longi", 640, 15500, 28000, 0.12, "☀️", "hot,solar,energy", 1, 1],
  ["solar-inverter", "3.2kW Hybrid Solar Inverter with MPPT", "solar-power", "Generic", 1450, 34500, 12000, 0.06, "⚡", "inverter,solar,backup", 1, 1],
  ["lithium-battery", "12V 100Ah LiFePO4 Deep Cycle Battery", "solar-power", "Generic", 1250, 29500, 13000, 0.03, "🔋", "battery,lifepo4,backup", 0, 2],
  ["kraft-boxes", "Custom Printed Kraft Mailer Boxes (500 pcs)", "packaging-printing", "Generic", 620, 14500, 22000, 0.32, "📦", "packaging,ecommerce,custom-print", 1, 500],
  ["bubble-mailer", "Poly Bubble Mailers 25x35cm (1000 pcs)", "packaging-printing", "Generic", 380, 8900, 15000, 0.18, "✉️", "packaging,bubble-mailer", 0, 1000],
  ["led-panel-light", "36W Frameless LED Ceiling Panel Light (20 pcs)", "building-hardware", "Generic", 420, 9800, 14000, 0.14, "💡", "led,lighting,wholesale", 1, 20],
  ["stainless-faucet", "Brushed Stainless Steel Kitchen Faucet", "building-hardware", "Generic", 165, 3800, 1200, 0.005, "🚿", "faucet,sanitary", 0, 3],
  ["smart-door-lock", "Smart Fingerprint Door Lock with Camera", "building-hardware", "Generic", 520, 11900, 2200, 0.01, "🔐", "smart-lock,security", 1, 2],
];

const VARIANT_MAP: Record<string, { name: string; values: string[] }> = {
  "mobile-accessories": { name: "Color", values: ["Black", "White", "Blue"] },
  electronics: { name: "Variant", values: ["Global version", "UK plug", "EU plug"] },
  "audio-wearables": { name: "Color", values: ["Black", "White", "Navy"] },
  "home-kitchen": { name: "Plug", values: ["UK 3-pin", "EU 2-pin"] },
  "fashion-apparel": { name: "Size range", values: ["M-L assorted", "L-XL assorted"] },
  "shoes-bags": { name: "Size", values: ["39-42 assorted", "42-45 assorted"] },
  "beauty-care": { name: "Color", values: ["White", "Pink"] },
  "watches-jewelry": { name: "Color", values: ["Silver", "Gold", "Black"] },
  "toys-baby": { name: "Color", values: ["Assorted", "Blue", "Pink"] },
  "tools-machinery": { name: "Voltage", values: ["220V", "110V"] },
  "auto-parts": { name: "Fitment", values: ["Universal", "H4 socket"] },
  "sports-outdoor": { name: "Color", values: ["Black", "Grey"] },
  "office-stationery": { name: "Pack", values: ["Single", "Pack of 3"] },
  "solar-power": { name: "Capacity", values: ["Standard"] },
  "packaging-printing": { name: "Print", values: ["Plain", "Custom logo (+$35)"] },
  "building-hardware": { name: "Finish", values: ["Chrome", "Matte black"] },
};

export function buildCatalog() {
  const random = rng();

  const categories = CATEGORY_SEED.map((c, i) => ({
    id: `cat_${c.slug.replace(/-/g, "_")}`,
    name: c.name,
    nameBn: c.nameBn,
    slug: c.slug,
    icon: c.icon,
    image: ph({ seed: `cat-${c.slug}`, label: c.name, icon: c.icon }),
    description: c.description,
    featured: c.featured,
    serviceFeePct: c.serviceFeePct,
    dutyPct: c.dutyPct,
    parentId: null as string | null,
    sortOrder: i,
    createdAt: daysAgo(320 - i),
  }));

  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

  const suppliers = SUPPLIER_SEED.map((s) => ({
    id: s.id,
    name: s.name,
    nameCn: s.nameCn,
    platform: s.platform,
    city: s.city,
    contactPerson: ["Li Wei", "Chen Hao", "Wang Fang", "Zhang Min", "Liu Yang", "Sun Lei", "Zhao Jing", "Huang Bo"][
      SUPPLIER_SEED.indexOf(s) % 8
    ],
    phone: `+86 1${Math.floor(random() * 900000000 + 100000000)}`,
    wechat: `cb_${s.id.replace("sup_", "")}`,
    rating: s.rating,
    totalOrders: s.totalOrders,
    totalSpendCny: s.totalSpendCny,
    onTimeRate: s.onTimeRate,
    status: s.id === "sup_ningbo_auto" ? ("paused" as const) : ("active" as const),
    categories: s.categories,
    joinedAt: daysAgo(600 + Math.floor(random() * 400)),
    notes: "",
  }));

  const products: SeedProductRow[] = [];
  const variants: (typeof import("./schema").productVariants.$inferInsert)[] = [];

  PRODUCT_SEED.forEach((tuple, index) => {
    const [slug, title, catSlug, brand, costCny, priceBdt, weightG, cbmValue, icon, tags, featured, moq] = tuple;
    const category = categoryBySlug.get(catSlug);
    if (!category) return;
    const supplier = suppliers.find((s) => s.categories.includes(catSlug)) ?? suppliers[0];
    const id = `prd_${slug.replace(/-/g, "_")}`;
    const rating = Math.round((4.1 + random() * 0.85) * 10) / 10;
    const sold = 60 + Math.floor(random() * 1400);
    const stock = moq > 100 ? 200 : Math.floor(random() * 180) + 20;

    products.push({
      id,
      sku: `CB-${catSlug.slice(0, 3).toUpperCase()}-${String(1000 + index)}`,
      slug,
      title,
      titleBn: null,
      description: `${title} — sourced directly from verified ${supplier.platform} suppliers in ${supplier.city}. ChinaBridge BD handles supplier verification, quality inspection, consolidation, air/sea freight and Bangladesh customs clearance, so the price you see is close to your final landed cost. Order from ${moq} pcs (MOQ) for wholesale pricing, or a single piece for personal import.`,
      categoryId: category.id,
      supplierId: supplier.id,
      brand,
      originCountry: "China",
      sourceUrl: `https://detail.1688.com/offer/${6000000000 + index * 137}.html`,
      images: [
        ph({ seed: `${slug}-a`, label: brand, icon }),
        ph({ seed: `${slug}-b`, label: title.split(" ").slice(0, 2).join(" "), icon }),
        ph({ seed: `${slug}-c`, label: "QC inspected", icon: "🔍" }),
        ph({ seed: `${slug}-d`, label: "ChinaBridge BD", icon: "🚢" }),
      ],
      costPriceCny: costCny,
      priceBdt,
      compareAtPriceBdt: Math.round(priceBdt * (1.22 + random() * 0.2)),
      weightGrams: weightG,
      cbm: cbmValue,
      moq,
      stock,
      unit: "piece",
      rating,
      reviewCount: 8 + Math.floor(random() * 220),
      soldCount: sold,
      tags: tags.split(","),
      status: (stock === 0 ? "out_of_stock" : "active") as "active" | "out_of_stock",
      featured: featured === 1,
      leadTimeDays: cbmValue > 0.05 ? 12 : 5,
      hsCode: `${8500 + (index % 400)}.${10 + (index % 80)}.00`,
      createdAt: daysAgo(Math.floor(random() * 280)),
      updatedAt: daysAgo(Math.floor(random() * 20)),
    });

    const variantSpec = VARIANT_MAP[catSlug] ?? { name: "Option", values: ["Standard"] };
    variantSpec.values.forEach((value, vi) => {
      variants.push({
        id: `${id}_v${vi + 1}`,
        productId: id,
        name: variantSpec.name,
        value,
        priceDeltaBdt: vi === 0 ? 0 : Math.round(priceBdt * (0.03 + vi * 0.02)),
        stock: Math.max(5, Math.floor(stock / variantSpec.values.length)),
        sortOrder: vi,
      });
    });
  });

  return { categories, suppliers, products, variants };
}
