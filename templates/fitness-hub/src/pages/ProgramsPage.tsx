import { Link } from 'wouter';
import { TrendingUp, Clock, Target } from 'lucide-react';
import { useProducts } from '@/hooks/useContent';

export default function ProgramsPage() {
  const { data: programs = [], isLoading } = useProducts({ type: 'program' });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-600 px-4 py-2 rounded-lg mb-4">
            <TrendingUp className="w-5 h-5" />
            <span className="font-bold">TRANSFORM YOUR BODY</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            <span className="gradient-energy bg-clip-text text-transparent">TRAINING PROGRAMS</span>
          </h1>
          <p className="text-xl text-gray-300">Structured workout plans for every fitness level</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <p className="text-gray-600">
            <span className="font-bold text-gray-900">{programs.length}</span> PROGRAMS AVAILABLE
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="card-fitness animate-pulse h-96" />
            ))
          ) : (
            programs.map((program: any) => (
              <div key={program.id} className="card-fitness overflow-hidden group">
                <div className="aspect-video bg-gradient-to-br from-red-600 to-orange-600 relative">
                  {program.difficulty && (
                    <div className="absolute top-3 right-3 bg-white text-gray-900 px-3 py-1 rounded text-xs font-bold uppercase">
                      {program.difficulty}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-black text-gray-900 text-xl mb-2">{program.name}</h3>
                  <p className="text-gray-600 mb-4">{program.description}</p>
                  
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    {program.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{program.duration}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      <span>{program.difficulty || 'All Levels'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-red-600">${program.price}</span>
                    <Link href={`/products/${program.id}`}>
                      <button className="btn-energy text-sm py-2 px-6">
                        START NOW
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!isLoading && programs.length === 0 && (
          <div className="text-center py-16">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-900 mb-2">NO PROGRAMS AVAILABLE</h3>
            <p className="text-gray-600 mb-6">Vuelve pronto para nuevos programas de entrenamiento</p>
            <Link href="/products">
              <button className="btn-energy">BROWSE EQUIPMENT</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
