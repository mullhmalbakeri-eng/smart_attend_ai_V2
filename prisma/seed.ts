import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Delete all existing records first
    console.log('🗑️ Purging existing data...');
    await prisma.attendance.deleteMany({});
    await prisma.employee.deleteMany({});
    await prisma.department.deleteMany({});
    console.log('✅ Database purged successfully');

    // Create departments for Etihad Company
    console.log('🏢 Creating Etihad Company departments...');
    const departments = [
      { id: 1, name: "الموارد البشرية" },
      { id: 2, name: "تقنية المعلومات" },
      { id: 3, name: "المالية والمحاسبة" },
      { id: 4, name: "التسويق والمبيعات" },
      { id: 5, name: "العمليات والخدمات" }
    ];

    for (const dept of departments) {
      await prisma.department.create({ data: dept });
    }
    console.log('✅ Departments created');

    // Create 10 professional employees for Etihad Company
    console.log('👥 Creating 10 Etihad Company employees...');
    const employees = [
      {
        name: "أحمد محمد السعيد",
        email: "ahmed.saeed@etihad.com",
        role: "EMPLOYEE",
        departmentId: 1,
        password: "123456"
      },
      {
        name: "فاطمة علي حسن",
        email: "fatima.ali@etihad.com",
        role: "EMPLOYEE",
        departmentId: 2,
        password: "123456"
      },
      {
        name: "خالد عبدالله الرشيد",
        email: "khalid.rashid@etihad.com",
        role: "EMPLOYEE",
        departmentId: 3,
        password: "123456"
      },
      {
        name: "مريم أحمد خالد",
        email: "mariam.ahmed@etihad.com",
        role: "EMPLOYEE",
        departmentId: 4,
        password: "123456"
      },
      {
        name: "عبدالرحيم إبراهيم",
        email: "abdulrahim.ibrahim@etihad.com",
        role: "EMPLOYEE",
        departmentId: 5,
        password: "123456"
      },
      {
        name: "نورة محمد سالم",
        email: "nora.mohammed@etihad.com",
        role: "EMPLOYEE",
        departmentId: 1,
        password: "123456"
      },
      {
        name: "يوسف عبدالله أحمد",
        email: "yousef.abdullah@etihad.com",
        role: "EMPLOYEE",
        departmentId: 2,
        password: "123456"
      },
      {
        name: "هناء علي محمود",
        email: "hanan.ali@etihad.com",
        role: "EMPLOYEE",
        departmentId: 3,
        password: "123456"
      },
      {
        name: "عمر حسن خالد",
        email: "omar.hassan@etihad.com",
        role: "EMPLOYEE",
        departmentId: 4,
        password: "123456"
      },
      {
        name: "ليلى محمد إبراهيم",
        email: "laila.mohammed@etihad.com",
        role: "EMPLOYEE",
        departmentId: 5,
        password: "123456"
      }
    ];

    for (const emp of employees) {
      await prisma.employee.create({ data: emp });
    }
    console.log('✅ 10 Etihad Company employees created');

    console.log('\n🎉 Etihad Company database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   🏢 Departments: ${departments.length}`);
    console.log(`   👥 Employees: ${employees.length}`);
    console.log(`   🏢 Company: Etihad Company`);
    
    console.log('\n🔐 Login credentials for testing:');
    employees.forEach((emp, index) => {
      console.log(`   ${index + 1}. ${emp.name}: ${emp.email} / 123456`);
    });

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
