import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding company settings...');

  try {
    // Create default company settings
    const settings = await prisma.companySettings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        companyName: "Smart Attend AI",
        workStartTime: "09:00",
        workEndTime: "17:00",
        gracePeriodMinutes: 15
      }
    });

    console.log('✅ Company settings created/updated:', settings.companyName);
    console.log('🎉 Company settings seeding completed!');

  } catch (error) {
    console.error('❌ Error seeding company settings:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
