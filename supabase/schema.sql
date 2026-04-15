create type public.user_role as enum ('OWNER', 'ADMIN', 'USER');
create type public.resort_status as enum ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED');
create type public.review_status as enum ('pending', 'approved');

create table if not exists public.users (
  id text primary key,
  email text not null unique,
  name text not null,
  password_hash text not null,
  role public.user_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.owner_profiles (
  id text primary key,
  user_id text not null unique references public.users(id) on delete cascade,
  company text not null,
  phone text not null,
  whatsapp text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resorts (
  id text primary key,
  owner_profile_id text not null references public.owner_profiles(id) on delete cascade,
  title text not null,
  slug text not null unique,
  short_description text not null,
  description text not null,
  address text not null,
  zone text not null,
  distance_to_lake_m integer not null,
  latitude double precision not null,
  longitude double precision not null,
  min_price integer not null,
  max_price integer not null,
  food_options text not null,
  accommodation_type text not null,
  contact_phone text not null,
  whatsapp text not null,
  family_friendly boolean not null default true,
  youth_friendly boolean not null default false,
  has_pool boolean not null default false,
  has_wifi boolean not null default true,
  has_parking boolean not null default true,
  has_kids_zone boolean not null default false,
  included_text text not null default '',
  rules_text text not null default '',
  beach_line text not null default '',
  transfer_info text not null default '',
  is_featured boolean not null default false,
  status public.resort_status not null default 'DRAFT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resorts_status_zone_idx on public.resorts(status, zone, is_featured);

create table if not exists public.resort_images (
  id text primary key,
  resort_id text not null references public.resorts(id) on delete cascade,
  url text not null,
  alt text not null,
  sort_order integer not null default 0,
  kind text not null default 'gallery'
);

create table if not exists public.resort_amenities (
  id text primary key,
  resort_id text not null references public.resorts(id) on delete cascade,
  label text not null
);

create table if not exists public.resort_prices (
  id text primary key,
  resort_id text not null references public.resorts(id) on delete cascade,
  label text not null,
  amount integer not null,
  description text not null
);

create table if not exists public.leads (
  id text primary key,
  resort_id text not null references public.resorts(id) on delete cascade,
  handled_by_id text references public.users(id) on delete set null,
  guest_name text not null,
  phone text not null,
  note text,
  source text not null default 'site_form',
  status text not null default 'new',
  owner_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id text primary key,
  resort_id text not null references public.resorts(id) on delete cascade,
  user_id text references public.users(id) on delete set null,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  body text not null,
  status public.review_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists reviews_resort_status_idx on public.reviews(resort_id, status);

create table if not exists public.favorites (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  resort_id text not null references public.resorts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, resort_id)
);

create table if not exists public.notifications (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.password_reset_tokens (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.moderation_reviews (
  id text primary key,
  resort_id text not null references public.resorts(id) on delete cascade,
  admin_id text references public.users(id) on delete set null,
  action text not null,
  comment text,
  created_at timestamptz not null default now()
);
