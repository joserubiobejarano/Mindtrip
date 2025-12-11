import type { Metadata } from "next";
import { NewNavbar } from "@/components/new-navbar";
import { NewFooter } from "@/components/new-footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy – Kruno",
  description: "Learn about how Kruno uses cookies and similar technologies to improve your experience.",
  openGraph: {
    title: "Cookie Policy – Kruno",
    description: "Learn about how Kruno uses cookies and similar technologies.",
    url: "https://kruno.app/cookies",
    siteName: "Kruno",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cookie Policy – Kruno",
    description: "Learn about Kruno's cookie usage.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <NewNavbar />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 
          className="text-4xl font-bold mb-6"
          style={{ fontFamily: "'Patrick Hand', cursive" }}
        >
          Cookie Policy
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">What Are Cookies?</h2>
            <p className="text-muted-foreground">
              Cookies are small text files that are placed on your device when you visit a website. 
              They are widely used to make websites work more efficiently and provide information to 
              the website owners. Cookies allow websites to remember your preferences and improve your 
              browsing experience.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Cookies</h2>
            <p className="text-muted-foreground mb-4">
              Kruno uses cookies for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Essential Cookies:</strong> Required for the Service to function properly, including authentication and session management</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences (e.g., cookie consent, display preferences)</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our Service (only with your consent)</li>
              <li><strong>Functional Cookies:</strong> Enable enhanced functionality and personalization</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cookie Consent</h2>
            <p className="text-muted-foreground">
              When you first visit Kruno, we ask for your consent to use non-essential cookies. You can 
              choose to accept all cookies or only essential cookies. You can change your cookie preferences 
              at any time through your browser settings or by clearing your browser's stored preferences.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Managing Cookies</h2>
            <p className="text-muted-foreground mb-4">
              You can control and manage cookies in several ways:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Browser settings allow you to refuse or delete cookies</li>
              <li>Most browsers automatically accept cookies, but you can modify settings to decline them</li>
              <li>Note that disabling cookies may impact your experience on our Service</li>
              <li>Essential cookies cannot be disabled as they are necessary for the Service to function</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Third-party Cookies</h2>
            <p className="text-muted-foreground">
              Some cookies are placed by third-party services that appear on our pages. These may include 
              analytics services, payment processors, and other service providers. We do not control the 
              setting of these cookies, so we recommend checking the third-party websites for more information 
              about their cookie practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">More Information</h2>
            <p className="text-muted-foreground">
              For more information about how we handle your personal information, please see our{" "}
              <Link href="/privacy" className="text-primary hover:underline" rel="nofollow">
                Privacy Policy
              </Link>
              . If you have questions about our use of cookies, please contact us at{" "}
              <a href="mailto:support@kruno.app" className="text-primary hover:underline">
                support@kruno.app
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <NewFooter />
    </div>
  );
}
