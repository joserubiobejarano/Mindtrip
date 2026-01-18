"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { postAttributionIfAuthed } from "@/lib/attribution/client";

export function AttributionSync() {
  const { isLoaded, isSignedIn } = useAuth();
  const hasPosted = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || hasPosted.current) return;
    hasPosted.current = true;
    void postAttributionIfAuthed();
  }, [isLoaded, isSignedIn]);

  return null;
}
