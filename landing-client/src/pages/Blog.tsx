import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, Calendar, User } from "lucide-react";

export default function Blog() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('blog.title') + " | JMarkets";
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [t]);

  const articles = [
    { id: 1, title: t('blog.article1.title'), excerpt: t('blog.article1.excerpt'), date: t('blog.article1.date'), author: t('blog.article1.author'), featured: true },
    { id: 2, title: t('blog.article2.title'), excerpt: t('blog.article2.excerpt'), date: t('blog.article2.date'), author: t('blog.article2.author') },
    { id: 3, title: t('blog.article3.title'), excerpt: t('blog.article3.excerpt'), date: t('blog.article3.date'), author: t('blog.article3.author') },
    { id: 4, title: t('blog.article4.title'), excerpt: t('blog.article4.excerpt'), date: t('blog.article4.date'), author: t('blog.article4.author') },
    { id: 5, title: t('blog.article5.title'), excerpt: t('blog.article5.excerpt'), date: t('blog.article5.date'), author: t('blog.article5.author') },
    { id: 6, title: t('blog.article6.title'), excerpt: t('blog.article6.excerpt'), date: t('blog.article6.date'), author: t('blog.article6.author') },
  ];

  const featuredArticle = articles.find(a => a.featured);
  const otherArticles = articles.filter(a => !a.featured);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <BookOpen className="h-3.5 w-3.5" />
              {t('blog.badge')}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {t('blog.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('blog.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground mb-8">{t('blog.featured')}</h2>
            <div className="rounded-2xl p-8 bg-card border-2 border-primary/30 hover:border-primary/50 transition-all">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{featuredArticle.date}</span>
                <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{featuredArticle.author}</span>
              </div>
              <h3 className="font-serif text-3xl font-bold text-foreground mb-3">{featuredArticle.title}</h3>
              <p className="text-muted-foreground text-justify mb-6 max-w-3xl">{featuredArticle.excerpt}</p>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full gap-2">
                {t('blog.readMore')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section className="py-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">{t('blog.latestArticles')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherArticles.map((article) => (
              <div key={article.id} className="rounded-2xl bg-card border border-border hover:border-primary/20 hover:-translate-y-1 hover:shadow-md transition-all flex flex-col p-6">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4" />{article.date}
                </div>
                <h3 className="font-serif text-lg font-bold text-foreground mb-2">{article.title}</h3>
                <p className="text-sm text-muted-foreground text-justify flex-1 mb-4">{article.excerpt}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />{article.author}
                  </span>
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 gap-1 rounded-full text-xs">
                    {t('blog.readMore')}
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
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">{t('blog.stayUpdated')}</h2>
          <p className="text-lg text-muted-foreground mb-8">{t('blog.newsletter')}</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="tu@email.com"
              className="flex-grow px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6 whitespace-nowrap">
              {t('blog.subscribe')}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">{t('blog.privacyNote')}</p>
        </div>
      </section>
    </div>
  );
}
