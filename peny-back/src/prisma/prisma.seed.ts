import { PrismaClient, UserRole } from '../../generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminEmail = 'admin@penitentiary.com';
  const secretaryEmail = 'secretary@penitentiary.com';

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const adminPasswordHash = await bcrypt.hash('admin123456', 12);

    const admin = await prisma.user.create({
      data: {
        name: 'System Administrator',
        email: adminEmail,
        role: UserRole.ADMIN,
      },
    });

    await prisma.userAuth.create({
      data: {
        userId: admin.id,
        passwordHash: adminPasswordHash,
      },
    });

    console.log('✅ Admin user created:', adminEmail);
  } else {
    console.log('ℹ️ Admin user already exists');
  }

  // Check if secretary already exists
  const existingSecretary = await prisma.user.findUnique({
    where: { email: secretaryEmail },
  });

  if (!existingSecretary) {
    const secretaryPasswordHash = await bcrypt.hash('secretary123456', 12);

    const secretary = await prisma.user.create({
      data: {
        name: 'Secretary User',
        email: secretaryEmail,
        role: UserRole.SECRETARY,
      },
    });

    await prisma.userAuth.create({
      data: {
        userId: secretary.id,
        passwordHash: secretaryPasswordHash,
      },
    });

    console.log('✅ Secretary user created:', secretaryEmail);
  } else {
    console.log('ℹ️ Secretary user already exists');
  }

  console.log('🎉 Seed completed successfully!');
  console.log('📝 Default credentials:');
  console.log('   Admin: admin@penitentiary.com / admin123456');
  console.log('   Secretary: secretary@penitentiary.com / secretary123456');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    return prisma.$disconnect().finally(() => process.exit(1));
  });
