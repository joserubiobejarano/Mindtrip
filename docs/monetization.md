# MindTrip – Monetization Strategy

## Positioning

- Product vision: "Notion + ChatGPT for trips."  

- Core value: an AI-first planner that creates rich, story-like itineraries and lets users tweak them with a collaborative, Notion-style interface.

- Philosophy: affiliate revenue and "Pro" upgrades should feel **helpful, not pushy**. The itinerary and planning UX always come first.

---

## Revenue Streams

### 1. Travel Affiliate Revenue (Contextual Add-Ons)

**Idea:** Contextual suggestions attached to the user's real plan instead of generic banners.

Examples of in-app prompts:

- "Book a nearby hotel for this area" (after user plans a day in a neighborhood).

- "Get tickets for the Prado Museum" (when the plan includes Prado).

- "Book a food tour in La Latina" (when there's a tapas / food section).

**Potential affiliate categories:**

- Hotels & stays (Booking.com, Expedia Group, etc.)

- Flights

- Activities & tours (GetYourGuide, Viator, Klook, etc.)

- Ground transport (rental cars, trains, buses, airport transfers)

- City cards / attraction passes (e.g. Madrid Pass, museum passes)

- Travel insurance

- eSIMs / mobile data (Airalo, Holafly, etc.)

**Scope principle:**  

- We prioritize **global partners** that cover many destinations (Booking, large OTA activity platforms, global eSIMs).  

- Local/smaller programs can be added later for key cities as we grow.

---

## Free vs Pro – Product Strategy

MindTrip should be fully useful on the free plan, but clearly better with Pro. Free is for casual / one-off users. Pro is for frequent travelers, planners, and group trips.

### Free Plan (baseline)

- AI-generated itinerary for **one city trip** (up to 14 days).

- Up to **2 active trips**.

- Basic editing:

  - Add / remove activities.

  - Mark places as "visited".

  - Adjust times / reorder items.

- Basic checklists (packing / to-dos) if/when we reintroduce them.

- Basic expense tracking.

- Basic chat assistant:

  - Limited monthly messages per user.

  - Uses current trip context but without power features (no advanced routing or deep personalization).

### Pro Plan (MindTrip Pro)

Pricing ideas:

- **Per-trip pass:** $4.99 per trip  

  - Framing example: "Cheaper than one coffee in New York."

- **Yearly plan:** $34.99 / year  

  - No monthly plan initially to keep pricing simple.

**Feature set (Pro):**

- **Multi-city & road trips**

  - Plan a route across multiple cities/countries.

  - AI helps structure stops and days.

- **Longer trips**

  - Up to **30 days** per itinerary (or more for annual Pro).

- **Advanced routing & optimization**

  - Reduce backtracking within a city.

  - Smart grouping of nearby activities.

  - "Tighten this day" / "Make this day more relaxed."

- **Collaboration & group travel**

  - Shared editing with friends/family.

  - Polls / voting:

    - e.g. "Which activity do we prefer for Day 3 afternoon?"

  - Comments on activities/days.

- **Unlimited active trips**

  - Free: 2 active trips.

  - Pro: unlimited.

- **Version history / undo**

  - "Undo last AI change."

  - View previous versions of a day/itinerary.

- **AI Concierge+**

  - Higher chat limits.

  - Deeper context, remembers preferences:

    - Budget, travel style, mobility constraints, etc.

- **Exports**

  - Export itinerary to:

    - Google Maps (lists / saved places).

    - PDF.

    - Calendar (ICS).

- **Imports**

  - Import bookings from email (Gmail parsing) into the itinerary:

    - Flights, hotels, trains, activities.

- **Offline / PWA (later phase)**

  - Cached itineraries for use offline on mobile.

- **Custom tags & filters**

  - Tag activities as "romantic", "digital nomad friendly", "photography spot", etc.

---

## "Not Evil" Principles

- The **itinerary quality** always comes first. We never distort suggestions purely for commission.

- Affiliate suggestions must be:

  - Contextual (tied to places already in the itinerary).

  - Clear when they are paid links.

- No dark patterns:

  - No fake urgency ("only 1 room left" type scare tactics).

  - No hiding cancellation policies.

- Pro vs Free:

  - Free must be genuinely useful.

  - Pro should add depth, collaboration, and power features — not basic necessities.

---

## Implementation Notes (High Level)

- Store Pro status & per-trip passes in our user profile / billing tables.

- Attach affiliate suggestions to:

  - Specific activities (e.g., museum, viewpoint, restaurant).

  - City/day sections (e.g., "Stay near Barrio de Las Letras").

- Track clicks and attributions with outbound link wrappers so we can improve relevance over time.

---

## Future Ideas (Backlog)

- Co-branded deals with specific providers (e.g., "MindTrip x XYZ food tours").

- Creator / influencer itineraries with revenue shares.

- White-label or API access for agencies once the product is stable.

