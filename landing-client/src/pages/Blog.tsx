import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Calendar, User } from "lucide-react";

export default function Blog() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('blog.title') + " | JMarkets";
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [t]);

  const articles = [
    {
      id: 1,
      title: t('blog.article1.title'),
      excerpt: t('blog.article1.excerpt'),
      date: t('blog.article1.date'),
      author: t('blog.article1.author'),
      featured: true
    },
    {
      id: 2,
      title: t('blog.article2.title'),
      excerpt: t('blog.article2.excerpt'),
      date: t('blog.article2.date'),
      author: t('blog.article2.author')
    },
    {
      id: 3,
      title: t('blog.article3.title'),
      excerpt: t('blog.article3.excerpt'),
      date: t('blog.article3.date'),
      author: t('blog.article3.author')
    },
    {
      id: 4,
      title: t('blog.article4.title'),
      excerpt: t('blog.article4.excerpt'),
      date: t('blog.article4.date'),
      author: t('blog.article4.author')
    },
    {
      id: 5,
      title: t('blog.article5.title'),
      excerpt: t('blog.article5.excerpt'),
      date: t('blog.article5.date'),
      author: t('blog.article5.author')
    },
    {
      id: 6,
      title: t('blog.article6.title'),
      excerpt: t('blog.article6.excerpt'),
      date: t('blog.article6.date'),
      author: t('blog.article6.author')
    }
  ];

  const featuredArticle = articles.find(a => a.featured);
  const otherArticles = articles.filter(a => !a.featured);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <section className="bg-white dark:bg-slate-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              <FileText className="h-3 w-3 mr-1" />
              {t('blog.badge')}
            </Badge>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('blog.title')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('blog.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              {t('blog.featured')}
            </h2>

            <Card className="bg-white dark:bg-slate-800 border-2 border-primary">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {featuredArticle.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {featuredArticle.author}
                  </div>
                </div>
                <CardTitle className="text-3xl">{featuredArticle.title}</CardTitle>
                <CardDescription className="text-base text-justify">
                  {featuredArticle.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="btn-primary">
                  {t('blog.readMore')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {t('blog.latestArticles')}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherArticles.map((article) => (
              <Card key={article.id} className="bg-white dark:bg-slate-800 flex flex-col">
                <CardHeader className="space-y-3 flex-grow">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {article.date}
                  </div>
                  <CardTitle className="text-xl">{article.title}</CardTitle>
                  <CardDescription className="text-justify">{article.excerpt}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {article.author}
                  </div>
                  <Button variant="outline" className="w-full group">
                    {t('blog.readMore')}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('blog.stayUpdated')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            {t('blog.newsletter')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-grow px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Button className="btn-primary whitespace-nowrap">
              {t('blog.subscribe')}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            {t('blog.privacyNote')}
          </p>
        </div>
      </section>
    </div>
  );
}
