const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanTodayRecords() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Delete all attendance records for today
    const deletedRecords = await prisma.attendance.deleteMany({
      where: {
        timestamp: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    console.log(`✅ تم حذف ${deletedRecords.count} سجل حضور لليوم`);
    console.log('🎯 قاعدة البيانات نظيفة وجاهزة للاختبار');

  } catch (error) {
    console.error('❌ خطأ في تنظيف السجلات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanTodayRecords();
