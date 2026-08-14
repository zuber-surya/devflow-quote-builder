import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean up existing data
  await prisma.refreshToken.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.businessProfile.deleteMany();
  await prisma.user.deleteMany();

  // Create a test user
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.create({
    data: {
      email: "demo@example.com",
      name: "Demo User",
      password: hashedPassword,
    },
  });

  console.log("✅ User created:", user.email);

  // Create business profile
  const businessProfile = await prisma.businessProfile.create({
    data: {
      businessName: "Acme Corporation",
      ownerName: "John Doe",
      email: "contact@acme.com",
      phone: "+1-555-0123",
      website: "https://acme.example.com",
      address: "123 Business St",
      city: "New York",
      state: "NY",
      country: "USA",
      postalCode: "10001",
      taxNumber: "12-3456789",
      currency: "USD",
      primaryAccentColor: "#2563eb",
      defaultFooterNote: "Thank you for your business!",
      userId: user.id,
    },
  });

  console.log("✅ Business profile created:", businessProfile.businessName);

  // Create sample customers
  const customer1 = await prisma.customer.create({
    data: {
      customerName: "Jane Smith",
      companyName: "Smith Consulting",
      email: "jane@smith.com",
      phone: "+1-555-0456",
      address: "456 Client Ave",
      city: "Los Angeles",
      state: "CA",
      country: "USA",
      postalCode: "90001",
      taxNumber: "98-7654321",
      userId: user.id,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      customerName: "Bob Johnson",
      companyName: "Johnson Industries",
      email: "bob@johnson.com",
      phone: "+1-555-0789",
      address: "789 Business Blvd",
      city: "Chicago",
      state: "IL",
      country: "USA",
      postalCode: "60601",
      userId: user.id,
    },
  });

  console.log("✅ Customers created");

  // Create sample products
  const product1 = await prisma.product.create({
    data: {
      name: "Consulting Services",
      description: "Professional consulting services",
      sku: "CONS-001",
      price: "150.00",
      taxRate: "10.00",
      unit: "hour",
      userId: user.id,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: "Software Development",
      description: "Custom software development",
      sku: "DEV-001",
      price: "5000.00",
      taxRate: "10.00",
      unit: "project",
      userId: user.id,
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: "Support Services",
      description: "Technical support",
      sku: "SUP-001",
      price: "100.00",
      taxRate: "10.00",
      unit: "month",
      userId: user.id,
    },
  });

  console.log("✅ Products created");

  // Create a sample quote
  const quote = await prisma.quote.create({
    data: {
      quoteNumber: `Q-${new Date().getFullYear()}-00001`,
      customerId: customer1.id,
      status: "DRAFT",
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      subtotal: "9150.00",
      taxAmount: "915.00",
      total: "10065.00",
      notes: "Sample quote for demonstration",
      userId: user.id,
      items: {
        create: [
          {
            productId: product1.id,
            quantity: "10",
            unitPrice: "150.00",
            taxRate: "10.00",
            lineTotal: "1650.00",
          },
          {
            productId: product2.id,
            quantity: "1",
            unitPrice: "5000.00",
            taxRate: "10.00",
            lineTotal: "5500.00",
          },
          {
            productId: product3.id,
            quantity: "12",
            unitPrice: "100.00",
            taxRate: "10.00",
            lineTotal: "1200.00",
          },
        ],
      },
    },
  });

  console.log("✅ Quote created:", quote.quoteNumber);

  // Create a sample invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: `INV-${new Date().getFullYear()}-00001`,
      customerId: customer2.id,
      issuedAt: new Date(),
      dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      subtotal: "500.00",
      taxAmount: "50.00",
      total: "550.00",
      paymentStatus: "UNPAID",
      notes: "Sample invoice for demonstration",
      userId: user.id,
      items: {
        create: [
          {
            productId: product1.id,
            quantity: "3.5",
            unitPrice: "150.00",
            taxRate: "10.00",
            lineTotal: "525.00",
          },
        ],
      },
    },
  });

  console.log("✅ Invoice created:", invoice.invoiceNumber);

  console.log("✨ Database seeded successfully!");
  console.log("\n📝 Test Credentials:");
  console.log("   Email: demo@example.com");
  console.log("   Password: password123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
