import { SignUp } from "@clerk/nextjs";

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

