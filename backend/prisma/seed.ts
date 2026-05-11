import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding VVCE resources...');

  // 1. Delete existing data to avoid conflicts and duplicates
  // Order matters due to foreign key constraints
  await prisma.waitlist.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.resource.deleteMany({});

  const resources = [
    // A Block
    { name: "A-001 Seminar Hall", type: "Seminar Hall", capacity: 80, location: "A Block", status: "Available" },
    { name: "A-101 Seminar Hall", type: "Seminar Hall", capacity: 80, location: "A Block", status: "Available" },
    { name: "A-201 Seminar Hall", type: "Seminar Hall", capacity: 80, location: "A Block", status: "Available" },
    { name: "A-002 Computer Lab", type: "Computer Lab", capacity: 40, location: "A Block", status: "Available" },
    { name: "A-102 Computer Lab", type: "Computer Lab", capacity: 40, location: "A Block", status: "Available" },
    { name: "A-202 Computer Lab", type: "Computer Lab", capacity: 40, location: "A Block", status: "Available" },
    
    // B Block
    { name: "B-001 Seminar Hall", type: "Seminar Hall", capacity: 80, location: "B Block", status: "Available" },
    { name: "B-101 Seminar Hall", type: "Seminar Hall", capacity: 80, location: "B Block", status: "Available" },
    { name: "B-201 Seminar Hall", type: "Seminar Hall", capacity: 80, location: "B Block", status: "Available" },
    { name: "B-002 Civil Lab", type: "Civil Lab", capacity: 40, location: "B Block", status: "Available" },
    { name: "B-102 Civil Lab", type: "Civil Lab", capacity: 40, location: "B Block", status: "Available" },
    { name: "B-202 Civil Lab", type: "Civil Lab", capacity: 40, location: "B Block", status: "Available" },

    // C Block
    { name: "C-001 Seminar Hall", type: "Seminar Hall", capacity: 80, location: "C Block", status: "Available" },
    { name: "C-101 Seminar Hall", type: "Seminar Hall", capacity: 80, location: "C Block", status: "Available" },
    { name: "C-201 Seminar Hall", type: "Seminar Hall", capacity: 80, location: "C Block", status: "Available" },
    { name: "C-002 Electronics Lab", type: "Electronics Lab", capacity: 40, location: "C Block", status: "Available" },
    { name: "C-102 Electronics Lab", type: "Electronics Lab", capacity: 40, location: "C Block", status: "Available" },
    { name: "C-202 Electrical Lab", type: "Electrical Lab", capacity: 40, location: "C Block", status: "Available" },

    // D Block
    { name: "D-101 Sahukar Channaiah Auditorium", type: "Auditorium", capacity: 500, location: "D Block", status: "Available" },
    { name: "D-201 Seminar Hall", type: "Seminar Hall", capacity: 80, location: "D Block", status: "Available" },
    { name: "D-002 Mechanical Lab", type: "Mechanical Lab", capacity: 40, location: "D Block", status: "Available" },
    { name: "D-102 Mechanical Lab", type: "Mechanical Lab", capacity: 40, location: "D Block", status: "Available" },
    { name: "D-202 Mechanical Lab", type: "Mechanical Lab", capacity: 40, location: "D Block", status: "Available" },

    // G Block
    { name: "G-001 Physics Lab", type: "Physics Lab", capacity: 30, location: "G Block", status: "Available" },
    { name: "G-002 Physics Lab", type: "Physics Lab", capacity: 30, location: "G Block", status: "Available" },
    { name: "G-101 Chemistry Lab", type: "Chemistry Lab", capacity: 30, location: "G Block", status: "Available" },
    { name: "G-102 Chemistry Lab", type: "Chemistry Lab", capacity: 30, location: "G Block", status: "Available" },

    // M Block
    { name: "M-202 Interactive Class", type: "Interactive Class", capacity: 60, location: "M Block", status: "Available" },
    { name: "M-203 Interactive Class", type: "Interactive Class", capacity: 60, location: "M Block", status: "Available" },
    { name: "M-301 Computer Lab", type: "Computer Lab", capacity: 40, location: "M Block", status: "Available" },
    { name: "M-302 Computer Lab", type: "Computer Lab", capacity: 40, location: "M Block", status: "Available" },
    { name: "M-303 Computer Lab", type: "Computer Lab", capacity: 40, location: "M Block", status: "Available" },
    { name: "M-304 Computer Lab", type: "Computer Lab", capacity: 40, location: "M Block", status: "Available" },
    { name: "M-305 Computer Lab", type: "Computer Lab", capacity: 40, location: "M Block", status: "Available" },
    { name: "M-306 Computer Lab", type: "Computer Lab", capacity: 40, location: "M Block", status: "Available" },
    { name: "M-401 Interactive Class", type: "Interactive Class", capacity: 60, location: "M Block", status: "Available" },
    { name: "M-402 Interactive Class", type: "Interactive Class", capacity: 60, location: "M Block", status: "Available" },
    { name: "M-501 Interactive Class", type: "Interactive Class", capacity: 60, location: "M Block", status: "Available" },
    { name: "M-502 Interactive Class", type: "Interactive Class", capacity: 60, location: "M Block", status: "Available" },
    { name: "M-601 TAP Seminar Hall", type: "Seminar Hall", capacity: 100, location: "M Block", status: "Available" },
    { name: "M-602 TAP Seminar Hall", type: "Seminar Hall", capacity: 100, location: "M Block", status: "Available" },

    // Sports Complex
    { name: "Sports Complex", type: "Sports Facility", capacity: 1000, location: "Sports Complex", status: "Available" },
  ];

  for (const resource of resources) {
    await prisma.resource.create({
      data: resource,
    });
    console.log(`Created resource: ${resource.name}`);
  }

  console.log('Successfully seeded VVCE resources and cleaned old data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
