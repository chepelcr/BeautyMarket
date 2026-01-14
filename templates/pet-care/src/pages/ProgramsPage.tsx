import React from 'react';
import { Link } from 'wouter';
import { GraduationCap, Clock, Target } from 'lucide-react';
import { useProducts } from '@/hooks/useContent';

const ProgramsPage: React.FC = () => {
  const { data: programs = [], isLoading } = useProducts({ type: 'program' });

  return (
    <div className="relative z-10">
      <section className="bg-gradient-to-r from-primary via-secondary to-accent py-16 mb-12">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl mb-4">
            <GraduationCap className="w-5 h-5 text-white" />
            <span className="font-bold text-white">Training Programs</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Pet Training Programs</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Structured training courses for your pets
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing <span className="font-bold text-foreground">{programs.length}</span> programs
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-card rounded-2xl h-96 border-2 border-border" />
            ))}
          </div>
        ) : programs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program: any) => (
              <div key={program.id} className="bg-card rounded-2xl border-2 border-border p-6 hover:border-primary transition-all">
                <h3 className="text-xl font-bold text-foreground mb-2">{program.name}</h3>
                <p className="text-muted-foreground mb-4">{program.description}</p>
                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
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
                  <button className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-semibold hover:scale-105 transition-transform">
                    Inscribirse
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <GraduationCap className="w-16 h-16 text-primary/30 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">No programas disponibles</h3>
            <p className="text-muted-foreground mb-6">Vuelve pronto</p>
            <Link href="/products">
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-transform">
                Ver Productos
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramsPage;
