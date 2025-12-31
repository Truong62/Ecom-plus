import envConfig from 'src/shared/config';
import { ROLE_NAME } from 'src/shared/constants/role.constants';
import { HashingService } from 'src/shared/hashing.service';
import { PrismaService } from 'src/shared/prisma.service';

const prisma = new PrismaService();
const hashing = new HashingService();

const main = async () => {
  const roleCount = await prisma.role.count();

  if (roleCount > 0) throw new Error('Role already exists');

  const roles = await prisma.role.createMany({
    data: [
      {
        name: ROLE_NAME.ADMIN,
        description: 'admin role',
      },
      {
        name: ROLE_NAME.CLIENT,
        description: 'client role',
      },
      {
        name: ROLE_NAME.SELLER,
        description: 'seller role',
      },
    ],
  });

  console.log(`Created ${roles.count} roles`);

  const adminRole = await prisma.role.findFirstOrThrow({
    where: {
      name: ROLE_NAME.ADMIN,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      name: envConfig.ADMIN_NAME,
      email: envConfig.ADMIN_EMAIL,
      password: await hashing.hashPassword(envConfig.ADMIN_PASSWORD),
      phoneNumber: envConfig.ADMIN_PHONE_NUMBER,
      roleId: adminRole.id,
    },
  });

  console.log(`Created admin user: ${adminUser.id}`);
};

main().catch((error) => {
  console.log('=>>>', error);
  process.exit(1);
});
