import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Updating company name to شركة الاتحاد...');

  try {
    // Update company settings with the new name and specific work times
    const settings = await prisma.companySettings.upsert({
      where: { id: 1 },
      update: {
        companyName: "شركة الاتحاد",
        workStartTime: "08:00",
        workEndTime: "16:00",
        gracePeriodMinutes: 15
      },
      create: {
        companyName: "شركة الاتحاد",
        workStartTime: "08:00",
        workEndTime: "16:00",
        gracePeriodMinutes: 15
      }
    });

    console.log('✅ Company settings updated:', settings.companyName);
    console.log('⏰ Work Start:', settings.workStartTime);
    console.log('⏰ Work End:', settings.workEndTime);
    console.log('⏰ Grace Period:', settings.gracePeriodMinutes, 'minutes');
    console.log('🎉 Company name and settings updated successfully!');

  } catch (error) {
    console.error('❌ Error updating company settings:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Update failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
