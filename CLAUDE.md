# Land Flipping CRM

A CRM for land investors to manage contacts, properties, deals, and tasks.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database/Auth**: Supabase
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Icons**: lucide-react

## Quick Start

1. Set up Supabase:
   - Create a project at https://supabase.com
   - Run the SQL schema from `schema.sql` in the SQL Editor
   - Enable Email auth in Authentication > Providers

2. Configure environment:
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase URL and anon key

3. Run the app:
   ```bash
   npm install
   npm run dev
   ```

## Commands

```bash
npm run dev      # Run development server
npm run build    # Build for production
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/        # Protected routes with sidebar
│   │   ├── page.tsx        # Dashboard
│   │   ├── contacts/       # Contact management
│   │   ├── properties/     # Property management
│   │   ├── deals/          # Deal pipeline (Kanban)
│   │   ├── tasks/          # Task management
│   │   └── settings/       # Team management
│   └── login/              # Auth page
├── components/
│   ├── layout/             # Sidebar, Header
│   ├── contacts/           # Contact components
│   ├── properties/         # Property components
│   ├── deals/              # Deal/pipeline components
│   ├── tasks/              # Task components
│   ├── activity/           # Activity feed components
│   ├── settings/           # Settings components
│   └── ui/                 # Reusable UI (Button, Input, Modal, etc.)
└── lib/
    ├── supabase/           # Supabase clients
    ├── types.ts            # TypeScript types
    └── utils.ts            # Helpers, color constants
```

## Database Schema

### Core Tables
- **team_members** - Users (extends Supabase auth.users)
- **contacts** - Buyers, sellers, builders, agents
- **properties** - Land parcels
- **deals** - Pipeline tracking
- **tasks** - Todo items
- **activity_log** - Call/email/note history

### Key Enums
- **deal_stage**: lead → contacted → offer_made → negotiating → under_contract → due_diligence → closed_won/closed_lost/dead
- **contact_type**: buyer, seller, builder, agent, other
- **property_status**: researching → mailer_sent → offer_sent → under_contract → owned → listed_for_sale → sold/dead
- **task_priority**: low, medium, high, urgent
- **task_status**: todo, in_progress, done

## Key Patterns

### Supabase Clients
- Browser: `createClient()` from `@/lib/supabase/client`
- Server: `createClient()` from `@/lib/supabase/server`

### Dynamic Forms
- Contact forms adapt based on `contact_type`
- Buyer/builder: buying criteria fields
- Seller: motivation level, asking price

### UI Conventions
- Status badges use color constants from `utils.ts`
- Format helpers: `formatCurrency()`, `formatAcreage()`, `formatDate()`
- Deals use drag-and-drop Kanban board

### Activity Logging
- Types: call, email, text, meeting, site_visit, mailer_sent, note
- Outcomes: interested, not_interested, no_answer, left_voicemail, follow_up_needed

## Domain Knowledge

### Buyer/Builder Fields
- Counties/states of interest - market-specific targeting
- Acreage range - lot size requirements
- Budget constraints - price per acre, total budget
- Requirements - road access, utilities, water

### Property Fields
- APN - Assessor Parcel Number for county records
- Flood zone - A/AE zones difficult to sell
- Mineral rights - can double value in TX/OK/PA
- Per-acre pricing - primary land valuation metric

### Deal Fields
- Deal type: acquisition (buying) vs disposition (selling)
- DD deadline - miss it = lose earnest money
- Earnest money - capital at risk
- Estimated profit - sell price - buy price - costs
