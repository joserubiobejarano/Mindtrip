# Commands to Run

## Initial Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Create `.env.local` file:**
```bash
# Copy the example and add your Mapbox token
NEXT_PUBLIC_SUPABASE_URL=https://upeoxmwdwghdbgcqqtll.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZW94bXdkd2doZGJnY3FxdGxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NzcxOTgsImV4cCI6MjA3OTE1MzE5OH0.6yZ4f5tUM_75mp31wQBxwLUlNmhsAF0-FGDQRDddFk0
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

3. **Set up Supabase database:**
   - Go to your Supabase dashboard
   - Open SQL Editor
   - Copy and paste the entire contents of `database/supabase-schema.sql`
   - Execute the SQL script

4. **Enable Realtime in Supabase:**
   - Go to Database > Replication
   - Enable replication for: `activities`, `places`, `checklists`, `checklist_items`, `trip_members`

5. **Configure Auth providers in Supabase:**
   - Go to Authentication > Providers
   - Enable Email provider
   - Enable Google provider (configure OAuth credentials)

6. **Run the development server:**
```bash
npm run dev
```

7. **Build for production:**
```bash
npm run build
npm start
```

## File Structure Created

All necessary files have been created:

### Configuration Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `next.config.mjs` - Next.js configuration
- `postcss.config.mjs` - PostCSS configuration
- `.gitignore` - Git ignore rules
- `.eslintrc.json` - ESLint configuration
- `database/supabase-schema.sql` - Complete database schema

### App Pages
- `app/layout.tsx` - Root layout with providers
- `app/page.tsx` - Home page (redirects to /trips)
- `app/globals.css` - Global styles with Tailwind
- `app/auth/page.tsx` - Login/signup page
- `app/trips/page.tsx` - Trips list page
- `app/trips/[tripId]/page.tsx` - Trip detail page
- `app/p/[slug]/page.tsx` - Public trip sharing page

### Components
- `components/ui/` - shadcn/ui components (button, input, label, card, dialog, tabs)
- `components/trip-layout.tsx` - Split layout component
- `components/trip-detail.tsx` - Main trip detail component
- `components/trip-tabs.tsx` - Tabbed interface component
- `components/itinerary-tab.tsx` - Itinerary builder tab
- `components/trips-list.tsx` - Trips list component
- `components/new-trip-dialog.tsx` - Create trip dialog
- `components/day-selector.tsx` - Day selector component
- `components/activity-list.tsx` - Activity list component
- `components/activity-dialog.tsx` - Add/edit activity dialog
- `components/place-search.tsx` - Place search with Mapbox Geocoding
- `components/map-panel.tsx` - Mapbox map component
- `components/share-trip-dialog.tsx` - Share trip dialog
- `components/trip-members-dialog.tsx` - Trip members management
- `components/expenses-tab.tsx` - Expenses tracking tab
- `components/checklists-tab.tsx` - Checklists tab
- `components/public-trip-view.tsx` - Public trip view
- `components/public-itinerary-panel.tsx` - Read-only itinerary panel

### Hooks
- `hooks/use-trip.ts` - Trip data hook
- `hooks/use-days.ts` - Days data hook
- `hooks/use-activities.ts` - Activities CRUD hooks
- `hooks/use-realtime-activities.ts` - Realtime activities sync
- `hooks/use-realtime-checklists.ts` - Realtime checklists sync

### Utilities
- `lib/utils.ts` - Utility functions (cn for className merging)
- `lib/providers.tsx` - React Query provider
- `lib/supabase/client.ts` - Browser Supabase client
- `lib/supabase/server.ts` - Server Supabase client
- `lib/supabase/middleware.ts` - Middleware helper

### Types
- `types/database.ts` - TypeScript database types

### Documentation
- `README.md` - Project overview
- `docs/SETUP.md` - Detailed setup instructions
- `docs/COMMANDS.md` - This file
- `docs/MIGRATION_INSTRUCTIONS.md` - Database migration guide
- `ROADMAP.md` - Development roadmap

## Next Steps

1. Get your Mapbox token from https://www.mapbox.com/
2. Add it to `.env.local`
3. Run the SQL schema in Supabase
4. Enable Realtime for the required tables
5. Configure Google OAuth (if using Google sign-in)
6. Run `npm run dev` and test the application!

