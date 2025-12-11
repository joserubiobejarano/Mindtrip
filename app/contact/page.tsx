import type { Metadata } from "next";
import { NewNavbar } from "@/components/new-navbar";
import { NewFooter } from "@/components/new-footer";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us – Kruno",
  description: "Get in touch with the Kruno team. We're here to help with questions, feedback, or support requests.",
  openGraph: {
    title: "Contact Us – Kruno",
    description: "Get in touch with the Kruno team. We're here to help with questions, feedback, or support requests.",
    url: "https://kruno.app/contact",
    siteName: "Kruno",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us – Kruno",
    description: "Get in touch with the Kruno team.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <NewNavbar />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 
          className="text-4xl font-bold mb-6"
          style={{ fontFamily: "'Patrick Hand', cursive" }}
        >
          Contact
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Have a question, feedback, or need support? We'd love to hear from you!
          </p>
          
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Email Us</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Send us an email at:
            </p>
            <a 
              href="mailto:support@kruno.app"
              className="text-primary hover:underline text-lg font-medium"
            >
              support@kruno.app
            </a>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Response Time</h2>
            <p className="text-muted-foreground">
              We typically respond within 24-48 hours during business days. For urgent matters, 
              please include "URGENT" in your subject line.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">What We Can Help With</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Technical support and troubleshooting</li>
              <li>Feature requests and feedback</li>
              <li>Account and billing questions</li>
              <li>Partnership and collaboration inquiries</li>
              <li>General questions about Kruno</li>
            </ul>
          </section>
        </div>
      </main>
      <NewFooter />
    </div>
  );
}
