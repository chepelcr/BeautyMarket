import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useDynamicTitle } from "@/hooks/useDynamicTitle";
import {
  Store,
  Users,
  Globe,
  Shield,
  Zap,
  BarChart3,
  Palette,
  CreditCard,
  Truck,
  Check,
  ArrowRight,
  Sparkles,
  Building2,
  Lock
} from "lucide-react";

export default function Landing() {
  useDynamicTitle("Tu tienda online");

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0">
          <svg viewBox="0 0 1440 800" className="absolute inset-0 w-full h-full">
            <path d="M0,400 Q360,300 720,400 T1440,400 L1440,800 L0,800 Z" fill="rgba(233, 30, 99, 0.05)" />
            <path d="M0,500 Q480,350 960,500 T1920,500 L1920,800 L0,800 Z" fill="rgba(248, 187, 217, 0.1)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              Plataforma completa para e-commerce
            </Badge>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Crea tu tienda online
              <span className="text-pink-500 block mt-2">
                en minutos, no en meses
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              La plataforma completa para vender en línea.
              Tu propio subdominio, gestión de inventario, pagos integrados y más.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/organizations/new">
                <Button size="lg" className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-6 text-lg">
                  Crear mi tienda gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/examples">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                  Ver ejemplos
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Sin tarjeta de crédito. Comienza en 2 minutos.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Todo lo que necesitas para vender
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Herramientas profesionales para todos tus tipos de negocios
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Globe className="h-6 w-6" />}
              title="Tu propio subdominio"
              description="Obtén tu-tienda.jmarkets.jcampos.dev o conecta tu dominio personalizado"
            />
            <FeatureCard
              icon={<Palette className="h-6 w-6" />}
              title="Personalización total"
              description="Colores, logo, tipografía. Tu marca, tu estilo, sin código"
            />
            <FeatureCard
              icon={<Store className="h-6 w-6" />}
              title="Catálogo ilimitado"
              description="Sube todos tus productos con fotos, variantes y stock"
            />
            <FeatureCard
              icon={<CreditCard className="h-6 w-6" />}
              title="Pagos integrados"
              description="Acepta tarjetas, SINPE Móvil y más métodos de pago"
            />
            <FeatureCard
              icon={<Truck className="h-6 w-6" />}
              title="Envíos configurables"
              description="Define zonas, costos y opciones de envío gratis"
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Analíticas en tiempo real"
              description="Conoce tus ventas, productos populares y más"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Gestión de equipo"
              description="Invita colaboradores con roles y permisos específicos"
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Seguridad empresarial"
              description="SSL, backups automáticos y protección de datos"
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Velocidad optimizada"
              description="CDN global para cargar tu tienda en milisegundos"
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Comienza en 3 simples pasos
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              De la idea a vender en menos de una hora
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Crea tu cuenta"
              description="Regístrate gratis y elige el nombre de tu tienda. Sin compromisos."
            />
            <StepCard
              number="2"
              title="Personaliza tu tienda"
              description="Sube tu logo, elige colores y agrega tus productos al catálogo."
            />
            <StepCard
              number="3"
              title="Empieza a vender"
              description="Comparte el enlace de tu tienda y recibe tus primeras ventas."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Planes para cada etapa
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Comienza gratis, escala cuando crezcas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="relative">
              <CardHeader>
                <CardTitle>Gratis</CardTitle>
                <CardDescription>Perfecto para empezar</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <PricingFeature>Hasta 25 productos</PricingFeature>
                  <PricingFeature>Subdominio incluido</PricingFeature>
                  <PricingFeature>1 usuario</PricingFeature>
                  <PricingFeature>Soporte por email</PricingFeature>
                </ul>
                <Link href="/organizations/new">
                  <Button className="w-full mt-6" variant="outline">
                    Comenzar gratis
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-pink-500 border-2">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-pink-500">Más popular</Badge>
              </div>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>Para negocios en crecimiento</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <PricingFeature>Productos ilimitados</PricingFeature>
                  <PricingFeature>Dominio personalizado</PricingFeature>
                  <PricingFeature>5 usuarios</PricingFeature>
                  <PricingFeature>Analíticas avanzadas</PricingFeature>
                  <PricingFeature>Soporte prioritario</PricingFeature>
                </ul>
                <Link href="/organizations/new">
                  <Button className="w-full mt-6 bg-pink-500 hover:bg-pink-600">
                    Prueba 14 días gratis
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Business Plan */}
            <Card className="relative">
              <CardHeader>
                <CardTitle>Business</CardTitle>
                <CardDescription>Para equipos grandes</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$99</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <PricingFeature>Todo de Pro</PricingFeature>
                  <PricingFeature>Usuarios ilimitados</PricingFeature>
                  <PricingFeature>API access</PricingFeature>
                  <PricingFeature>Multi-ubicación</PricingFeature>
                  <PricingFeature>Gerente de cuenta</PricingFeature>
                </ul>
                <Button className="w-full mt-6" variant="outline">
                  Contactar ventas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-pink-500 mb-2">500+</div>
              <div className="text-muted-foreground">Tiendas activas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-500 mb-2">$2M+</div>
              <div className="text-muted-foreground">En ventas procesadas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-500 mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime garantizado</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-500 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
            Tu negocio merece brillar en línea
          </h2>
          <p className="text-lg text-pink-100 mb-8">
            Únete a cientos de emprendedores que ya venden en línea con JMarkets
          </p>
          <Link href="/organizations/new">
            <Button size="lg" variant="secondary" className="px-8 py-6 text-lg">
              <Building2 className="mr-2 h-5 w-5" />
              Crear mi tienda ahora
            </Button>
          </Link>
        </div>
      </section>

      {/* Security Footer */}
      <section className="py-10 bg-white dark:bg-gray-800 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              SSL Seguro
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Datos protegidos
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pagos seguros
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardContent className="pt-6">
        <div className="p-3 bg-pink-100 dark:bg-pink-500/20 rounded-lg w-fit mb-4">
          <div className="text-pink-500">{icon}</div>
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

// Step Card Component
function StepCard({ number, title, description }: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="font-semibold text-xl mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

// Pricing Feature Component
function PricingFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
      <span className="text-sm">{children}</span>
    </li>
  );
}
