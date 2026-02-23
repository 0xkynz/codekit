---
title: Data Integration Planning
impact: HIGH
tags: database, api, supabase, authentication, data-models, real-time
---

# Phase 8 — Data Integration Planning

**Role:** Act as a Full-Stack Architect.

## Purpose

Design the data layer for the website. Define data models, API endpoints, authentication, real-time features, and caching strategy. Figma Make connects to Supabase for real data — design the schema for this integration.

## Data Models

### Core Schemas

Define each entity with field types, constraints, and relationships:

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Products (for e-commerce or SaaS features)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  images TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES categories(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id),
  sort_order INT DEFAULT 0
);

-- Blog Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  cover_image TEXT,
  author_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contact Submissions
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Newsletter Subscribers
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  subscribed_at TIMESTAMPTZ DEFAULT now()
);
```

### Row Level Security (Supabase)

```sql
-- Users can read their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own" ON users FOR UPDATE USING (auth.uid() = id);

-- Products are publicly readable
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products public read" ON products FOR SELECT USING (status = 'active');

-- Blog posts are publicly readable when published
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts public read" ON posts FOR SELECT USING (status = 'published');

-- Contact submissions: anyone can create, only admins can read
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit" ON contact_submissions FOR INSERT WITH CHECK (true);
```

## API Endpoints

### RESTful API Design

| Method | Endpoint | Auth | Description | Response |
|--------|----------|------|-------------|----------|
| GET | /api/products | No | List products (paginated) | `{ data: Product[], count: number }` |
| GET | /api/products/:slug | No | Single product detail | `Product` |
| GET | /api/posts | No | List published posts | `{ data: Post[], count: number }` |
| GET | /api/posts/:slug | No | Single post | `Post` |
| POST | /api/contact | No | Submit contact form | `{ success: boolean }` |
| POST | /api/subscribe | No | Newsletter signup | `{ success: boolean }` |
| POST | /api/auth/signup | No | Create account | `{ user: User, session: Session }` |
| POST | /api/auth/login | No | Login | `{ user: User, session: Session }` |
| POST | /api/auth/logout | Yes | Logout | `{ success: boolean }` |
| GET | /api/auth/me | Yes | Current user | `User` |
| PUT | /api/auth/me | Yes | Update profile | `User` |

### Supabase Client Integration

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Fetch products with pagination
async function getProducts(page = 1, pageSize = 12) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)', { count: 'exact' })
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(from, to);

  return { data, count, error };
}

// Search with filters
async function searchProducts(query: string, filters: Filters) {
  let request = supabase
    .from('products')
    .select('*, categories(name, slug)', { count: 'exact' })
    .eq('status', 'active');

  if (query) request = request.textSearch('title', query);
  if (filters.category) request = request.eq('category_id', filters.category);
  if (filters.minPrice) request = request.gte('price', filters.minPrice);
  if (filters.maxPrice) request = request.lte('price', filters.maxPrice);

  return request.order(filters.sort || 'created_at', { ascending: false });
}
```

## Authentication Strategy

### Supabase Auth

```typescript
// Signup
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  options: { data: { full_name: 'John Doe' } }
});

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword'
});

// OAuth (Google, GitHub)
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: `${window.location.origin}/auth/callback` }
});

// Session management
const { data: { session } } = await supabase.auth.getSession();
supabase.auth.onAuthStateChange((event, session) => {
  // Handle auth state changes
});
```

### Auth flow:
1. User signs up → email verification sent
2. User verifies email → redirect to app
3. Session stored in httpOnly cookie (SSR) or localStorage (SPA)
4. Refresh tokens auto-renew sessions
5. Protected routes check session server-side

## Real-Time Features

### Supabase Realtime

```typescript
// Subscribe to new orders (dashboard)
const subscription = supabase
  .channel('orders')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'orders'
  }, (payload) => {
    // Update dashboard in real-time
    addOrder(payload.new);
  })
  .subscribe();

// Presence (who's online)
const presence = supabase.channel('online-users');
presence.on('presence', { event: 'sync' }, () => {
  const state = presence.presenceState();
  // Update online user count
});
presence.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    await presence.track({ user_id: currentUser.id });
  }
});
```

### When to use real-time vs polling:
- **Real-time:** Chat, notifications, live dashboards, collaborative editing
- **Polling (30s):** Activity feeds, analytics counters
- **On-demand:** Product lists, blog posts, static content

## Caching Strategy

| Layer | Strategy | TTL | Content |
|-------|----------|-----|---------|
| CDN | Edge caching | 1 hour | Static assets, images, fonts |
| ISR/SSG | Build-time + revalidation | 60 seconds | Blog posts, product pages |
| Client | SWR / TanStack Query | 5 minutes | API responses |
| Local Storage | Persistent | 24 hours | User preferences, cart |
| Session Storage | Tab lifetime | Session | Form drafts, UI state |

### Cache invalidation:
- On data mutation → revalidate affected queries
- On deploy → purge CDN cache
- On auth change → clear user-specific caches

## Error Handling

| Scenario | Strategy |
|----------|----------|
| Network offline | Show cached data + "You're offline" banner |
| API 4xx | Show specific error message to user |
| API 5xx | Show generic error + retry button |
| Rate limited (429) | Exponential backoff (1s, 2s, 4s, max 30s) |
| Auth expired | Auto-refresh token, retry request |
| Data validation | Client-side first, server-side always |
| Optimistic update fails | Rollback UI, show error toast |

## User-Facing Features

### Dynamic Content Loading
- **Infinite scroll:** Load 12 items, fetch next page at 80% scroll
- **Pagination:** Server-side with page/pageSize params
- **Skeleton loading:** Show placeholders matching content layout

### Form Submissions
- Client validation before submit
- Disable button during submission
- Success: toast + reset form (or redirect)
- Error: inline errors + toast summary
- Rate limit: 1 submission per 30 seconds per IP

### User Accounts
- Profile: name, avatar, email, plan
- Preferences: theme, notifications, language
- Password change: current + new + confirm
- Account deletion: type email to confirm

### Search
- Full-text search via Supabase `textSearch`
- Index searchable columns
- Faceted filters from category/tag tables
- Debounce input (300ms)

## Next Phase

Pass data architecture to [Phase 9 — QA & Optimization](phase-9-qa-optimization.md).
