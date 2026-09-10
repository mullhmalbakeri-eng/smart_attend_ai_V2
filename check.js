const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.employee.findMany({ select: { email: true, role: true } })
  .then(r => console.log(JSON.stringify(r, null, 2)))
  .finally(() => p.$disconnect());