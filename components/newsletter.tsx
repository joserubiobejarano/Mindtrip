import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Send } from 'lucide-react';
import { useState } from 'react';

export function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10"></div>
      
      {/* Decorative elements */}
      <svg className="absolute top-10 left-10 w-32 h-32 text-primary/20" viewBox="0 0 100 100">
        <path d="M50,10 L60,40 L90,50 L60,60 L50,90 L40,60 L10,50 L40,40 Z" fill="currentColor" />
      </svg>
      <svg className="absolute bottom-10 right-10 w-40 h-40 text-accent/20" viewBox="0 0 100 100">
        <circle cx="30" cy="30" r="25" fill="currentColor" />
        <circle cx="70" cy="70" r="20" fill="currentColor" />
      </svg>

      <div className="container max-w-4xl mx-auto relative z-10">
        <div className="bg-card border-4 border-border rounded-3xl p-12 shadow-2xl transform hover:scale-105 transition-transform">
          {/* Sketch border effect */}
          <div className="absolute inset-0 border-4 border-primary/30 rounded-3xl transform rotate-2 -z-10"></div>
          
          <div className="text-center space-y-6">
            <div className="inline-block relative">
              <Mail className="w-16 h-16 text-primary mx-auto mb-4 animate-bounce" />
              <svg className="absolute -inset-4 -z-10" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-primary/30" />
              </svg>
            </div>

            <div>
              <h2 className="text-5xl mb-4 relative inline-block">
                Get Travel Inspiration
                <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 400 8" preserveAspectRatio="none">
                  <path d="M0,4 Q100,1 200,4 T400,4" fill="none" stroke="#ffd93d" strokeWidth="2" />
                </svg>
              </h2>
              <p className="text-xl text-muted-foreground mt-6">
                Subscribe to our newsletter for weekly travel tips, destination guides, and exclusive deals!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto pt-6">
              <Input
                type="email"
                placeholder="your.email@adventure.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-14 border-2 border-border bg-input-background rounded-full px-6 focus:border-primary transition-colors"
                required
              />
              <Button
                type="submit"
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 shadow-lg transform hover:scale-105 hover:rotate-3 transition-all h-14"
              >
                <Send className="mr-2 h-5 w-5" />
                Subscribe
              </Button>
            </form>

            <p className="text-sm text-muted-foreground pt-4">
              Join <span className="text-primary">10,000+</span> travelers already subscribed! 
              <br />
              We respect your privacy and never spam 🎉
            </p>

            {/* Decorative doodles */}
            <div className="flex justify-center gap-8 pt-8 opacity-50">
              <svg className="w-8 h-8 text-primary" viewBox="0 0 50 50">
                <path d="M25,5 L30,20 L45,20 L33,30 L38,45 L25,35 L12,45 L17,30 L5,20 L20,20 Z" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              <svg className="w-8 h-8 text-accent" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              <svg className="w-8 h-8 text-secondary" viewBox="0 0 50 50">
                <path d="M10,25 Q10,10 25,10 Q40,10 40,25 Q40,35 25,45 Q10,35 10,25" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
