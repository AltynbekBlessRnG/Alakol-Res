begin;

delete from public.notifications where user_id in ('user-owner-1', 'user-admin-1', 'user-consumer-1');
delete from public.favorites where user_id in ('user-owner-1', 'user-admin-1', 'user-consumer-1');
delete from public.reviews where id in ('review-seed-1', 'review-seed-2');
delete from public.leads where id in ('lead-seed-1');
delete from public.moderation_reviews where id in ('audit-seed-1', 'audit-seed-2');
delete from public.resort_prices where resort_id in ('resort-1', 'resort-2', 'resort-3');
delete from public.resort_amenities where resort_id in ('resort-1', 'resort-2', 'resort-3');
delete from public.resort_images where resort_id in ('resort-1', 'resort-2', 'resort-3');
delete from public.resorts where id in ('resort-1', 'resort-2', 'resort-3');
delete from public.owner_profiles where id in ('owner-profile-1');
delete from public.password_reset_tokens where user_id in ('user-owner-1', 'user-admin-1', 'user-consumer-1');
delete from public.users where id in ('user-owner-1', 'user-admin-1', 'user-consumer-1');

insert into public.users (id, email, name, password_hash, role, created_at, updated_at)
values
  ('user-owner-1', 'owner@alakol.kz', 'Sunrise Travel', '$2a$10$wgjv2VWaU.Us3A4lT84XFer1TTS/8EYCKV8Q9MUzZWlgzcLLexJ4m', 'OWNER', now(), now()),
  ('user-admin-1', 'admin@alakol.kz', 'Alakol Admin', '$2a$10$PTG5t4i/B.JcnRf6sZErauj06jX15d8X1FbTMJvB6.EflnGYCyFgC', 'ADMIN', now(), now()),
  ('user-consumer-1', 'user@alakol.kz', 'Аружан', '$2a$10$hSFHsb55GHw0pcNXkUtRRupmv4qjpd1LKotD.agNbHwxgvXq0yaAq', 'USER', now(), now());

insert into public.owner_profiles (id, user_id, company, phone, whatsapp, created_at, updated_at)
values
  ('owner-profile-1', 'user-owner-1', 'Sunrise Travel', '+7 777 100 20 30', '7771002030', now(), now());

insert into public.resorts (
  id, owner_profile_id, title, slug, short_description, description, address, zone,
  distance_to_lake_m, latitude, longitude, min_price, max_price, food_options, accommodation_type,
  contact_phone, whatsapp, family_friendly, youth_friendly, has_pool, has_wifi, has_parking,
  has_kids_zone, included_text, rules_text, beach_line, transfer_info, is_featured, status, created_at, updated_at
)
values
  (
    'resort-1', 'owner-profile-1', 'Aqua Marina Resort', 'aqua-marina-resort',
    'Панорамный берег, семейный формат и тёплый бассейн у первой линии.',
    'Aqua Marina подойдёт для спокойного семейного отдыха у воды: большой пляж, закрытая территория, детская анимация и просторные номера с видом на Алаколь.',
    'пос. Акши, первая береговая линия', 'Акши',
    80, 46.163, 81.633, 28000, 52000, 'трёхразовое питание', 'семейные номера и коттеджи',
    '+7 705 440 11 22', '77054401122', true, false, true, true, true,
    true, 'Пляж, питание, лежаки, базовый Wi-Fi, парковка', 'Заселение после 14:00, без шумных мероприятий после 23:00',
    'Песчаный пляж, первая линия', 'Трансфер по запросу', true, 'PUBLISHED', now(), now()
  ),
  (
    'resort-2', 'owner-profile-1', 'Nomad Breeze Village', 'nomad-breeze-village',
    'Стильные домики для компании, барбекю-зоны и близость к ночной жизни.',
    'Nomad Breeze — более динамичный формат для друзей и пар: террасы, вечерняя музыка, лаунж-зоны и комфортный доступ к кафе и прогулочной части берега.',
    'пос. Кабанбай, центральная улица', 'Кабанбай',
    240, 46.101, 81.552, 22000, 41000, 'завтраки и grill menu', 'домики и loft-номера',
    '+7 701 555 67 89', '77015556789', false, true, false, true, true,
    false, 'Завтрак, BBQ-зона, парковка', 'Подходит для компании, действует депозит на шумные заезды',
    'Галечный пляж, 3 минуты пешком', 'Трансфер не включён', true, 'PUBLISHED', now(), now()
  ),
  (
    'resort-3', 'owner-profile-1', 'Laguna Silence Spa', 'laguna-silence-spa',
    'Тихая spa-зона у берега с приватными террасами и повышенным комфортом.',
    'Laguna Silence создана для размеренного отдыха: оздоровительные процедуры, приватные террасы, внимательный сервис и акцент на спокойствие.',
    'пос. Акши, северный сектор', 'Акши',
    120, 46.175, 81.612, 36000, 68000, 'полный пансион', 'spa suites',
    '+7 747 332 22 11', '77473322211', true, false, true, true, true,
    false, 'Пансион, SPA-зона, доступ к бассейну', 'Тихий формат отдыха, размещение с животными по согласованию',
    'Песчано-галечный берег', 'Индивидуальный трансфер', false, 'PENDING_REVIEW', now(), now()
  );

