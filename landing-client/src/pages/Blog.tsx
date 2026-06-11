import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, Calendar, User } from "lucide-react";
import { getFeaturedArticle, listOtherArticles } from "@/services/blog.service";
import chrome from "@/content/blog-chrome.json";

export default function Blog() {
  const { language } = useLanguage();
  const lang = language;
  const pick = (f: { es: string; en: string }) => f[lang] ?? f.es;

  useEffect(() => {
    document.title = pick(chrome.title) + pick(chrome.docTitleSuffix);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [lang]);

  const featuredArticle = getFeaturedArticle();
  const otherArticles = listOtherArticles();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <BookOpen className="h-3.5 w-3.5" />
              {pick(chrome.badge)}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {pick(chrome.title)}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {pick(chrome.subtitle)}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground mb-8">{pick(chrome.featured)}</h2>
            <div className="rounded-2xl p-8 bg-card border-2 border-primary/30 hover:border-primary/50 transition-all">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{featuredArticle.date[language] ?? featuredArticle.date.es}</span>
                <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{featuredArticle.author}</span>
              </div>
              <h3 className="font-serif text-3xl font-bold text-foreground mb-3">{featuredArticle.title[language] ?? featuredArticle.title.es}</h3>
              <p className="text-muted-foreground text-justify mb-6 max-w-3xl">{featuredArticle.excerpt[language] ?? featuredArticle.excerpt.es}</p>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full gap-2">
                {pick(chrome.readMore)}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section className="py-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">{pick(chrome.latestArticles)}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherArticles.map((article) => (
              <div key={article.id} className="rounded-2xl bg-card border border-border hover:border-primary/20 hover:-translate-y-1 hover:shadow-md transition-all flex flex-col p-6">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4" />{article.date[language] ?? article.date.es}
                </div>
                <h3 className="font-serif text-lg font-bold text-foreground mb-2">{article.title[language] ?? article.title.es}</h3>
                <p className="text-sm text-muted-foreground text-justify flex-1 mb-4">{article.excerpt[language] ?? article.excerpt.es}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />{article.author}
                  </span>
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 gap-1 rounded-full text-xs">
                    {pick(chrome.readMore)}
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">{pick(chrome.stayUpdated)}</h2>
          <p className="text-lg text-muted-foreground mb-8">{pick(chrome.newsletter)}</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="tu@email.com"
              className="flex-grow px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6 whitespace-nowrap">
              {pick(chrome.subscribe)}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">{pick(chrome.privacyNote)}</p>
        </div>
      </section>
    </div>
  );
}
