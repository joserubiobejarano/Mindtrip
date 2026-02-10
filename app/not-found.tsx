import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MarketingNavbar } from "@/components/marketing-navbar";
import { NewFooter } from "@/components/new-footer";

export default async function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MarketingNavbar isSignedIn={false} />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-2xl text-center space-y-6">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            404
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold">Page not found</h1>
          <p className="text-lg text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or may have been
            moved. Let&apos;s get you back on track.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/">
              <Button className="rounded-full">Back to home</Button>
            </Link>
            <Link href="/trips">
              <Button variant="outline" className="rounded-full">
                View my trips
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <NewFooter />
    </div>
  );
}
