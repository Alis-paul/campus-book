/**
 * One-time script to fix a user's role in the database.
 * Run with: npx ts-node fix-role.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Change this email to the account you want to fix
  const EMAIL_TO_FIX = 'user@gmail.com';
  const NEW_ROLE = 'faculty';

  const user = await prisma.user.findUnique({ where: { email: EMAIL_TO_FIX } });
  
  if (!user) {
    console.error(`❌ User not found: ${EMAIL_TO_FIX}`);
    process.exit(1);
  }

  console.log(`Found user: ${user.name} (current role: ${user.role})`);

  const updated = await prisma.user.update({
    where: { email: EMAIL_TO_FIX },
    data: { role: NEW_ROLE },
    select: { id: true, name: true, email: true, role: true }
  });

  console.log(`✅ Role updated to '${NEW_ROLE}':`, updated);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
