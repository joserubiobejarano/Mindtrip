import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full py-4 px-6 md:px-12 bg-background/80 backdrop-blur-sm border-b border-border/40">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="md" />
          </Link>
          <Link
            href="/sign-in"
            className="font-mono text-xs tracking-wider uppercase hover:text-primary transition-colors"
          >
            Log in
          </Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
