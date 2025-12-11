"use client";

import Link from "next/link";
import { Compass, Instagram, Twitter, Facebook, Youtube } from "lucide-react";

export function NewFooter() {
  return (
    <footer className="py-12 px-6" style={{ backgroundColor: 'hsl(var(--cream))' }}>
      <div className="max-w-6xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
                <Compass className="w-6 h-6 text-background" strokeWidth={2} />
              </div>
              <span 
                className="text-xl font-bold"
                style={{ fontFamily: "'Patrick Hand', cursive" }}
              >
                Kruno
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your companion for unforgettable adventures around the world
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 border-2 border-foreground rounded-lg flex items-center justify-center hover:bg-foreground hover:text-background transition-colors">
                <Instagram className="w-5 h-5" strokeWidth={2} />
              </a>
              <a href="#" className="w-10 h-10 border-2 border-foreground rounded-lg flex items-center justify-center hover:bg-foreground hover:text-background transition-colors">
                <Twitter className="w-5 h-5" strokeWidth={2} />
              </a>
              <a href="#" className="w-10 h-10 border-2 border-foreground rounded-lg flex items-center justify-center hover:bg-foreground hover:text-background transition-colors">
                <Facebook className="w-5 h-5" strokeWidth={2} />
              </a>
              <a href="#" className="w-10 h-10 border-2 border-foreground rounded-lg flex items-center justify-center hover:bg-foreground hover:text-background transition-colors">
                <Youtube className="w-5 h-5" strokeWidth={2} />
              </a>
            </div>
          </div>

          {/* Explore Column */}
          <div>
            <h3 
              className="text-lg font-bold mb-4 relative inline-block"
              style={{ fontFamily: "'Patrick Hand', cursive" }}
            >
              Explore
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
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Destinations</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Experiences</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Travel Guides</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Trip Planner</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Community</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 
              className="text-lg font-bold mb-4 relative inline-block"
              style={{ fontFamily: "'Patrick Hand', cursive" }}
            >
              Company
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
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors" rel="nofollow">About Us</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Press</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Partners</Link></li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 
              className="text-lg font-bold mb-4 relative inline-block"
              style={{ fontFamily: "'Patrick Hand', cursive" }}
            >
              Support
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
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors" rel="nofollow">Contact Us</Link></li>
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors" rel="nofollow">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors" rel="nofollow">Terms of Service</Link></li>
              <li><Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors" rel="nofollow">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-dashed border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Made with ❤️ by travelers, for travelers
          </p>
          <p className="text-sm text-muted-foreground">
            ©2025 Kruno. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

