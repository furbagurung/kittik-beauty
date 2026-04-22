import { prisma } from "../src/config/prisma.js";

const STATEMENTS = [
  `ALTER TABLE \`ProductVariant\`
    ADD COLUMN \`sku\` VARCHAR(191) NULL AFTER \`title\`,
    ADD COLUMN \`barcode\` VARCHAR(191) NULL AFTER \`sku\`,
    ADD COLUMN \`compareAtPrice\` DOUBLE NULL AFTER \`price\`,
    ADD COLUMN \`costPerItem\` DOUBLE NULL AFTER \`compareAtPrice\`,
    ADD COLUMN \`trackQuantity\` BOOLEAN NOT NULL DEFAULT TRUE AFTER \`stock\`,
    ADD COLUMN \`continueSellingWhenOutOfStock\` BOOLEAN NOT NULL DEFAULT FALSE AFTER \`trackQuantity\`,
    ADD COLUMN \`weight\` DOUBLE NULL AFTER \`continueSellingWhenOutOfStock\`,
    ADD COLUMN \`weightUnit\` ENUM('KG','G','LB','OZ') NULL AFTER \`weight\`,
    ADD COLUMN \`status\` ENUM('ACTIVE','ARCHIVED','OUT_OF_STOCK') NOT NULL DEFAULT 'ACTIVE' AFTER \`position\``,

  `CREATE UNIQUE INDEX \`ProductVariant_sku_key\` ON \`ProductVariant\` (\`sku\`)`,

  `CREATE INDEX \`ProductVariant_productId_status_idx\` ON \`ProductVariant\` (\`productId\`, \`status\`)`,

  `UPDATE \`ProductVariant\` SET \`status\` = 'OUT_OF_STOCK' WHERE \`stock\` = 0`,

  `CREATE TABLE \`VariantOptionSelection\` (
    \`id\` INTEGER NOT NULL AUTO_INCREMENT,
    \`variantId\` INTEGER NOT NULL,
    \`optionId\` INTEGER NOT NULL,
    \`optionValueId\` INTEGER NOT NULL,
    UNIQUE INDEX \`VariantOptionSelection_variantId_optionId_key\`(\`variantId\`, \`optionId\`),
    INDEX \`VariantOptionSelection_optionId_optionValueId_idx\`(\`optionId\`, \`optionValueId\`),
    INDEX \`VariantOptionSelection_variantId_idx\`(\`variantId\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,

  `ALTER TABLE \`VariantOptionSelection\`
    ADD CONSTRAINT \`VariantOptionSelection_variantId_fkey\`
      FOREIGN KEY (\`variantId\`) REFERENCES \`ProductVariant\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT \`VariantOptionSelection_optionId_fkey\`
      FOREIGN KEY (\`optionId\`) REFERENCES \`ProductOption\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT \`VariantOptionSelection_optionValueId_fkey\`
      FOREIGN KEY (\`optionValueId\`) REFERENCES \`ProductOptionValue\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
];

async function main() {
  for (const sql of STATEMENTS) {
    const preview = sql.replace(/\s+/g, " ").slice(0, 90);
    console.log(`→ ${preview}...`);
    await prisma.$executeRawUnsafe(sql);
  }
  console.log("✓ all statements applied");
}

main()
  .catch((error) => {
    console.error("✗ DDL failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
