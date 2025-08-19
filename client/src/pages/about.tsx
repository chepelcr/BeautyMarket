import { useCmsContent } from "@/hooks/use-cms-content";
import { Loader2 } from "lucide-react";

export default function AboutPage() {
  const { content, isLoading, error } = useCmsContent();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error al cargar contenido</h2>
          <p className="text-muted-foreground">Intenta recargar la página</p>
        </div>
      </div>
    );
  }

  const aboutContent = content?.acerca || {};

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          {aboutContent.titulo && (
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {aboutContent.titulo}
              </h1>
              {aboutContent.subtitulo && (
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {aboutContent.subtitulo}
                </p>
              )}
            </div>
          )}

          {/* Hero Image */}
          {aboutContent.imagen_principal && (
            <div className="mb-12 rounded-lg overflow-hidden shadow-lg">
              <img
                src={aboutContent.imagen_principal}
                alt={aboutContent.titulo || "Acerca de nosotros"}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
          )}

          {/* Main Content */}
          <div className="prose prose-lg max-w-none dark:prose-invert">
            {aboutContent.descripcion && (
              <div className="mb-8">
                <p className="text-lg leading-relaxed text-foreground">
                  {aboutContent.descripcion}
                </p>
              </div>
            )}

            {aboutContent.historia && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Nuestra Historia</h2>
                <p className="text-foreground leading-relaxed">
                  {aboutContent.historia}
                </p>
              </div>
            )}

            {aboutContent.mision && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Nuestra Misión</h2>
                <p className="text-foreground leading-relaxed">
                  {aboutContent.mision}
                </p>
              </div>
            )}

            {aboutContent.vision && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Nuestra Visión</h2>
                <p className="text-foreground leading-relaxed">
                  {aboutContent.vision}
                </p>
              </div>
            )}

            {aboutContent.valores && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Nuestros Valores</h2>
                <div className="text-foreground leading-relaxed">
                  {aboutContent.valores.split('\n').map((value: string, index: number) => (
                    <p key={index} className="mb-2">{value}</p>
                  ))}
                </div>
              </div>
            )}

            {aboutContent.equipo && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Nuestro Equipo</h2>
                <p className="text-foreground leading-relaxed">
                  {aboutContent.equipo}
                </p>
              </div>
            )}

            {aboutContent.compromiso && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Nuestro Compromiso</h2>
                <p className="text-foreground leading-relaxed">
                  {aboutContent.compromiso}
                </p>
              </div>
            )}
          </div>

          {/* Call to Action */}
          {(aboutContent.cta_texto || aboutContent.cta_boton) && (
            <div className="mt-12 text-center bg-muted p-8 rounded-lg">
              {aboutContent.cta_texto && (
                <p className="text-lg mb-4 text-foreground">
                  {aboutContent.cta_texto}
                </p>
              )}
              {aboutContent.cta_boton && aboutContent.cta_enlace && (
                <a
                  href={aboutContent.cta_enlace}
                  className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  {aboutContent.cta_boton}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}