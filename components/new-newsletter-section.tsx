"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Send, Star } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/components/providers/language-provider";

export function NewNewsletterSection() {
  const [email, setEmail] = useState("");
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log("Newsletter subscription:", email);
    setEmail("");
  };

  return (
    <section className="py-20 px-6" style={{ backgroundColor: 'hsl(var(--cream))' }}>
      <div className="max-w-4xl mx-auto relative">
        <Star className="absolute top-4 left-4 w-6 h-6 text-foreground rotate-12" strokeWidth={2} />

        {/* Main card */}
        <div className="bg-card border-2 border-foreground rounded-3xl p-8 md:p-10 shadow-lg relative">
          {/* Decorative sketch border */}
          <div className="absolute inset-0 border-2 border-foreground/20 rounded-3xl transform rotate-1 -z-10"></div>

          <div className="text-left space-y-6">
            {/* Title with Icon */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border-2 border-primary/20 flex-shrink-0">
                <Mail className="w-8 h-8 text-primary" strokeWidth={2} />
              </div>
              <h2 
                className="text-3xl md:text-4xl mb-0"
                style={{ fontFamily: "'Patrick Hand', cursive" }}
              >
                {t('home_newsletter_title')}
              </h2>
            </div>
            <p className="text-muted-foreground text-lg mt-4">
              {t('home_newsletter_description')}
            </p>
            <p className="text-sm mt-2" style={{ color: '#1e40af' }}>
              {t('home_newsletter_no_spam')}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Input
                type="email"
                placeholder={t('home_newsletter_placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 border-2 border-foreground rounded-full px-6 flex-1 font-mono text-sm bg-background focus:border-primary transition-colors"
                required
              />
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 h-14 border-2 border-foreground font-mono text-xs tracking-wider uppercase shadow-md hover:shadow-lg transition-all"
              >
                <Send className="mr-2 h-4 w-4" />
                {t('home_newsletter_subscribe')}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

