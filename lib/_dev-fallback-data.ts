import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";

export type UserRole = "OWNER" | "ADMIN" | "USER";
export type ResortStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED";
export type LeadStatus = "new" | "contacted" | "no_answer" | "booked" | "closed";
export type NotificationType = "lead_created" | "resort_submitted" | "resort_published" | "resort_rejected" | "password_reset";
export const RESORT_STATUS = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED"
} as const;

export type User = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  ownerProfileId: string | null;
  emailVerifiedAt?: Date | null;
};

export type PasswordResetToken = {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  usedAt?: Date | null;
};

export type ResortOwnerProfile = {
  id: string;
  userId: string;
  company: string;
  phone: string;
  whatsapp: string;
};

export type ResortImage = {
  id: string;
  resortId: string;
  url: string;
  alt: string;
  sortOrder: number;
  kind: string;
  isCover: boolean;
};

export type ResortAmenity = {
  id: string;
  resortId: string;
  label: string;
};

export type ResortPrice = {
  id: string;
  resortId: string;
  label: string;
  amount: number;
  description: string;
};

export type Resort = {
  id: string;
  ownerProfileId: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  address: string;
  zone: string;
  distanceToLakeM: number;
  latitude: number;
  longitude: number;
  minPrice: number;
  maxPrice: number;
  foodOptions: string;
  accommodationType: string;
  contactPhone: string;
  whatsapp: string;
  familyFriendly: boolean;
  youthFriendly: boolean;
  hasPool: boolean;
  hasWifi: boolean;
  hasParking: boolean;
  hasKidsZone: boolean;
  isFeatured: boolean;
  status: ResortStatus;
  includedText: string;
  rulesText: string;
  beachLine: string;
  transferInfo: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Lead = {
  id: string;
  resortId: string;
  guestName: string;
  phone: string;
  note?: string;
  ownerComment?: string;
  status: LeadStatus;
  source: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ModerationReview = {
  id: string;
  resortId: string;
  adminId?: string;
  action: string;
  comment?: string;
  createdAt: Date;
};

export type Review = {
  id: string;
  resortId: string;
  userId?: string | null;
  authorName: string;
  rating: number;
  body: string;
  status: "pending" | "approved";
  createdAt: Date;
};

export type Favorite = {
  id: string;
  userId: string;
  resortId: string;
  createdAt: Date;
};

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  createdAt: Date;
  readAt?: Date | null;
};

export type AnalyticsEvent = {
  id: string;
  eventType: string;
  resortId?: string;
  slug?: string;
  metadata?: string;
  createdAt: Date;
};

export type ResortWithRelations = Resort & {
  images: ResortImage[];
  amenities: ResortAmenity[];
  prices: ResortPrice[];
  ownerProfile?: ResortOwnerProfile;
  reviews: Review[];
  ratingAverage: number;
  approvedReviewsCount: number;
};

export type PendingResort = ResortWithRelations & {
  moderationReviews: ModerationReview[];
  completeness: {
    isReady: boolean;
    missing: string[];
  };
};

export type AuditItem = ModerationReview & {
  resort: { id: string; title: string };
  admin?: { name: string };
};

export type OwnerLead = Lead & {
  resort: { id: string; title: string; ownerProfileId: string };
};

export type UserReviewItem = Review & {
  resort: { id: string; title: string; slug: string };
};

type DbRow = Record<string, string | number | null>;

declare global {
  var alakolDb: Database.Database | undefined;
}

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "alakol.db");

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function toBool(value: number | null | undefined) {
  return Boolean(value);
}

function parseDate(value: string | number | null) {
  return value ? new Date(String(value)) : new Date();
}

function hasColumn(db: Database.Database, table: string, column: string) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  return rows.some((row) => row.name === column);
}

