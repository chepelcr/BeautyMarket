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

  const aboutContent = content?.about || {};
  
  // If no about content exists, show a fallback
  if (!content || Object.keys(aboutContent).length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-foreground mb-6">Acerca de Nosotros</h1>
              <p className="text-muted-foreground mb-8">
                El contenido de la página "Acerca" aún no ha sido configurado en el CMS.
              </p>
              <p className="text-sm text-muted-foreground">
                Secciones CMS disponibles: {Object.keys(content || {}).join(', ') || 'Ninguna'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            {/* Page Header */}
            {(aboutContent.title || aboutContent.titulo) && (
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {aboutContent.title || aboutContent.titulo}
                </h1>
                {(aboutContent.subtitle || aboutContent.subtitulo) && (
                  <p className="text-lg text-muted-foreground">
                    {aboutContent.subtitle || aboutContent.subtitulo}
                  </p>
                )}
              </div>
            )}

            {/* Hero Image */}
            {(aboutContent.imagen_principal || aboutContent.image) && (
              <div className="mb-8 rounded-lg overflow-hidden shadow-lg max-w-lg mx-auto">
                <img
                  src={aboutContent.imagen_principal || aboutContent.image}
                  alt={aboutContent.title || aboutContent.titulo || "Acerca de nosotros"}
                  className="w-full h-48 md:h-56 object-cover"
                />
              </div>
            )}

            {/* Main Content */}
            <div className="max-w-xl mx-auto">
              {(aboutContent.description || aboutContent.descripcion) && (
                <div className="mb-6">
                  <p className="text-base leading-relaxed text-foreground">
                    {aboutContent.description || aboutContent.descripcion}
                  </p>
                </div>
              )}

              {aboutContent.historia && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3 text-center">Nuestra Historia</h2>
                  <p className="text-foreground leading-relaxed text-sm">
                    {aboutContent.historia}
                  </p>
                </div>
              )}

              {aboutContent.mision && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3 text-center">Nuestra Misión</h2>
                  <p className="text-foreground leading-relaxed text-sm">
                    {aboutContent.mision}
                  </p>
                </div>
              )}

              {aboutContent.vision && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3 text-center">Nuestra Visión</h2>
                  <p className="text-foreground leading-relaxed text-sm">
                    {aboutContent.vision}
                  </p>
                </div>
              )}

              {aboutContent.valores && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3 text-center">Nuestros Valores</h2>
                  <div className="text-foreground leading-relaxed text-sm">
                    {aboutContent.valores.split('\n').map((value: string, index: number) => (
                      <p key={index} className="mb-1">{value}</p>
                    ))}
                  </div>
                </div>
              )}

              {aboutContent.equipo && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3 text-center">Nuestro Equipo</h2>
                  <p className="text-foreground leading-relaxed text-sm">
                    {aboutContent.equipo}
                  </p>
                </div>
              )}

              {aboutContent.compromiso && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3 text-center">Nuestro Compromiso</h2>
                  <p className="text-foreground leading-relaxed text-sm">
                    {aboutContent.compromiso}
                  </p>
                </div>
              )}

              {/* Call to Action */}
              {(aboutContent.cta_texto || aboutContent.cta_boton) && (
                <div className="mt-8 bg-muted p-6 rounded-lg">
                  {aboutContent.cta_texto && (
                    <p className="text-base mb-3 text-foreground">
                      {aboutContent.cta_texto}
                    </p>
                  )}
                  {aboutContent.cta_boton && aboutContent.cta_enlace && (
                    <a
                      href={aboutContent.cta_enlace}
                      className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm"
                    >
                      {aboutContent.cta_boton}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}