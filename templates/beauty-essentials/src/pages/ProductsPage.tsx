import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { Filter, SlidersHorizontal } from "lucide-react";

const allProducts = [
  {
    id: "1",
    name: "Radiant Glow Vitamin C Serum",
    category: "Skincare",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80",
    rating: 5,
    reviews: 234,
    isNew: true,
  },
  {
    id: "2",
    name: "Luxe Velvet Matte Lipstick - Rose",
    category: "Makeup",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&q=80",
    rating: 5,
    reviews: 189,
    isBestseller: true,
  },
  {
    id: "3",
    name: "Hydrating Rose Water Facial Mist",
    category: "Skincare",
    price: 18.99,
    image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=500&q=80",
    rating: 4,
    reviews: 156,
  },
  {
    id: "4",
    name: "Nourishing Night Cream with Retinol",
    category: "Skincare",
    price: 54.99,
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500&q=80",
    rating: 5,
    reviews: 298,
    isBestseller: true,
  },
  {
    id: "5",
    name: "Natural Blush Palette - Peachy Glow",
    category: "Makeup",
    price: 32.99,
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&q=80",
    rating: 4,
    reviews: 127,
  },
  {
    id: "6",
    name: "Gentle Exfoliating Face Scrub",
    category: "Skincare",
    price: 22.99,
    image: "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=500&q=80",
    rating: 5,
    reviews: 203,
  },
  {
    id: "7",
    name: "Floral Essence Eau de Parfum",
    category: "Fragrance",
    price: 68.99,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&q=80",
    rating: 5,
    reviews: 412,
    isNew: true,
    isBestseller: true,
  },
  {
    id: "8",
    name: "Long-Lasting Gel Eyeliner - Black",
    category: "Makeup",
    price: 16.99,
    image: "https://images.unsplash.com/photo-1631214524020-7e18db3a8c87?w=500&q=80",
    rating: 4,
    reviews: 98,
  },
  {
    id: "9",
    name: "Brightening Eye Cream with Caffeine",
    category: "Skincare",
    price: 38.99,
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&q=80",
    rating: 5,
    reviews: 167,
  },
  {
    id: "10",
    name: "Volumizing Mascara - Jet Black",
    category: "Makeup",
    price: 21.99,
    image: "https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=500&q=80",
    rating: 5,
    reviews: 289,
    isBestseller: true,
  },
  {
    id: "11",
    name: "Hydrating Hyaluronic Acid Moisturizer",
    category: "Skincare",
    price: 44.99,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80",
    rating: 5,
    reviews: 321,
  },
  {
    id: "12",
    name: "Natural Brow Pencil - Soft Brown",
    category: "Makeup",
    price: 14.99,
    image: "https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=500&q=80",
    rating: 4,
    reviews: 134,
    isNew: true,
  },
];

const categories = ["All", "Skincare", "Makeup", "Fragrance"];
const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  // Filter products by category
  const filteredProducts =
    selectedCategory === "All"
      ? allProducts
      : allProducts.filter((product) => product.category === selectedCategory);

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating || b.reviews - a.reviews;
      case "newest":
        return a.isNew ? -1 : 1;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Page Header */}
      <section className="bg-gradient-to-br from-pink-50 via-white to-pink-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-4">
              Our Products
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover our complete collection of premium beauty essentials,
              carefully crafted with natural ingredients
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8 pb-6 border-b border-border">
            {/* Category Filters */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                      selectedCategory === category
                        ? "bg-primary text-white shadow-beauty"
                        : "bg-white border border-border text-foreground hover:border-primary"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:border-primary transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing <span className="font-bold text-foreground">{sortedProducts.length}</span> products
              {selectedCategory !== "All" && (
                <span> in <span className="font-bold text-primary">{selectedCategory}</span></span>
              )}
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          {/* Empty State */}
          {sortedProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Filter className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
                No products found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters to find what you're looking for
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSortBy("featured");
                }}
                className="btn-beauty"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 section-cream">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Get in touch with our beauty experts for personalized product
              recommendations
            </p>
            <a href="#contact" className="btn-beauty">
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
