const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function seed() {
  const dept = await p.department.create({ data: { name: 'الإدارة' } });
  
  await p.employee.create({
    data: {
      email: 'admin@etihad.com',
      name: 'مدير النظام',
      password: 'admin123',
      role: 'ADMIN',
      departmentId: dept.id
    }
  });

  await p.employee.create({
    data: {
      email: 'ahmed.saeed@etihad.com',
      name: 'أحمد محمد السعيد',
      password: '123456',
      role: 'EMPLOYEE',
      departmentId: dept.id
    }
  });

  await p.companySettings.create({
    data: { companyName: 'شركة الاتحاد' }
  });

  console.log('Done!');
}

seed().finally(() => p.$disconnect());