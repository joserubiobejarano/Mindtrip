import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Sign In – Kruno",
  description: "Sign in to Kruno to access your trips and itineraries.",
  path: "/sign-in",
  robots: {
    index: false,
    follow: false,
  },
});

type SignInPageProps = {
  searchParams?: Promise<{ redirect_url?: string | string[] }>;
};

const getSafeRedirectUrl = (value?: string | string[]) => {
  const redirectValue = Array.isArray(value) ? value[0] : value;
  if (!redirectValue) return "/";
  return redirectValue.startsWith("/") ? redirectValue : "/";
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = await searchParams;
  const redirectUrl = getSafeRedirectUrl(resolvedSearchParams?.redirect_url);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <SignIn routing="path" path="/sign-in" redirectUrl={redirectUrl} />
    </div>
  );
}

