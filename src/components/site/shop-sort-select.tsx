"use client";

import { Select } from "@/components/ui/fields";
import { useRouter, useSearchParams } from "next/navigation";

const SORTS = [
  { value: "relevance", label: "Best match" },
  { value: "popular", label: "Most ordered" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest arrivals" },
];

export function ShopSortSelect() {
  const router = useRouter();
  const params = useSearchParams();

  const currentSort = params.get("sort") || "relevance";

  function apply(sort: string) {
    const next = new URLSearchParams(params.toString());
    if (sort === "relevance") next.delete("sort");
    else next.set("sort", sort);
    next.delete("page");
    router.push(`/shop?${next.toString()}`);
  }

  return (
    <Select value={currentSort} onChange={(e) => apply(e.target.value)} className="h-8">
      {SORTS.map((sort) => (
        <option key={sort.value} value={sort.value}>
          {sort.label}
        </option>
      ))}
    </Select>
  );
}