import { Link } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useProducts } from "@/hooks/useContent";
import { BookOpen, Clock, Target } from "lucide-react";

export default function ProgramsPage() {
  const { data: programs = [], isLoading } = useProducts({ type: 'program' });

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="bg-gradient-orange-blue py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4">
            <BookOpen className="w-5 h-5" />
            <span className="font-semibold">Learning Programs</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Programs</h1>
          <p className="text-xl text-white/90">Structured learning paths for success</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-muted-foreground">
              <span className="font-bold text-foreground">{programs.length}</span> programas disponibles
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-96" />)
            ) : (
              programs.map((program: any) => (
                <div key={program.id} className="card-modern p-6">
                  <h3 className="text-xl font-bold mb-2">{program.name}</h3>
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
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-2xl font-bold text-primary">${program.price}</span>
                    <button className="btn-primary px-6 py-2 rounded-md font-semibold shadow-orange">Inscribirse</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {!isLoading && programs.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold mb-2">No programas disponibles</h3>
              <Link href="/products"><a className="btn-primary px-8 py-3 rounded-md font-semibold shadow-orange">Ver Productos</a></Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
