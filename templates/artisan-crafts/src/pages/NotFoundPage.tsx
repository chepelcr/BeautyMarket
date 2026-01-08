import { Link } from 'wouter';
import { Home, ArrowLeft, Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="text-9xl font-bold text-gradient-artisan opacity-20">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Compass className="w-24 h-24 text-primary animate-wiggle" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-foreground/70 mb-8 max-w-md mx-auto">
          Oops! It seems this handcrafted page hasn't been created yet. Let's get you back to discovering amazing artisan treasures.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <a className="btn-artisan inline-flex items-center gap-2">
              <Home className="w-5 h-5" />
              Go Home
            </a>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-artisan-outline inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex items-center justify-center gap-4 text-foreground/30">
          <span className="text-2xl">🏺</span>
          <span className="text-2xl">✨</span>
          <span className="text-2xl">🧶</span>
          <span className="text-2xl">🌿</span>
        </div>
      </div>
    </div>
  );
}
