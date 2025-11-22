# Mindtrip - Travel Planner App

A collaborative travel planning application built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Quick Start

See [COMMANDS.md](./docs/COMMANDS.md) for all commands to run and [SETUP.md](./docs/SETUP.md) for detailed setup instructions.

### Quick Setup:

1. **Install dependencies:**
```bash
npm install
```

2. **Create `.env.local` file:**
```
NEXT_PUBLIC_SUPABASE_URL=https://upeoxmwdwghdbgcqqtll.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZW94bXdkd2doZGJnY3FxdGxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NzcxOTgsImV4cCI6MjA3OTE1MzE5OH0.6yZ4f5tUM_75mp31wQBxwLUlNmhsAF0-FGDQRDddFk0
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

3. **Set up database:**
   - Open Supabase SQL Editor
   - Run `database/supabase-schema.sql`

4. **Enable Realtime:**
   - Supabase Dashboard > Database > Replication
   - Enable for: `activities`, `places`, `checklists`, `checklist_items`, `trip_members`

5. **Run development server:**
```bash
npm run dev
```

## ✨ Features

### Phase 1 - Project Setup ✅
- Next.js 15 with App Router
- TypeScript configuration
- Tailwind CSS styling
- shadcn/ui components
- Split layout (40% sidebar, 60% map)
- Supabase integration
- Email/Password + Google OAuth authentication

### Phase 2 - Data Model & Trip CRUD ✅
- Complete database schema (11 tables)
- Row Level Security (RLS) policies
- Trip creation, listing, and management
- Auto-generation of days for trip date ranges

### Phase 3 - Itinerary Builder & Map ✅
- Day selector with date display
- Activity CRUD (create, read, update, delete)
- Mapbox GL JS integration
- Interactive map with markers and popups
- Place search using Mapbox Geocoding API
- Collaborative trip editing
- Realtime sync for activities

### Phase 4 - Explore Tab ✅
- Destination autocomplete search
- Place discovery and exploration
- Add places to itinerary functionality

### Phase 5 - Expenses & Checklists ✅
- Expense tracking with category support
- Automatic balance calculation per person
- Expense sharing among trip members
- Multiple checklists per trip
- Checklist items with checkbox states
- Realtime sync for checklists

### Phase 6 - Sharing & Watermark ✅
- Public trip sharing with unique slugs
- Read-only public view
- Subtle watermark on public pages
- PDF export functionality

## 📁 Project Structure

```
mindtrip/
├── app/                    # Next.js 15 App Router
│   ├── auth/              # Authentication pages
│   ├── trips/             # Trip management pages
│   └── p/                 # Public sharing pages
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── trip-*.tsx         # Trip-related components
│   ├── *-tab.tsx          # Tab components
│   └── *-dialog.tsx       # Dialog components
├── hooks/                 # Custom React hooks
│   ├── use-trip.ts
│   ├── use-activities.ts
│   └── use-realtime-*.ts  # Realtime hooks
├── lib/                   # Utilities
│   ├── supabase/          # Supabase clients
│   └── providers.tsx      # React Query provider
├── types/                 # TypeScript definitions
├── docs/                  # Documentation files
│   ├── COMMANDS.md
│   ├── SETUP.md
│   ├── MIGRATION_INSTRUCTIONS.md
│   └── ROADMAP.md
└── database/              # Database files
    ├── supabase-schema.sql
    └── migrations/        # Database migration scripts
```

## 🔧 Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Maps:** Mapbox GL JS
- **State Management:** React Query (TanStack Query)
- **Date Utilities:** date-fns

## 📝 Documentation

- [COMMANDS.md](./docs/COMMANDS.md) - All commands to run
- [SETUP.md](./docs/SETUP.md) - Detailed setup instructions
- [MIGRATION_INSTRUCTIONS.md](./docs/MIGRATION_INSTRUCTIONS.md) - Database migration guide
- [ROADMAP.md](./ROADMAP.md) - Development roadmap and progress tracking
- [database/supabase-schema.sql](./database/supabase-schema.sql) - Complete database schema

## 🎯 Next Steps

1. Get your Mapbox token from [mapbox.com](https://www.mapbox.com/)
2. Configure Google OAuth in Supabase (optional)
3. Run the SQL schema in Supabase
4. Enable Realtime for required tables
5. Start developing!

## 📄 License

MIT

supabase-add-trip-id-to-places.sql