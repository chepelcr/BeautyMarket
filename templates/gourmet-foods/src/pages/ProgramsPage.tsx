import { Link } from 'wouter';
import { ChefHat, Clock, Target } from 'lucide-react';
import { useProducts } from '@/hooks/useContent';

export default function ProgramsPage() {
  const { data: programs = [], isLoading } = useProducts({ type: 'program' });

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="bg-gradient-to-br from-gourmet-red to-gourmet-gold py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg mb-4">
            <ChefHat className="w-5 h-5" />
            <span className="font-sans font-semibold">Culinary Programs</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">Cooking Programs</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Master gourmet cooking techniques
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <p className="text-stone-600 font-sans">
            <span className="font-bold text-stone-900">{programs.length}</span> programas disponibles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg h-96 border border-stone-200" />
            ))
          ) : (
            programs.map((program: any) => (
              <div key={program.id} className="bg-white rounded-lg border border-stone-200 p-6 hover:shadow-lg transition-shadow">
                <h3 className="font-serif font-bold text-stone-900 text-xl mb-2">{program.name}</h3>
                <p className="text-stone-600 font-sans mb-4">{program.description}</p>
                <div className="flex items-center gap-4 mb-4 text-sm text-stone-600">
                  {program.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{program.duration}</span>
                    </div>
                  )}
                  {program.difficulty && (
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      <span className="capitalize">{program.difficulty}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                  <span className="text-2xl font-bold text-gourmet-red">${program.price}</span>
                  <button className="bg-gourmet-red text-white px-6 py-2 rounded-lg font-sans font-semibold hover:bg-gourmet-gold transition-colors">
                    Inscribirse
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {!isLoading && programs.length === 0 && (
          <div className="text-center py-16">
            <ChefHat className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">No programas disponibles</h3>
            <p className="text-stone-600 font-sans mb-6">Vuelve pronto</p>
            <Link href="/products">
              <button className="bg-gourmet-red text-white px-8 py-3 rounded-lg font-sans font-semibold hover:bg-gourmet-gold transition-colors">
                Ver Productos
              </button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
