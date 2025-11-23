"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Check } from "lucide-react";

interface ShareTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
}

export function ShareTripDialog({
  open,
  onOpenChange,
  tripId,
}: ShareTripDialogProps) {
  const [publicSlug, setPublicSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  const generateSlug = () => {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  };

  const createShareLink = async () => {
    setLoading(true);
    try {
      // Check if share already exists
      const { data: existing } = await supabase
        .from("trip_shares")
        .select("public_slug")
        .eq("trip_id", tripId)
        .single();

      if (existing) {
        setPublicSlug(existing.public_slug);
      } else {
        const slug = generateSlug();
        const { data, error } = await supabase
          .from("trip_shares")
          .insert({
            trip_id: tripId,
            public_slug: slug,
          })
          .select()
          .single();

        if (error) throw error;
        setPublicSlug(data.public_slug);
      }
    } catch (error) {
      console.error("Error creating share link:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!publicSlug) return;

    const url = `${window.location.origin}/p/${publicSlug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (open && !publicSlug) {
      createShareLink();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Trip</DialogTitle>
          <DialogDescription>
            Create a public link to share your trip. Anyone with the link can view it.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="py-4 text-center text-muted-foreground">
            Creating share link...
          </div>
        ) : publicSlug ? (
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Public URL</Label>
              <div className="flex gap-2">
                <Input
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/p/${publicSlug}`}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <Button onClick={createShareLink} disabled={loading}>
              {loading ? "Creating..." : "Create Share Link"}
            </Button>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

