/** Helpers for the built-in SVG placeholder service and misc UI helpers. */

export const TONE_BY_INDEX = [
  "indigo",
  "teal",
  "amber",
  "rose",
  "sky",
  "violet",
  "emerald",
  "orange",
  "cyan",
  "slate",
] as const;

export type Tone = (typeof TONE_BY_INDEX)[number];

/** Build a placeholder image URL served by /ph (see src/app/ph/route.ts). */
export function ph(opts: { seed: string; label?: string; icon?: string; tone?: Tone; angle?: number }) {
  const params = new URLSearchParams({ seed: opts.seed });
  if (opts.label) params.set("label", opts.label);
  if (opts.icon) params.set("icon", opts.icon);
  params.set("tone", opts.tone ?? TONE_BY_INDEX[hash(opts.seed) % TONE_BY_INDEX.length]);
  return `/ph?${params.toString()}`;
}

export function toneFor(seed: string): Tone {
  return TONE_BY_INDEX[hash(seed) % TONE_BY_INDEX.length];
}

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** Group array items by a key. */
export function groupBy<T, K extends string>(items: T[], key: (item: T) => K) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    acc[k] = acc[k] ? [...acc[k], item] : [item];
    return acc;
  }, {});
}

export function sum<T>(items: T[], pick: (item: T) => number) {
  return items.reduce((acc, item) => acc + (pick(item) || 0), 0);
}

export function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

export function chunk<T>(items: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
