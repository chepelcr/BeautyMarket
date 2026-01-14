import { useState } from "react";
import { useRoute, Link } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useContent";
import {
  ShoppingCart,
  Heart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Sparkles,
  Check,
  Minus,
  Plus,
} from "lucide-react";



export default function ProductDetailPage() {
  const [, params] = useRoute("/products/:id");
  const productId = params?.id || "1";
  const { data: products = [] } = useProducts();
  const product = products.find((p: any) => p.id === productId) || products[0];

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // Related products from same category
  const relatedProducts = products
    .filter((p: any) => p.category === product?.category && p.id !== product?.id)
    .slice(0, 4);

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p>Product not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images || [product.image, product.image, product.image];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-pink-50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/">
              <a className="hover:text-primary transition-colors">Home</a>
            </Link>
            <span>/</span>
            <Link href="/products">
              <a className="hover:text-primary transition-colors">Products</a>
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <div>
              {/* Main Image */}
              <div className="mb-4 rounded-2xl overflow-hidden bg-beauty-cream aspect-square">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-3 gap-4">
                {images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`rounded-lg overflow-hidden border-2 transition-all aspect-square ${
                      selectedImage === index
                        ? "border-primary shadow-beauty"
                        : "border-transparent hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              {/* Category & New Badge */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                  {product.category}
                </span>
                {product.isNew && (
                  <span className="px-3 py-1 bg-accent text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    NEW
                  </span>
                )}
              </div>

              {/* Product Name */}
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <p className="text-4xl font-bold text-primary">${product.price.toFixed(2)}</p>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={decrementQuantity}
                      className="p-3 hover:bg-pink-50 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="px-6 py-3 font-bold text-lg">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      className="p-3 hover:bg-pink-50 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total: <span className="font-bold text-foreground">${(product.price * quantity).toFixed(2)}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-8">
                <button className="flex-1 btn-beauty flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button className="p-4 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
                  <Heart className="w-6 h-6" />
                </button>
              </div>

              {/* Product Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-lg">
                  <Truck className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Free Shipping</p>
                    <p className="text-xs text-muted-foreground">Orders over $50</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-lg">
                  <Shield className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Secure Payment</p>
                    <p className="text-xs text-muted-foreground">100% protected</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-lg">
                  <RotateCcw className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Easy Returns</p>
                    <p className="text-xs text-muted-foreground">30-day policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-white rounded-2xl border border-border p-8">
              {/* Benefits */}
              <div className="mb-8">
                <h3 className="text-2xl font-serif font-bold text-foreground mb-4">
                  Key Benefits
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(product.benefits || []).map((benefit: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="beauty-divider mb-8"></div>

              {/* Ingredients */}
              <div className="mb-8">
                <h3 className="text-2xl font-serif font-bold text-foreground mb-4">
                  Ingredients
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(product.ingredients || []).map((ingredient: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-pink-50 text-foreground rounded-full text-sm"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>

              <div className="beauty-divider mb-8"></div>

              {/* How to Use */}
              <div>
                <h3 className="text-2xl font-serif font-bold text-foreground mb-4">
                  How to Use
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.howToUse || product.description}
                </p>
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
                You May Also Like
              </h2>
              <p className="text-muted-foreground">
                Complete your skincare routine with these complementary products
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product: any) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
