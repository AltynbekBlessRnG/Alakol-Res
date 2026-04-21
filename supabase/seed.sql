begin;

delete from public.notifications where user_id in ('user-owner-1', 'user-admin-1', 'user-consumer-1');
delete from public.favorites where user_id in ('user-owner-1', 'user-admin-1', 'user-consumer-1');
delete from public.reviews where id in ('review-seed-1', 'review-seed-2', 'review-seed-3', 'review-seed-4', 'review-seed-5', 'review-seed-6', 'review-seed-7', 'review-seed-8', 'review-seed-9', 'review-seed-10', 'review-seed-11', 'review-seed-12');
delete from public.leads where id in ('lead-seed-1');
delete from public.moderation_reviews where id in ('audit-seed-1', 'audit-seed-2');
delete from public.resort_prices where resort_id in ('resort-1', 'resort-2', 'resort-3', 'resort-4', 'resort-5', 'resort-6', 'resort-7', 'resort-8', 'resort-9', 'resort-10', 'resort-11', 'resort-12', 'resort-13');
delete from public.resort_amenities where resort_id in ('resort-1', 'resort-2', 'resort-3', 'resort-4', 'resort-5', 'resort-6', 'resort-7', 'resort-8', 'resort-9', 'resort-10', 'resort-11', 'resort-12', 'resort-13');
delete from public.resort_images where resort_id in ('resort-1', 'resort-2', 'resort-3', 'resort-4', 'resort-5', 'resort-6', 'resort-7', 'resort-8', 'resort-9', 'resort-10', 'resort-11', 'resort-12', 'resort-13');
delete from public.resorts where id in ('resort-1', 'resort-2', 'resort-3', 'resort-4', 'resort-5', 'resort-6', 'resort-7', 'resort-8', 'resort-9', 'resort-10', 'resort-11', 'resort-12', 'resort-13');
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
  ),
  (
    'resort-4', 'owner-profile-1', 'Saffron Coast Family Club', 'saffron-coast-family-club',
    'Семейный клуб у воды с детским бассейном, мягким песком и большим двором.',
    'Saffron Coast ориентирован на родителей с детьми: спокойный пляж, анимация по вечерам, большая зелёная территория и семейные корпуса с коротким путём до воды.',
    'пос. Коктума, восточная линия', 'Коктума',
    95, 46.121, 81.707, 26000, 47000, 'завтрак и ужин', 'family rooms и коттеджи',
    '+7 708 310 44 55', '77083104455', true, false, true, true, true,
    true, 'Питание, пляж, детский бассейн, парковка', 'После 22:30 тихий режим, детские кроватки по запросу',
    'Песчаный берег, 2 минуты пешком', 'Групповой трансфер по расписанию', true, 'PUBLISHED', now(), now()
  ),
  (
    'resort-5', 'owner-profile-1', 'White Sail Residence', 'white-sail-residence',
    'Спокойный премиальный формат с дизайнерскими номерами и приватной береговой зоной.',
    'White Sail Residence подойдёт тем, кто ищет более камерный и дорогой отдых у Алаколя: стильные интерьеры, внимательный сервис и приватные зоны отдыха у воды.',
    'пос. Акши, южная часть берега', 'Акши',
    70, 46.154, 81.641, 42000, 76000, 'завтраки a la carte', 'boutique suites',
    '+7 700 888 19 19', '77008881919', true, false, true, true, true,
    false, 'Завтрак, лежаки, пляжные полотенца, Wi-Fi', 'Тихий отдых, вечеринки не проводятся',
    'Первая линия, приватный участок пляжа', 'Индивидуальный трансфер по запросу', true, 'PUBLISHED', now(), now()
  ),
  (
    'resort-6', 'owner-profile-1', 'Cedar Shore Eco Park', 'cedar-shore-eco-park',
    'Бюджетный eco-формат с домиками, соснами и спокойной атмосферой.',
    'Cedar Shore выбирают за разумную цену и камерную атмосферу: простые, но аккуратные домики, большая тенистая территория и хороший вариант для спокойных заездов.',
    'пос. Кабанбай, тихий сектор', 'Кабанбай',
    310, 46.098, 81.561, 18000, 33000, 'домашнее питание по заказу', 'eco cabins',
    '+7 776 540 80 80', '77765408080', true, false, false, true, true,
    true, 'Парковка, мангальная зона, Wi-Fi в общей зоне', 'Размещение с животными по согласованию',
    'Галечный пляж, 5 минут пешком', 'Трансфера нет', false, 'PUBLISHED', now(), now()
  ),
  (
    'resort-7', 'owner-profile-1', 'Sunset Bay Premium', 'sunset-bay-premium',
    'Премиальные виллы, инфинити-бассейн и закаты у самого берега.',
    'Sunset Bay Premium собран как дорогой курортный сценарий: приватные виллы, красивый бассейн с видом на воду, ресторан и сервис для длинных расслабленных выходных.',
    'пос. Акши, приватный сектор', 'Акши',
    55, 46.168, 81.625, 48000, 94000, 'завтрак и dinner menu', 'private villas и suites',
    '+7 701 990 22 44', '77019902244', true, true, true, true, true,
    false, 'Завтрак, бассейн, пляжный сервис, парковка', 'Курение только в отдельных зонах, поздний checkout платный',
    'Первая линия, песчано-галечный берег', 'Трансфер из Ушарала по брони', true, 'PUBLISHED', now(), now()
  ),
  (
    'resort-8', 'owner-profile-1', 'Steppe Wave Camp', 'steppe-wave-camp',
    'Молодёжный формат с музыкой, баром и быстрым выходом к пляжной части.',
    'Steppe Wave Camp создан для компании друзей и коротких ярких поездок: компактные номера, open-air зоны, вечерняя программа и близость к активной части берега.',
    'пос. Кабанбай, пляжная улица', 'Кабанбай',
    150, 46.109, 81.558, 20000, 37000, 'завтраки и street-food menu', 'camp rooms и bungalows',
    '+7 705 101 77 55', '77051017755', false, true, false, true, true,
    false, 'Завтрак, lounge-зона, барбекю', 'Шумный формат, подходит для компании',
    'Пляж рядом, 2 минуты пешком', 'Трансфер по договорённости', false, 'PUBLISHED', now(), now()
  ),
  (
    'resort-9', 'owner-profile-1', 'Azure Dune Resort', 'azure-dune-resort',
    'Минималистичный курорт с приватными террасами, баром у пляжа и атмосферой длинных закатов.',
    'Azure Dune подойдёт тем, кто ищет красивую визуальную среду, приватность и неспешный отдых в стиле boutique-resort у воды.',
    'пос. Коктума, западный берег', 'Коктума',
    110, 46.134, 81.694, 41000, 72000, 'завтраки и авторское меню', 'terrace suites',
    '+7 707 230 40 41', '77072304041', true, true, true, true, true,
    false, 'Завтрак, шезлонги, доступ к инфинити-бассейну и вечерний чай', 'Тихий формат после 23:00, вечеринки не проводятся',
    'Галечно-песчаный берег, 2 минуты пешком', 'Приватный трансфер по предварительной заявке', false, 'PUBLISHED', now(), now()
  ),
  (
    'resort-10', 'owner-profile-1', 'Marigold Beach Suites', 'marigold-beach-suites',
    'Светлый семейный курорт с песчаным берегом, детской площадкой и тихими корпусами.',
    'Marigold Beach Suites подойдёт тем, кто ищет спокойный семейный отдых без лишнего шума: короткий путь до берега, светлые номера, питание на территории и мягкий ритм отдыха.',
    'пос. Акши, восточный сектор', 'Акши',
    90, 46.158, 81.637, 30000, 56000, 'завтрак и ужин', 'family suites',
    '+7 701 202 32 32', '77012023232', true, false, true, true, true,
    true, 'Питание, шезлонги, детская площадка, парковка', 'Тихий режим после 22:30, ранний заезд по согласованию',
    'Песчаный берег, 2 минуты пешком', 'Трансфер из Ушарала по заявке', true, 'PUBLISHED', now(), now()
  ),
  (
    'resort-11', 'owner-profile-1', 'Harbor Line House', 'harbor-line-house',
    'Уютный формат ближе к воде для пар и спокойных коротких поездок.',
    'Harbor Line House создан для тех, кто хочет аккуратную и честную карточку без переплаты: компактный номерной фонд, хороший берег рядом и спокойная атмосфера без активной ночной жизни.',
    'пос. Кабанбай, прибрежная линия', 'Кабанбай',
    130, 46.106, 81.556, 24000, 39000, 'завтраки', 'double rooms и junior suites',
    '+7 775 909 63 63', '77759096363', true, false, false, true, true,
    false, 'Завтрак, Wi-Fi, парковка', 'Подходит для тихого отдыха, музыкальные мероприятия не проводятся',
    'Галечный берег, 2 минуты пешком', 'Трансфер не включён', false, 'PUBLISHED', now(), now()
  ),
  (
    'resort-12', 'owner-profile-1', 'Blue Cactus Yard', 'blue-cactus-yard',
    'Живой формат для друзей с двором, барбекю и лёгким выходом к пляжной улице.',
    'Blue Cactus Yard ориентирован на молодёжный и дружеский отдых: компактные домики, открытый двор, музыка по вечерам и удобная локация для коротких летних поездок.',
    'пос. Кабанбай, активный сектор', 'Кабанбай',
    170, 46.111, 81.559, 21000, 36000, 'завтраки и fast-casual menu', 'yard rooms и bungalows',
    '+7 707 515 22 66', '77075152266', false, true, false, true, true,
    false, 'Завтрак, BBQ-зона, Wi-Fi', 'Шумный формат, лучше подходит для компании друзей',
    'Пляж рядом, 3 минуты пешком', 'Трансфер по договорённости', false, 'PUBLISHED', now(), now()
  ),
  (
    'resort-13', 'owner-profile-1', 'Salt Wind Retreat', 'salt-wind-retreat',
    'Камерный retreat-курорт с красивыми террасами и неспешным премиальным ритмом.',
    'Salt Wind Retreat подойдёт тем, кто выбирает более дорогой, спокойный и визуально собранный отдых: приватность, красивые террасы, мягкий сервис и короткий путь до воды.',
    'пос. Коктума, тихий западный берег', 'Коктума',
    85, 46.129, 81.699, 43000, 78000, 'завтраки a la carte и вечернее меню', 'retreat suites',
    '+7 708 808 74 74', '77088087474', true, false, true, true, true,
    false, 'Завтрак, бассейн, beach set-up, парковка', 'Тихий формат без шумных заездов и громкой музыки',
    'Галечно-песчаный берег, 1-2 минуты пешком', 'Приватный трансфер по предварительной брони', true, 'PUBLISHED', now(), now()
  );

