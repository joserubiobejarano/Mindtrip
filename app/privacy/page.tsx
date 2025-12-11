import type { Metadata } from "next";
import { NewNavbar } from "@/components/new-navbar";
import { NewFooter } from "@/components/new-footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy – Kruno",
  description: "Learn how Kruno collects, uses, and protects your personal information. Your privacy is important to us.",
  openGraph: {
    title: "Privacy Policy – Kruno",
    description: "Learn how Kruno collects, uses, and protects your personal information.",
    url: "https://kruno.app/privacy",
    siteName: "Kruno",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy – Kruno",
    description: "Learn how Kruno protects your privacy.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <NewNavbar />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 
          className="text-4xl font-bold mb-6"
          style={{ fontFamily: "'Patrick Hand', cursive" }}
        >
          Privacy Policy
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data We Collect</h2>
            <p className="text-muted-foreground mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Account information (name, email address) through our authentication provider</li>
              <li>Trip data (destinations, dates, activities, preferences)</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Usage data and analytics to improve our service</li>
              <li>Communications you send to us</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Data</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide, maintain, and improve our Service</li>
              <li>Process transactions and manage subscriptions</li>
              <li>Send you service-related communications</li>
              <li>Personalize your experience and generate AI-powered itineraries</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
            <p className="text-muted-foreground">
              We use cookies and similar tracking technologies to track activity on our Service and store 
              certain information. You can control cookie preferences through your browser settings. For more 
              detailed information about our use of cookies, please see our{" "}
              <Link href="/cookies" className="text-primary hover:underline" rel="nofollow">
                Cookie Policy
              </Link>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Third-party Services</h2>
            <p className="text-muted-foreground mb-4">
              We use trusted third-party services to operate our platform:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Clerk:</strong> Authentication and user management</li>
              <li><strong>Supabase:</strong> Database and backend services</li>
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>Google Places API:</strong> Location and place data</li>
              <li><strong>OpenAI:</strong> AI-powered itinerary generation</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              These services have their own privacy policies governing the use of your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              Depending on your location, you may have certain rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent where applicable</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              To exercise these rights, please contact us at{" "}
              <a href="mailto:support@kruno.app" className="text-primary hover:underline">
                support@kruno.app
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. However, 
              no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:support@kruno.app" className="text-primary hover:underline">
                support@kruno.app
              </a>
              {" "}or visit our{" "}
              <Link href="/contact" className="text-primary hover:underline" rel="nofollow">
                contact page
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
      <NewFooter />
    </div>
  );
}
