const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function run() {
  const dept = await p.department.findFirst();
  
  const employees = [
    { email: 'ahmed.saeed@etihad.com', name: 'أحمد محمد السعيد', password: '123456' },
    { email: 'fatima.ali@etihad.com', name: 'فاطمة علي حسن', password: '123456' },
    { email: 'khalid.rashid@etihad.com', name: 'خالد عبدالله الرشيد', password: '123456' },
    { email: 'mariam.ahmed@etihad.com', name: 'مريم أحمد خالد', password: '123456' },
    { email: 'omar.hassan@etihad.com', name: 'عمر حسن خالد', password: '123456' },
  ];

  for (const emp of employees) {
    await p.employee.upsert({
      where: { email: emp.email },
      update: {},
      create: { ...emp, role: 'EMPLOYEE', departmentId: dept.id }
    });
  }
  console.log('Done! Added', employees.length, 'employees');
}

run().finally(() => p.$disconnect());