insert into public.resort_images (id, resort_id, url, alt, sort_order, kind)
values
  ('img-1', 'resort-1', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', 'Пляж и пирс у Aqua Marina', 0, 'cover'),
  ('img-2', 'resort-1', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', 'Территория отеля с деревьями', 1, 'gallery'),
  ('img-3', 'resort-2', 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80', 'Домики у Nomad Breeze', 0, 'cover'),
  ('img-4', 'resort-2', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', 'Терраса для отдыха', 1, 'gallery'),
  ('img-5', 'resort-3', 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80', 'Тихий пляж у Laguna Silence', 0, 'cover');

insert into public.resort_amenities (id, resort_id, label)
values
  ('am-1', 'resort-1', 'Бассейн'),
  ('am-2', 'resort-1', 'Детская зона'),
  ('am-3', 'resort-1', 'Песчаный пляж'),
  ('am-4', 'resort-1', 'Wi-Fi'),
  ('am-5', 'resort-2', 'BBQ'),
  ('am-6', 'resort-2', 'Террасы'),
  ('am-7', 'resort-2', 'Wi-Fi'),
  ('am-8', 'resort-2', 'Парковка'),
  ('am-9', 'resort-3', 'SPA'),
  ('am-10', 'resort-3', 'Бассейн'),
  ('am-11', 'resort-3', 'Терраса'),
  ('am-12', 'resort-3', 'Трансфер');

insert into public.resort_prices (id, resort_id, label, amount, description)
values
  ('pr-1', 'resort-1', 'Стандарт', 28000, 'за номер в сутки'),
  ('pr-2', 'resort-1', 'Семейный люкс', 52000, 'за номер в сутки'),
  ('pr-3', 'resort-2', 'Loft room', 22000, 'за номер в сутки'),
  ('pr-4', 'resort-2', 'Домик на компанию', 41000, 'за домик в сутки'),
  ('pr-5', 'resort-3', 'Spa suite', 36000, 'за номер в сутки'),
  ('pr-6', 'resort-3', 'Lake terrace suite', 68000, 'за номер в сутки');

insert into public.reviews (id, resort_id, user_id, author_name, rating, body, status, created_at)
values
  ('review-seed-1', 'resort-1', 'user-consumer-1', 'Аружан', 5, 'Очень удобный семейный формат, чистый пляж и спокойная территория.', 'approved', now()),
  ('review-seed-2', 'resort-2', 'user-consumer-1', 'Аружан', 4, 'Хороший вариант для компании, понравились террасы и атмосфера вечером.', 'approved', now());

insert into public.favorites (id, user_id, resort_id, created_at)
values
  ('favorite-seed-1', 'user-consumer-1', 'resort-1', now()),
  ('favorite-seed-2', 'user-consumer-1', 'resort-2', now());

insert into public.notifications (id, user_id, type, title, body, href, created_at)
values
  ('notification-seed-1', 'user-admin-1', 'resort_submitted', 'Новый объект на модерации', 'Laguna Silence Spa ожидает проверки.', '/admin', now()),
  ('notification-seed-2', 'user-owner-1', 'lead_created', 'Новая заявка', 'Появилась тестовая заявка по Aqua Marina Resort.', '/owner', now());

insert into public.leads (id, resort_id, handled_by_id, guest_name, phone, note, source, status, owner_comment, created_at, updated_at)
values
  ('lead-seed-1', 'resort-1', null, 'Айгерим', '+7 777 123 45 67', 'Интересуют даты на июль и семейный номер.', 'site_form', 'new', null, now(), now());

insert into public.moderation_reviews (id, resort_id, admin_id, action, comment, created_at)
values
  ('audit-seed-1', 'resort-3', 'user-admin-1', 'submitted', 'Карточка отправлена на модерацию.', now()),
  ('audit-seed-2', 'resort-1', 'user-admin-1', 'publish', 'Карточка опубликована.', now());

commit;
