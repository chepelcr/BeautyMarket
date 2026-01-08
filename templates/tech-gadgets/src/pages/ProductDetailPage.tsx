import { Link, useParams } from 'wouter';
import { Zap, Check, ShoppingCart, Heart, Share2, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar cartItemCount={0} />

      {/* Breadcrumb */}
      <div className="container-tech py-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-tech-cyan transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-tech-cyan transition-colors">Products</Link>
          <span>/</span>
          <span className="text-foreground">UltraBook Pro X1</span>
        </div>
      </div>

      {/* Product Detail */}
      <section className="container-tech py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-card rounded-sm mb-4 overflow-hidden tech-glow">
              <div className="w-full h-full flex items-center justify-center tech-gradient">
                <Zap className="h-40 w-40 text-white opacity-80" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-card rounded-sm overflow-hidden cursor-pointer hover:ring-2 ring-tech-cyan transition-all">
                  <div className="w-full h-full flex items-center justify-center tech-gradient-subtle">
                    <Zap className="h-8 w-8 text-tech-cyan opacity-50" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <span className="px-3 py-1 bg-accent/20 text-accent rounded-sm text-sm font-medium">New Arrival</span>
            </div>

            <h1 className="text-4xl font-bold mb-4">UltraBook Pro X1</h1>

            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-5 w-5 fill-tech-cyan text-tech-cyan" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">4.9 (342 reviews)</span>
            </div>

            <div className="mb-6">
              <p className="text-4xl font-bold text-tech-cyan mb-2">$2,499</p>
              <p className="text-muted-foreground">Tax included. Shipping calculated at checkout.</p>
            </div>

            <p className="text-lg mb-8 leading-relaxed">
              Experience unparalleled performance with the UltraBook Pro X1. Featuring a stunning 16" 4K display,
              next-gen M2 chip, and 32GB of unified memory. Perfect for professionals who demand the best.
            </p>

            {/* Specs */}
            <div className="bg-card border border-border rounded-sm p-6 mb-8">
              <h3 className="font-semibold text-lg mb-4 flex items-center space-x-2">
                <Zap className="h-5 w-5 text-tech-cyan" />
                <span>Key Specifications</span>
              </h3>
              <div className="space-y-3">
                {specs.map((spec, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-tech-cyan flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">{spec.label}:</span>
                      <span className="text-muted-foreground ml-2">{spec.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-8">
              <h4 className="font-semibold mb-3">Color</h4>
              <div className="flex items-center space-x-3">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    className="w-12 h-12 rounded-sm border-2 border-border hover:border-tech-cyan transition-colors"
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Storage Selection */}
            <div className="mb-8">
              <h4 className="font-semibold mb-3">Storage</h4>
              <div className="flex items-center space-x-3">
                {['512GB', '1TB', '2TB'].map((storage, i) => (
                  <button
                    key={storage}
                    className={`px-6 py-3 border rounded-sm font-medium transition-colors ${
                      i === 1
                        ? 'bg-tech-cyan text-background border-tech-cyan'
                        : 'border-border hover:border-tech-cyan'
                    }`}
                  >
                    {storage}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4 mb-8">
              <button className="flex-1 btn-tech-accent flex items-center justify-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>
              <button className="p-3 border border-border rounded-sm hover:border-tech-cyan transition-colors">
                <Heart className="h-6 w-6" />
              </button>
              <button className="p-3 border border-border rounded-sm hover:border-tech-cyan transition-colors">
                <Share2 className="h-6 w-6" />
              </button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-4">
              {guarantees.map((item) => (
                <div key={item.label} className="flex flex-col items-center text-center p-4 bg-card rounded-sm">
                  <item.icon className="h-8 w-8 text-tech-cyan mb-2" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="mt-16">
          <h2 className="section-header-tech">Technical Specifications</h2>
          <div className="card-tech">
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Specification</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {technicalSpecs.map((spec, i) => (
                  <tr key={i}>
                    <td className="font-medium">{spec.category}</td>
                    <td>{spec.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="section-header-tech">You May Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <div className="card-tech group cursor-pointer">
                  <div className="aspect-square bg-background rounded-sm mb-4 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center tech-gradient-subtle group-hover:tech-gradient transition-all">
                      <Zap className="h-16 w-16 text-tech-cyan opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2 group-hover:text-tech-cyan transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-2xl font-bold text-tech-cyan">${product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const specs = [
  { label: 'Display', value: '16.2" Liquid Retina XDR (3456 x 2234)' },
  { label: 'Processor', value: 'Apple M2 Pro 12-core CPU' },
  { label: 'Memory', value: '32GB Unified Memory' },
  { label: 'Storage', value: '1TB SSD' },
  { label: 'Graphics', value: '19-core GPU' },
  { label: 'Battery', value: 'Up to 22 hours' },
  { label: 'Ports', value: '3x Thunderbolt 4, HDMI, SD card, MagSafe' },
  { label: 'Weight', value: '2.1 kg (4.7 lbs)' },
];

const colors = [
  { name: 'Space Gray', hex: '#52525b' },
  { name: 'Silver', hex: '#d4d4d8' },
  { name: 'Midnight', hex: '#18181b' },
];

const guarantees = [
  { icon: Truck, label: 'Free Shipping' },
  { icon: Shield, label: '2-Year Warranty' },
  { icon: RotateCcw, label: '30-Day Returns' },
];

const technicalSpecs = [
  { category: 'Display Technology', details: 'Mini-LED backlit Liquid Retina XDR, 1,000,000:1 contrast ratio, 1000 nits sustained, 1600 nits peak' },
  { category: 'Neural Engine', details: '16-core Neural Engine, 15.8 trillion operations per second' },
  { category: 'Camera', details: '1080p FaceTime HD camera with advanced image signal processor' },
  { category: 'Audio', details: 'High-fidelity six-speaker sound system, Studio-quality three-mic array' },
  { category: 'Wireless', details: 'Wi-Fi 6E (802.11ax), Bluetooth 5.3' },
  { category: 'Operating System', details: 'macOS Ventura (upgradeable)' },
  { category: 'Security', details: 'Touch ID sensor, Apple T2 Security Chip' },
  { category: 'Dimensions', details: '35.57 x 24.81 x 1.68 cm' },
];

const relatedProducts = [
  { id: '2', name: 'Quantum Phone 15', price: 1299 },
  { id: '3', name: 'AirPods Max Elite', price: 549 },
  { id: '4', name: 'SmartWatch Ultra', price: 799 },
  { id: '5', name: 'Gaming Monitor 4K', price: 899 },
];
