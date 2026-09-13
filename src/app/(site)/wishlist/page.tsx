"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { useCart } from "@/components/providers";
import { ProductCard } from "@/components/site/product-card";
import { Button } from "@/components/ui/button";
import { Breadcrumbs, EmptyState, Skeleton } from "@/components/ui/data";
import type { Product } from "@/lib/types";

export default function WishlistPage() {
  const { wishlist, hydrated } = useCart();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!hydrated) return;
    if (wishlist.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    fetch(`/api/products?ids=${wishlist.join(",")}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.items ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [wishlist, hydrated]);

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Saved for later</h1>
      <p className="mt-1 text-sm text-slate-500">
        Wishlisted products stay here across devices once you sign in. Prices update with the weekly CNY rate.
      </p>

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Heart className="size-5" />}
            title="No saved products yet"
            description="Tap the heart on any product card to keep it here for your next consignment."
            action={
              <Button variant="brand" asChild>
                <Link href="/shop">Browse products</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
