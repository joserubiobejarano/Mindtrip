import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNavbar } from "@/components/marketing-navbar";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Newsletter confirmed – Kruno",
  description: "Your newsletter subscription is confirmed.",
  path: "/newsletter/confirmed",
  robots: {
    index: false,
    follow: false,
  },
});

const STATUS_COPY: Record<string, { title: string; description: string }> = {
  invalid: {
    title: "Confirmation link not found",
    description: "This confirmation link is invalid or has expired.",
  },
  error: {
    title: "Something went wrong",
    description: "We couldn't confirm your subscription. Please try again.",
  },
  already: {
    title: "You're already confirmed",
    description: "You're already subscribed to the Kruno newsletter.",
  },
  success: {
    title: "You're confirmed!",
    description: "Thanks for confirming. You'll start receiving travel tips soon.",
  },
};

export default async function NewsletterConfirmedPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const statusKey = resolvedSearchParams?.status || "success";
  const copy = STATUS_COPY[statusKey] ?? STATUS_COPY.success;

  return (
    <div className="min-h-screen bg-background">
      <MarketingNavbar isSignedIn={false} />
      <main className="px-6 pt-24 pb-16">
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">
            {copy.title}
          </h1>
          <p className="text-muted-foreground mb-8">{copy.description}</p>
          <Link
            href="/discover-kruno"
            className="inline-flex items-center justify-center rounded-full border-2 border-foreground bg-primary px-6 py-3 text-xs font-mono uppercase tracking-wider text-primary-foreground shadow-md hover:shadow-lg transition-all"
          >
            Discover Kruno
          </Link>
        </div>
      </main>
    </div>
  );
}
