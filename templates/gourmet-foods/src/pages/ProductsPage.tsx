import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal } from 'lucide-react';

export default function ProductsPage() {
  const products = Array.from({ length: 12 }, (_, i) => ({
    id: `${i + 1}`,
    name: `Gourmet Product ${i + 1}`,
    description: 'Premium artisanal product with exceptional quality and taste',
    price: Math.floor(Math.random() * 50) + 15,
    image: `https://images.unsplash.com/photo-${1500000000000 + i * 10000000}?w=500`,
    rating: Math.floor(Math.random() * 2) + 4,
    reviewCount: Math.floor(Math.random() * 200) + 50,
    badges:
      i % 3 === 0
        ? [{ type: 'organic' as const, label: 'Organic' }]
        : i % 3 === 1
        ? [{ type: 'premium' as const, label: 'Premium' }]
        : [{ type: 'fresh' as const, label: 'Fresh' }],
    onSale: i % 5 === 0,
    salePrice: i % 5 === 0 ? Math.floor(Math.random() * 30) + 10 : undefined,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-stone-100 border-b border-stone-200">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-3">
              All Products
            </h1>
            <p className="text-lg text-stone-600">
              Discover our complete collection of premium gourmet foods
            </p>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              <aside className="lg:w-64 flex-shrink-0">
                <div className="sticky top-24 space-y-6">
                  {/* Filter Header */}
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-stone-200">
                    <h2 className="font-serif font-semibold text-lg flex items-center gap-2">
                      <Filter className="w-5 h-5 text-gourmet-red" />
                      Filters
                    </h2>
                    <button className="text-sm text-gourmet-red hover:text-gourmet-gold transition-colors">
                      Reset
                    </button>
                  </div>

                  {/* Category Filter */}
                  <div className="bg-white p-4 rounded-lg border border-stone-200">
                    <h3 className="font-semibold mb-3">Categories</h3>
                    <div className="space-y-2">
                      {[
                        'All Products',
                        'Artisan Cheese',
                        'Charcuterie',
                        'Specialty Oils',
                        'Gourmet Coffee',
                        'Organic Selection',
                      ].map((category) => (
                        <label key={category} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded border-stone-300" />
                          <span className="text-sm text-stone-700">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div className="bg-white p-4 rounded-lg border border-stone-200">
                    <h3 className="font-semibold mb-3">Price Range</h3>
                    <div className="space-y-2">
                      {['Under $20', '$20 - $40', '$40 - $60', 'Over $60'].map((range) => (
                        <label key={range} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded border-stone-300" />
                          <span className="text-sm text-stone-700">{range}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Dietary Filter */}
                  <div className="bg-white p-4 rounded-lg border border-stone-200">
                    <h3 className="font-semibold mb-3">Dietary</h3>
                    <div className="space-y-2">
                      {['Organic', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto'].map(
                        (dietary) => (
                          <label key={dietary} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded border-stone-300" />
                            <span className="text-sm text-stone-700">{dietary}</span>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </aside>

              {/* Products Grid */}
              <div className="flex-1">
                {/* Sort & View Options */}
                <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg border border-stone-200">
                  <p className="text-sm text-stone-600">
                    Showing <strong>12</strong> products
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-stone-500" />
                      <select className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gourmet-red">
                        <option>Sort by: Featured</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                        <option>Newest</option>
                        <option>Best Rated</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-12 flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((page) => (
                    <button
                      key={page}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        page === 1
                          ? 'bg-gourmet-red text-white'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
