import { Link } from 'wouter';
import { Palette, Clock, Target } from 'lucide-react';
import { useProducts } from '@/hooks/useContent';

export default function ProgramsPage() {
  const { data: programs = [], isLoading } = useProducts({ type: 'program' });

  return (
    <div className="min-h-screen bg-background">
      <div className="section-textured py-12">
        <div className="container-organic">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <span className="font-sans font-semibold text-primary">Workshops</span>
            </div>
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Craft <span className="text-gradient-artisan">Programs</span>
            </h1>
            <p className="text-foreground/70 text-lg">Learn traditional crafting techniques</p>
          </div>
        </div>
      </div>

      <div className="container-organic py-12">
        <div className="mb-6">
          <p className="text-foreground/60">
            <span className="font-bold text-foreground">{programs.length}</span> programas disponibles
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-muted rounded-lg h-96" />)
          ) : (
            programs.map((program: any) => (
              <div key={program.id} className="bg-card rounded-lg border border-border p-6 hover:shadow-artisan transition-shadow">
                <h3 className="text-xl font-bold text-foreground mb-2">{program.name}</h3>
                <p className="text-foreground/70 mb-4">{program.description}</p>
                <div className="flex items-center gap-4 mb-4 text-sm text-foreground/60">
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
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-2xl font-bold text-primary">${program.price}</span>
                  <button className="btn-artisan text-sm py-2 px-6">Inscribirse</button>
                </div>
              </div>
            ))
          )}
        </div>

        {!isLoading && programs.length === 0 && (
          <div className="text-center py-16">
            <Palette className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-foreground mb-2">No programas disponibles</h3>
            <p className="text-foreground/60 mb-6">Vuelve pronto</p>
            <Link href="/products"><button className="btn-artisan">Browse Items</button></Link>
          </div>
        )}
      </div>
    </div>
  );
}
