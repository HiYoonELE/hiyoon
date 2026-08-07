# Route Bridge

Local transportation marketplace — connecting families, schools, and programs with trusted local providers.

## Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Cookie-based admin session (password protected)
- **Email**: Resend
- **Hosting**: Vercel (recommended)

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Paste and run the contents of `supabase-schema.sql`
4. Copy your project URL and anon key from Settings > API

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

RESEND_API_KEY=your-resend-api-key
ADMIN_EMAIL=admin@hiyoon.com

ADMIN_SECRET=choose-a-strong-password-here

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Pages

| URL | Description |
|-----|-------------|
| `/` | Homepage |
| `/request` | Customer intake form (6 steps) |
| `/request/confirmation` | Post-submission confirmation |
| `/providers` | Provider signup form |
| `/providers/confirmation` | Provider post-signup confirmation |
| `/how-it-works` | Explainer page |
| `/admin` | Admin login (password protected, hidden from public) |
| `/admin/dashboard` | Admin dashboard — requests + providers |

---

## Admin access

Navigate directly to `/admin` — it does not appear in public navigation.

Login with the password set in `ADMIN_SECRET`.

The admin dashboard lets you:
- View all submitted transportation requests
- Update request status
- View and approve/reject provider applications
- Click into any request for full detail

---

## Deploy to Vercel

1. Push this repo to GitHub
2. Connect to [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.local` in Vercel's project settings
4. Deploy

---

## Project structure

```
src/
  app/
    page.tsx                   # Homepage
    request/
      page.tsx                 # Customer intake form
      confirmation/page.tsx    # Confirmation screen
    providers/
      page.tsx                 # Provider signup
      confirmation/page.tsx    # Provider confirmation
    how-it-works/page.tsx      # Explainer
    admin/
      page.tsx                 # Admin login
      dashboard/page.tsx       # Admin dashboard
    api/
      requests/route.ts        # GET all / POST new request
      requests/[id]/route.ts   # PATCH status
      providers/route.ts       # GET all / POST new provider
      providers/[id]/route.ts  # PATCH approval status
      admin/auth/route.ts      # Login / logout
  components/
    ui/
      Navbar.tsx               # Public navbar (no admin link)
      Footer.tsx
  lib/
    supabase/
      client.ts                # Browser Supabase client
      server.ts                # Server + admin Supabase clients
    types.ts                   # All TypeScript types
  middleware.ts                # Protects /admin/* routes
  styles/globals.css

supabase-schema.sql            # Full database schema — run in Supabase
```

---

## Version roadmap

**MVP (current)**
- Customer request form
- Provider signup
- Admin dashboard (requests + providers)
- Password-protected admin

**V2**
- Provider dashboard (login, view leads, submit quotes)
- Email notifications via Resend
- In-platform messaging

**V3**
- Customer accounts
- Quote comparison portal
- Stripe payments

**V4**
- Mobile app
- Automated matching
- SMS notifications 
