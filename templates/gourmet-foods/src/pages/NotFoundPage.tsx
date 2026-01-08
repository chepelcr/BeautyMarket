import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'wouter';
import { ChefHat, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center bg-stone-50">
        <div className="text-center px-4 py-16">
          <ChefHat className="w-24 h-24 text-gourmet-red mx-auto mb-6" />
          <h1 className="text-6xl font-serif font-bold text-stone-900 mb-4">404</h1>
          <h2 className="text-3xl font-serif font-semibold text-stone-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-stone-600 mb-8 max-w-md mx-auto">
            Sorry, the recipe you're looking for seems to have been moved or doesn't exist.
          </p>
          <Link href="/">
            <a className="inline-flex items-center gap-2 bg-gourmet-red hover:bg-gourmet-gold text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg">
              <Home className="w-5 h-5" />
              Back to Home
            </a>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
