import { Link } from "wouter";
import strawberryLogo from "@assets/image_1755019713048.png";

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img 
                  src={strawberryLogo} 
                  alt="Strawberry Essentials Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-serif text-xl font-semibold">Strawberry Essentials</span>
            </div>
            <p className="text-gray-400 dark:text-gray-500 mb-6 max-w-md">
              Tu tienda virtual de confianza para productos de belleza. Ofrecemos lo mejor en maquillaje, skincare y accesorios.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com/strawberry.essentials" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-pink-primary transition-colors"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a 
                href="https://wa.me/50673676745" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-pink-primary transition-colors"
              >
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-gray-400 hover:text-white transition-colors">
                Inicio
              </Link>
              <Link href="/products" className="block text-gray-400 hover:text-white transition-colors">
                Productos
              </Link>
              <Link href="/admin" className="block text-gray-400 hover:text-white transition-colors">
                Admin
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Contacto</h4>
            <div className="space-y-2 text-gray-400 dark:text-gray-500">
              <p>@strawberry.essentials</p>
              <p>Tel: 73676745</p>
              <p>Costa Rica</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 dark:border-gray-700 mt-12 pt-8 text-center text-gray-400 dark:text-gray-500">
          <p>&copy; 2024 Strawberry Essentials. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
