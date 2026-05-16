# Production Release Checklist

## Покупки и сервисы

- Домен: купить основной домен и подключить DNS к Vercel.
- Hosting: Vercel Pro для коммерческого запуска, лимитов, команды и spend controls.
- Database/storage: Supabase Pro, production project, daily backups, storage bucket `resort-media`.
- Maps: Google Cloud billing, Maps JavaScript API, ключи с HTTP referrer restrictions.
- Monitoring: Sentry Developer на старт или Team при работе в команде.
- Notifications: Telegram bot и отдельный приватный чат для заявок.

## Production env

- Supabase project: `Alakol-Select`
- Supabase project ref: `bktrmzuhyziutmlzeert`
- Supabase URL: `https://bktrmzuhyziutmlzeert.supabase.co`

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `SITE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_LEADS_CHAT_ID`

## Before deploy

- Rotate the Google Maps key that was shared in chat.
- Restrict browser Google Maps key to the production domain and localhost for development.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only and never expose it as `NEXT_PUBLIC_*`.
- Supabase schema has been applied to project `bktrmzuhyziutmlzeert`.
- Storage bucket `resort-media` has been created.
- Seed or import real resorts, real photos, correct contacts, and owner accounts.
- Set spend limits in Vercel, Supabase, and Google Cloud.

## Release smoke

- `npm run lint`
- `npm run build`
- `npm run test:e2e`
- Open `/`, `/catalog`, one resort page, `/login`, `/owner`, `/admin`.
- Submit a lead and confirm it appears in admin/owner CRM.
- Confirm Telegram failure does not block lead creation.
- Check sitemap and robots on the final domain.

## Content and trust

- Add real phone/WhatsApp contacts for every published resort.
- Replace demo objects or clearly mark any demo data before public launch.
- Add privacy policy and terms pages before collecting real user data at scale.
- Add a simple support contact in the footer.
