import { Compass, Instagram, Twitter, Facebook, Youtube, Heart } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-muted/40 border-t-4 border-border py-12 px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <svg className="absolute bottom-0 left-0 w-64 h-64 text-primary/5" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" fill="currentColor" />
      </svg>
      <svg className="absolute top-0 right-0 w-48 h-48 text-accent/5" viewBox="0 0 200 200">
        <path d="M20,100 Q60,20 100,60 T180,100 Q140,180 100,140 T20,100" fill="currentColor" />
      </svg>

      <div className="container max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Compass className="h-10 w-10 text-primary rotate-12" strokeWidth={2.5} />
                <div className="absolute inset-0 -z-10">
                  <Compass className="h-10 w-10 text-primary/20 -rotate-6" strokeWidth={2.5} />
                </div>
              </div>
              <h3 className="text-2xl text-primary m-0">MindTrip</h3>
            </div>
            <p className="text-muted-foreground">
              Your companion for unforgettable adventures around the world
            </p>
            <div className="flex gap-3">
              <Link href="#" className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all transform hover:scale-110 hover:rotate-12">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all transform hover:scale-110 hover:rotate-12">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all transform hover:scale-110 hover:rotate-12">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all transform hover:scale-110 hover:rotate-12">
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xl mb-4 relative inline-block">
              Explore
              <svg className="absolute -bottom-1 left-0 w-full h-2" viewBox="0 0 100 4" preserveAspectRatio="none">
                <path d="M0,2 Q25,0 50,2 T100,2" fill="none" stroke="#ff6b6b" strokeWidth="1" />
              </svg>
            </h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Destinations</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Experiences</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Travel Guides</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Trip Planner</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Community</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xl mb-4 relative inline-block">
              Company
              <svg className="absolute -bottom-1 left-0 w-full h-2" viewBox="0 0 100 4" preserveAspectRatio="none">
                <path d="M0,2 Q25,0 50,2 T100,2" fill="none" stroke="#6bcf7f" strokeWidth="1" />
              </svg>
            </h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Press</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Partners</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xl mb-4 relative inline-block">
              Support
              <svg className="absolute -bottom-1 left-0 w-full h-2" viewBox="0 0 100 4" preserveAspectRatio="none">
                <path d="M0,2 Q25,0 50,2 T100,2" fill="none" stroke="#ffd93d" strokeWidth="1" />
              </svg>
            </h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t-2 border-dashed border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground flex items-center gap-2">
            Made with <Heart className="w-4 h-4 text-primary fill-primary animate-pulse" /> by travelers, for travelers
          </p>
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} MindTrip. All rights reserved.
          </p>
        </div>

        {/* Decorative doodles */}
        <div className="flex justify-center gap-4 mt-8 opacity-30">
          <svg className="w-6 h-6 text-primary" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3,3" />
          </svg>
          <svg className="w-6 h-6 text-accent" viewBox="0 0 50 50">
            <path d="M10,25 L25,10 L40,25 L25,40 Z" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          <svg className="w-6 h-6 text-secondary" viewBox="0 0 50 50">
            <path d="M25,5 L30,20 L45,20 L33,30 L38,45 L25,35 L12,45 L17,30 L5,20 L20,20 Z" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </footer>
  );
}