insert into public.resort_images (id, resort_id, url, alt, sort_order, kind)
values
  ('img-1', 'resort-1', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', 'Пляж и пирс у Aqua Marina', 0, 'cover'),
  ('img-2', 'resort-1', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', 'Территория отеля с деревьями', 1, 'gallery'),
  ('img-3', 'resort-2', 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80', 'Домики у Nomad Breeze', 0, 'cover'),
  ('img-4', 'resort-2', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', 'Терраса для отдыха', 1, 'gallery'),
  ('img-5', 'resort-3', 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80', 'Тихий пляж у Laguna Silence', 0, 'cover'),
  ('img-6', 'resort-4', 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80', 'Пляж у Saffron Coast', 0, 'cover'),
  ('img-7', 'resort-4', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', 'Семейный номер', 1, 'gallery'),
  ('img-8', 'resort-5', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', 'Номер White Sail Residence', 0, 'cover'),
  ('img-9', 'resort-5', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', 'Территория White Sail', 1, 'gallery'),
  ('img-10', 'resort-6', 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80', 'Домики Cedar Shore', 0, 'cover'),
  ('img-11', 'resort-6', 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80', 'Eco территория', 1, 'gallery'),
  ('img-12', 'resort-7', 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=1200&q=80', 'Виллы Sunset Bay', 0, 'cover'),
  ('img-13', 'resort-7', 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80', 'Бассейн Sunset Bay', 1, 'gallery'),
  ('img-14', 'resort-8', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', 'Steppe Wave Camp номер', 0, 'cover'),
  ('img-15', 'resort-8', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80', 'Лаунж-зона Steppe Wave', 1, 'gallery'),
  ('img-16', 'resort-9', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', 'Azure Dune пляж', 0, 'cover'),
  ('img-17', 'resort-9', 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80', 'Azure Dune терраса', 1, 'gallery'),
  ('img-18', 'resort-10', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', 'Marigold Beach Suites номер', 0, 'cover'),
  ('img-19', 'resort-10', 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80', 'Пляж Marigold', 1, 'gallery'),
  ('img-20', 'resort-11', 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80', 'Harbor Line House берег', 0, 'cover'),
  ('img-21', 'resort-11', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', 'Номер Harbor Line', 1, 'gallery'),
  ('img-22', 'resort-12', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', 'Blue Cactus Yard двор', 0, 'cover'),
  ('img-23', 'resort-12', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80', 'Blue Cactus зона отдыха', 1, 'gallery'),
  ('img-24', 'resort-13', 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=1200&q=80', 'Salt Wind Retreat терраса', 0, 'cover'),
  ('img-25', 'resort-13', 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80', 'Salt Wind бассейн', 1, 'gallery');

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
  ('am-12', 'resort-3', 'Трансфер'),
  ('am-13', 'resort-4', 'Детский бассейн'),
  ('am-14', 'resort-4', 'Анимация'),
  ('am-15', 'resort-4', 'Песчаный пляж'),
  ('am-16', 'resort-5', 'Приватный пляж'),
  ('am-17', 'resort-5', 'Бассейн'),
  ('am-18', 'resort-5', 'Дизайнерские номера'),
  ('am-19', 'resort-6', 'Мангальная зона'),
  ('am-20', 'resort-6', 'Сосновая территория'),
  ('am-21', 'resort-6', 'Парковка'),
  ('am-22', 'resort-7', 'Инфинити-бассейн'),
  ('am-23', 'resort-7', 'Виллы'),
  ('am-24', 'resort-7', 'Первая линия'),
  ('am-25', 'resort-8', 'Барбекю'),
  ('am-26', 'resort-8', 'Лаунж'),
  ('am-27', 'resort-8', 'Wi-Fi'),
  ('am-28', 'resort-9', 'Инфинити-бассейн'),
  ('am-29', 'resort-9', 'Террасы'),
  ('am-30', 'resort-9', 'Парковка'),
  ('am-31', 'resort-10', 'Детская площадка'),
  ('am-32', 'resort-10', 'Песчаный пляж'),
  ('am-33', 'resort-10', 'Семейные корпуса'),
  ('am-34', 'resort-11', 'Близко к воде'),
  ('am-35', 'resort-11', 'Wi-Fi'),
  ('am-36', 'resort-11', 'Парковка'),
  ('am-37', 'resort-12', 'Двор'),
  ('am-38', 'resort-12', 'BBQ'),
  ('am-39', 'resort-12', 'Лаунж'),
  ('am-40', 'resort-13', 'Бассейн'),
  ('am-41', 'resort-13', 'Террасы'),
  ('am-42', 'resort-13', 'Тихий retreat');

insert into public.resort_prices (id, resort_id, label, amount, description)
values
  ('pr-1', 'resort-1', 'Стандарт', 28000, 'за номер в сутки'),
  ('pr-2', 'resort-1', 'Семейный люкс', 52000, 'за номер в сутки'),
  ('pr-3', 'resort-2', 'Loft room', 22000, 'за номер в сутки'),
  ('pr-4', 'resort-2', 'Домик на компанию', 41000, 'за домик в сутки'),
  ('pr-5', 'resort-3', 'Spa suite', 36000, 'за номер в сутки'),
  ('pr-6', 'resort-3', 'Lake terrace suite', 68000, 'за номер в сутки'),
  ('pr-7', 'resort-4', 'Family room', 26000, 'за номер в сутки'),
  ('pr-8', 'resort-4', 'Family cottage', 47000, 'за коттедж в сутки'),
  ('pr-9', 'resort-5', 'Boutique suite', 42000, 'за номер в сутки'),
  ('pr-10', 'resort-5', 'Premium residence', 76000, 'за номер в сутки'),
  ('pr-11', 'resort-6', 'Eco room', 18000, 'за номер в сутки'),
  ('pr-12', 'resort-6', 'Cabin for four', 33000, 'за домик в сутки'),
  ('pr-13', 'resort-7', 'Villa suite', 48000, 'за номер в сутки'),
  ('pr-14', 'resort-7', 'Private villa', 94000, 'за виллу в сутки'),
  ('pr-15', 'resort-8', 'Camp room', 20000, 'за номер в сутки'),
  ('pr-16', 'resort-8', 'Bungalow', 37000, 'за домик в сутки'),
  ('pr-17', 'resort-9', 'Terrace suite', 41000, 'за номер в сутки'),
  ('pr-18', 'resort-9', 'Lakefront suite', 72000, 'за номер в сутки'),
  ('pr-19', 'resort-10', 'Family suite', 30000, 'за номер в сутки'),
  ('pr-20', 'resort-10', 'Large family suite', 56000, 'за номер в сутки'),
  ('pr-21', 'resort-11', 'Double room', 24000, 'за номер в сутки'),
  ('pr-22', 'resort-11', 'Junior suite', 39000, 'за номер в сутки'),
  ('pr-23', 'resort-12', 'Yard room', 21000, 'за номер в сутки'),
  ('pr-24', 'resort-12', 'Bungalow', 36000, 'за домик в сутки'),
  ('pr-25', 'resort-13', 'Retreat suite', 43000, 'за номер в сутки'),
  ('pr-26', 'resort-13', 'Terrace retreat suite', 78000, 'за номер в сутки');

insert into public.reviews (id, resort_id, user_id, author_name, rating, body, status, created_at)
values
  ('review-seed-1', 'resort-1', 'user-consumer-1', 'Аружан', 5, 'Очень удобный семейный формат, чистый пляж и спокойная территория.', 'approved', now()),
  ('review-seed-2', 'resort-2', 'user-consumer-1', 'Аружан', 4, 'Хороший вариант для компании, понравились террасы и атмосфера вечером.', 'approved', now()),
  ('review-seed-3', 'resort-4', 'user-consumer-1', 'Аружан', 5, 'Очень удобный вариант для отдыха с ребёнком, пляж рядом и территория тихая.', 'approved', now()),
  ('review-seed-4', 'resort-5', 'user-consumer-1', 'Аружан', 5, 'Красивые номера и спокойная атмосфера, ощущается дороже остальных вариантов.', 'approved', now()),
  ('review-seed-5', 'resort-6', 'user-consumer-1', 'Аружан', 4, 'Простой, но приятный вариант, понравилась территория и соотношение цены.', 'approved', now()),
  ('review-seed-6', 'resort-7', 'user-consumer-1', 'Аружан', 5, 'Очень сильный сервис и красивый бассейн с видом на воду.', 'approved', now()),
  ('review-seed-7', 'resort-8', 'user-consumer-1', 'Аружан', 4, 'Больше для компании, чем для семьи, но атмосфера очень живая.', 'approved', now()),
  ('review-seed-8', 'resort-9', 'user-consumer-1', 'Аружан', 5, 'Стильное место, понравились террасы и общее ощущение спокойного курорта.', 'approved', now()),
  ('review-seed-9', 'resort-10', 'user-consumer-1', 'Аружан', 5, 'Очень удобный семейный вариант, тихо и близко к воде.', 'approved', now()),
  ('review-seed-10', 'resort-11', 'user-consumer-1', 'Аружан', 4, 'Хороший честный вариант без лишнего пафоса, удобно для пары.', 'approved', now()),
  ('review-seed-11', 'resort-12', 'user-consumer-1', 'Аружан', 4, 'Подойдёт для компании друзей, атмосфера более живая, чем семейная.', 'approved', now()),
  ('review-seed-12', 'resort-13', 'user-consumer-1', 'Аружан', 5, 'Очень красивый и спокойный вариант для неспешного отдыха.', 'approved', now());

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
