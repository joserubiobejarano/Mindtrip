import { SignIn } from "@clerk/nextjs";

type SignInPageProps = {
  searchParams?: { redirect_url?: string | string[] };
};

const getSafeRedirectUrl = (value?: string | string[]) => {
  const redirectValue = Array.isArray(value) ? value[0] : value;
  if (!redirectValue) return "/";
  return redirectValue.startsWith("/") ? redirectValue : "/";
};

export default function SignInPage({ searchParams }: SignInPageProps) {
  const redirectUrl = getSafeRedirectUrl(searchParams?.redirect_url);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <SignIn routing="path" path="/sign-in" redirectUrl={redirectUrl} />
    </div>
  );
}

