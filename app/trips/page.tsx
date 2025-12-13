import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TripsList } from "@/components/trips-list";
import Link from "next/link";

export default async function TripsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img 
              src="/icon.svg" 
              alt="Kruno" 
              className="w-8 h-8"
            />
            <span className="font-display text-xl font-semibold">Kruno</span>
          </Link>
          <h1 className="text-3xl font-bold">My Trips</h1>
        </div>
        <TripsList />
      </div>
    </div>
  );
}

