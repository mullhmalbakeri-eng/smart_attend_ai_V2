import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create departments first
    console.log('🏢 Creating departments...');
    const hrDept = await prisma.department.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, name: "HR", manager: "Ali" }
    });

    const itDept = await prisma.department.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, name: "IT", manager: "Sara" }
    });

    console.log('✅ Departments created');

    // Create test users with password using raw SQL
    console.log('👥 Creating/updating test users...');

    // Admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: { 
        name: 'Administrator',
        role: 'ADMIN',
        departmentId: itDept.id
      },
      create: {
        email: 'admin@test.com',
        role: 'ADMIN',
        name: 'Administrator',
        uuid: 'admin-uuid-' + Date.now(),
        departmentId: itDept.id
      }
    });

    console.log('✅ Admin user created/updated:', adminUser.email);

    // Employee user
    const employeeUser = await prisma.user.upsert({
      where: { email: 'employee@test.com' },
      update: { 
        name: 'Test Employee',
        role: 'EMPLOYEE',
        departmentId: hrDept.id
      },
      create: {
        email: 'employee@test.com',
        role: 'EMPLOYEE',
        name: 'Test Employee',
        uuid: 'employee-uuid-' + Date.now(),
        departmentId: hrDept.id
      }
    });

    console.log('✅ Employee user created/updated:', employeeUser.email);

    // Update the existing admin user (mullhm200231@gmail.com)
    const existingAdmin = await prisma.user.upsert({
      where: { email: 'mullhm200231@gmail.com' },
      update: { 
        name: 'Main Admin',
        role: 'ADMIN',
        departmentId: itDept.id
      },
      create: {
        email: 'mullhm200231@gmail.com',
        role: 'ADMIN',
        name: 'Main Admin',
        uuid: 'main-admin-uuid-' + Date.now(),
        departmentId: itDept.id
      }
    });

    console.log('✅ Main admin user created/updated:', existingAdmin.email);

    // Create the original users from the old seed
    const ahmadUser = await prisma.user.upsert({
      where: { email: "ahmad@company.com" },
      update: { 
        role: 'ADMIN'
      },
      create: {
        name: "Ahmad",
        email: "ahmad@company.com",
        role: "ADMIN",
        departmentId: itDept.id,
        uuid: 'ahmad-uuid-' + Date.now()
      }
    });

    const saraUser = await prisma.user.upsert({
      where: { email: "sara@company.com" },
      update: { 
        role: 'EMPLOYEE'
      },
      create: {
        name: "Sara",
        email: "sara@company.com",
        role: "EMPLOYEE",
        departmentId: hrDept.id,
        uuid: 'sara-uuid-' + Date.now()
      }
    });

    // Update all users to have password using raw SQL
    console.log('🔄 Updating all users with password...');
    await prisma.$executeRaw`UPDATE User SET password = '123456' WHERE password IS NULL OR password = ''`;
    console.log('✅ All users updated with password');

    // Display all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    console.log('\n📋 All users in database:');
    allUsers.forEach(user => {
      console.log(`   👤 ${user.email} (${user.role}) - ${user.name}`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n🔐 Login credentials:');
    console.log('   🚀 Admin: admin@test.com / 123456');
    console.log('   🚛️  Employee: employee@test.com / 123456');
    console.log('   🚀 Main Admin: mullhm200231@gmail.com / 123456');
    console.log('   🚀 Ahmad: ahmad@company.com / 123456');
    console.log('   🚛️  Sara: sara@company.com / 123456');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
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
