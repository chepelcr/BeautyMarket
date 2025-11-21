import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDynamicTitle } from "@/hooks/useDynamicTitle";
import {
  ExternalLink,
  Store,
  Sparkles,
  Leaf,
  Crown,
  Heart,
  Scissors,
  Star
} from "lucide-react";

// Example store data
const exampleStores = [
  {
    id: "basic-example",
    title: "JMarkets Demo",
    description: "Tienda de ejemplo completa con productos, carrito de compras, checkout y todas las funcionalidades de la plataforma.",
    url: "/basic-example",
    icon: <Store className="h-6 w-6" />,
    category: "Demo",
    featured: true,
    isInternal: true
  },
  {
    id: "tech-gadgets",
    title: "Tech Gadgets Pro",
    description: "Últimos gadgets y accesorios electrónicos. Smartphones, laptops, tablets y dispositivos innovadores para la vida moderna.",
    url: "https://tech-gadgets.jmarkets.jcampos.dev",
    icon: <Leaf className="h-6 w-6" />,
    category: "Electrónica",
    featured: false
  },
  {
    id: "vintage-fashion",
    title: "Vintage Fashion Co",
    description: "Colección curada de ropa vintage y retro. Piezas únicas de décadas pasadas con estilo atemporal.",
    url: "https://vintage-fashion.jmarkets.jcampos.dev",
    icon: <Sparkles className="h-6 w-6" />,
    category: "Moda",
    featured: false
  },
  {
    id: "artisan-crafts",
    title: "Artisan Crafts Studio",
    description: "Manualidades y suministros para DIY. Materiales para tejer, pintar, trabajar la madera y artículos únicos hechos a mano.",
    url: "https://artisan-crafts.jmarkets.jcampos.dev",
    icon: <Crown className="h-6 w-6" />,
    category: "Artesanías",
    featured: true
  },
  {
    id: "gourmet-foods",
    title: "Gourmet Foods Market",
    description: "Alimentos orgánicos y especiales premium. Quesos artesanales, especias exóticas, bebidas artesanales y productos especiales.",
    url: "https://gourmet-foods.jmarkets.jcampos.dev",
    icon: <Heart className="h-6 w-6" />,
    category: "Alimentos",
    featured: false
  },
  {
    id: "fitness-hub",
    title: "Fitness Equipment Hub",
    description: "Equipamiento de fitness para hogar y gimnasio. Mancuernas, tapetes de yoga, bandas de resistencia y accesorios de entrenamiento.",
    url: "https://fitness-hub.jmarkets.jcampos.dev",
    icon: <Star className="h-6 w-6" />,
    category: "Deportes",
    featured: false
  },
  {
    id: "pet-supplies",
    title: "Pet Care Supplies",
    description: "Todo para tus mascotas. Juguetes, productos de aseo, nutrición y camas cómodas para gatos y perros.",
    url: "https://pet-supplies.jmarkets.jcampos.dev",
    icon: <Scissors className="h-6 w-6" />,
    category: "Mascotas",
    featured: true
  }
];

export default function Examples() {
  useDynamicTitle("Ejemplos de tiendas");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <section className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              <Store className="h-3 w-3 mr-1" />
              Tiendas de ejemplo
            </Badge>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Inspírate con tiendas reales
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explora ejemplos de tiendas creadas con JMarkets.
              Cada una muestra diferentes personalizaciones y categorías de productos.
            </p>
          </div>
        </div>
      </section>

      {/* Examples Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exampleStores.map((store) => (
              <ExampleCard key={store.id} store={store} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white dark:bg-gray-800 border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Comienza a crear tu propia tienda
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Comienza gratis y personaliza tu tienda como quieras
          </p>
          <Button
            size="lg"
            className="bg-pink-500 hover:bg-pink-600"
            onClick={() => window.location.href = '/organizations/new'}
          >
            Crear mi tienda
          </Button>
        </div>
      </section>
    </div>
  );
}

// Example Card Component
function ExampleCard({ store }: {
  store: {
    id: string;
    title: string;
    description: string;
    url: string;
    icon: React.ReactNode;
    category: string;
    featured: boolean;
    isInternal?: boolean;
  }
}) {
  const handleVisit = () => {
    if (store.isInternal) {
      window.open(store.url, '_blank');
    } else {
      window.open(store.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className={`relative transition-all hover:shadow-lg ${store.featured ? 'ring-2 ring-pink-500' : ''}`}>
      {store.featured && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-pink-500">Destacada</Badge>
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="p-3 bg-pink-100 dark:bg-pink-500/20 rounded-lg w-fit">
            <div className="text-pink-500">{store.icon}</div>
          </div>
          <Badge variant="outline">{store.category}</Badge>
        </div>
        <CardTitle className="mt-4">{store.title}</CardTitle>
        <CardDescription className="line-clamp-3">
          {store.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleVisit}
          className="w-full"
          variant="outline"
        >
          Ver tienda
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
