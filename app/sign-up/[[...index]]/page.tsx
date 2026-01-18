import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Sign Up – Kruno",
  description: "Create a Kruno account to start planning your next trip.",
  path: "/sign-up",
  robots: {
    index: false,
    follow: false,
  },
});

type SignUpPageProps = {
  searchParams?: Promise<{ redirect_url?: string | string[] }>;
};

const getSafeRedirectUrl = (value?: string | string[]) => {
  const redirectValue = Array.isArray(value) ? value[0] : value;
  if (!redirectValue) return "/";
  return redirectValue.startsWith("/") ? redirectValue : "/";
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const resolvedSearchParams = await searchParams;
  const redirectUrl = getSafeRedirectUrl(resolvedSearchParams?.redirect_url);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <SignUp routing="path" path="/sign-up" redirectUrl={redirectUrl} />
    </div>
  );
}

