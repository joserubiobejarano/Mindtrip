# Mindtrip Setup Instructions

## Prerequisites

- Node.js 18+ installed
- A Supabase account (already configured)
- A Mapbox account (for map features)

## Installation Steps

1. **Install Dependencies**
```bash
npm install
```

2. **Set Up Environment Variables**

Create a `.env.local` file in the root directory with the following:

```
NEXT_PUBLIC_SUPABASE_URL=https://upeoxmwdwghdbgcqqtll.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZW94bXdkd2doZGJnY3FxdGxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NzcxOTgsImV4cCI6MjA3OTE1MzE5OH0.6yZ4f5tUM_75mp31wQBxwLUlNmhsAF0-FGDQRDddFk0
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

**To get your Mapbox token:**
1. Sign up at https://www.mapbox.com/
2. Go to your account page
3. Copy your default public token
4. Replace `your_mapbox_token_here` with your actual token

3. **Set Up Supabase Database**

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database/supabase-schema.sql`
4. Run the SQL script to create all tables, indexes, and RLS policies

4. **Enable Realtime in Supabase**

1. Go to Database > Replication in your Supabase dashboard
2. Enable replication for the following tables:
   - `activities`
   - `places`
   - `checklists`
   - `checklist_items`
   - `trip_members`

5. **Configure Supabase Auth**

1. Go to Authentication > Providers in your Supabase dashboard
2. Enable Email provider
3. Enable Google provider and configure it with your OAuth credentials

6. **Run the Development Server**

```bash
npm run dev
```

7. **Open the Application**

Navigate to http://localhost:3000 in your browser.

## Features Implemented

✅ Phase 1:
- Next.js 15 with TypeScript and Tailwind CSS
- shadcn/ui components
- Split layout (40% sidebar, 60% map area)
- Supabase integration with auth (email/password + Google OAuth)

✅ Phase 2:
- Complete database schema with all tables
- Trip CRUD operations
- Auto-creation of days for trip date ranges

✅ Phase 3:
- Itinerary builder with day selector
- Activity creation, editing, and deletion
- Mapbox GL JS integration with markers and popups
- Place search using Mapbox Geocoding API
- Collaborative trips with member invitations
- Realtime sync for activities

✅ Phase 5:
- Expenses tracking with balance calculation
- Checklists with realtime sync
- Tabbed interface for Itinerary, Expenses, and Checklists

✅ Phase 6:
- Public trip sharing with unique slugs
- Public read-only view
- Watermark on public pages
- PDF export functionality

## Project Structure

```
mindtrip/
├── app/                    # Next.js 15 App Router
│   ├── auth/              # Authentication pages
│   ├── trips/             # Trip pages
│   ├── p/                 # Public trip pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── itinerary-panel.tsx
│   ├── map-panel.tsx
│   ├── expenses-tab.tsx
│   ├── checklists-tab.tsx
│   └── ...
├── hooks/                 # Custom React hooks
│   ├── use-trip.ts
│   ├── use-activities.ts
│   ├── use-realtime-activities.ts
│   └── ...
├── lib/                   # Utilities
│   ├── supabase/          # Supabase clients
│   └── utils.ts
├── types/                 # TypeScript types
│   └── database.ts
├── docs/                  # Documentation
│   ├── COMMANDS.md
│   ├── SETUP.md
│   └── MIGRATION_INSTRUCTIONS.md
└── database/              # Database files
    ├── supabase-schema.sql
    └── migrations/        # Migration scripts

```

## Important Notes

1. **Realtime Features**: Make sure to enable replication for the tables mentioned above in Supabase for realtime sync to work.

2. **Mapbox Token**: The app requires a Mapbox token for the map and geocoding features to work. Get a free token from mapbox.com.

3. **Database Schema**: Run the SQL script in `database/supabase-schema.sql` before using the app to ensure all tables and policies are set up correctly.

4. **Row Level Security**: The schema includes RLS policies that ensure users can only access their own trips and trips they're members of.

5. **Public Sharing**: Public trip URLs are in the format `/p/[slug]`. The watermark appears on public pages.

## Troubleshooting

- **Map not showing**: Check that `NEXT_PUBLIC_MAPBOX_TOKEN` is set correctly in `.env.local`
- **Realtime not working**: Ensure replication is enabled for the required tables in Supabase
- **Auth errors**: Verify Supabase URL and anon key are correct in `.env.local`
- **Database errors**: Make sure you've run the SQL schema script in Supabase

