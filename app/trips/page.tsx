import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TripsList } from "@/components/trips-list";

export default async function TripsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Trips</h1>
        </div>
        <TripsList />
      </div>
    </div>
  );
}

