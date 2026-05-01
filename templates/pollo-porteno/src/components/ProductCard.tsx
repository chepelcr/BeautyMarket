import type { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all">
      <div className="aspect-[4/3] bg-muted relative grill-stripes flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-6xl">🍗</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-base text-foreground leading-tight">{product.name}</h3>
          <span className="text-primary font-bold whitespace-nowrap">
            {formatCurrency(product.price)}
          </span>
        </div>
        {product.description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        )}
        {product.category?.name && (
          <span className="inline-block mt-3 text-[11px] uppercase tracking-wider text-secondary-foreground bg-secondary/60 px-2 py-0.5 rounded">
            {product.category.name}
          </span>
        )}
      </div>
    </article>
  );
}
