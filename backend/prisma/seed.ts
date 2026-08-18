import 'dotenv/config';
import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const users = [
  { email: 'admin@test.com', name: 'admin', role: UserRole.ADMIN },
  { email: 'user1@test.com', name: 'user1', role: UserRole.USER },
  { email: 'user2@test.com', name: 'user2', role: UserRole.USER },
  { email: 'user3@test.com', name: 'user3', role: UserRole.USER },
  { email: 'user4@test.com', name: 'user4', role: UserRole.USER },
  { email: 'user5@test.com', name: 'user5', role: UserRole.USER },
  { email: 'user6@test.com', name: 'user6', role: UserRole.USER },
  { email: 'user7@test.com', name: 'user7', role: UserRole.USER },
  { email: 'user8@test.com', name: 'user8', role: UserRole.USER },
  { email: 'user9@test.com', name: 'user9', role: UserRole.USER },
  { email: 'user10@test.com', name: 'user10', role: UserRole.USER },
];

const now = new Date();
const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

const inventoryItems = [
  {
    name: 'Item 1',
    sku: 'ITEM-001',
    totalQuantity: 100,
    remainingQuantity: 100,
    saleStart: now,
    saleEnd: oneWeekLater,
    isActive: true,
  },
  {
    name: 'Item 2',
    sku: 'ITEM-002',
    totalQuantity: 50,
    remainingQuantity: 50,
    saleStart: oneWeekLater,
    saleEnd: twoWeeksLater,
    isActive: true,
  },
  {
    name: 'Item 3',
    sku: 'ITEM-003',
    totalQuantity: 25,
    remainingQuantity: 0,
    saleStart: oneWeekAgo,
    saleEnd: oneWeekLater,
    isActive: true,
  },
  {
    name: 'Item 4',
    sku: 'ITEM-004',
    totalQuantity: 200,
    remainingQuantity: 150,
    saleStart: oneWeekAgo,
    saleEnd: now,
    isActive: false,
  },
  {
    name: 'Item 5',
    sku: 'ITEM-005',
    totalQuantity: 75,
    remainingQuantity: 75,
    saleStart: now,
    saleEnd: twoWeeksLater,
    isActive: true,
  },
];

async function main() {
  console.log('Seeding database...');

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }
  console.log(`Seeded ${users.length} users`);

  for (const item of inventoryItems) {
    await prisma.inventoryItem.upsert({
      where: { sku: item.sku },
      update: {},
      create: item,
    });
  }
  console.log(`Seeded ${inventoryItems.length} inventory items`);

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
