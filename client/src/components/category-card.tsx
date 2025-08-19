import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import type { Category } from "@shared/schema";
import { normalizeImageUrl } from "@/lib/image-utils";

interface CategoryCardProps {
  category: Category;
}

// Helper function to get contrasting text color
function getContrastingTextColor(backgroundColor: string): string {
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return dark or light color based on luminance
  return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const textColor = getContrastingTextColor(category.backgroundColor);
  const buttonTextColor = getContrastingTextColor(category.buttonColor);

  return (
    <Link href={`/products/${category.slug}`} className="block h-full">
      <Card 
        className="rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 cursor-pointer group h-full"
        style={{ backgroundColor: category.backgroundColor }}
      >
      <CardContent className="p-8 h-full">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h3 
                className="font-serif text-2xl font-bold mb-2"
                style={{ color: textColor }}
              >
                {category.name}
              </h3>
              {category.description && (
                <p 
                  className="leading-relaxed"
                  style={{ color: textColor, opacity: 0.8 }}
                >
                  {category.description}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-2xl">🍓</span>
            </div>
          </div>

          {/* Spacer to push images and button to bottom */}
          <div className="flex-1"></div>

          {/* Images - Centered */}
          <div className="flex justify-between items-center px-8 mb-6">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-xl overflow-hidden relative">
              {category.image1Url ? (
                <img 
                  src={normalizeImageUrl(category.image1Url) || ''} 
                  alt={`${category.name} imagen 1`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.parentElement?.querySelector('.fallback-icon');
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`fallback-icon absolute inset-0 flex items-center justify-center ${category.image1Url ? 'hidden' : ''}`}>
                <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-xl">🍓</span>
                </div>
              </div>
            </div>
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-xl overflow-hidden relative">
              {category.image2Url ? (
                <img 
                  src={normalizeImageUrl(category.image2Url) || ''} 
                  alt={`${category.name} imagen 2`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.parentElement?.querySelector('.fallback-icon');
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`fallback-icon absolute inset-0 flex items-center justify-center ${category.image2Url ? 'hidden' : ''}`}>
                <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-xl">🍓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="pt-2">
            <Button 
              className="w-full py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg"
              style={{ 
                backgroundColor: category.buttonColor,
                color: buttonTextColor
              }}
            >
              Ver Productos
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}