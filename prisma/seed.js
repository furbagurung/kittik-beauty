import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaMariaDb({
  host: "localhost",
  port: 3306,
  user: "kittik_user",
  password: "StrongPassword123!",
  database: "kittik",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding products...");

  await prisma.product.createMany({
    data: [
      {
        name: "Glow Serum",
        price: 1299,
        image:
          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop",
        category: "Skincare",
        rating: 4.8,
      },
      {
        name: "Velvet Lipstick",
        price: 899,
        image:
          "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=800&auto=format&fit=crop",
        category: "Makeup",
        rating: 4.7,
      },
      {
        name: "Hydrating Cream",
        price: 1599,
        image:
          "https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=800&auto=format&fit=crop",
        category: "Skincare",
        rating: 4.9,
      },
      {
        name: "Hair Repair Oil",
        price: 1099,
        image:
          "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop",
        category: "Haircare",
        rating: 4.6,
      },
    ],
  });

  const existingTestProduct = await prisma.product.findFirst({
    where: {
      name: "eSewa Test Product",
    },
  });

  if (!existingTestProduct) {
    await prisma.product.create({
      data: {
        name: "eSewa Test Product",
        price: 0,
        image:
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop",
        category: "Skincare",
        rating: 5,
      },
    });
  }

  console.log("✅ Products seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
