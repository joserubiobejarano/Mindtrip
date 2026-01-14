"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/providers/language-provider";
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
  const { t } = useLanguage();
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

      type TripShareQueryResult = {
        public_slug: string
        [key: string]: any
      }

      const existingTyped = existing as TripShareQueryResult | null;

      if (existingTyped) {
        setPublicSlug(existingTyped.public_slug);
      } else {
        const slug = generateSlug();
        const { data, error } = await (supabase
          .from("trip_shares") as any)
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

    // Use environment variable if available, otherwise fallback to window.location.origin
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
    const url = `${baseUrl}/p/${publicSlug}`;
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
          <DialogTitle>{t("share_dialog_title")}</DialogTitle>
          <DialogDescription className="space-y-0.5">
            <p>{t("share_dialog_description_line1")}</p>
            <p>{t("share_dialog_description_line2")}</p>
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="py-4 text-center text-muted-foreground">
            {t("share_dialog_creating")}
          </div>
        ) : publicSlug ? (
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>{t("share_dialog_public_url")}</Label>
              <div className="flex gap-2">
                <Input
                  value={`${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "")}/p/${publicSlug}`}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                  title={t("share_dialog_copy_title")}
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
              {loading ? t("share_dialog_creating") : t("share_dialog_create")}
            </Button>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common_close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

