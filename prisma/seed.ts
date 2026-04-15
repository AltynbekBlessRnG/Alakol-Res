import bcrypt from "bcryptjs";
import { PrismaClient, ResortStatus, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.moderationReview.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.resortPrice.deleteMany();
  await prisma.resortAmenity.deleteMany();
  await prisma.resortImage.deleteMany();
  await prisma.resort.deleteMany();
  await prisma.resortOwnerProfile.deleteMany();
  await prisma.user.deleteMany();

  const ownerPasswordHash = await bcrypt.hash("owner123", 10);
  const adminPasswordHash = await bcrypt.hash("admin123", 10);

  const owner = await prisma.user.create({
    data: {
      email: "owner@alakol.kz",
      name: "Sunrise Travel",
      passwordHash: ownerPasswordHash,
      role: UserRole.OWNER,
      ownerProfile: {
        create: {
          company: "Sunrise Travel",
          phone: "+7 777 100 20 30",
          whatsapp: "7771002030"
        }
      }
    },
    include: {
      ownerProfile: true
    }
  });

  await prisma.user.create({
    data: {
      email: "admin@alakol.kz",
      name: "Alakol Admin",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN
    }
  });

  if (!owner.ownerProfile) {
    throw new Error("Owner profile was not created.");
  }

  const resorts = [
    {
      title: "Aqua Marina Resort",
      slug: "aqua-marina-resort",
      shortDescription: "Панорамный берег, семейный формат и тёплый бассейн у первой линии.",
      description:
        "Aqua Marina подойдёт для спокойного семейного отдыха у воды: большой пляж, закрытая территория, детская анимация и просторные номера с видом на Алаколь.",
      address: "пос. Акши, первая береговая линия",
      zone: "Акши",
      distanceToLakeM: 80,
      latitude: 46.163,
      longitude: 81.633,
      minPrice: 28000,
      maxPrice: 52000,
      foodOptions: "трёхразовое питание",
      accommodationType: "семейные номера и коттеджи",
      contactPhone: "+7 705 440 11 22",
      whatsapp: "77054401122",
      familyFriendly: true,
      youthFriendly: false,
      hasPool: true,
      hasWifi: true,
      hasParking: true,
      hasKidsZone: true,
      isFeatured: true,
      status: ResortStatus.PUBLISHED,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
            alt: "Пляж и пирс у Aqua Marina",
            sortOrder: 0
          },
          {
            url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
            alt: "Территория отеля с деревьями",
            sortOrder: 1
          }
        ]
      },
      amenities: {
        create: [{ label: "Бассейн" }, { label: "Детская зона" }, { label: "Песчаный пляж" }, { label: "Wi-Fi" }]
      },
      prices: {
        create: [
          { label: "Стандарт", amount: 28000, description: "за номер в сутки" },
          { label: "Семейный люкс", amount: 52000, description: "за номер в сутки" }
        ]
      }
    },
    {
      title: "Nomad Breeze Village",
      slug: "nomad-breeze-village",
      shortDescription: "Стильные домики для компании, барбекю-зоны и близость к ночной жизни.",
      description:
        "Nomad Breeze — более динамичный формат для друзей и пар: террасы, вечерняя музыка, лаунж-зоны и комфортный доступ к кафе и прогулочной части берега.",
      address: "пос. Кабанбай, центральная улица",
      zone: "Кабанбай",
      distanceToLakeM: 240,
      latitude: 46.101,
      longitude: 81.552,
      minPrice: 22000,
      maxPrice: 41000,
      foodOptions: "завтраки и grill menu",
      accommodationType: "домики и loft-номера",
      contactPhone: "+7 701 555 67 89",
      whatsapp: "77015556789",
      familyFriendly: false,
      youthFriendly: true,
      hasPool: false,
      hasWifi: true,
      hasParking: true,
      hasKidsZone: false,
      isFeatured: true,
      status: ResortStatus.PUBLISHED,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80",
            alt: "Домики у Nomad Breeze",
            sortOrder: 0
          },
          {
            url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
            alt: "Терраса для отдыха",
            sortOrder: 1
          }
        ]
      },
      amenities: {
        create: [{ label: "BBQ" }, { label: "Террасы" }, { label: "Wi-Fi" }, { label: "Парковка" }]
      },
      prices: {
        create: [
          { label: "Loft room", amount: 22000, description: "за номер в сутки" },
          { label: "Домик на компанию", amount: 41000, description: "за домик в сутки" }
        ]
      }
    },
    {
      title: "Laguna Silence Spa",
      slug: "laguna-silence-spa",
      shortDescription: "Тихая spa-зона у берега с приватными террасами и повышенным комфортом.",
      description:
        "Laguna Silence создана для размеренного отдыха: оздоровительные процедуры, приватные террасы, внимательный сервис и акцент на спокойствие.",
      address: "пос. Акши, северный сектор",
      zone: "Акши",
      distanceToLakeM: 120,
      latitude: 46.175,
      longitude: 81.612,
      minPrice: 36000,
      maxPrice: 68000,
      foodOptions: "полный пансион",
      accommodationType: "spa suites",
      contactPhone: "+7 747 332 22 11",
      whatsapp: "77473322211",
      familyFriendly: true,
      youthFriendly: false,
      hasPool: true,
      hasWifi: true,
      hasParking: true,
      hasKidsZone: false,
      isFeatured: false,
      status: ResortStatus.PENDING_REVIEW,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
            alt: "Тихий пляж у Laguna Silence",
            sortOrder: 0
          }
        ]
      },
      amenities: {
        create: [{ label: "SPA" }, { label: "Бассейн" }, { label: "Терраса" }, { label: "Трансфер" }]
      },
      prices: {
        create: [
          { label: "Spa suite", amount: 36000, description: "за номер в сутки" },
          { label: "Lake terrace suite", amount: 68000, description: "за номер в сутки" }
        ]
      }
    }
  ];

  for (const resort of resorts) {
    await prisma.resort.create({
      data: {
        ownerProfileId: owner.ownerProfile.id,
        ...resort
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
