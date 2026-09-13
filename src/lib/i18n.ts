/** Minimal bilingual dictionary (English + Bangla) for the storefront chrome. */

export type Locale = "en" | "bn";

export const DICTIONARY = {
  "nav.shop": { en: "Shop", bn: "শপ" },
  "nav.categories": { en: "Categories", bn: "ক্যাটাগরি" },
  "nav.howItWorks": { en: "How it works", bn: "কিভাবে কাজ করে" },
  "nav.shipping": { en: "Shipping & duty", bn: "শিপিং ও ডিউটি" },
  "nav.groupBuy": { en: "Group deals", bn: "গ্রুপ ডিল" },
  "nav.track": { en: "Track order", bn: "অর্ডার ট্র্যাক" },
  "nav.quote": { en: "Request quote", bn: "কোটেশন" },
  "nav.blog": { en: "Guides", bn: "গাইড" },
  "nav.contact": { en: "Contact", bn: "যোগাযোগ" },
  "nav.account": { en: "My account", bn: "আমার অ্যাকাউন্ট" },
  "nav.cart": { en: "Cart", bn: "কার্ট" },
  "nav.login": { en: "Sign in", bn: "লগইন" },
  "nav.register": { en: "Create account", bn: "রেজিস্ট্রেশন" },
  "cta.shopNow": { en: "Browse products", bn: "পণ্য দেখুন" },
  "cta.getQuote": { en: "Get a landed-cost quote", bn: "ল্যান্ডেড কস্ট কোটেশন" },
  "cta.track": { en: "Track your order", bn: "অর্ডার ট্র্যাক করুন" },
  "hero.eyebrow": { en: "One-stop global sourcing in Bangladesh", bn: "বাংলাদেশে ওয়ান-স্টপ গ্লোবাল সোর্সিং" },
  "hero.title": { en: "Import anything from China — we buy, ship, clear and deliver", bn: "চায়না থেকে যেকোনো পণ্য আনুন — কেনা, শিপিং, ক্লিয়ারেন্স ও ডেলিভারি আমাদের দায়িত্ব" },
  "hero.subtitle": {
    en: "Browse verified 1688 & Taobao products with the full landed cost shown upfront: sourcing fee, freight, customs duty, VAT and delivery.",
    bn: "যাচাইকৃত ১৬৮৮ ও টাওবাও পণ্য দেখুন, সাথে সম্পূর্ণ ল্যান্ডেড কস্ট: সার্ভিস ফি, ফ্রেইট, কাস্টমস ডিউটি, ভ্যাট ও ডেলিভারি।",
  },
  "search.placeholder": { en: "Search products, brands or paste a 1688 link…", bn: "পণ্য, ব্র্যান্ড খুঁজুন বা ১৬৮৮ লিংক দিন…" },
  "product.addToCart": { en: "Add to cart", bn: "কার্টে যোগ করুন" },
  "product.moq": { en: "MOQ", bn: "সর্বনিম্ন অর্ডার" },
  "product.landed": { en: "Est. landed cost", bn: "সম্ভাব্য ল্যান্ডেড কস্ট" },
  "product.inStock": { en: "In stock", bn: "স্টকে আছে" },
  "product.outOfStock": { en: "Out of stock", bn: "স্টকে নেই" },
  "section.featured": { en: "Featured imports", bn: "ফিচার্ড পণ্য" },
  "section.categories": { en: "Shop by category", bn: "ক্যাটাগরি অনুযায়ী" },
  "section.why": { en: "Why importers choose us", bn: "কেন আমাদের বেছে নেবেন" },
  "section.how": { en: "How sourcing works", bn: "সোর্সিং প্রক্রিয়া" },
  "footer.rights": { en: "All rights reserved.", bn: "সর্বস্বত্ব সংরক্ষিত।" },
} as const;

export type TranslationKey = keyof typeof DICTIONARY;

export function translate(key: TranslationKey, locale: Locale) {
  return DICTIONARY[key]?.[locale] ?? DICTIONARY[key]?.en ?? key;
}
