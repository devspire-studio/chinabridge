import { NextRequest } from "next/server";

/**
 * Self-contained SVG image service.
 * Keeps the whole app offline-safe: no external image hosts required.
 * GET /ph?seed=airpods&label=AirPods%20Pro&icon=🎧&tone=indigo
 */

const TONES: Record<string, [string, string, string]> = {
  indigo: ["#1e40f5", "#4f46e5", "#c7d2fe"],
  teal: ["#0d9488", "#14b8a6", "#ccfbf1"],
  amber: ["#d97706", "#f59e0b", "#fef3c7"],
  rose: ["#e11d48", "#fb7185", "#ffe4e6"],
  sky: ["#0284c7", "#38bdf8", "#e0f2fe"],
  violet: ["#7c3aed", "#a78bfa", "#ede9fe"],
  slate: ["#334155", "#64748b", "#e2e8f0"],
  emerald: ["#047857", "#10b981", "#d1fae5"],
  orange: ["#c2410c", "#fb923c", "#ffedd5"],
  cyan: ["#0e7490", "#22d3ee", "#cffafe"],
};

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const seed = sp.get("seed") || "chinabridge";
  const label = (sp.get("label") || "").slice(0, 42);
  const icon = (sp.get("icon") || "📦").slice(0, 4);
  const toneKey = sp.get("tone") || "indigo";
  const tone = TONES[toneKey] ?? TONES.indigo;
  const w = 800;
  const h = 800;
  const h1 = hash(seed);
  const angle = 20 + (h1 % 50);
  const r1 = 24 + (h1 % 16);
  const r2 = 40 + ((h1 >> 3) % 22);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(label)}">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${tone[2]}"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${tone[0]}"/>
      <stop offset="100%" stop-color="${tone[1]}"/>
    </linearGradient>
    <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.6" fill="${tone[0]}" opacity="0.16"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#dots)"/>
  <circle cx="${w * 0.78}" cy="${h * 0.22}" r="${r2 * 3}" fill="${tone[1]}" opacity="0.14"/>
  <circle cx="${w * 0.18}" cy="${h * 0.82}" r="${r1 * 4}" fill="${tone[0]}" opacity="0.10"/>
  <g transform="translate(${w / 2} ${h / 2 - 40})">
    <circle r="132" fill="#ffffff" opacity="0.86"/>
    <circle r="132" fill="none" stroke="${tone[0]}" stroke-opacity="0.25" stroke-width="2"/>
    <text x="0" y="34" font-size="128" text-anchor="middle" font-family="Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif">${escapeXml(icon)}</text>
  </g>
  <text x="${w / 2}" y="${h - 92}" font-size="34" font-weight="700" text-anchor="middle" fill="${tone[0]}" opacity="0.92" font-family="Segoe UI,Inter,Helvetica,Arial,sans-serif">${escapeXml(label)}</text>
  <text x="${w / 2}" y="${h - 54}" font-size="20" text-anchor="middle" fill="${tone[0]}" opacity="0.6" font-family="Segoe UI,Inter,Helvetica,Arial,sans-serif">ChinaBridge BD · Global Sourcing</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
