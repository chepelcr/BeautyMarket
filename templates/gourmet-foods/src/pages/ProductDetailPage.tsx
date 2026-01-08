import { useRoute } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import IngredientBadge from '../components/IngredientBadge';
import { ShoppingCart, Heart, Star, Award, Leaf, Package } from 'lucide-react';

export default function ProductDetailPage() {
  const [, params] = useRoute('/products/:id');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Image */}
            <div>
              <div
                className="aspect-square bg-cover bg-center rounded-lg shadow-xl mb-4"
                style={{
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800)',
                }}
              />
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-stone-200 rounded-lg cursor-pointer hover:ring-2 hover:ring-gourmet-red transition-all"
                    style={{
                      backgroundImage: `url(https://images.unsplash.com/photo-${
                        1486297678162 + i * 1000000
                      }?w=200)`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <IngredientBadge type="premium" label="Premium" />
                <IngredientBadge type="organic" label="Organic" />
              </div>

              <h1 className="text-4xl font-serif font-bold text-stone-900 mb-4">
                Aged Parmesan Reggiano
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-gourmet-gold text-gourmet-gold" />
                  ))}
                </div>
                <span className="text-sm text-stone-600">(127 reviews)</span>
              </div>

              <p className="text-xl text-gourmet-red font-bold mb-6">$24.99</p>

              <p className="text-stone-700 mb-8 leading-relaxed">
                Our 24-month aged Parmesan Reggiano is carefully crafted by artisanal cheese makers
                in the Emilia-Romagna region of Italy. This premium cheese features a granular
                texture and complex, nutty flavor with subtle fruity notes. Perfect for grating over
                pasta, risotto, or enjoying on its own.
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-gourmet-gold flex-shrink-0" />
                  <span className="text-sm text-stone-700">PDO Certified (Protected Designation of Origin)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Leaf className="w-5 h-5 text-gourmet-green flex-shrink-0" />
                  <span className="text-sm text-stone-700">Made from organic cow's milk</span>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-gourmet-red flex-shrink-0" />
                  <span className="text-sm text-stone-700">Vacuum-sealed for freshness - 8oz package</span>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-stone-300 rounded-lg">
                    <button className="px-4 py-2 hover:bg-stone-100 transition-colors">-</button>
                    <span className="px-6 py-2 border-x border-stone-300">1</span>
                    <button className="px-4 py-2 hover:bg-stone-100 transition-colors">+</button>
                  </div>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-gourmet-red hover:bg-gourmet-gold text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                  <button className="p-3 border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors">
                    <Heart className="w-5 h-5 text-stone-600" />
                  </button>
                </div>

                <button className="w-full bg-stone-900 hover:bg-stone-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="bg-white rounded-lg border border-stone-200 p-8">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-serif font-bold mb-4">Product Details</h2>
                <div className="prose prose-stone max-w-none">
                  <p>
                    Parmesan Reggiano is the "King of Cheeses" and has been produced in the same way
                    for over 900 years in the provinces of Parma, Reggio Emilia, Modena, Bologna,
                    and Mantua. Our 24-month aged variety offers the perfect balance of flavor and
                    texture.
                  </p>
                  <h3 className="font-serif font-semibold mt-6 mb-3">Tasting Notes</h3>
                  <ul>
                    <li>Complex nutty flavor with hints of caramel</li>
                    <li>Granular, crystalline texture</li>
                    <li>Long-lasting finish with subtle fruity undertones</li>
                    <li>Intense umami character</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-serif font-bold mb-4">Storage Instructions</h2>
                <p className="text-stone-700">
                  Store in the refrigerator, wrapped in wax paper or parchment paper. For best
                  flavor, bring to room temperature 30 minutes before serving. Once opened, consume
                  within 3-4 weeks.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-serif font-bold mb-4">Pairing Suggestions</h2>
                <p className="text-stone-700 mb-3">
                  This versatile cheese pairs wonderfully with:
                </p>
                <ul className="list-disc list-inside text-stone-700 space-y-1">
                  <li>Aged balsamic vinegar and fresh figs</li>
                  <li>Prosciutto di Parma and crusty bread</li>
                  <li>Full-bodied red wines like Chianti or Barolo</li>
                  <li>Fresh pears and honey</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
