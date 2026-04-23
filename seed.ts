import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding mock data for testing...");

  // Create a mock user
  const user = await prisma.user.upsert({
    where: { phone: '08123456789' },
    update: {},
    create: {
      id: 'usr_mock_123',
      name: 'Member VIP Cleanova',
      email: 'member@cleanova.dev',
      phone: '08123456789',
      role: 'USER',
    },
  });
  console.log('User created:', user.name);

  const admin = await prisma.user.upsert({
    where: { phone: '08999999999' },
    update: {},
    create: {
      id: 'usr_admin_123',
      name: 'Admin Cleanova',
      email: 'admin@cleanova.dev',
      phone: '08999999999',
      role: 'ADMIN',
    },
  });
  console.log('Admin created:', admin.name);

  // Clear existing videos
  await prisma.video.deleteMany();

  // Insert mock videos
  const videos = [
    {
      id: 'vid_1',
      title: 'Membersihkan Perak Kusam dengan Pasta Gigi',
      description: 'Tutorial DIY lengkap mengembalikan warna perak yang teroksidasi hanya dengan barang rumahan.',
      url: 'https://youtube.com/mock',
      category: 'DIY_HACKS' as const,
    },
    {
      id: 'vid_2',
      title: 'Review: Cleanova Gold Polishing Cloth',
      description: 'Cara tepat menggunakan kain poles emas kami agar hasil maksimal tanpa mengikis material.',
      url: 'https://youtube.com/mock',
      category: 'CLEANOVA_PRODUCT' as const,
    },
    {
      id: 'vid_3',
      title: 'Cara Aman Menyikat Berlian Anda',
      description: 'Menjaga pantulan cahaya berlian tanpa merusak dudukan emasnya.',
      url: 'https://youtube.com/mock',
      category: 'DIY_HACKS' as const,
    },
    {
      id: 'vid_4',
      title: 'Unboxing & Tutorial Cleanova Liquid Cleaner',
      description: 'Dosis yang tepat untuk merendam perhiasan perak Anda.',
      url: 'https://youtube.com/mock',
      category: 'CLEANOVA_PRODUCT' as const,
    }
  ];

  for (const v of videos) {
    await prisma.video.create({
      data: v
    });
  }
  console.log('Mock videos inserted successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
