import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const bookmarks = await prisma.bookmark.findMany()
  console.log("Bookmarks in DB:", bookmarks)
}
main().catch(console.error).finally(() => prisma.$disconnect())
