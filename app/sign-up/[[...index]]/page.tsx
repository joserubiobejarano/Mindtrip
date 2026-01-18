import { SignUp } from "@clerk/nextjs";

type SignUpPageProps = {
  searchParams?: { redirect_url?: string | string[] };
};

const getSafeRedirectUrl = (value?: string | string[]) => {
  const redirectValue = Array.isArray(value) ? value[0] : value;
  if (!redirectValue) return "/";
  return redirectValue.startsWith("/") ? redirectValue : "/";
};

export default function SignUpPage({ searchParams }: SignUpPageProps) {
  const redirectUrl = getSafeRedirectUrl(searchParams?.redirect_url);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <SignUp routing="path" path="/sign-up" redirectUrl={redirectUrl} />
    </div>
  );
}

