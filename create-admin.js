const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create department if not exists
  let dept = await prisma.department.findFirst();
  if (!dept) {
    dept = await prisma.department.create({ data: { name: 'الإدارة' } });
    console.log('Department created:', dept.id);
  }
  
  // Create or update admin
  const admin = await prisma.employee.upsert({
    where: { email: 'admin@test.com' },
    update: { password: '123456', role: 'ADMIN', name: 'Administrator' },
    create: {
      email: 'admin@test.com',
      password: '123456',
      role: 'ADMIN',
      name: 'Administrator',
      departmentId: dept.id
    }
  });
  
  console.log('Admin created/updated:', admin.email, '- Password: 123456');
  console.log('Role:', admin.role);
  
  // Also create employee
  const employee = await prisma.employee.upsert({
    where: { email: 'employee@test.com' },
    update: { password: '123456', role: 'EMPLOYEE', name: 'Test Employee' },
    create: {
      email: 'employee@test.com',
      password: '123456',
      role: 'EMPLOYEE',
      name: 'Test Employee',
      departmentId: dept.id
    }
  });
  
  console.log('Employee created/updated:', employee.email, '- Password: 123456');
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
