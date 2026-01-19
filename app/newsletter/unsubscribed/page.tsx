import type { Metadata } from "next";
import Link from "next/link";
import { NewNavbar } from "@/components/new-navbar";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Unsubscribed – Kruno",
  description: "You have been unsubscribed from the newsletter.",
  path: "/newsletter/unsubscribed",
  robots: {
    index: false,
    follow: false,
  },
});

const STATUS_COPY: Record<string, { title: string; description: string }> = {
  invalid: {
    title: "Unsubscribe link not found",
    description: "This unsubscribe link is invalid or has expired.",
  },
  error: {
    title: "Something went wrong",
    description: "We couldn't process your request. Please try again.",
  },
  success: {
    title: "You're unsubscribed",
    description: "You won't receive marketing emails from us anymore.",
  },
};

export default async function NewsletterUnsubscribedPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const statusKey = resolvedSearchParams?.status || "success";
  const copy = STATUS_COPY[statusKey] ?? STATUS_COPY.success;

  return (
    <div className="min-h-screen bg-background">
      <NewNavbar />
      <main className="px-6 pt-24 pb-16">
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">
            {copy.title}
          </h1>
          <p className="text-muted-foreground mb-8">{copy.description}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border-2 border-foreground bg-primary px-6 py-3 text-xs font-mono uppercase tracking-wider text-primary-foreground shadow-md hover:shadow-lg transition-all"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
