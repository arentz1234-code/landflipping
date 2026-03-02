# Land Flipping CRM

A CRM for land investors to manage buyers, builders, deals, and tasks.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database/Auth**: Supabase
- **Styling**: Tailwind CSS
- **Maps**: Leaflet / React-Leaflet
- **Icons**: lucide-react
- **Notifications**: react-hot-toast

## Commands

```bash
npm install      # Install dependencies
npm run dev      # Run development server (localhost:3000)
npm run build    # Build for production
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/        # Protected routes with sidebar
│   │   ├── page.tsx        # Dashboard - stats overview
│   │   ├── buyers/         # Buyer management
│   │   ├── builders/       # Builder management
│   │   ├── tasks/          # Task board (todo/in-progress/done)
│   │   ├── completed-deals/# Closed deals with profit tracking
│   │   ├── map/            # Interactive deal map
│   │   ├── admin/          # Admin panel, team management
│   │   ├── deals/          # Deal pipeline (legacy)
│   │   ├── contacts/       # All contacts (legacy)
│   │   ├── properties/     # Properties (legacy)
│   │   └── settings/       # User settings
│   ├── login/              # Auth page
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout
├── components/
│   ├── layout/             # Sidebar, Header
│   ├── contacts/           # BuyerForm, BuilderForm, ContactForm
│   ├── deals/              # DealForm, PipelineBoard
│   ├── tasks/              # TaskBoard, TaskForm
│   ├── map/                # DealMap, MapWrapper
│   ├── activity/           # ActivityFeed, ActivityForm
│   ├── properties/         # PropertyForm, PropertyFilters
│   ├── settings/           # InviteMemberForm, MemberRoleSelect
│   └── ui/                 # Button, Input, Card, Modal, Badge, etc.
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser Supabase client
│   │   └── server.ts       # Server Supabase client
│   ├── types.ts            # TypeScript interfaces
│   └── utils.ts            # Helpers, color constants
└── middleware.ts           # Auth middleware
```

## Database Schema

### Core Tables
- **team_members** - Users (extends Supabase auth.users)
- **contacts** - Buyers, sellers, builders, agents (contact_type field)
- **properties** - Land parcels with location and financials
- **deals** - Pipeline tracking with stages
- **tasks** - Todo items linked to deals/properties/contacts
- **activity_log** - Call/email/note history

### Key Enums
```typescript
type DealStage = 'lead' | 'contacted' | 'offer_made' | 'negotiating' |
                 'under_contract' | 'due_diligence' | 'closed_won' |
                 'closed_lost' | 'dead';

type ContactType = 'buyer' | 'seller' | 'builder' | 'agent' | 'other';

type PropertyStatus = 'researching' | 'mailer_sent' | 'offer_sent' |
                      'under_contract' | 'owned' | 'listed_for_sale' |
                      'sold' | 'dead';

type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
type TaskStatus = 'todo' | 'in_progress' | 'done';
type UserRole = 'admin' | 'member' | 'viewer';
```

## Key Patterns

### Supabase Clients
```typescript
// Server Components (app router pages)
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();

// Client Components
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
```

### Authentication
- Middleware protects all routes except `/login`
- Dashboard layout redirects to `/login` if no user
- User must exist in `team_members` table after signup

### Color Constants (utils.ts)
```typescript
DEAL_STAGE_COLORS[stage]      // Badge colors for deal stages
PROPERTY_STATUS_COLORS[status] // Badge colors for property status
PRIORITY_COLORS[priority]      // Badge colors for task priority
CONTACT_TYPE_COLORS[type]      // Badge colors for contact types
```

### Format Helpers (utils.ts)
```typescript
formatCurrency(amount)   // $150,000
formatAcreage(acres)     // 10.5 acres
formatDate(date)         // Jan 15, 2024
formatDateTime(date)     // Jan 15, 2024 2:30 PM
daysUntil(date)          // 5 (or -3 if past)
cn(...classes)           // Tailwind class merger
```

## Page Routes

| Route | Description |
|-------|-------------|
| `/` | Dashboard with stats, pipeline, tasks |
| `/buyers` | List all buyers |
| `/buyers/new` | Add new buyer |
| `/buyers/[id]` | Buyer detail |
| `/buyers/[id]/edit` | Edit buyer |
| `/builders` | List all builders |
| `/builders/new` | Add new builder |
| `/builders/[id]` | Builder detail |
| `/builders/[id]/edit` | Edit builder |
| `/tasks` | Task board |
| `/completed-deals` | Closed deals with profit |
| `/completed-deals/[id]` | Deal detail |
| `/map` | Interactive map of all deals |
| `/admin` | Admin panel, team, exports |
| `/settings` | Team management |
| `/login` | Authentication |

## Environment Variables

Required in `.env.local` and Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Deployment

1. Push to GitHub (repo: arentz1234-code/landflipping)
2. Import to Vercel
3. Add environment variables in Vercel project settings
4. Run `schema.sql` in Supabase SQL Editor
5. Enable Email auth in Supabase Auth settings

## Domain Knowledge

### Buyer/Builder Fields
- **Counties of interest**: Specific markets they buy in
- **Min/Max acreage**: Lot size requirements
- **Max budget**: Price ceiling
- **Builder type**: custom, production, spec, infill
- **Avg homes per year**: Volume indicator

### Deal Fields
- **Deal type**: acquisition (buying) vs disposition (selling)
- **Stages**: lead → contacted → offer_made → negotiating → under_contract → due_diligence → closed_won
- **Estimated profit**: sell_price - buy_price - costs

### Map Feature
- Uses Leaflet with OpenStreetMap tiles
- Deals plotted by county coordinates (Texas counties pre-configured)
- Color-coded markers by deal stage
- Click markers for deal details

## Sidebar Navigation

1. Dashboard - Overview stats
2. Buyers - Land buyer contacts
3. Builders - Home builder contacts
4. Tasks - Task management board
5. Completed Deals - Closed deals tracking
6. Map - Geographic deal view
7. Admin - System administration
