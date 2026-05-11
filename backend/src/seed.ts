import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const resources = [
  // A Block
  { name: "A-101 (Main Auditorium)", type: "Auditorium", capacity: 250, location: "A Block", status: "Available", imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80" },
  { name: "A-201 (CSE Seminar Hall)", type: "Hall", capacity: 60, location: "A Block", status: "Available", imageUrl: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=400&q=80" },
  
  // B Block
  { name: "B-105 (Physics Lab)", type: "Lab", capacity: 40, location: "B Block", status: "Available", imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=80" },
  { name: "B-302 (Classroom)", type: "Classroom", capacity: 60, location: "B Block", status: "Available", imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=400&q=80" },

  // C Block
  { name: "C-101 (Board Room)", type: "Meeting Room", capacity: 20, location: "C Block", status: "Available", imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=400&q=80" },

  // M Block
  { name: "M-401 (AI Lab)", type: "Lab", capacity: 30, location: "M Block", status: "Available", imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80" },
  { name: "M-402 (Networking Lab)", type: "Lab", capacity: 30, location: "M Block", status: "Available", imageUrl: "https://images.unsplash.com/photo-1558494949-ef0109dec8d8?auto=format&fit=crop&w=400&q=80" },

  // Sports Complex
  { name: "Indoor Badminton Court", type: "Sports", capacity: 4, location: "Sports Complex", status: "Available", imageUrl: "https://images.unsplash.com/photo-1626225967045-2c7c88b90161?auto=format&fit=crop&w=400&q=80" },

  // H Block
  { name: "H-201 (Library Pod 1)", type: "Study Room", capacity: 4, location: "H Block", status: "Available", imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=400&q=80" },

  // G Block
  { name: "G-102 (Classroom)", type: "Classroom", capacity: 50, location: "G Block", status: "Available", imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=400&q=80" },

  // D Block
  { name: "D-101 (Seminar Hall)", type: "Hall", capacity: 100, location: "D Block", status: "Available", imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80" },
];

async function main() {
  // Clear existing resources to avoid duplicates during re-seeding
  await prisma.resource.deleteMany({});
  
  for (const resource of resources) {
    await prisma.resource.create({ data: resource });
  }
  console.log('Successfully seeded VVCE resources!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
