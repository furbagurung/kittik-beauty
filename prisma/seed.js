import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const adapter = new PrismaMariaDb({
  host: "localhost",
  port: 3306,
  user: "kittik_user",
  password: "StrongPassword123!",
  database: "kittik",
});

const prisma = new PrismaClient({ adapter });
const hashedPassword = await bcrypt.hash("Admin123@", 10);

await prisma.user.upsert({
  where: { email: "admin@kittik.com" },
  update: {},
  create: {
    name: "Admin",
    email: "admin@kittik.com",
    password: hashedPassword,
    role: "admin",
  },
});
const products = [
  {
    title: "Glow Serum",
    slug: "glow-serum",
    price: 1299,
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop",
    category: "Skincare",
    rating: 4.8,
  },
  {
    title: "Velvet Lipstick",
    slug: "velvet-lipstick",
    price: 899,
    image:
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=800&auto=format&fit=crop",
    category: "Makeup",
    rating: 4.7,
  },
  {
    title: "Hydrating Cream",
    slug: "hydrating-cream",
    price: 1599,
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=800&auto=format&fit=crop",
    category: "Skincare",
    rating: 4.9,
  },
  {
    title: "Hair Repair Oil",
    slug: "hair-repair-oil",
    price: 1099,
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop",
    category: "Haircare",
    rating: 4.6,
  },
];

async function createProductIfMissing(product) {
  const existing = await prisma.product.findUnique({
    where: { slug: product.slug },
  });

  if (existing) return;

  await prisma.product.create({
    data: {
      title: product.title,
      slug: product.slug,
      category: product.category,
      featuredImage: product.image,
      rating: product.rating,
      status: "ACTIVE",
      media: {
        create: {
          url: product.image,
          altText: product.title,
          position: 0,
        },
      },
      variants: {
        create: {
          title: "Default Title",
          price: product.price,
          stock: 25,
          image: product.image,
          isDefault: true,
          position: 0,
          status: "ACTIVE",
        },
      },
    },
  });
}

async function main() {
  console.log("Seeding products...");

  for (const product of products) {
    await createProductIfMissing(product);
  }

  await createProductIfMissing({
    title: "eSewa Test Product",
    slug: "esewa-test-product",
    price: 0,
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop",
    category: "Skincare",
    rating: 5,
  });

  console.log("Products seeded!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
