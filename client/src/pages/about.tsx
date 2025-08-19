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
      <div className="flex items-center justify-center py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center bg-card p-6 rounded-2xl shadow-lg border">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Acerca de Nosotros</h1>
            <p className="text-muted-foreground mb-6 text-sm">
              El contenido de la página "Acerca" aún no ha sido configurado en el CMS.
            </p>
            <p className="text-xs text-muted-foreground">
              Secciones CMS disponibles: {Object.keys(content || {}).join(', ') || 'Ninguna'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-4">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto text-center bg-card p-6 rounded-2xl shadow-lg border">
          {/* Page Header */}
          {(aboutContent.title || aboutContent.titulo) && (
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                {aboutContent.title || aboutContent.titulo}
              </h1>
              {(aboutContent.subtitle || aboutContent.subtitulo) && (
                <p className="text-base text-muted-foreground">
                  {aboutContent.subtitle || aboutContent.subtitulo}
                </p>
              )}
            </div>
          )}

          {/* Hero Image */}
          {(aboutContent.imagen_principal || aboutContent.image) && (
            <div className="mb-6 rounded-lg overflow-hidden shadow-md max-w-xs mx-auto">
              <img
                src={aboutContent.imagen_principal || aboutContent.image}
                alt={aboutContent.title || aboutContent.titulo || "Acerca de nosotros"}
                className="w-full h-32 object-cover"
              />
            </div>
          )}

          {/* Main Content - Only show description to keep it concise */}
          <div className="max-w-md mx-auto">
            {(aboutContent.description || aboutContent.descripcion) && (
              <div className="mb-6">
                <p className="text-sm leading-relaxed text-foreground">
                  {aboutContent.description || aboutContent.descripcion}
                </p>
              </div>
            )}

            {/* Call to Action */}
            {(aboutContent.cta_texto || aboutContent.cta_boton) && (
              <div className="bg-muted/50 p-4 rounded-lg">
                {aboutContent.cta_texto && (
                  <p className="text-sm mb-3 text-foreground">
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
  );
}