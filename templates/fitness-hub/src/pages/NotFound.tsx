import { Link } from 'wouter';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-black text-gray-200">404</h1>
        <h2 className="text-4xl font-black text-gray-900 mb-4">
          PAGE NOT <span className="text-red-600">FOUND</span>
        </h2>
        <p className="text-gray-600 mb-8">
          Looks like this page took a rest day.
        </p>
        <Link href="/">
          <a className="btn-energy inline-flex items-center gap-2">
            <Home className="w-5 h-5" />
            BACK TO HOME
          </a>
        </Link>
      </div>
    </div>
  );
}
