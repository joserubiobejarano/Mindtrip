import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TripsList } from "@/components/trips-list";
import { NewNavbar } from "@/components/new-navbar";
import { NewFooter } from "@/components/new-footer";
import { TripsPageHeader } from "@/components/trips-page-header";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "My Trips – Kruno",
  description: "Manage your trips and itineraries in Kruno.",
  path: "/trips",
  robots: {
    index: false,
    follow: false,
  },
});

export default async function TripsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-[#FDFCF9] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute left-10 top-40 opacity-10 pointer-events-none hidden md:block">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 50 Q 30 10, 50 50 T 90 50" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M20 70 Q 40 30, 60 70 T 100 70" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
        </svg>
      </div>
      <div className="absolute right-10 bottom-40 opacity-10 pointer-events-none hidden md:block rotate-12">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z" />
        </svg>
      </div>

      <NewNavbar />
      <main className="max-w-4xl mx-auto py-12 px-6 relative z-10">
        <TripsPageHeader />
        
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 shadow-sm border border-border/40 min-h-[60vh] relative">
          {/* Notepad lines effect */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.03] rounded-3xl"
            style={{ 
              backgroundImage: 'linear-gradient(transparent 39px, #000 40px)',
              backgroundSize: '100% 40px'
            }}
          ></div>
          
          <div className="relative z-10">
            <TripsList />
          </div>
        </div>
      </main>
      <NewFooter />
    </div>
  );
}

