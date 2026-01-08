import { Link, useParams } from "wouter";
import { ShoppingCart, Heart, Share2, Star, Truck, Shield, RotateCcw } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";

export default function ProductDetail() {
  const params = useParams();
  const productId = params.id || '1';

  const relatedProducts = Array.from({ length: 4 }, (_, i) => ({
    id: i + 10,
    name: `Related Product ${i + 1}`,
    category: ['Electronics', 'Fashion', 'Home & Garden', 'Sports'][i % 4],
    price: 79.99 - (i * 5),
    originalPrice: 99.99,
    badge: (i % 3 === 0 ? 'Sale' : i % 3 === 1 ? 'New' : 'Bestseller') as 'Sale' | 'New' | 'Bestseller',
  }));

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Breadcrumbs */}
      <div className="bg-muted py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/">
              <a className="hover:text-primary">Home</a>
            </Link>
            <span>/</span>
            <Link href="/products">
              <a className="hover:text-primary">Products</a>
            </Link>
            <span>/</span>
            <span className="text-foreground">Product {productId}</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-gradient-to-br from-orange-200 to-blue-200 rounded-lg mb-4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-gradient-to-br from-orange-100 to-blue-100 rounded-md cursor-pointer hover:opacity-75 transition-opacity"></div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <span className="badge-bestseller">Bestseller</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Amazing Product {productId}
            </h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-muted-foreground">4.8 (234 reviews)</span>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">${(99.99 - parseInt(productId) * 5).toFixed(2)}</span>
                <span className="text-2xl text-muted-foreground line-through">$149.99</span>
                <span className="badge-sale text-lg px-3 py-1">33% OFF</span>
              </div>
            </div>

            <p className="text-muted-foreground text-lg mb-6">
              This is an amazing product that will exceed your expectations. Featuring premium quality
              and modern design, it's the perfect addition to your collection. Made with attention to
              detail and built to last.
            </p>

            {/* Options */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Size</h3>
              <div className="flex gap-2">
                {['S', 'M', 'L', 'XL'].map((size) => (
                  <button
                    key={size}
                    className="px-6 py-2 border-2 border-border rounded-md hover:border-primary transition-colors"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Color</h3>
              <div className="flex gap-2">
                {['bg-orange-500', 'bg-blue-800', 'bg-amber-400', 'bg-gray-800'].map((color, i) => (
                  <button
                    key={i}
                    className={`w-10 h-10 ${color} rounded-full border-2 border-gray-300 hover:border-foreground transition-colors`}
                  ></button>
                ))}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex gap-4 mb-8">
              <div className="flex items-center border border-border rounded-md">
                <button className="px-4 py-2 hover:bg-muted transition-colors">-</button>
                <span className="px-6 py-2 border-x border-border">1</span>
                <button className="px-4 py-2 hover:bg-muted transition-colors">+</button>
              </div>
              <button className="btn-primary flex-1 py-3 rounded-md font-semibold flex items-center justify-center gap-2 shadow-orange">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-8">
              <button className="flex-1 btn-secondary py-3 rounded-md font-medium flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                Add to Wishlist
              </button>
              <button className="px-6 py-3 border border-border rounded-md hover:bg-muted transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-muted rounded-lg">
              <div className="text-center">
                <Truck className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Free Shipping</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-secondary mx-auto mb-2" />
                <p className="text-sm font-medium">Secure Payment</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="text-sm font-medium">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-6">Product Description</h2>
          <div className="prose max-w-none">
            <p className="text-muted-foreground mb-4">
              Discover the perfect blend of style and functionality with this exceptional product.
              Crafted with premium materials and designed with your needs in mind, it delivers
              outstanding performance in every situation.
            </p>
            <h3 className="text-xl font-semibold mt-6 mb-3">Key Features:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Premium quality construction for long-lasting durability</li>
              <li>Modern design that fits any style</li>
              <li>Easy to use and maintain</li>
              <li>Eco-friendly materials</li>
              <li>Backed by our satisfaction guarantee</li>
            </ul>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8">You May Also Like</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
