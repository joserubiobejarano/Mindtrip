import { ClerkProvider } from "@clerk/nextjs";
import { AttributionSync } from "@/components/attribution/attribution-sync";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // If no publishable key, render without Clerk (for build time).
  if (!publishableKey) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
      <AttributionSync />
    </ClerkProvider>
  );
}
