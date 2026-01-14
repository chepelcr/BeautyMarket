import { Link } from 'wouter';
import { Zap, Target, TrendingUp, Award, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cart';

export default function Home() {
  const { addToCart } = useCartStore();
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-orange-600/20"></div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
              TRANSFORM YOUR
              <span className="block gradient-energy bg-clip-text text-transparent">
                FITNESS JOURNEY
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Premium equipment. Expert guidance. Unstoppable results. Join
              thousands of athletes achieving their goals with Fitness Hub.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <a className="btn-energy flex items-center gap-2">
                  SHOP NOW
                  <ArrowRight className="w-5 h-5" />
                </a>
              </Link>
              <button className="bg-transparent border-2 border-white text-white font-bold py-3 px-6 rounded-lg hover:bg-white hover:text-gray-900 transition-all">
                EXPLORE PROGRAMS
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4 text-gray-900">
              WHY CHOOSE <span className="text-red-600">FITNESS HUB</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide everything you need to reach your peak performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-fitness p-6 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black mb-2 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4 text-gray-900">
              FEATURED <span className="text-orange-600">EQUIPMENT</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Top-rated gear trusted by champions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="card-fitness overflow-hidden group cursor-pointer"
              >
                <div className="aspect-square bg-gray-200 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 group-hover:scale-110 transition-transform duration-300"></div>
                </div>
                <div className="p-6">
                  <div className="text-xs font-bold text-orange-600 mb-2">
                    {product.category}
                  </div>
                  <h3 className="text-xl font-black mb-2 text-gray-900">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-red-600">
                      ${product.price}
                    </span>
                    <button
                      onClick={() => addToCart({
                        id: `home-${index}`,
                        name: product.name,
                        price: product.price,
                      })}
                      className="btn-energy text-sm py-2 px-4"
                    >
                      ADD TO CART
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/products">
              <a className="btn-secondary inline-flex items-center gap-2">
                VIEW ALL PRODUCTS
                <ArrowRight className="w-5 h-5" />
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-5xl font-black mb-6">
              READY TO{' '}
              <span className="gradient-energy bg-clip-text text-transparent">
                DOMINATE?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join our community of champions and start your transformation
              today.
            </p>
            <button className="btn-energy text-lg">
              GET STARTED NOW
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: <Zap className="w-8 h-8 text-white" />,
    title: 'PREMIUM QUALITY',
    description: 'Professional-grade equipment built to last',
  },
  {
    icon: <Target className="w-8 h-8 text-white" />,
    title: 'EXPERT GUIDANCE',
    description: 'Training programs designed by certified coaches',
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-white" />,
    title: 'TRACK PROGRESS',
    description: 'Advanced tools to monitor your gains',
  },
  {
    icon: <Award className="w-8 h-8 text-white" />,
    title: 'PROVEN RESULTS',
    description: 'Thousands of success stories and counting',
  },
];

const featuredProducts = [
  {
    category: 'STRENGTH TRAINING',
    name: 'Pro Adjustable Dumbbells',
    description: 'Space-saving design with quick weight adjustment',
    price: 299,
  },
  {
    category: 'CARDIO',
    name: 'Elite Rowing Machine',
    description: 'Full-body workout with performance tracking',
    price: 899,
  },
  {
    category: 'ACCESSORIES',
    name: 'Premium Yoga Mat',
    description: 'Non-slip, eco-friendly, extra cushioning',
    price: 49,
  },
];
