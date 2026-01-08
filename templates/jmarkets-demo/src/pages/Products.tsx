import { Filter, Search } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";

export default function Products() {
  const products = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Amazing Product ${i + 1}`,
    category: ['Electronics', 'Fashion', 'Home & Garden', 'Sports'][i % 4],
    price: 99.99 - (i * 5),
    originalPrice: 149.99,
    badge: (i % 3 === 0 ? 'Sale' : i % 3 === 1 ? 'New' : 'Bestseller') as 'Sale' | 'New' | 'Bestseller',
  }));

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Page Header */}
      <div className="bg-gradient-orange py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">All Products</h1>
          <p className="text-xl text-white/90">Discover our amazing collection</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="card-modern p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Filters</h2>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-3">Categories</h3>
                <div className="space-y-2">
                  {['All Products', 'Electronics', 'Fashion', 'Home & Garden', 'Sports'].map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                      <input type="checkbox" className="rounded border-border" defaultChecked={cat === 'All Products'} />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-3">Price Range</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-border" />
                    <span>Under $50</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-border" />
                    <span>$50 - $100</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-border" />
                    <span>Over $100</span>
                  </label>
                </div>
              </div>

              <button className="btn-primary w-full py-2 rounded-md font-medium">
                Apply Filters
              </button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <select className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
              </select>
            </div>

            {/* Results count */}
            <p className="text-muted-foreground mb-6">
              Showing {products.length} products
            </p>

            {/* Products Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-8">
              <button className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">
                Previous
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded-md">1</button>
              <button className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">2</button>
              <button className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">3</button>
              <button className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
