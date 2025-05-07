import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clear existing data (optional)
  await prisma.activity.deleteMany({});
  
  // Create sample activities
  await prisma.activity.createMany({
    data: [
      {
        title: 'Cricket Match',
        description: 'Weekend cricket tournament',
        location: 'City Sports Complex',
        dateTime: new Date('2023-12-15T14:00:00')
      },
      {
        title: 'Movie Night',
        description: 'Outdoor screening of classic films',
        location: 'Central Park Amphitheater',
        dateTime: new Date('2023-12-10T19:30:00')
      },
      {
        title: 'Football League',
        description: 'Local football league matches',
        location: 'Regional Stadium',
        dateTime: new Date('2023-12-20T16:00:00')
      },
      {
        title: 'Yoga Session',
        description: 'Morning yoga for beginners',
        location: 'Beachfront Park',
        dateTime: new Date('2023-12-12T07:00:00')
      },
      {
        title: 'Art Workshop',
        description: 'Learn watercolor painting',
        location: 'Community Arts Center',
        dateTime: new Date('2023-12-17T11:00:00')
      }
    ],
    skipDuplicates: true
  });

  console.log('Successfully seeded database with sample activities!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });