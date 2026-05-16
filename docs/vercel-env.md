# Vercel Env Setup

Use these values for the production deployment.

## Public values

These are safe to store in Vercel and can be visible in client builds when prefixed with `NEXT_PUBLIC_`.

```env
NEXT_PUBLIC_SUPABASE_URL="https://bktrmzuhyziutmlzeert.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_-QEWO_rz5I3YwENPKnoXIw_0K-8ZgLk"
SUPABASE_STORAGE_BUCKET="resort-media"
```

## Domain values

Set these after the final domain is connected.

```env
NEXTAUTH_URL="https://your-domain.kz"
SITE_URL="https://your-domain.kz"
NEXT_PUBLIC_SITE_URL="https://your-domain.kz"
```

For local development use:

```env
NEXTAUTH_URL="http://localhost:3000"
SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## Secrets

Do not paste these into chat. Copy them directly from the vendor dashboards into Vercel Project Settings -> Environment Variables.

```env
DATABASE_URL="postgresql://postgres.bktrmzuhyziutmlzeert:YOUR_PASSWORD@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.bktrmzuhyziutmlzeert:YOUR_PASSWORD@db.bktrmzuhyziutmlzeert.supabase.co:5432/postgres"
SUPABASE_SERVICE_ROLE_KEY="copy-from-supabase-api-settings"
NEXTAUTH_SECRET="generate-a-long-random-secret"
GOOGLE_MAPS_API_KEY="copy-from-google-cloud"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="copy-from-google-cloud-browser-key"
TELEGRAM_BOT_TOKEN="copy-from-botfather"
TELEGRAM_LEADS_CHAT_ID="copy-from-telegram"
```

## Supabase project

- Project name: `Alakol-Select`
- Project ref: `bktrmzuhyziutmlzeert`
- Region: `ap-northeast-1`
- Storage bucket: `resort-media`

The schema and starter data have already been applied to this project.
