import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const ownerProfileId = "owner-profile-1";
const ownerId = "user-owner-1";
const adminId = "user-admin-1";
const userId = "user-consumer-1";

const resorts = [
  {
    id: "resort-1",
    title: "Aqua Marina Resort",
    slug: "aqua-marina-resort",
    short_description: "Семейный курорт первой линии с бассейном, питанием и спокойной территорией у воды.",
    description:
      "Aqua Marina Resort подходит для семейного отдыха без лишней суеты: закрытая территория, теплый бассейн, детская зона, питание на месте и короткий путь к берегу. Номера рассчитаны на пары и семьи с детьми, а персонал помогает с трансфером и бытовыми вопросами.",
    address: "пос. Акши, первая береговая линия",
    zone: "Акши",
    distance_to_lake_m: 80,
    latitude: 46.163,
    longitude: 81.633,
    min_price: 28000,
    max_price: 52000,
    food_options: "трехразовое питание",
    accommodation_type: "семейные номера и коттеджи",
    contact_phone: "+7 705 440 11 22",
    whatsapp: "77054401122",
    family_friendly: true,
    youth_friendly: false,
    has_pool: true,
    has_wifi: true,
    has_parking: true,
    has_kids_zone: true,
    included_text: "Питание, бассейн, пляжная зона, базовый Wi-Fi, парковка и детская площадка.",
    rules_text: "Заселение после 14:00. После 23:00 действует тихий режим.",
    beach_line: "Первая линия, песчано-галечный берег",
    transfer_info: "Трансфер из Ушарала по предварительной заявке",
    is_featured: true,
    status: "PUBLISHED"
  },
  {
    id: "resort-2",
    title: "Nomad Breeze Village",
    slug: "nomad-breeze-village",
    short_description: "Стильные домики для компании, BBQ-зоны и живая вечерняя атмосфера недалеко от берега.",
    description:
      "Nomad Breeze Village создан для друзей и молодых пар: отдельные домики, общие лаунж-зоны, барбекю, вечерняя музыка и быстрый доступ к активной части побережья. Формат более живой, чем семейный, но без ощущения хаоса.",
    address: "пос. Кабанбай, центральная улица",
    zone: "Кабанбай",
    distance_to_lake_m: 240,
    latitude: 46.101,
    longitude: 81.552,
    min_price: 22000,
    max_price: 41000,
    food_options: "завтраки и grill menu",
    accommodation_type: "домики и loft-номера",
    contact_phone: "+7 701 555 67 89",
    whatsapp: "77015556789",
    family_friendly: false,
    youth_friendly: true,
    has_pool: false,
    has_wifi: true,
    has_parking: true,
    has_kids_zone: false,
    included_text: "Завтрак, BBQ-зона, Wi-Fi в общей зоне и парковка.",
    rules_text: "Подходит для компании. На шумные заезды действует депозит.",
    beach_line: "Галечный пляж, 3 минуты пешком",
    transfer_info: "Трансфер по договоренности",
    is_featured: true,
    status: "PUBLISHED"
  },
  {
    id: "resort-3",
    title: "Laguna Silence Spa",
    slug: "laguna-silence-spa",
    short_description: "Тихий spa-курорт с приватными террасами, бассейном и повышенным уровнем сервиса.",
    description:
      "Laguna Silence Spa подойдет тем, кто едет за спокойным отдыхом: приватные террасы, spa-процедуры, мягкий сервис и номера с акцентом на тишину. Здесь нет шумных вечеринок, зато удобно отдыхать парой или небольшой семьей.",
    address: "пос. Акши, северный сектор",
    zone: "Акши",
    distance_to_lake_m: 120,
    latitude: 46.175,
    longitude: 81.612,
    min_price: 36000,
    max_price: 68000,
    food_options: "полный пансион",
    accommodation_type: "spa suites",
    contact_phone: "+7 747 332 22 11",
    whatsapp: "77473322211",
    family_friendly: true,
    youth_friendly: false,
    has_pool: true,
    has_wifi: true,
    has_parking: true,
    has_kids_zone: false,
    included_text: "Пансион, spa-зона, бассейн, полотенца, Wi-Fi и парковка.",
    rules_text: "Тихий формат отдыха. Животные только по согласованию.",
    beach_line: "Песчано-галечный берег, 2 минуты пешком",
    transfer_info: "Индивидуальный трансфер по запросу",
    is_featured: false,
    status: "PUBLISHED"
  },
  {
    id: "resort-4",
    title: "Saffron Coast Family Club",
    slug: "saffron-coast-family-club",
    short_description: "Семейный клуб с детским бассейном, мягким песком и большой зеленой территорией.",
    description:
      "Saffron Coast Family Club ориентирован на родителей с детьми: спокойный берег, детская анимация, большой двор, безопасные дорожки и семейные корпуса. Хороший выбор для длительного заезда, когда важны режим, питание и понятная инфраструктура.",
    address: "пос. Коктума, восточная линия",
    zone: "Коктума",
    distance_to_lake_m: 95,
    latitude: 46.121,
    longitude: 81.707,
    min_price: 26000,
    max_price: 47000,
    food_options: "завтрак и ужин",
    accommodation_type: "family rooms и коттеджи",
    contact_phone: "+7 708 310 44 55",
    whatsapp: "77083104455",
    family_friendly: true,
    youth_friendly: false,
    has_pool: true,
    has_wifi: true,
    has_parking: true,
    has_kids_zone: true,
    included_text: "Питание, детский бассейн, игровая зона, парковка и пляжные лежаки.",
    rules_text: "После 22:30 тихий режим. Детские кроватки по запросу.",
    beach_line: "Песчаный берег, 2 минуты пешком",
    transfer_info: "Групповой трансфер по расписанию",
    is_featured: true,
    status: "PUBLISHED"
  },
  {
    id: "resort-5",
    title: "White Sail Residence",
    slug: "white-sail-residence",
    short_description: "Премиальный формат с дизайнерскими номерами и приватной пляжной зоной.",
    description:
      "White Sail Residence подойдет гостям, которые хотят более камерный и дорогой отдых у Алаколя. Здесь стильные интерьеры, аккуратная территория, приватные зоны у воды и сервис без перегруза. Хорошо для пары, семьи или спокойной поездки с родителями.",
    address: "пос. Акши, южная часть берега",
    zone: "Акши",
    distance_to_lake_m: 70,
    latitude: 46.154,
    longitude: 81.641,
    min_price: 42000,
    max_price: 76000,
    food_options: "завтраки a la carte",
    accommodation_type: "boutique suites",
    contact_phone: "+7 700 888 19 19",
    whatsapp: "77008881919",
    family_friendly: true,
    youth_friendly: false,
    has_pool: true,
    has_wifi: true,
    has_parking: true,
    has_kids_zone: false,
    included_text: "Завтрак, лежаки, пляжные полотенца, Wi-Fi и парковка.",
    rules_text: "Тихий отдых. Вечеринки не проводятся.",
    beach_line: "Первая линия, приватный участок пляжа",
    transfer_info: "Индивидуальный трансфер по запросу",
    is_featured: true,
    status: "PUBLISHED"
  },
  {
    id: "resort-6",
    title: "Cedar Shore Eco Park",
    slug: "cedar-shore-eco-park",
    short_description: "Бюджетный eco-формат с домиками, соснами и спокойной атмосферой.",
    description:
      "Cedar Shore Eco Park выбирают за разумную цену и простую, но приятную территорию. Домики без лишнего пафоса, тенистый двор, мангальная зона и доброжелательный персонал делают место удобным для спокойного летнего заезда.",
    address: "пос. Кабанбай, тихий сектор",
    zone: "Кабанбай",
    distance_to_lake_m: 310,
    latitude: 46.098,
    longitude: 81.561,
    min_price: 18000,
    max_price: 33000,
    food_options: "домашнее питание по заказу",
    accommodation_type: "eco cabins",
    contact_phone: "+7 776 540 80 80",
    whatsapp: "77765408080",
    family_friendly: true,
    youth_friendly: false,
    has_pool: false,
    has_wifi: true,
    has_parking: true,
    has_kids_zone: true,
    included_text: "Парковка, мангальная зона, Wi-Fi в общей зоне и детский уголок.",
    rules_text: "Животные по согласованию. После 23:00 без громкой музыки.",
    beach_line: "Галечный пляж, 5 минут пешком",
    transfer_info: "Трансфера нет",
    is_featured: false,
    status: "PUBLISHED"
  },
  {
    id: "resort-7",
    title: "Sunset Bay Premium",
    slug: "sunset-bay-premium",
    short_description: "Премиальные виллы, infinity-бассейн и красивые закаты у самого берега.",
    description:
      "Sunset Bay Premium собран как дорогой курортный сценарий: приватные виллы, бассейн с видом на воду, ресторан и сервис для длинных расслабленных выходных. Хороший выбор для гостей, которым важны вид, приватность и уровень проживания.",
    address: "пос. Акши, приватный сектор",
    zone: "Акши",
    distance_to_lake_m: 55,
    latitude: 46.168,
    longitude: 81.625,
    min_price: 48000,
    max_price: 94000,
    food_options: "завтрак и dinner menu",
    accommodation_type: "private villas и suites",
    contact_phone: "+7 701 990 22 44",
    whatsapp: "77019902244",
    family_friendly: true,
    youth_friendly: true,
    has_pool: true,
    has_wifi: true,
    has_parking: true,
    has_kids_zone: false,
    included_text: "Завтрак, бассейн, пляжный сервис, парковка и Wi-Fi.",
    rules_text: "Курение только в отдельных зонах. Поздний checkout платный.",
    beach_line: "Первая линия, песчано-галечный берег",
    transfer_info: "Трансфер из Ушарала по брони",
    is_featured: true,
    status: "PUBLISHED"
  },
  {
    id: "resort-8",
    title: "Steppe Wave Camp",
    slug: "steppe-wave-camp",
    short_description: "Молодежный формат с музыкой, баром и быстрым выходом к пляжной части.",
    description:
      "Steppe Wave Camp создан для коротких ярких поездок: компактные номера, open-air зоны, вечерняя программа и близость к активной части берега. Подойдет компаниям друзей, но семьям с маленькими детьми лучше выбрать более тихие варианты.",
    address: "пос. Кабанбай, пляжная улица",
    zone: "Кабанбай",
    distance_to_lake_m: 150,
    latitude: 46.109,
    longitude: 81.558,
    min_price: 20000,
    max_price: 37000,
    food_options: "завтраки и street-food menu",
    accommodation_type: "camp rooms и bungalows",
    contact_phone: "+7 705 101 77 55",
    whatsapp: "77051017755",
    family_friendly: false,
    youth_friendly: true,
    has_pool: false,
    has_wifi: true,
    has_parking: true,
    has_kids_zone: false,
    included_text: "Завтрак, lounge-зона, барбекю, Wi-Fi и парковка.",
    rules_text: "Живой формат. Для компаний действует депозит.",
    beach_line: "Пляж рядом, 2 минуты пешком",
    transfer_info: "Трансфер по договоренности",
    is_featured: false,
    status: "PUBLISHED"
  },
  {
    id: "resort-9",
    title: "Azure Dune Resort",
    slug: "azure-dune-resort",
    short_description: "Минималистичный курорт с террасами, баром у пляжа и атмосферой длинных закатов.",
    description:
      "Azure Dune Resort подойдет тем, кто ищет визуально красивое место у воды: светлые номера, приватные террасы, бар у пляжа и спокойная музыка вечером. Курорт больше про атмосферу, чем про шумную программу.",
    address: "пос. Коктума, западный берег",
    zone: "Коктума",
    distance_to_lake_m: 110,
    latitude: 46.134,
    longitude: 81.694,
    min_price: 41000,
    max_price: 72000,
    food_options: "завтраки и авторское меню",
    accommodation_type: "terrace suites",
    contact_phone: "+7 707 230 40 41",
    whatsapp: "77072304041",
    family_friendly: true,
    youth_friendly: true,
    has_pool: true,
    has_wifi: true,
    has_parking: true,
    has_kids_zone: false,
    included_text: "Завтрак, шезлонги, бассейн, вечерний чай, Wi-Fi и парковка.",
    rules_text: "После 23:00 тихий формат. Вечеринки не проводятся.",
    beach_line: "Галечно-песчаный берег, 2 минуты пешком",
    transfer_info: "Приватный трансфер по предварительной заявке",
    is_featured: false,
    status: "PUBLISHED"
  },
  {
    id: "resort-10",
    title: "Marigold Beach Suites",
    slug: "marigold-beach-suites",
    short_description: "Светлый семейный курорт с песчаным берегом, детской площадкой и тихими корпусами.",
    description:
      "Marigold Beach Suites подойдет для спокойного семейного отдыха с понятной инфраструктурой. На территории есть детская площадка, летняя столовая, тихие корпуса и удобный выход к песчаной части берега. Формат простой, чистый и дружелюбный.",
    address: "пос. Коктума, семейный сектор",
    zone: "Коктума",
    distance_to_lake_m: 130,
    latitude: 46.126,
    longitude: 81.703,
    min_price: 30000,
    max_price: 56000,
    food_options: "завтрак и ужин",
    accommodation_type: "family suites",
    contact_phone: "+7 747 600 33 44",
    whatsapp: "77476003344",
    family_friendly: true,
    youth_friendly: false,
    has_pool: false,
    has_wifi: true,
    has_parking: true,
    has_kids_zone: true,
    included_text: "Завтрак, ужин, детская площадка, Wi-Fi и парковка.",
    rules_text: "Тихий семейный формат. Курение только вне корпусов.",
    beach_line: "Песчаный берег, 3 минуты пешком",
    transfer_info: "Помогаем организовать трансфер через партнеров",
    is_featured: false,
    status: "PUBLISHED"
  },
  {
    id: "resort-11",
    title: "Harbor Line House",
    slug: "harbor-line-house",
    short_description: "Небольшой гостевой дом рядом с водой для пар и спокойных коротких поездок.",
    description:
      "Harbor Line House - компактный гостевой дом без лишнего пафоса. Его выбирают за близость к воде, аккуратные номера и честную цену. Хороший вариант для пары, небольшой семьи или гостей, которым нужен простой ночлег рядом с берегом.",
    address: "пос. Акши, район малого причала",
    zone: "Акши",
    distance_to_lake_m: 140,
    latitude: 46.158,
    longitude: 81.636,
    min_price: 24000,
    max_price: 39000,
    food_options: "кафе на территории",
    accommodation_type: "guest house rooms",
    contact_phone: "+7 771 222 16 16",
    whatsapp: "77712221616",
    family_friendly: true,
    youth_friendly: false,
    has_pool: false,
    has_wifi: true,
    has_parking: true,
    has_kids_zone: false,
    included_text: "Wi-Fi, парковка, доступ к общей кухне и зона отдыха во дворе.",
    rules_text: "Без громких мероприятий. Заселение после 14:00.",
    beach_line: "Берег рядом, 3 минуты пешком",
    transfer_info: "Трансфер не предоставляется",
    is_featured: false,
    status: "PUBLISHED"
  },
  {
    id: "resort-12",
    title: "Blue Cactus Yard",
    slug: "blue-cactus-yard",
    short_description: "Дворовый формат для друзей: бунгало, BBQ, музыка и удобная цена.",
    description:
      "Blue Cactus Yard - демократичное место для компании друзей. Здесь компактные бунгало, открытый двор, BBQ-зона, вечерняя музыка и удобная локация для коротких летних поездок. Не самый тихий вариант, зато живой и доступный.",
    address: "пос. Кабанбай, активный сектор",
    zone: "Кабанбай",
    distance_to_lake_m: 170,
    latitude: 46.111,
    longitude: 81.559,
    min_price: 21000,
    max_price: 36000,
    food_options: "завтраки и fast-casual menu",
    accommodation_type: "yard rooms и bungalows",
    contact_phone: "+7 707 515 22 66",
    whatsapp: "77075152266",
    family_friendly: false,
    youth_friendly: true,
    has_pool: false,
    has_wifi: true,
    has_parking: true,
    has_kids_zone: false,
    included_text: "Завтрак, BBQ-зона, Wi-Fi, парковка и общий двор.",
    rules_text: "Подходит для компании друзей. Депозит зависит от состава заезда.",
    beach_line: "Пляж рядом, 3 минуты пешком",
    transfer_info: "Трансфер по договоренности",
    is_featured: false,
    status: "PUBLISHED"
  },
  {
    id: "resort-13",
    title: "Salt Wind Retreat",
    slug: "salt-wind-retreat",
    short_description: "Камерный retreat-курорт с красивыми террасами и неспешным премиальным ритмом.",
    description:
      "Salt Wind Retreat выбирают за приватность, красивые террасы, мягкий сервис и короткий путь до воды. Это место для спокойного отдыха без громкой музыки: утренний кофе у берега, бассейн, вечернее меню и аккуратная территория.",
    address: "пос. Коктума, тихий западный берег",
    zone: "Коктума",
    distance_to_lake_m: 85,
    latitude: 46.129,
    longitude: 81.699,
    min_price: 43000,
    max_price: 78000,
    food_options: "завтраки a la carte и вечернее меню",
    accommodation_type: "retreat suites",
    contact_phone: "+7 708 808 74 74",
    whatsapp: "77088087474",
    family_friendly: true,
    youth_friendly: false,
    has_pool: true,
    has_wifi: true,
    has_parking: true,
    has_kids_zone: false,
    included_text: "Завтрак, бассейн, beach set-up, парковка, Wi-Fi и вечерний чай.",
    rules_text: "Тихий формат без шумных заездов и громкой музыки.",
    beach_line: "Галечно-песчаный берег, 1-2 минуты пешком",
    transfer_info: "Приватный трансфер по предварительной брони",
    is_featured: true,
    status: "PUBLISHED"
  }
] as const;

