import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import contact from "@/content/contact.json";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";

export default function Contact() {
  const { language: lang } = useLanguage();
  const pick = (f: { es: string; en: string }) => f[lang] ?? f.es;
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    document.title = pick(contact.title) + pick(contact.docTitleSuffix);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [lang]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: Mail,   label: pick(contact.info.email),   value: contact.contactInfo.email },
    { icon: Phone,  label: pick(contact.info.phone),   value: contact.contactInfo.phone },
    { icon: MapPin, label: pick(contact.info.address), value: contact.contactInfo.address },
  ];

  const inputClass = "w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <MessageSquare className="h-3.5 w-3.5" />
              {pick(contact.badge)}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {pick(contact.title)}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {pick(contact.subtitle)}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">

            {/* Form */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">{pick(contact.sendMessage)}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                    {pick(contact.form.name)}
                  </label>
                  <input type="text" id="name" name="name" value={formData.name}
                    onChange={handleInputChange} required className={inputClass}
                    placeholder={pick(contact.form.namePlaceholder)} />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                    {pick(contact.form.email)}
                  </label>
                  <input type="email" id="email" name="email" value={formData.email}
                    onChange={handleInputChange} required className={inputClass}
                    placeholder={pick(contact.form.emailPlaceholder)} />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1">
                    {pick(contact.form.subject)}
                  </label>
                  <input type="text" id="subject" name="subject" value={formData.subject}
                    onChange={handleInputChange} required className={inputClass}
                    placeholder={pick(contact.form.subjectPlaceholder)} />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">
                    {pick(contact.form.message)}
                  </label>
                  <textarea id="message" name="message" value={formData.message}
                    onChange={handleInputChange} required rows={5}
                    className={`${inputClass} resize-none`}
                    placeholder={pick(contact.form.messagePlaceholder)} />
                </div>
                <Button type="submit" disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
                  {isSubmitting ? pick(contact.form.sending) : pick(contact.form.submit)}
                </Button>

                {submitStatus === 'success' && (
                  <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
                    <p className="text-sm text-success">{pick(contact.form.success)}</p>
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <p className="text-sm text-destructive">{pick(contact.error)}. {pick(contact.tryAgain)}</p>
                  </div>
                )}
              </form>
            </div>

            {/* Info */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">{pick(contact.otherWays)}</h2>
              <div className="space-y-4">
                {contactInfo.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all">
                    <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{label}</p>
                      <p className="text-muted-foreground text-sm">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-6 bg-primary/10 rounded-xl border border-primary/20">
                <h3 className="font-semibold text-foreground mb-2">{pick(contact.responseTime)}</h3>
                <p className="text-sm text-muted-foreground text-justify">{pick(contact.responseTimeDesc)}</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