function ensureColumn(db: Database.Database, table: string, column: string, definition: string) {
  if (!hasColumn(db, table, column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function rowToUser(row: DbRow): User {
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    passwordHash: String(row.passwordHash ?? row.password ?? ""),
    role: String(row.role) as UserRole,
    ownerProfileId: row.ownerProfileId ? String(row.ownerProfileId) : null,
    emailVerifiedAt: row.emailVerifiedAt ? parseDate(row.emailVerifiedAt) : null
  };
}

function rowToOwnerProfile(row: DbRow): ResortOwnerProfile {
  return {
    id: String(row.id),
    userId: String(row.userId),
    company: String(row.company),
    phone: String(row.phone),
    whatsapp: String(row.whatsapp)
  };
}

function rowToResort(row: DbRow): Resort {
  return {
    id: String(row.id),
    ownerProfileId: String(row.ownerProfileId),
    title: String(row.title),
    slug: String(row.slug),
    shortDescription: String(row.shortDescription),
    description: String(row.description),
    address: String(row.address),
    zone: String(row.zone),
    distanceToLakeM: Number(row.distanceToLakeM),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    minPrice: Number(row.minPrice),
    maxPrice: Number(row.maxPrice),
    foodOptions: String(row.foodOptions),
    accommodationType: String(row.accommodationType),
    contactPhone: String(row.contactPhone),
    whatsapp: String(row.whatsapp),
    familyFriendly: toBool(row.familyFriendly as number),
    youthFriendly: toBool(row.youthFriendly as number),
    hasPool: toBool(row.hasPool as number),
    hasWifi: toBool(row.hasWifi as number),
    hasParking: toBool(row.hasParking as number),
    hasKidsZone: toBool(row.hasKidsZone as number),
    isFeatured: toBool(row.isFeatured as number),
    status: String(row.status) as ResortStatus,
    includedText: String(row.includedText ?? ""),
    rulesText: String(row.rulesText ?? ""),
    beachLine: String(row.beachLine ?? ""),
    transferInfo: String(row.transferInfo ?? ""),
    createdAt: parseDate(row.createdAt),
    updatedAt: parseDate(row.updatedAt)
  };
}

function rowToResortImage(row: DbRow): ResortImage {
  return {
    id: String(row.id),
    resortId: String(row.resortId),
    url: String(row.url),
    alt: String(row.alt),
    sortOrder: Number(row.sortOrder),
    kind: String(row.kind ?? "gallery"),
    isCover: toBool(row.isCover as number)
  };
}

function rowToAmenity(row: DbRow): ResortAmenity {
  return {
    id: String(row.id),
    resortId: String(row.resortId),
    label: String(row.label)
  };
}

function rowToPrice(row: DbRow): ResortPrice {
  return {
    id: String(row.id),
    resortId: String(row.resortId),
    label: String(row.label),
    amount: Number(row.amount),
    description: String(row.description)
  };
}

function rowToLead(row: DbRow): Lead {
  return {
    id: String(row.id),
    resortId: String(row.resortId),
    guestName: String(row.guestName),
    phone: String(row.phone),
    note: row.note ? String(row.note) : undefined,
    ownerComment: row.ownerComment ? String(row.ownerComment) : undefined,
    status: String(row.status) as LeadStatus,
    source: String(row.source ?? "site_form"),
    createdAt: parseDate(row.createdAt),
    updatedAt: parseDate(row.updatedAt ?? row.createdAt)
  };
}

function rowToReview(row: DbRow): ModerationReview {
  return {
    id: String(row.id),
    resortId: String(row.resortId),
    adminId: row.adminId ? String(row.adminId) : undefined,
    action: String(row.action),
    comment: row.comment ? String(row.comment) : undefined,
    createdAt: parseDate(row.createdAt)
  };
}

function rowToPublicReview(row: DbRow): Review {
  return {
    id: String(row.id),
    resortId: String(row.resortId),
    userId: row.userId ? String(row.userId) : null,
    authorName: String(row.authorName),
    rating: Number(row.rating),
    body: String(row.body),
    status: String(row.status) as "pending" | "approved",
    createdAt: parseDate(row.createdAt)
  };
}

function rowToFavorite(row: DbRow): Favorite {
  return {
    id: String(row.id),
    userId: String(row.userId),
    resortId: String(row.resortId),
    createdAt: parseDate(row.createdAt)
  };
}

function rowToNotification(row: DbRow): Notification {
  return {
    id: String(row.id),
    userId: String(row.userId),
    type: String(row.type) as NotificationType,
    title: String(row.title),
    body: String(row.body),
    href: row.href ? String(row.href) : undefined,
    createdAt: parseDate(row.createdAt),
    readAt: row.readAt ? parseDate(row.readAt) : null
  };
}

function rowToAnalytics(row: DbRow): AnalyticsEvent {
  return {
    id: String(row.id),
    eventType: String(row.eventType),
    resortId: row.resortId ? String(row.resortId) : undefined,
    slug: row.slug ? String(row.slug) : undefined,
    metadata: row.metadata ? String(row.metadata) : undefined,
    createdAt: parseDate(row.createdAt)
  };
}

function getDb() {
  if (!global.alakolDb) {
    fs.mkdirSync(dataDir, { recursive: true });
    global.alakolDb = new Database(dbPath);
    global.alakolDb.pragma("journal_mode = WAL");
    initializeDatabase(global.alakolDb);
  }
  return global.alakolDb;
}

function initializeDatabase(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password TEXT,
      passwordHash TEXT,
      role TEXT NOT NULL,
      ownerProfileId TEXT,
      emailVerifiedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS owner_profiles (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL UNIQUE,
      company TEXT NOT NULL,
      phone TEXT NOT NULL,
      whatsapp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS resorts (
      id TEXT PRIMARY KEY,
      ownerProfileId TEXT NOT NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      shortDescription TEXT NOT NULL,
      description TEXT NOT NULL,
      address TEXT NOT NULL,
      zone TEXT NOT NULL,
      distanceToLakeM INTEGER NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      minPrice INTEGER NOT NULL,
      maxPrice INTEGER NOT NULL,
      foodOptions TEXT NOT NULL,
      accommodationType TEXT NOT NULL,
      contactPhone TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      familyFriendly INTEGER NOT NULL,
      youthFriendly INTEGER NOT NULL,
      hasPool INTEGER NOT NULL,
      hasWifi INTEGER NOT NULL,
      hasParking INTEGER NOT NULL,
      hasKidsZone INTEGER NOT NULL,
      isFeatured INTEGER NOT NULL,
      status TEXT NOT NULL,
      includedText TEXT DEFAULT '',
      rulesText TEXT DEFAULT '',
      beachLine TEXT DEFAULT '',
      transferInfo TEXT DEFAULT '',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS resort_images (
      id TEXT PRIMARY KEY,
      resortId TEXT NOT NULL,
      url TEXT NOT NULL,
      alt TEXT NOT NULL,
      sortOrder INTEGER NOT NULL,
      kind TEXT DEFAULT 'gallery',
      isCover INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS resort_amenities (
      id TEXT PRIMARY KEY,
      resortId TEXT NOT NULL,
      label TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS resort_prices (
      id TEXT PRIMARY KEY,
      resortId TEXT NOT NULL,
      label TEXT NOT NULL,
      amount INTEGER NOT NULL,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      resortId TEXT NOT NULL,
      guestName TEXT NOT NULL,
      phone TEXT NOT NULL,
      note TEXT,
      ownerComment TEXT,
      status TEXT NOT NULL,
      source TEXT DEFAULT 'site_form',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS moderation_reviews (
      id TEXT PRIMARY KEY,
      resortId TEXT NOT NULL,
      adminId TEXT,
      action TEXT NOT NULL,
      comment TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      resortId TEXT NOT NULL,
      userId TEXT,
      authorName TEXT NOT NULL,
      rating INTEGER NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      resortId TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      href TEXT,
      createdAt TEXT NOT NULL,
      readAt TEXT
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      eventType TEXT NOT NULL,
      resortId TEXT,
      slug TEXT,
      metadata TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expiresAt TEXT NOT NULL,
      usedAt TEXT
    );
  `);

  ensureColumn(db, "users", "passwordHash", "TEXT");
  ensureColumn(db, "users", "password", "TEXT");
  ensureColumn(db, "users", "emailVerifiedAt", "TEXT");
  ensureColumn(db, "resorts", "includedText", "TEXT DEFAULT ''");
  ensureColumn(db, "resorts", "rulesText", "TEXT DEFAULT ''");
  ensureColumn(db, "resorts", "beachLine", "TEXT DEFAULT ''");
  ensureColumn(db, "resorts", "transferInfo", "TEXT DEFAULT ''");
  ensureColumn(db, "resort_images", "kind", "TEXT DEFAULT 'gallery'");
  ensureColumn(db, "resort_images", "isCover", "INTEGER DEFAULT 0");
  ensureColumn(db, "leads", "ownerComment", "TEXT");
  ensureColumn(db, "leads", "source", "TEXT DEFAULT 'site_form'");
  ensureColumn(db, "leads", "updatedAt", "TEXT");
  ensureColumn(db, "reviews", "userId", "TEXT");

  const hasUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (hasUsers.count === 0) {
    seedDatabase(db);
  }

  migratePasswords(db);
  normalizeLeadTimestamps(db);
  normalizeImageCover(db);
  ensureCatalogSamples(db);
  ensureBaseReviews(db);
}

function seedDatabase(db: Database.Database) {
  const ownerProfileId = "owner-profile-1";
  const ownerId = "user-owner-1";
  const now = new Date().toISOString();

  db.prepare("INSERT INTO users (id, email, name, passwordHash, role, ownerProfileId, emailVerifiedAt) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(ownerId, "owner@alakol.kz", "Sunrise Travel", bcrypt.hashSync("owner123", 10), "OWNER", ownerProfileId, now);
  db.prepare("INSERT INTO users (id, email, name, passwordHash, role, ownerProfileId, emailVerifiedAt) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run("user-admin-1", "admin@alakol.kz", "Alakol Admin", bcrypt.hashSync("admin123", 10), "ADMIN", null, now);
  db.prepare("INSERT INTO users (id, email, name, passwordHash, role, ownerProfileId, emailVerifiedAt) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run("user-consumer-1", "user@alakol.kz", "Аружан", bcrypt.hashSync("user12345", 10), "USER", null, now);
  db.prepare("INSERT INTO owner_profiles (id, userId, company, phone, whatsapp) VALUES (?, ?, ?, ?, ?)")
    .run(ownerProfileId, ownerId, "Sunrise Travel", "+7 777 100 20 30", "7771002030");

  const insertResort = db.prepare(`
    INSERT INTO resorts (
      id, ownerProfileId, title, slug, shortDescription, description, address, zone,
      distanceToLakeM, latitude, longitude, minPrice, maxPrice, foodOptions, accommodationType,
        contactPhone, whatsapp, familyFriendly, youthFriendly, hasPool, hasWifi, hasParking,
        hasKidsZone, isFeatured, status, includedText, rulesText, beachLine, transferInfo, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const resorts = [
      ["resort-1", ownerProfileId, "Aqua Marina Resort", "aqua-marina-resort", "Панорамный берег, семейный формат и тёплый бассейн у первой линии.", "Aqua Marina подойдёт для спокойного семейного отдыха у воды: большой пляж, закрытая территория, детская анимация и просторные номера с видом на Алаколь.", "пос. Акши, первая береговая линия", "Акши", 80, 46.163, 81.633, 28000, 52000, "трёхразовое питание", "семейные номера и коттеджи", "+7 705 440 11 22", "77054401122", 1, 0, 1, 1, 1, 1, 1, "PUBLISHED", "Пляж, питание, лежаки, базовый Wi-Fi, парковка", "Заселение после 14:00, без шумных мероприятий после 23:00", "Песчаный пляж, первая линия", "Трансфер по запросу", now, now],
      ["resort-2", ownerProfileId, "Nomad Breeze Village", "nomad-breeze-village", "Стильные домики для компании, барбекю-зоны и близость к ночной жизни.", "Nomad Breeze — более динамичный формат для друзей и пар: террасы, вечерняя музыка, лаунж-зоны и комфортный доступ к кафе и прогулочной части берега.", "пос. Кабанбай, центральная улица", "Кабанбай", 240, 46.101, 81.552, 22000, 41000, "завтраки и grill menu", "домики и loft-номера", "+7 701 555 67 89", "77015556789", 0, 1, 0, 1, 1, 0, 1, "PUBLISHED", "Завтрак, BBQ-зона, парковка", "Подходит для компании, действует депозит на шумные заезды", "Галечный пляж, 3 минуты пешком", "Трансфер не включён", now, now],
      ["resort-3", ownerProfileId, "Laguna Silence Spa", "laguna-silence-spa", "Тихая spa-зона у берега с приватными террасами и повышенным комфортом.", "Laguna Silence создана для размеренного отдыха: оздоровительные процедуры, приватные террасы, внимательный сервис и акцент на спокойствие.", "пос. Акши, северный сектор", "Акши", 120, 46.175, 81.612, 36000, 68000, "полный пансион", "spa suites", "+7 747 332 22 11", "77473322211", 1, 0, 1, 1, 1, 0, 0, "PENDING_REVIEW", "Пансион, SPA-зона, доступ к бассейну", "Тихий формат отдыха, размещение с животными по согласованию", "Песчано-галечный берег", "Индивидуальный трансфер", now, now]
    ];
  for (const resort of resorts) {
    insertResort.run(...resort);
  }

  const insertImage = db.prepare("INSERT INTO resort_images (id, resortId, url, alt, sortOrder, kind, isCover) VALUES (?, ?, ?, ?, ?, ?, ?)");
  [
    ["img-1", "resort-1", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", "Пляж и пирс", 0, "beach", 1],
    ["img-2", "resort-1", "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80", "Территория", 1, "territory", 0],
    ["img-3", "resort-2", "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80", "Домики", 0, "rooms", 1],
    ["img-4", "resort-2", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80", "Терраса", 1, "territory", 0],
    ["img-5", "resort-3", "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80", "Тихий пляж", 0, "beach", 1]
  ].forEach((item) => insertImage.run(...item));

  const insertAmenity = db.prepare("INSERT INTO resort_amenities (id, resortId, label) VALUES (?, ?, ?)");
  [
    ["am-1", "resort-1", "Бассейн"], ["am-2", "resort-1", "Детская зона"], ["am-3", "resort-1", "Песчаный пляж"], ["am-4", "resort-1", "Wi-Fi"],
    ["am-5", "resort-2", "BBQ"], ["am-6", "resort-2", "Террасы"], ["am-7", "resort-2", "Wi-Fi"], ["am-8", "resort-2", "Парковка"],
    ["am-9", "resort-3", "SPA"], ["am-10", "resort-3", "Бассейн"], ["am-11", "resort-3", "Терраса"], ["am-12", "resort-3", "Трансфер"]
  ].forEach((item) => insertAmenity.run(...item));

  const insertPrice = db.prepare("INSERT INTO resort_prices (id, resortId, label, amount, description) VALUES (?, ?, ?, ?, ?)");
  [
    ["pr-1", "resort-1", "Стандарт", 28000, "за номер в сутки"],
    ["pr-2", "resort-1", "Семейный люкс", 52000, "за номер в сутки"],
    ["pr-3", "resort-2", "Loft room", 22000, "за номер в сутки"],
    ["pr-4", "resort-2", "Домик на компанию", 41000, "за домик в сутки"],
    ["pr-5", "resort-3", "Spa suite", 36000, "за номер в сутки"],
    ["pr-6", "resort-3", "Lake terrace suite", 68000, "за номер в сутки"]
  ].forEach((item) => insertPrice.run(...item));

  const insertReview = db.prepare("INSERT INTO reviews (id, resortId, authorName, rating, body, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)");
  [
    ["rv-1", "resort-1", "Алия", 5, "Очень удобно для отдыха с детьми, территория чистая и берег близко.", "approved", now],
    ["rv-2", "resort-1", "Нурлан", 4, "Хорошее питание и первая линия, хотелось бы больше вечерней программы.", "approved", now],
    ["rv-3", "resort-2", "Мадина", 5, "Отличный вариант для компании друзей и атмосфера живая.", "approved", now]
  ].forEach((item) => insertReview.run(...item));
}

function migratePasswords(db: Database.Database) {
  const users = db.prepare("SELECT id, password, passwordHash FROM users").all() as Array<{ id: string; password: string | null; passwordHash: string | null }>;
  const update = db.prepare("UPDATE users SET passwordHash = ? WHERE id = ?");
  for (const user of users) {
    if (!user.passwordHash && user.password) {
      update.run(bcrypt.hashSync(user.password, 10), user.id);
    }
  }
}

function normalizeLeadTimestamps(db: Database.Database) {
  db.exec("UPDATE leads SET updatedAt = createdAt WHERE updatedAt IS NULL");
}

function normalizeImageCover(db: Database.Database) {
  const resortIds = db.prepare("SELECT DISTINCT resortId FROM resort_images").all() as Array<{ resortId: string }>;
  for (const { resortId } of resortIds) {
    const count = db.prepare("SELECT COUNT(*) as count FROM resort_images WHERE resortId = ? AND isCover = 1").get(resortId) as { count: number };
    if (count.count === 0) {
      db.prepare("UPDATE resort_images SET isCover = 1 WHERE id = (SELECT id FROM resort_images WHERE resortId = ? ORDER BY sortOrder ASC LIMIT 1)").run(resortId);
    }
  }
}

function ensureCatalogSamples(db: Database.Database) {
  const ownerProfileId = "owner-profile-1";
  const now = new Date().toISOString();
  const samples = [
    {
      id: "resort-4",
      slug: "saffron-coast-family-club",
      title: "Saffron Coast Family Club",
      shortDescription: "Семейный клуб у первой линии с тёплым бассейном, игровой площадкой и мягким сервисом.",
      description: "Saffron Coast создан для семей, которым нужен спокойный ритм отдыха: короткий путь до воды, вечерние прогулки по набережной, бассейн и продуманная детская инфраструктура.",
      address: "пос. Акши, южная набережная",
      zone: "Акши",
      distanceToLakeM: 60,
      latitude: 46.157,
      longitude: 81.641,
      minPrice: 32000,
      maxPrice: 54000,
      foodOptions: "полный пансион",
      accommodationType: "семейные номера",
      contactPhone: "+7 707 121 00 11",
      whatsapp: "77071210011",
      familyFriendly: 1,
      youthFriendly: 0,
      hasPool: 1,
      hasWifi: 1,
      hasParking: 1,
      hasKidsZone: 1,
      isFeatured: 1,
      status: "PUBLISHED",
      includedText: "Трёхразовое питание, пляжная зона, бассейн, детская комната и парковка.",
      rulesText: "Заселение с 14:00, тихие часы после 22:30.",
      beachLine: "Песчаный берег, 1 минута пешком.",
      transferInfo: "Трансфер из Ушарала по запросу.",
      images: [
        ["img-6", "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80", "Рассвет у берега", 0, "beach", 1],
        ["img-7", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80", "Светлый семейный номер", 1, "rooms", 0],
        ["img-8", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80", "Зона отдыха у бассейна", 2, "territory", 0]
      ],
      amenities: ["Бассейн", "Детская зона", "Пляж", "Wi-Fi", "Парковка"],
      prices: [["pr-7", "Стандарт семейный", 32000, "за номер в сутки"], ["pr-8", "Family suite", 54000, "за номер в сутки"]],
      reviews: [["rv-4", "Асем", 5, "Очень спокойное место и детям действительно есть чем заняться."], ["rv-5", "Руслан", 4, "Чисто, близко к воде и удобный семейный формат."]]
    },
    {
      id: "resort-5",
      slug: "azure-dune-resort",
      title: "Azure Dune Resort",
      shortDescription: "Минималистичный курорт с приватными террасами, баром у пляжа и атмосферой длинных закатов.",
      description: "Azure Dune подойдёт тем, кто ищет красивую визуальную среду, приватность и неспешный отдых в стиле boutique-resort у воды.",
      address: "пос. Коктума, западный берег",
      zone: "Коктума",
      distanceToLakeM: 110,
      latitude: 46.089,
      longitude: 81.521,
      minPrice: 41000,
      maxPrice: 76000,
      foodOptions: "завтраки и авторское меню",
      accommodationType: "terrace suites",
      contactPhone: "+7 700 404 55 66",
      whatsapp: "77004045566",
      familyFriendly: 1,
      youthFriendly: 1,
      hasPool: 1,
      hasWifi: 1,
      hasParking: 1,
      hasKidsZone: 0,
      isFeatured: 1,
      status: "PUBLISHED",
      includedText: "Завтрак, шезлонги, доступ к инфинити-бассейну и вечерний чай.",
      rulesText: "Бутик-формат без шумных мероприятий после 23:00.",
      beachLine: "Галечно-песчаный берег, 2 минуты пешком.",
      transferInfo: "Приватный трансфер по предварительной заявке.",
      images: [
        ["img-9", "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80", "Современные виллы", 0, "cover", 1],
        ["img-10", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80", "Светлый интерьер", 1, "rooms", 0],
        ["img-11", "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80", "Ландшафт и закат", 2, "territory", 0]
      ],
      amenities: ["Бассейн", "Терраса", "Бар у пляжа", "Wi-Fi", "Парковка"],
      prices: [["pr-9", "Terrace suite", 41000, "за номер в сутки"], ["pr-10", "Panorama suite", 76000, "за номер в сутки"]],
      reviews: [["rv-6", "Дарина", 5, "Очень красивое место и стильная атмосфера."], ["rv-7", "Ермек", 4, "Хороший уровень сервиса и сильный визуальный стиль."]]
    },
    {
      id: "resort-6",
      slug: "white-sail-residence",
      title: "White Sail Residence",
      shortDescription: "Спокойная резиденция для пар и небольших семей с длинным пирсом и видом на гладкую воду.",
      description: "White Sail делает ставку на тишину, вид и мягкий comfort stay: просторные номера, длинный пирс, лаунж-зоны и аккуратный сервис без суеты.",
      address: "пос. Кабанбай, северный сектор",
      zone: "Кабанбай",
      distanceToLakeM: 95,
      latitude: 46.114,
      longitude: 81.563,
      minPrice: 35000,
      maxPrice: 59000,
      foodOptions: "полупансион",
      accommodationType: "номера и suites",
      contactPhone: "+7 778 222 44 55",
      whatsapp: "77782224455",
      familyFriendly: 1,
      youthFriendly: 0,
      hasPool: 0,
      hasWifi: 1,
      hasParking: 1,
      hasKidsZone: 0,
      isFeatured: 0,
      status: "PUBLISHED",
      includedText: "Завтрак и ужин, доступ к пирсу, парковка и пляжные полотенца.",
      rulesText: "Подходит для спокойного отдыха, без loud-party формата.",
      beachLine: "Ровный берег и деревянный пирс.",
      transferInfo: "Групповой трансфер доступен в высокий сезон.",
      images: [
        ["img-12", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", "Пирс на закате", 0, "beach", 1],
        ["img-13", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80", "Номер с нейтральным интерьером", 1, "rooms", 0],
        ["img-14", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80", "Территория резиденции", 2, "territory", 0]
      ],
      amenities: ["Пирс", "Wi-Fi", "Парковка", "Полупансион"],
      prices: [["pr-11", "Deluxe room", 35000, "за номер в сутки"], ["pr-12", "Residence suite", 59000, "за номер в сутки"]],
      reviews: [["rv-8", "Жанар", 5, "Очень тихий и красивый вариант для отдыха вдвоём."]]
    },
    {
      id: "resort-7",
      slug: "cedar-shore-eco-park",
      title: "Cedar Shore Eco Park",
      shortDescription: "Эко-парк с деревянными домиками, сосновыми дорожками и расслабленным outdoor-форматом.",
      description: "Cedar Shore подходит тем, кто любит природу и формат отдыха ближе к эко-деревне: деревянные домики, мягкая тень, простор и семейный outdoor-ритм.",
      address: "пос. Акши, восточная зелёная линия",
      zone: "Акши",
      distanceToLakeM: 180,
      latitude: 46.182,
      longitude: 81.625,
      minPrice: 26000,
      maxPrice: 47000,
      foodOptions: "завтраки и семейное меню",
      accommodationType: "эко-домики",
      contactPhone: "+7 775 330 91 91",
      whatsapp: "77753309191",
      familyFriendly: 1,
      youthFriendly: 1,
      hasPool: 0,
      hasWifi: 1,
      hasParking: 1,
      hasKidsZone: 1,
      isFeatured: 0,
      status: "PUBLISHED",
      includedText: "Завтрак, мангальная зона, детская площадка и парковка.",
      rulesText: "Разрешены спокойные семейные вечерние посиделки.",
      beachLine: "До воды 4-5 минут через зелёную аллею.",
      transferInfo: "Трансфер в формате шаттла по графику.",
      images: [
        ["img-15", "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80", "Эко-аллея", 0, "territory", 1],
        ["img-16", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80", "Деревянный интерьер", 1, "rooms", 0],
        ["img-17", "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80", "Берег у эко-парка", 2, "beach", 0]
      ],
      amenities: ["Эко-домики", "Детская зона", "BBQ", "Wi-Fi", "Парковка"],
      prices: [["pr-13", "Eco room", 26000, "за номер в сутки"], ["pr-14", "Family eco house", 47000, "за домик в сутки"]],
      reviews: [["rv-9", "Самат", 4, "Приятная территория и хороший вариант для семейного отдыха на природе."]]
    },
    {
      id: "resort-8",
      slug: "sunset-bay-premium",
      title: "Sunset Bay Premium",
      shortDescription: "Премиальный курорт для тех, кто выбирает простор, панорамные виды и уверенный сервис.",
      description: "Sunset Bay Premium делает ставку на широкие номера, панорамные окна, вечерний lounge у воды и премиальный формат отдыха для пар и семей.",
      address: "пос. Коктума, панорамная линия",
      zone: "Коктума",
      distanceToLakeM: 70,
      latitude: 46.077,
      longitude: 81.537,
      minPrice: 48000,
      maxPrice: 92000,
      foodOptions: "премиум-пансион",
      accommodationType: "panorama suites",
      contactPhone: "+7 702 888 77 66",
      whatsapp: "77028887766",
      familyFriendly: 1,
      youthFriendly: 0,
      hasPool: 1,
      hasWifi: 1,
      hasParking: 1,
      hasKidsZone: 1,
      isFeatured: 1,
      status: "PUBLISHED",
      includedText: "Питание, бассейн, lounge-зона, пляжный сервис и трансфер по брони.",
      rulesText: "Премиальный формат проживания, поздний check-out по наличию.",
      beachLine: "Широкая песчаная линия с приватной зоной лежаков.",
      transferInfo: "Индивидуальный трансфер и VIP-встреча.",
      images: [
        ["img-18", "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80", "Панорамный пейзаж", 0, "cover", 1],
        ["img-19", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80", "Премиальный интерьер", 1, "rooms", 0],
        ["img-20", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80", "Лаунж у воды", 2, "territory", 0]
      ],
      amenities: ["Бассейн", "Premium beach", "Kids club", "Wi-Fi", "Парковка"],
      prices: [["pr-15", "Premium suite", 48000, "за номер в сутки"], ["pr-16", "Sunset panorama", 92000, "за номер в сутки"]],
      reviews: [["rv-10", "Ильяс", 5, "Самый цельный premium-вариант из тех, что видел на Алаколе."], ["rv-11", "Аружан", 5, "Красивый свет, простор и очень достойный сервис."]]
    }
  ] as const;

  const insertResort = db.prepare(`
    INSERT INTO resorts (
      id, ownerProfileId, title, slug, shortDescription, description, address, zone,
      distanceToLakeM, latitude, longitude, minPrice, maxPrice, foodOptions, accommodationType,
      contactPhone, whatsapp, familyFriendly, youthFriendly, hasPool, hasWifi, hasParking,
      hasKidsZone, isFeatured, status, includedText, rulesText, beachLine, transferInfo, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertImage = db.prepare("INSERT INTO resort_images (id, resortId, url, alt, sortOrder, kind, isCover) VALUES (?, ?, ?, ?, ?, ?, ?)");
  const insertAmenity = db.prepare("INSERT INTO resort_amenities (id, resortId, label) VALUES (?, ?, ?)");
  const insertPrice = db.prepare("INSERT INTO resort_prices (id, resortId, label, amount, description) VALUES (?, ?, ?, ?, ?)");
  const insertReview = db.prepare("INSERT INTO reviews (id, resortId, authorName, rating, body, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)");

  for (const sample of samples) {
    const exists = db.prepare("SELECT id FROM resorts WHERE slug = ?").get(sample.slug);
    if (exists) continue;

    insertResort.run(
      sample.id, ownerProfileId, sample.title, sample.slug, sample.shortDescription, sample.description, sample.address, sample.zone,
      sample.distanceToLakeM, sample.latitude, sample.longitude, sample.minPrice, sample.maxPrice, sample.foodOptions, sample.accommodationType,
      sample.contactPhone, sample.whatsapp, sample.familyFriendly, sample.youthFriendly, sample.hasPool, sample.hasWifi, sample.hasParking,
      sample.hasKidsZone, sample.isFeatured, sample.status, sample.includedText, sample.rulesText, sample.beachLine, sample.transferInfo, now, now
    );
    sample.images.forEach((item) => insertImage.run(item[0], sample.id, item[1], item[2], item[3], item[4], item[5]));
    sample.amenities.forEach((label, index) => insertAmenity.run(`am-${sample.id}-${index}`, sample.id, label));
    sample.prices.forEach((item) => insertPrice.run(item[0], sample.id, item[1], item[2], item[3]));
    sample.reviews.forEach((item) => insertReview.run(item[0], sample.id, item[1], item[2], item[3], "approved", now));
  }
}

function getResortImages(resortId: string) {
  return getDb().prepare("SELECT * FROM resort_images WHERE resortId = ? ORDER BY isCover DESC, sortOrder ASC").all(resortId).map((row) => rowToResortImage(row as DbRow));
}

function getResortAmenities(resortId: string) {
  return getDb().prepare("SELECT * FROM resort_amenities WHERE resortId = ? ORDER BY label ASC").all(resortId).map((row) => rowToAmenity(row as DbRow));
}

function getResortPrices(resortId: string) {
  return getDb().prepare("SELECT * FROM resort_prices WHERE resortId = ? ORDER BY amount ASC").all(resortId).map((row) => rowToPrice(row as DbRow));
}

function getResortReviews(resortId: string) {
  return getDb().prepare("SELECT * FROM reviews WHERE resortId = ? AND status = 'approved' ORDER BY datetime(createdAt) DESC").all(resortId).map((row) => rowToPublicReview(row as DbRow));
}

function getRatingStats(reviews: Review[]) {
  const approvedReviewsCount = reviews.length;
  const ratingAverage = approvedReviewsCount ? Number((reviews.reduce((sum, item) => sum + item.rating, 0) / approvedReviewsCount).toFixed(1)) : 0;
  return { ratingAverage, approvedReviewsCount };
}

export function getUserByEmail(email: string) {
  const row = getDb().prepare("SELECT * FROM users WHERE email = ?").get(email);
  return row ? rowToUser(row as DbRow) : null;
}

export function getUserById(id: string) {
  const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(id);
  return row ? rowToUser(row as DbRow) : null;
}

export function verifyPassword(user: User, password: string) {
  return bcrypt.compareSync(password, user.passwordHash);
}

export function updateUserPassword(userId: string, password: string) {
  getDb().prepare("UPDATE users SET passwordHash = ? WHERE id = ?").run(bcrypt.hashSync(password, 10), userId);
}

export function createPasswordResetToken(email: string) {
  const user = getUserByEmail(email);
  if (!user) return null;
  const token = `${Math.random().toString(36).slice(2, 8)}${Math.random().toString(36).slice(2, 8)}`;
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();
  getDb()
    .prepare("INSERT INTO password_reset_tokens (id, userId, token, expiresAt, usedAt) VALUES (?, ?, ?, ?, ?)")
    .run(createId("reset"), user.id, token, expiresAt, null);
  createNotification({
    userId: user.id,
    type: "password_reset",
    title: "Запрос на сброс пароля",
    body: `Токен для сброса пароля: ${token}`,
    href: "/reset-password"
  });
  return token;
}

export function getValidPasswordResetToken(token: string) {
  const row = getDb().prepare("SELECT * FROM password_reset_tokens WHERE token = ? AND usedAt IS NULL").get(token);
  if (!row) return null;
  const parsed = row as DbRow;
  const expiresAt = parseDate(parsed.expiresAt);
  if (expiresAt.getTime() < Date.now()) return null;
  return {
    id: String(parsed.id),
    userId: String(parsed.userId),
    token: String(parsed.token),
    expiresAt,
    usedAt: parsed.usedAt ? parseDate(parsed.usedAt) : null
  } satisfies PasswordResetToken;
}

export function markPasswordResetTokenUsed(id: string) {
  getDb().prepare("UPDATE password_reset_tokens SET usedAt = ? WHERE id = ?").run(new Date().toISOString(), id);
}

export function getOwnerProfileById(id: string) {
  const row = getDb().prepare("SELECT * FROM owner_profiles WHERE id = ?").get(id);
  return row ? rowToOwnerProfile(row as DbRow) : null;
}

export function getOwnerProfileByUserId(userId: string) {
  const row = getDb().prepare("SELECT * FROM owner_profiles WHERE userId = ?").get(userId);
  return row ? rowToOwnerProfile(row as DbRow) : null;
}

export function getResortById(id: string) {
  const row = getDb().prepare("SELECT * FROM resorts WHERE id = ?").get(id);
  return row ? rowToResort(row as DbRow) : null;
}

export function enrichResort(resort: Resort): ResortWithRelations {
  const reviews = getResortReviews(resort.id);
  return {
    ...resort,
    images: getResortImages(resort.id),
    amenities: getResortAmenities(resort.id),
    prices: getResortPrices(resort.id),
    ownerProfile: getOwnerProfileById(resort.ownerProfileId) ?? undefined,
    reviews,
    ...getRatingStats(reviews)
  };
}

export function listOwnerResorts(ownerProfileId: string): Resort[] {
  return getDb()
    .prepare("SELECT * FROM resorts WHERE ownerProfileId = ? ORDER BY datetime(updatedAt) DESC")
    .all(ownerProfileId)
    .map((row) => rowToResort(row as DbRow));
}

export function listOwnerLeads(ownerProfileId: string, filters?: { status?: LeadStatus | "all"; q?: string }): OwnerLead[] {
  const rows = getDb().prepare(`
    SELECT leads.*, resorts.title as resortTitle, resorts.ownerProfileId
    FROM leads
    JOIN resorts ON resorts.id = leads.resortId
    WHERE resorts.ownerProfileId = ?
    ORDER BY datetime(leads.createdAt) DESC
  `).all(ownerProfileId) as Array<DbRow & { resortTitle: string; ownerProfileId: string }>;

  return rows
    .map((row) => ({
      ...rowToLead(row),
      resort: {
        id: String(row.resortId),
        title: String(row.resortTitle),
        ownerProfileId: String(row.ownerProfileId)
      }
    }))
    .filter((lead) => (filters?.status && filters.status !== "all" ? lead.status === filters.status : true))
    .filter((lead) => {
      if (!filters?.q) return true;
      const q = filters.q.toLowerCase();
      return [lead.guestName, lead.phone, lead.resort.title, lead.note ?? "", lead.ownerComment ?? ""].join(" ").toLowerCase().includes(q);
    });
}

export function listPendingResorts(): PendingResort[] {
  return getDb()
    .prepare("SELECT * FROM resorts WHERE status IN ('PENDING_REVIEW', 'REJECTED') ORDER BY datetime(updatedAt) DESC")
    .all()
    .map((row) => rowToResort(row as DbRow))
    .map((resort) => {
      const full = enrichResort(resort);
      return {
        ...full,
        moderationReviews: listModerationReviewsByResort(resort.id),
        completeness: getResortCompleteness(full)
      };
    });
}

export function listAudit(limit = 8): AuditItem[] {
  const rows = getDb().prepare(`
    SELECT moderation_reviews.*, resorts.title as resortTitle, users.name as adminName
    FROM moderation_reviews
    JOIN resorts ON resorts.id = moderation_reviews.resortId
    LEFT JOIN users ON users.id = moderation_reviews.adminId
    ORDER BY datetime(moderation_reviews.createdAt) DESC
    LIMIT ?
  `).all(limit) as Array<DbRow & { resortTitle: string; adminName: string | null }>;

  return rows.map((row) => ({
    ...rowToReview(row),
    resort: { id: String(row.resortId), title: String(row.resortTitle) },
    admin: row.adminName ? { name: String(row.adminName) } : undefined
  }));
}

export function listModerationReviewsByResort(resortId: string) {
  return getDb()
    .prepare("SELECT * FROM moderation_reviews WHERE resortId = ? ORDER BY datetime(createdAt) DESC")
    .all(resortId)
    .map((row) => rowToReview(row as DbRow));
}

export function listPublishedResorts() {
  return getDb()
    .prepare("SELECT * FROM resorts WHERE status = 'PUBLISHED' ORDER BY isFeatured DESC, minPrice ASC")
    .all()
    .map((row) => rowToResort(row as DbRow))
    .map(enrichResort);
}

export function listFeaturedResorts() {
  return getDb()
    .prepare("SELECT * FROM resorts WHERE status = 'PUBLISHED' AND isFeatured = 1 ORDER BY minPrice ASC LIMIT 6")
    .all()
    .map((row) => rowToResort(row as DbRow))
    .map(enrichResort);
}

function ensureBaseReviews(db: Database.Database) {
  const insertReview = db.prepare("INSERT INTO reviews (id, resortId, authorName, rating, body, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)");
  const now = new Date().toISOString();
  const samples = [
    ["rv-base-1", "resort-1", "Мадина", 5, "Очень удобный семейный формат и хороший берег."],
    ["rv-base-2", "resort-1", "Талгат", 4, "Чистая территория, детям было комфортно."],
    ["rv-base-3", "resort-2", "Айгерим", 4, "Хороший вариант для компании и выходных у воды."],
    ["rv-base-4", "resort-2", "Нуртас", 5, "Понравились террасы и близость к прогулочной части."]
  ] as const;

  for (const [id, resortId, authorName, rating, body] of samples) {
    const exists = db.prepare("SELECT id FROM reviews WHERE id = ?").get(id);
    if (exists) continue;
    insertReview.run(id, resortId, authorName, rating, body, "approved", now);
  }
}

export function getPublishedResortBySlug(slug: string) {
  const row = getDb().prepare("SELECT * FROM resorts WHERE slug = ? AND status = 'PUBLISHED'").get(slug);
  return row ? enrichResort(rowToResort(row as DbRow)) : null;
}

export function listAllPublishedSlugs() {
  return getDb().prepare("SELECT slug FROM resorts WHERE status = 'PUBLISHED' ORDER BY title ASC").all() as Array<{ slug: string }>;
}

export function createLead(input: { resortId: string; guestName: string; phone: string; note?: string; source?: string }) {
  const id = createId("lead");
  const now = new Date().toISOString();
  getDb()
    .prepare("INSERT INTO leads (id, resortId, guestName, phone, note, ownerComment, status, source, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(id, input.resortId, input.guestName, input.phone, input.note ?? null, null, "new", input.source ?? "site_form", now, now);
  return id;
}

export function updateLead(id: string, input: { status: LeadStatus; ownerComment?: string }) {
  getDb()
    .prepare("UPDATE leads SET status = ?, ownerComment = ?, updatedAt = ? WHERE id = ?")
    .run(input.status, input.ownerComment ?? null, new Date().toISOString(), id);
}

export function updateResortRecord(
  id: string,
  data: Omit<Resort, "id" | "ownerProfileId" | "createdAt"> & { ownerProfileId?: string; createdAt?: Date }
) {
  getDb()
    .prepare(`
      UPDATE resorts SET
        title = ?, slug = ?, shortDescription = ?, description = ?, address = ?, zone = ?,
        distanceToLakeM = ?, latitude = ?, longitude = ?, minPrice = ?, maxPrice = ?, foodOptions = ?,
        accommodationType = ?, contactPhone = ?, whatsapp = ?, familyFriendly = ?, youthFriendly = ?,
        hasPool = ?, hasWifi = ?, hasParking = ?, hasKidsZone = ?, isFeatured = ?, status = ?,
        includedText = ?, rulesText = ?, beachLine = ?, transferInfo = ?, updatedAt = ?
      WHERE id = ?
    `)
    .run(
      data.title,
      data.slug,
      data.shortDescription,
      data.description,
      data.address,
      data.zone,
      data.distanceToLakeM,
      data.latitude,
      data.longitude,
      data.minPrice,
      data.maxPrice,
      data.foodOptions,
      data.accommodationType,
      data.contactPhone,
      data.whatsapp,
      Number(data.familyFriendly),
      Number(data.youthFriendly),
      Number(data.hasPool),
      Number(data.hasWifi),
      Number(data.hasParking),
      Number(data.hasKidsZone),
      Number(data.isFeatured),
      data.status,
      data.includedText,
      data.rulesText,
      data.beachLine,
      data.transferInfo,
      data.updatedAt.toISOString(),
      id
    );
}

export function replaceResortAmenities(resortId: string, labels: string[]) {
  const db = getDb();
  db.prepare("DELETE FROM resort_amenities WHERE resortId = ?").run(resortId);
  const insert = db.prepare("INSERT INTO resort_amenities (id, resortId, label) VALUES (?, ?, ?)");
  labels.forEach((label) => insert.run(createId("amenity"), resortId, label));
}

export function replaceResortImages(resortId: string, items: Array<{ url: string; kind?: string }>) {
  const db = getDb();
  db.prepare("DELETE FROM resort_images WHERE resortId = ?").run(resortId);
  const insert = db.prepare("INSERT INTO resort_images (id, resortId, url, alt, sortOrder, kind, isCover) VALUES (?, ?, ?, ?, ?, ?, ?)");
  items.forEach((item, index) => insert.run(createId("image"), resortId, item.url, `Фото объекта ${index + 1}`, index, item.kind ?? "gallery", index === 0 ? 1 : 0));
}

export function appendResortImages(resortId: string, urls: string[]) {
  const current = getResortImages(resortId).length;
  const insert = getDb().prepare("INSERT INTO resort_images (id, resortId, url, alt, sortOrder, kind, isCover) VALUES (?, ?, ?, ?, ?, ?, ?)");
  urls.forEach((url, index) => insert.run(createId("image"), resortId, url, `Фото объекта ${current + index + 1}`, current + index, "gallery", 0));
}

export function addModerationReview(input: { resortId: string; adminId?: string; action: string; comment?: string }) {
  getDb()
    .prepare("INSERT INTO moderation_reviews (id, resortId, adminId, action, comment, createdAt) VALUES (?, ?, ?, ?, ?, ?)")
    .run(createId("review"), input.resortId, input.adminId ?? null, input.action, input.comment ?? null, new Date().toISOString());
}

export function createReview(input: { resortId: string; userId?: string | null; authorName: string; rating: number; body: string }) {
  getDb()
    .prepare("INSERT INTO reviews (id, resortId, userId, authorName, rating, body, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run(createId("review"), input.resortId, input.userId ?? null, input.authorName, input.rating, input.body, "pending", new Date().toISOString());
}

export function listPendingReviews() {
  return getDb()
    .prepare(`
      SELECT reviews.*, resorts.title as resortTitle
      FROM reviews
      JOIN resorts ON resorts.id = reviews.resortId
      WHERE reviews.status = 'pending'
      ORDER BY datetime(reviews.createdAt) DESC
    `)
    .all()
    .map((row) => ({ ...rowToPublicReview(row as DbRow), resortTitle: String((row as DbRow).resortTitle) }));
}

export function moderateReview(id: string, status: "approved" | "pending") {
  getDb().prepare("UPDATE reviews SET status = ? WHERE id = ?").run(status, id);
}

export function createDraftResort(ownerProfileId: string) {
  const id = createId("resort");
  const now = new Date().toISOString();
  getDb()
    .prepare(`
      INSERT INTO resorts (
        id, ownerProfileId, title, slug, shortDescription, description, address, zone,
        distanceToLakeM, latitude, longitude, minPrice, maxPrice, foodOptions, accommodationType,
        contactPhone, whatsapp, familyFriendly, youthFriendly, hasPool, hasWifi, hasParking,
        hasKidsZone, isFeatured, status, includedText, rulesText, beachLine, transferInfo, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      id,
      ownerProfileId,
      "Новая зона отдыха",
      `new-resort-${Date.now()}`,
      "Добавьте краткое описание объекта.",
      "Опишите преимущества, расположение и атмосферу вашей зоны отдыха.",
      "Алаколь",
      "Акши",
      100,
      46.15,
      81.61,
      25000,
      40000,
      "по договорённости",
      "номера",
      "+7",
      "7",
      1,
      0,
      0,
      1,
      1,
      0,
      0,
      "DRAFT",
      "",
      "",
      "",
      "",
      now,
      now
    );

  return id;
}

export function listFavoritesByUserId(userId: string) {
  return getDb()
    .prepare("SELECT * FROM favorites WHERE userId = ? ORDER BY datetime(createdAt) DESC")
    .all(userId)
    .map((row) => rowToFavorite(row as DbRow));
}

export function isFavoriteForUser(userId: string, resortId: string) {
  const row = getDb().prepare("SELECT id FROM favorites WHERE userId = ? AND resortId = ?").get(userId, resortId);
  return Boolean(row);
}

export function toggleFavoriteForUser(userId: string, resortId: string) {
  const existing = getDb().prepare("SELECT id FROM favorites WHERE userId = ? AND resortId = ?").get(userId, resortId) as DbRow | undefined;
  if (existing?.id) {
    getDb().prepare("DELETE FROM favorites WHERE id = ?").run(String(existing.id));
    return false;
  }

  getDb()
    .prepare("INSERT INTO favorites (id, userId, resortId, createdAt) VALUES (?, ?, ?, ?)")
    .run(createId("favorite"), userId, resortId, new Date().toISOString());

  return true;
}

export function listUserFavoriteResorts(userId: string) {
  return listFavoritesByUserId(userId)
    .map((favorite) => getResortById(favorite.resortId))
    .filter(Boolean)
    .map((resort) => enrichResort(resort!));
}

export function listUserReviews(userId: string): UserReviewItem[] {
  const rows = getDb().prepare(`
    SELECT reviews.*, resorts.title as resortTitle, resorts.slug as resortSlug
    FROM reviews
    JOIN resorts ON resorts.id = reviews.resortId
    WHERE reviews.userId = ?
    ORDER BY datetime(reviews.createdAt) DESC
  `).all(userId) as Array<DbRow & { resortTitle: string; resortSlug: string }>;

  return rows.map((row) => ({
    ...rowToPublicReview(row),
    resort: {
      id: String(row.resortId),
      title: String(row.resortTitle),
      slug: String(row.resortSlug)
    }
  }));
}

export function listAllResortsForFilters() {
  return getDb().prepare("SELECT * FROM resorts").all().map((row) => rowToResort(row as DbRow));
}

export function createNotification(input: { userId: string; type: NotificationType; title: string; body: string; href?: string }) {
  getDb()
    .prepare("INSERT INTO notifications (id, userId, type, title, body, href, createdAt, readAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run(createId("notification"), input.userId, input.type, input.title, input.body, input.href ?? null, new Date().toISOString(), null);
}

export function listNotifications(userId: string, limit = 8) {
  return getDb()
    .prepare("SELECT * FROM notifications WHERE userId = ? ORDER BY datetime(createdAt) DESC LIMIT ?")
    .all(userId, limit)
    .map((row) => rowToNotification(row as DbRow));
}

export function markNotificationRead(id: string) {
  getDb().prepare("UPDATE notifications SET readAt = ? WHERE id = ?").run(new Date().toISOString(), id);
}

export function createAnalyticsEvent(input: { eventType: string; resortId?: string; slug?: string; metadata?: string }) {
  getDb()
    .prepare("INSERT INTO analytics_events (id, eventType, resortId, slug, metadata, createdAt) VALUES (?, ?, ?, ?, ?, ?)")
    .run(createId("event"), input.eventType, input.resortId ?? null, input.slug ?? null, input.metadata ?? null, new Date().toISOString());
}

export function listAnalyticsSummary() {
  const db = getDb();
  const totalLeads = Number((db.prepare("SELECT COUNT(*) as count FROM leads").get() as { count: number }).count);
  const totalPublished = Number((db.prepare("SELECT COUNT(*) as count FROM resorts WHERE status = 'PUBLISHED'").get() as { count: number }).count);
  const totalOwners = Number((db.prepare("SELECT COUNT(*) as count FROM owner_profiles").get() as { count: number }).count);
  const topResorts = db.prepare(`
    SELECT resorts.title as title, COUNT(leads.id) as leadsCount
    FROM resorts
    LEFT JOIN leads ON leads.resortId = resorts.id
    GROUP BY resorts.id
    ORDER BY leadsCount DESC, resorts.title ASC
    LIMIT 5
  `).all() as Array<{ title: string; leadsCount: number }>;
  const eventCounts = db.prepare(`
    SELECT eventType, COUNT(*) as count
    FROM analytics_events
    GROUP BY eventType
    ORDER BY count DESC
  `).all() as Array<{ eventType: string; count: number }>;

  return { totalLeads, totalPublished, totalOwners, topResorts, eventCounts };
}

export function getResortCompleteness(resort: ResortWithRelations | Resort) {
  const base = "images" in resort ? resort : enrichResort(resort);
  const missing: string[] = [];
  if (!base.images.length || !base.images.some((image) => image.isCover || image.kind === "cover")) missing.push("cover-фото");
  if (base.images.length < 3) missing.push("минимум 3 фото");
  if (!base.description.trim() || base.description.trim().length < 140) missing.push("полное описание без пустых мест");
  if (!base.includedText.trim()) missing.push("что включено в цену");
  if (!base.rulesText.trim()) missing.push("правила проживания");
  if (!base.beachLine.trim()) missing.push("описание берега");
  if (!base.contactPhone.trim() || base.contactPhone.trim().length < 7) missing.push("рабочий телефон");
  if (!base.whatsapp.trim() || base.whatsapp.trim().length < 7) missing.push("WhatsApp");
  if (!base.address.trim()) missing.push("адрес");
  if (base.prices.length === 0) missing.push("ценовые пакеты");
  if (base.amenities.length < 3) missing.push("хотя бы 3 удобства");
  if (!base.shortDescription.trim() || base.shortDescription.trim().length < 60) missing.push("сильное краткое описание");
  return { isReady: missing.length === 0, missing };
}

export function listIncompleteResorts() {
  return getDb()
    .prepare("SELECT * FROM resorts ORDER BY datetime(updatedAt) DESC")
    .all()
    .map((row) => rowToResort(row as DbRow))
    .map((resort) => {
      const full = enrichResort(resort);
      return { ...full, completeness: getResortCompleteness(full) };
    })
    .filter((resort) => !resort.completeness.isReady);
}

export function setResortFeatured(id: string, featured: boolean) {
  getDb().prepare("UPDATE resorts SET isFeatured = ?, updatedAt = ? WHERE id = ?").run(Number(featured), new Date().toISOString(), id);
}

export function listAnalyticsEvents(limit = 50) {
  return getDb().prepare("SELECT * FROM analytics_events ORDER BY datetime(createdAt) DESC LIMIT ?").all(limit).map((row) => rowToAnalytics(row as DbRow));
}

export function getDatabasePath() {
  return dbPath;
}
