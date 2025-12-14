import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TripsList } from "@/components/trips-list";
import Link from "next/link";
import Image from "next/image";

export default async function TripsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity mb-8">
          <Image 
            src="/icon.svg" 
            alt="Kruno logo" 
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="font-display text-xl font-semibold">Kruno</span>
        </Link>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-normal inline-block text-foreground mb-20" style={{ fontFamily: "'Patrick Hand', cursive" }}>
          My Trips
        </h1>
        <TripsList />
      </div>
    </div>
  );
}

