import { Link } from 'wouter';
import { Cpu, Clock, Target } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useProducts } from '@/hooks/useContent';

export default function ProgramsPage() {
  const { data: programs = [], isLoading } = useProducts({ type: 'program' });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar cartItemCount={0} />

      <section className="relative overflow-hidden grid-pattern scanlines">
        <div className="container-tech py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-tech-electric/20 text-tech-electric rounded-sm mb-6">
              <Cpu className="w-5 h-5" />
              <span className="font-bold">LEARNING PATHS</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-tech-shadow">
              <span className="animated-gradient-text">Tech Programs</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Master technology with structured learning programs
            </p>
          </div>
        </div>
      </section>

      <section className="container-tech py-16">
        <div className="mb-6">
          <p className="text-muted-foreground">
            <span className="text-foreground font-medium">{programs.length}</span> programas disponibles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <div key={i} className="card-tech animate-pulse h-96" />)
          ) : (
            programs.map((program: any) => (
              <div key={program.id} className="card-tech p-6">
                <h3 className="text-xl font-semibold mb-2 text-tech-cyan">{program.name}</h3>
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
                  <span className="text-2xl font-bold text-tech-cyan">${program.price}</span>
                  <button className="btn-tech-accent text-sm py-2 px-6">Inscribirse</button>
                </div>
              </div>
            ))
          )}
        </div>

        {!isLoading && programs.length === 0 && (
          <div className="text-center py-16">
            <Cpu className="h-16 w-16 text-tech-cyan mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold mb-2">No programas disponibles</h3>
            <Link href="/products"><button className="btn-tech-accent">Ver Productos</button></Link>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
