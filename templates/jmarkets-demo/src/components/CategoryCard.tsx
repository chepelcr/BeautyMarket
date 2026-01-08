import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  name: string;
  description?: string;
  productCount?: number;
  imageUrl?: string;
  href?: string;
}

export default function CategoryCard({
  name,
  description,
  productCount,
  imageUrl,
  href = "/products",
}: CategoryCardProps) {
  return (
    <Link href={href}>
      <a className="card-modern group cursor-pointer overflow-hidden">
        {/* Category Image */}
        <div className="aspect-video bg-gradient-to-br from-orange-200 to-blue-200 relative overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-blue-200 opacity-60" />
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
            <div className="p-4 w-full">
              <div className="flex items-center justify-between text-white">
                <span className="font-semibold">Browse {name}</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Category Info */}
        <div className="p-5">
          <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {name}
          </h3>

          {description && (
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {description}
            </p>
          )}

          {productCount !== undefined && (
            <p className="text-sm text-muted-foreground">
              {productCount} {productCount === 1 ? 'product' : 'products'}
            </p>
          )}

          <div className="mt-4 flex items-center text-primary font-semibold text-sm">
            <span>Shop Now</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </a>
    </Link>
  );
}
