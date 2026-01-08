import { Link } from 'wouter';
import { Zap, Filter, Grid, List } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar cartItemCount={0} />

      {/* Page Header */}
      <section className="bg-card border-b border-border">
        <div className="container-tech py-12">
          <h1 className="text-4xl font-bold mb-4 animated-gradient-text">
            All Products
          </h1>
          <p className="text-muted-foreground text-lg">
            Browse our complete collection of premium tech gadgets
          </p>
        </div>
      </section>

      {/* Filters and Products */}
      <section className="container-tech py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="w-64 flex-shrink-0">
            <div className="card-tech sticky top-24">
              <div className="flex items-center space-x-2 mb-6">
                <Filter className="h-5 w-5 text-tech-cyan" />
                <h3 className="font-semibold text-lg">Filters</h3>
              </div>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h4 className="font-medium mb-3">Category</h4>
                  <div className="space-y-2">
                    {['Smartphones', 'Laptops', 'Audio', 'Wearables', 'Computing', 'Smart Home'].map((cat) => (
                      <label key={cat} className="flex items-center space-x-2 cursor-pointer group">
                        <input type="checkbox" className="rounded-sm border-border" />
                        <span className="text-sm group-hover:text-tech-cyan transition-colors">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Under $100', value: '0-100' },
                      { label: '$100 - $500', value: '100-500' },
                      { label: '$500 - $1000', value: '500-1000' },
                      { label: 'Over $1000', value: '1000+' },
                    ].map((range) => (
                      <label key={range.value} className="flex items-center space-x-2 cursor-pointer group">
                        <input type="checkbox" className="rounded-sm border-border" />
                        <span className="text-sm group-hover:text-tech-cyan transition-colors">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brand Filter */}
                <div>
                  <h4 className="font-medium mb-3">Brand</h4>
                  <div className="space-y-2">
                    {['TechCorp', 'Quantum', 'UltraGear', 'SmartHome', 'AudioMax'].map((brand) => (
                      <label key={brand} className="flex items-center space-x-2 cursor-pointer group">
                        <input type="checkbox" className="rounded-sm border-border" />
                        <span className="text-sm group-hover:text-tech-cyan transition-colors">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button className="w-full btn-tech-secondary text-sm">
                  Apply Filters
                </button>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                Showing <span className="text-foreground font-medium">247</span> products
              </p>
              <div className="flex items-center space-x-4">
                <select className="px-4 py-2 bg-card border border-border rounded-sm text-sm">
                  <option>Sort by: Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest First</option>
                  <option>Best Selling</option>
                </select>
                <div className="flex items-center space-x-2">
                  <button className="p-2 bg-tech-cyan/20 text-tech-cyan rounded-sm">
                    <Grid className="h-4 w-4" />
                  </button>
                  <button className="p-2 hover:bg-muted rounded-sm">
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <div className="card-tech group cursor-pointer h-full flex flex-col">
                    <div className="aspect-square bg-background rounded-sm mb-4 overflow-hidden relative">
                      <div className="w-full h-full flex items-center justify-center tech-gradient-subtle group-hover:tech-gradient transition-all">
                        <Zap className="h-16 w-16 text-tech-cyan opacity-50 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {product.badge && (
                        <span className="absolute top-3 right-3 px-3 py-1 bg-accent rounded-sm text-xs font-medium">
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h4 className="font-semibold mb-2 group-hover:text-tech-cyan transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3 flex-1">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-tech-cyan">${product.price}</span>
                        <button className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-sm text-sm font-medium transition-colors">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-12 space-x-2">
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  className={`px-4 py-2 rounded-sm font-medium transition-colors ${
                    page === 1
                      ? 'bg-tech-cyan text-background'
                      : 'bg-card hover:bg-muted'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </main>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const products = [
  { id: '1', name: 'UltraBook Pro X1', description: '16" 4K Display, M2 Chip, 32GB RAM', price: 2499, badge: 'New' },
  { id: '2', name: 'Quantum Phone 15', description: '6.7" OLED, 5G, Triple Camera', price: 1299, badge: 'Bestseller' },
  { id: '3', name: 'AirPods Max Elite', description: 'ANC, Spatial Audio, 40hr Battery', price: 549 },
  { id: '4', name: 'SmartWatch Ultra', description: 'GPS, ECG, Always-on Display', price: 799, badge: 'New' },
  { id: '5', name: 'Gaming Monitor 4K', description: '32" 144Hz, HDR, 1ms Response', price: 899 },
  { id: '6', name: 'Wireless Keyboard Pro', description: 'Mechanical, RGB, Multi-device', price: 179 },
  { id: '7', name: 'Smart Speaker Max', description: '360° Audio, Alexa Built-in', price: 299 },
  { id: '8', name: 'Fitness Tracker Elite', description: 'Heart Rate, Sleep, 14-day Battery', price: 149 },
  { id: '9', name: 'Wireless Earbuds', description: 'ANC, Transparency Mode, 8hr Battery', price: 249 },
];
