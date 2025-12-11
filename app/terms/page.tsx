import type { Metadata } from "next";
import { NewNavbar } from "@/components/new-navbar";
import { NewFooter } from "@/components/new-footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service – Kruno",
  description: "Read Kruno's Terms of Service to understand the rules and guidelines for using our platform.",
  openGraph: {
    title: "Terms of Service – Kruno",
    description: "Read Kruno's Terms of Service to understand the rules and guidelines for using our platform.",
    url: "https://kruno.app/terms",
    siteName: "Kruno",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service – Kruno",
    description: "Read Kruno's Terms of Service.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <NewNavbar />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 
          className="text-4xl font-bold mb-6"
          style={{ fontFamily: "'Patrick Hand', cursive" }}
        >
          Terms of Service
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="text-muted-foreground">
              Welcome to Kruno. These Terms of Service (&quot;Terms&quot;) govern your access to and use of Kruno&apos;s 
              website, mobile applications, and services (collectively, the &quot;Service&quot;). By accessing or 
              using our Service, you agree to be bound by these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Use of Service</h2>
            <p className="text-muted-foreground mb-4">
              You may use our Service only for lawful purposes and in accordance with these Terms. You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Transmit any harmful or malicious code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the Service to spam or harass others</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Payments</h2>
            <p className="text-muted-foreground">
              Kruno offers both free and paid subscription plans. By subscribing to a paid plan, you agree 
              to pay the fees associated with your chosen subscription. All fees are processed through our 
              third-party payment processor, Stripe. Subscription fees are billed in advance on a recurring 
              basis according to your subscription term.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cancellation</h2>
            <p className="text-muted-foreground">
              You may cancel your subscription at any time through your account settings or by contacting 
              support. Cancellation will take effect at the end of your current billing period. You will 
              continue to have access to Pro features until the end of the billing period for which you 
              have already paid.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Liability</h2>
            <p className="text-muted-foreground">
              Kruno provides the Service &quot;as is&quot; without warranties of any kind. We are not responsible 
              for the accuracy, completeness, or usefulness of any information provided through the Service. 
              We shall not be liable for any indirect, incidental, special, or consequential damages arising 
              from your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
              in which Kruno operates, without regard to its conflict of law provisions. Any disputes arising 
              from these Terms or your use of the Service shall be resolved in the appropriate courts of 
              that jurisdiction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these Terms at any time. We will notify users of any material 
              changes by posting the updated Terms on this page and updating the &quot;Last updated&quot; date. 
              Your continued use of the Service after such changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms, please contact us at{" "}
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
