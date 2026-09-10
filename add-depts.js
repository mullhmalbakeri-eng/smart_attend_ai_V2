const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function run() {
  const depts = ['الإدارة', 'المحاسبة', 'التقنية', 'المبيعات', 'الموارد البشرية'];
  for (const name of depts) {
    await p.department.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
  console.log('Done!');
}
run().finally(() => p.$disconnect());
