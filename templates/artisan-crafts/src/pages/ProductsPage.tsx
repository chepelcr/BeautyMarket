import { useState } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="section-textured py-12">
        <div className="container-organic">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Shop <span className="text-gradient-artisan">Handcrafted Goods</span>
          </h1>
          <p className="text-foreground/70 text-lg">
            Discover unique, handmade treasures from talented artisans
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-card border-b border-border sticky top-16 z-40 shadow-soft">
        <div className="container-organic py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for handmade items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-organic pl-10"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:border-primary transition-colors font-sans font-semibold">
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Filter</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:border-primary transition-colors font-sans font-semibold">
                <SlidersHorizontal className="w-5 h-5" />
                <span className="hidden sm:inline">Sort</span>
              </button>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-sans font-semibold text-sm transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white shadow-artisan'
                    : 'bg-muted text-foreground hover:bg-primary/10'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container-organic py-12">
        <div className="mb-6">
          <p className="text-foreground/60">
            Showing <span className="font-bold text-foreground">{filteredProducts.length}</span> products
          </p>
        </div>

        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description}
              price={product.price}
              category={product.category}
              badge={product.badge}
              rating={product.rating}
              artisan={product.artisan}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-foreground/60 text-lg">
              No products found. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const categories = [
  { id: 'all', label: 'All Items' },
  { id: 'pottery', label: 'Pottery' },
  { id: 'textiles', label: 'Textiles' },
  { id: 'jewelry', label: 'Jewelry' },
  { id: 'home & kitchen', label: 'Home & Kitchen' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'home decor', label: 'Home Decor' },
];

const products = [
  {
    id: 1,
    name: 'Handmade Ceramic Bowl',
    category: 'Pottery',
    description: 'Beautiful terracotta bowl, hand-thrown and glazed with natural earth tones.',
    price: 48,
    badge: 'sale' as const,
    rating: 5,
    artisan: 'Maria Santos',
  },
  {
    id: 2,
    name: 'Woven Macramé Wall Hanging',
    category: 'Textiles',
    description: 'Intricate boho-style wall art made from organic cotton rope.',
    price: 65,
    badge: 'new' as const,
    rating: 5,
    artisan: 'Sophie Chen',
  },
  {
    id: 3,
    name: 'Handcrafted Leather Journal',
    category: 'Fashion',
    description: 'Premium leather journal with hand-stitched binding and recycled paper.',
    price: 42,
    badge: null,
    rating: 4,
    artisan: 'James Cooper',
  },
  {
    id: 4,
    name: 'Artisan Wood Serving Board',
    category: 'Home & Kitchen',
    description: 'Live-edge walnut serving board with food-safe mineral oil finish.',
    price: 78,
    badge: 'featured' as const,
    rating: 5,
    artisan: 'Thomas Miller',
  },
  {
    id: 5,
    name: 'Hand-Painted Silk Scarf',
    category: 'Fashion',
    description: 'Luxurious silk scarf with original watercolor designs.',
    price: 55,
    badge: null,
    rating: 4,
    artisan: 'Elena Rodriguez',
  },
  {
    id: 6,
    name: 'Handwoven Basket Set',
    category: 'Home Decor',
    description: 'Set of three natural seagrass baskets, perfect for storage.',
    price: 89,
    badge: 'sale' as const,
    rating: 5,
    artisan: 'Aisha Patel',
  },
  {
    id: 7,
    name: 'Ceramic Planter Trio',
    category: 'Pottery',
    description: 'Three hand-painted planters in varying sizes, perfect for succulents.',
    price: 52,
    badge: null,
    rating: 5,
    artisan: 'Maria Santos',
  },
  {
    id: 8,
    name: 'Sterling Silver Necklace',
    category: 'Jewelry',
    description: 'Delicate handmade necklace with natural gemstone pendant.',
    price: 95,
    badge: 'new' as const,
    rating: 5,
    artisan: 'Sarah Kim',
  },
  {
    id: 9,
    name: 'Quilted Table Runner',
    category: 'Textiles',
    description: 'Hand-quilted table runner featuring traditional patchwork patterns.',
    price: 68,
    badge: null,
    rating: 4,
    artisan: 'Sophie Chen',
  },
  {
    id: 10,
    name: 'Wooden Cutting Board',
    category: 'Home & Kitchen',
    description: 'Handcrafted from reclaimed maple with juice groove.',
    price: 45,
    badge: null,
    rating: 5,
    artisan: 'Thomas Miller',
  },
  {
    id: 11,
    name: 'Hand-Knit Throw Blanket',
    category: 'Textiles',
    description: 'Cozy chunky knit blanket made from 100% organic wool.',
    price: 125,
    badge: 'featured' as const,
    rating: 5,
    artisan: 'Sophie Chen',
  },
  {
    id: 12,
    name: 'Artisan Soap Set',
    category: 'Home Decor',
    description: 'Four handmade soaps with natural ingredients and essential oils.',
    price: 28,
    badge: 'sale' as const,
    rating: 4,
    artisan: 'Emma Green',
  },
];