const imageUrls = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80"
];

function resortImages(resortId: string, index: number) {
  return [0, 1, 2].map((offset) => ({
    id: `img-${resortId}-${offset}`,
    resort_id: resortId,
    url: imageUrls[(index + offset) % imageUrls.length],
    alt: offset === 0 ? "Основное фото зоны отдыха" : "Фото территории зоны отдыха",
    sort_order: offset,
    kind: offset === 0 ? "cover" : "gallery"
  }));
}

function resortAmenities(resortId: string, source: (typeof resorts)[number]) {
  const labels = [
    source.has_wifi ? "Wi-Fi" : null,
    source.has_parking ? "Парковка" : null,
    source.has_pool ? "Бассейн" : null,
    source.has_kids_zone ? "Детская зона" : null,
    source.family_friendly ? "Семейный формат" : null,
    source.youth_friendly ? "Для компании" : null,
    source.zone,
    source.food_options
  ].filter(Boolean) as string[];

  return [...new Set(labels)].slice(0, 6).map((label, index) => ({
    id: `am-${resortId}-${index}`,
    resort_id: resortId,
    label
  }));
}

function resortPrices(resortId: string, source: (typeof resorts)[number]) {
  return [
    {
      id: `pr-${resortId}-1`,
      resort_id: resortId,
      label: "Стандарт",
      amount: source.min_price,
      description: "за номер в сутки"
    },
    {
      id: `pr-${resortId}-2`,
      resort_id: resortId,
      label: source.max_price > 60000 ? "Премиум" : "Семейный",
      amount: source.max_price,
      description: source.max_price > 60000 ? "за улучшенный номер в сутки" : "за семейный номер в сутки"
    }
  ];
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ message: "Supabase is not configured" }, { status: 500 });
  }

  const resortIds = resorts.map((resort) => resort.id);
  const now = new Date().toISOString();

  await supabase.from("notifications").delete().in("user_id", [ownerId, adminId, userId]);
  await supabase.from("favorites").delete().in("user_id", [ownerId, adminId, userId]);
  await supabase.from("reviews").delete().in("resort_id", resortIds);
  await supabase.from("leads").delete().in("resort_id", resortIds);
  await supabase.from("moderation_reviews").delete().in("resort_id", resortIds);
  await supabase.from("resort_prices").delete().in("resort_id", resortIds);
  await supabase.from("resort_amenities").delete().in("resort_id", resortIds);
  await supabase.from("resort_images").delete().in("resort_id", resortIds);
  await supabase.from("resorts").delete().in("id", resortIds);

  await supabase.from("users").upsert([
    {
      id: ownerId,
      email: "owner@alakol.kz",
      name: "Sunrise Travel",
      password_hash: bcrypt.hashSync("owner123", 10),
      role: "OWNER",
      created_at: now,
      updated_at: now
    },
    {
      id: adminId,
      email: "admin@alakol.kz",
      name: "Alakol Admin",
      password_hash: bcrypt.hashSync("admin123", 10),
      role: "ADMIN",
      created_at: now,
      updated_at: now
    },
    {
      id: userId,
      email: "user@alakol.kz",
      name: "Аружан",
      password_hash: bcrypt.hashSync("user12345", 10),
      role: "USER",
      created_at: now,
      updated_at: now
    }
  ]);

  await supabase.from("owner_profiles").upsert({
    id: ownerProfileId,
    user_id: ownerId,
    company: "Sunrise Travel",
    phone: "+7 777 100 20 30",
    whatsapp: "7771002030",
    created_at: now,
    updated_at: now
  });

  await supabase.from("resorts").insert(
    resorts.map((resort) => ({
      ...resort,
      owner_profile_id: ownerProfileId,
      created_at: now,
      updated_at: now
    }))
  );

  await supabase.from("resort_images").insert(resorts.flatMap((resort, index) => resortImages(resort.id, index)));
  await supabase.from("resort_amenities").insert(resorts.flatMap((resort) => resortAmenities(resort.id, resort)));
  await supabase.from("resort_prices").insert(resorts.flatMap((resort) => resortPrices(resort.id, resort)));

  await supabase.from("reviews").insert(
    resorts.slice(0, 10).map((resort, index) => ({
      id: `review-seed-${index + 1}`,
      resort_id: resort.id,
      user_id: userId,
      author_name: ["Аружан", "Мадина", "Талгат", "Айгерим", "Нуртас"][index % 5],
      rating: index % 3 === 0 ? 5 : 4,
      body: `${resort.title} понравился по атмосфере и расположению. Описание на сайте совпало с ожиданиями, бронировать было удобно.`,
      status: "approved",
      created_at: now
    }))
  );

  await supabase.from("favorites").insert([
    { id: "favorite-seed-1", user_id: userId, resort_id: "resort-1", created_at: now },
    { id: "favorite-seed-2", user_id: userId, resort_id: "resort-4", created_at: now },
    { id: "favorite-seed-3", user_id: userId, resort_id: "resort-13", created_at: now }
  ]);

  await supabase.from("leads").insert({
    id: "lead-seed-1",
    resort_id: "resort-1",
    guest_name: "Айгерим",
    phone: "+7 777 123 45 67",
    note: "Интересуют даты на июль и семейный номер на 4 человека.",
    source: "site_form",
    status: "new",
    created_at: now,
    updated_at: now
  });

  await supabase.from("notifications").insert([
    {
      id: "notification-seed-1",
      user_id: ownerId,
      type: "lead_created",
      title: "Новая заявка",
      body: "Появилась тестовая заявка по Aqua Marina Resort.",
      href: "/owner",
      created_at: now
    },
    {
      id: "notification-seed-2",
      user_id: adminId,
      type: "resort_published",
      title: "Каталог наполнен",
      body: "В каталоге опубликовано 13 демо-объектов.",
      href: "/admin",
      created_at: now
    }
  ]);

  return NextResponse.json({ ok: true, published: resorts.length });
}
