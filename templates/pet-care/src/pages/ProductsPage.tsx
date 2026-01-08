import React from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import ProductCard, { Product } from '../components/ProductCard';
import { DogIcon, CatIcon, BirdIcon } from '../components/PetIcons';

// Mock product data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Dog Food - Chicken & Rice',
    description: 'High-quality nutrition for adult dogs. Made with real chicken and wholesome grains.',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop',
    category: 'Dog Food',
    rating: 4.5,
    reviews: 128,
    inStock: true,
    badge: 'Best Seller',
  },
  {
    id: '2',
    name: 'Interactive Cat Toy Set',
    description: 'Keep your cat entertained for hours with this exciting toy collection.',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400&h=400&fit=crop',
    category: 'Cat Toys',
    rating: 5,
    reviews: 89,
    inStock: true,
  },
  {
    id: '3',
    name: 'Orthopedic Dog Bed - Large',
    description: 'Memory foam comfort for senior dogs and large breeds. Machine washable cover.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=400&fit=crop',
    category: 'Dog Beds',
    rating: 4,
    reviews: 64,
    inStock: true,
  },
  {
    id: '4',
    name: 'Natural Cat Litter - Clumping',
    description: 'Eco-friendly, odor-controlling litter made from natural materials.',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=400&h=400&fit=crop',
    category: 'Cat Supplies',
    rating: 4.5,
    reviews: 156,
    inStock: true,
    badge: 'Eco-Friendly',
  },
  {
    id: '5',
    name: 'Retractable Dog Leash',
    description: 'Durable 16ft retractable leash with comfortable grip and one-button brake.',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400&h=400&fit=crop',
    category: 'Dog Accessories',
    rating: 4,
    reviews: 92,
    inStock: true,
  },
  {
    id: '6',
    name: 'Bird Cage Deluxe',
    description: 'Spacious cage perfect for parakeets, cockatiels, and similar-sized birds.',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=400&fit=crop',
    category: 'Bird Supplies',
    rating: 4.5,
    reviews: 43,
    inStock: false,
  },
  {
    id: '7',
    name: 'Grooming Kit for Dogs',
    description: 'Complete grooming set with brushes, nail clippers, and scissors.',
    price: 44.99,
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
    category: 'Dog Grooming',
    rating: 4.5,
    reviews: 71,
    inStock: true,
  },
  {
    id: '8',
    name: 'Automatic Pet Feeder',
    description: 'Smart feeder with timer and portion control. Works with dogs and cats.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=400&h=400&fit=crop',
    category: 'Smart Devices',
    rating: 4,
    reviews: 118,
    inStock: true,
    badge: 'New',
  },
];

const ProductsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set());

  const categories = ['All', 'Dog Food', 'Cat Toys', 'Dog Beds', 'Cat Supplies', 'Dog Accessories', 'Bird Supplies', 'Dog Grooming', 'Smart Devices'];

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product) => {
    console.log('Added to cart:', product.name);
    // In a real app, this would update cart state
  };

  const handleToggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  return (
    <div className="relative z-10">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary via-secondary to-accent py-16 mb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Shop Pet Products
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Everything your furry friend needs, from food to toys to accessories
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">
        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-border focus:border-primary focus:outline-none bg-card text-foreground transition-colors"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/10 transition-colors bg-card">
                <SlidersHorizontal className="w-5 h-5" />
                <span className="font-medium">Filters</span>
              </button>
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/10 transition-colors bg-card">
                <Filter className="w-5 h-5" />
                <span className="font-medium">Sort</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-card text-foreground border-2 border-border hover:border-primary hover:bg-primary/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Pet Type Quick Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <button className="flex items-center gap-4 p-4 rounded-2xl bg-card border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all group">
            <div className="bg-primary/10 p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <DogIcon className="text-primary" size={32} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-foreground">For Dogs</h3>
              <p className="text-sm text-muted-foreground">Food, toys, accessories</p>
            </div>
          </button>

          <button className="flex items-center gap-4 p-4 rounded-2xl bg-card border-2 border-secondary/20 hover:border-secondary hover:bg-secondary/5 transition-all group">
            <div className="bg-secondary/10 p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <CatIcon className="text-secondary" size={32} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-foreground">For Cats</h3>
              <p className="text-sm text-muted-foreground">Treats, litter, toys</p>
            </div>
          </button>

          <button className="flex items-center gap-4 p-4 rounded-2xl bg-card border-2 border-accent/20 hover:border-accent hover:bg-accent/5 transition-all group">
            <div className="bg-accent/10 p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <BirdIcon className="text-accent" size={32} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-foreground">Other Pets</h3>
              <p className="text-sm text-muted-foreground">Birds, fish, small animals</p>
            </div>
          </button>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing <span className="font-bold text-foreground">{filteredProducts.length}</span> products
          </p>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites.has(product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-4">No products found</p>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
