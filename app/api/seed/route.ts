import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  try {
    // 1. Create User's Admin Account
    await prisma.user.upsert({
      where: { phone: '087855310680' },
      update: { role: 'ADMIN' },
      create: {
        id: 'usr_admin_zaidan',
        name: 'Zaidan (Admin)',
        email: 'zaidan@cleanova.dev',
        phone: '087855310680',
        role: 'ADMIN',
      },
    });

    // 2. Insert Videos (if empty to avoid duplication)
    const existingCount = await prisma.video.count();
    if (existingCount === 0) {
      await prisma.video.createMany({
        data: [
          {
            id: 'vid_1',
            title: 'Membersihkan Perak Kusam dengan Pasta Gigi',
            description: 'Tutorial DIY lengkap mengembalikan warna perak yang teroksidasi hanya dengan barang rumahan.',
            url: 'https://youtube.com/mock',
            category: 'DIY_HACKS'
          },
          {
            id: 'vid_2',
            title: 'Review: Cleanova Gold Polishing Cloth',
            description: 'Cara tepat menggunakan kain poles emas kami agar hasil maksimal tanpa mengikis material.',
            url: 'https://youtube.com/mock',
            category: 'CLEANOVA_PRODUCT'
          },
          {
            id: 'vid_3',
            title: 'Cara Aman Menyikat Berlian Anda',
            description: 'Menjaga pantulan cahaya berlian tanpa merusak dudukan emasnya.',
            url: 'https://youtube.com/mock',
            category: 'DIY_HACKS'
          }
        ]
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Database seeded successfully with ADMIN account!",
      loginCredentials: {
        phone: "087855310680",
        password: "Zaidan1505"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
