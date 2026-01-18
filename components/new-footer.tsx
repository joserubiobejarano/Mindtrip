"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";

export function NewFooter() {
  const { t } = useLanguage();
  return (
    <footer className="py-12 px-6" style={{ backgroundColor: 'hsl(var(--cream))' }}>
      <div className="max-w-6xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Explore Column */}
          <div>
            <h3 
              className="text-lg font-bold mb-4 relative inline-block"
              style={{ fontFamily: "'Patrick Hand', cursive" }}
            >
              {t('footer_explore')}
              <span 
                className="absolute -bottom-1 left-0 right-0 h-1"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 10'%3E%3Cpath d='M0 5 Q 25 0, 50 5 T 100 5' stroke='%23ef4444' fill='none' stroke-width='2'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "repeat-x",
                  backgroundSize: "100px 10px"
                }}
              ></span>
            </h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footer_link_destinations')}</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footer_link_travel_guides')}</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footer_link_trip_planner')}</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 
              className="text-lg font-bold mb-4 relative inline-block"
              style={{ fontFamily: "'Patrick Hand', cursive" }}
            >
              {t('footer_company')}
              <span 
                className="absolute -bottom-1 left-0 right-0 h-1"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 10'%3E%3Cpath d='M0 5 Q 25 0, 50 5 T 100 5' stroke='%2316a34a' fill='none' stroke-width='2'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "repeat-x",
                  backgroundSize: "100px 10px"
                }}
              ></span>
            </h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors" rel="nofollow">{t('footer_link_about')}</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footer_link_press')}</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('footer_link_blog')}</Link></li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 
              className="text-lg font-bold mb-4 relative inline-block"
              style={{ fontFamily: "'Patrick Hand', cursive" }}
            >
              {t('footer_support')}
              <span 
                className="absolute -bottom-1 left-0 right-0 h-1"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 10'%3E%3Cpath d='M0 5 Q 25 0, 50 5 T 100 5' stroke='%23f97316' fill='none' stroke-width='2'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "repeat-x",
                  backgroundSize: "100px 10px"
                }}
              ></span>
            </h3>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors" rel="nofollow">{t('footer_link_contact')}</Link></li>
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors" rel="nofollow">{t('footer_link_privacy')}</Link></li>
              <li><Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors" rel="nofollow">{t('footer_link_cookies')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-dashed border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Made for travelers, with ❤️ by{" "}
            <a
              href="https://x.com/jrubiobejarano_"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              Jose Bejarano
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            {t('footer_copyright_year')}
          </p>
        </div>
      </div>
    </footer>
  );
}

