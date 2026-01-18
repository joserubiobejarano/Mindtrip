import { NextRequest, NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/auth/require-auth";
import { createClient } from "@/lib/supabase/server";

type AttributionPayload = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  coupon_code?: string;
};

const normalizeString = (value: unknown, maxLength: number) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return undefined;
  return trimmed;
};

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    const supabase = await createClient();

    const body = await request.json().catch(() => ({}));
    const payload: AttributionPayload = {
      utm_source: normalizeString(body?.utm_source, 100),
      utm_medium: normalizeString(body?.utm_medium, 100),
      utm_campaign: normalizeString(body?.utm_campaign, 100),
      utm_content: normalizeString(body?.utm_content, 100),
      coupon_code: normalizeString(body?.coupon_code, 32),
    };

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("utm_source, utm_medium, utm_campaign, utm_content, coupon_code, attribution_set_at")
      .eq("id", authResult.profileId)
      .single();

    if (profileError) {
      console.error("[attribution] Failed to fetch profile:", profileError);
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }

    if (profile.attribution_set_at) {
      return NextResponse.json({ ok: true, stored: false });
    }

    const updateData: Partial<AttributionPayload> & { attribution_set_at: string } = {
      attribution_set_at: new Date().toISOString(),
    };

    if (!profile.utm_source && payload.utm_source) {
      updateData.utm_source = payload.utm_source;
    }
    if (!profile.utm_medium && payload.utm_medium) {
      updateData.utm_medium = payload.utm_medium;
    }
    if (!profile.utm_campaign && payload.utm_campaign) {
      updateData.utm_campaign = payload.utm_campaign;
    }
    if (!profile.utm_content && payload.utm_content) {
      updateData.utm_content = payload.utm_content;
    }
    if (!profile.coupon_code && payload.coupon_code) {
      updateData.coupon_code = payload.coupon_code;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", authResult.profileId);

    if (updateError) {
      console.error("[attribution] Failed to update profile:", updateError);
      return NextResponse.json({ error: "Failed to store attribution" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, stored: true });
  } catch (error: unknown) {
    console.error("[attribution] Error in POST /api/attribution:", error);
    return authErrorResponse(error);
  }
}
