import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create default bucket set
  const defaultBucketSet = await prisma.bucketSet.create({
    data: {
      name: 'Default Profit Allocation',
      buckets: {
        create: [
          { name: 'Taxes', percent: new Decimal(20.0), meta: { category: 'taxes' } },
          { 
            name: 'Owner Pay', 
            percent: new Decimal(10.0), 
            meta: { 
              category: 'compensation',
              owners: ['Alejandro', 'Jason'],
              split: '50/50'
            } 
          },
          { name: 'Retained Earnings', percent: new Decimal(10.0), meta: { category: 'cash_buffer' } },
          { name: 'Marketing – Growth', percent: new Decimal(15.0), meta: { category: 'marketing' } },
          { name: 'Payroll Growth Fund', percent: new Decimal(15.0), meta: { category: 'payroll' } },
          { name: 'Equipment/Tools/Showroom', percent: new Decimal(12.0), meta: { category: 'equipment' } },
          { name: 'Tech/Software', percent: new Decimal(5.0), meta: { category: 'technology' } },
          { name: 'Training/Education', percent: new Decimal(3.0), meta: { category: 'training' } },
          { name: 'Warranty/Callbacks Reserve', percent: new Decimal(3.0), meta: { category: 'warranty' } },
          { name: 'Partner/Referral Spiffs', percent: new Decimal(2.0), meta: { category: 'referrals' } },
          { name: 'Flex/Opportunity Fund', percent: new Decimal(5.0), meta: { category: 'flexible' } },
        ],
      },
    },
  })

  console.log('✅ Created default bucket set')

  // Create org settings
  const orgSettings = await prisma.orgSettings.create({
    data: {
      overheadPercent: new Decimal(15.0),
      mileageRatePerMile: new Decimal(0.70),
      perDiemPerDay: new Decimal(30.00),
      defaultSalesTaxRatePct: new Decimal(8.25),
      bucketSetId: defaultBucketSet.id,
    },
  })

  console.log('✅ Created org settings')

  // Create inventory items
  const inventoryItems = await Promise.all([
    prisma.inventoryItem.create({
      data: {
        sku: 'MEM-WHITE-MATTE',
        name: 'Stretch Membrane – White Matte',
        unit: 'SQFT',
        defaultCost: new Decimal(2.90),
        defaultPrice: new Decimal(8.00),
        active: true,
        notes: 'Standard white matte membrane for stretch ceilings',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        sku: 'AL06-EDGE-78',
        name: 'AL06 Edge Lighting Profile 78"',
        unit: 'PIECE',
        defaultCost: new Decimal(42.00),
        defaultPrice: new Decimal(95.00),
        active: true,
        notes: 'Aluminum edge lighting profile, 78 inches',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        sku: 'AL08-30-79',
        name: 'AL08 30 Linear Light Profile 79"',
        unit: 'PIECE',
        defaultCost: new Decimal(60.00),
        defaultPrice: new Decimal(120.00),
        active: true,
        notes: 'Linear light profile with 30 degree angle',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        sku: 'LED-4000K-16.4',
        name: 'LED Strip 4000K 16.4ft',
        unit: 'ROLL',
        defaultCost: new Decimal(68.00),
        defaultPrice: new Decimal(149.00),
        active: true,
        notes: '4000K LED strip, 16.4 feet per roll',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        sku: 'TRANS-200W',
        name: 'Transformer 200W',
        unit: 'PIECE',
        defaultCost: new Decimal(150.00),
        defaultPrice: new Decimal(260.00),
        active: true,
        notes: '200W LED transformer',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        sku: 'WELD-CORNER',
        name: 'Welded Corner',
        unit: 'PIECE',
        defaultCost: new Decimal(5.00),
        defaultPrice: new Decimal(15.00),
        active: true,
        notes: 'Welded corner piece for profiles',
      },
    }),
  ])

  console.log('✅ Created inventory items')

  // Create example job
  const exampleJob = await prisma.job.create({
    data: {
      code: 'JOB-001',
      name: 'Smith Residence - Living Room',
      clientName: 'John Smith',
      address: '123 Main St, Anytown, CA 90210',
      propertyType: 'Residential',
      contractType: 'LumpSum',
      salesTaxRatePct: new Decimal(8.25),
      salesperson: 'Alejandro',
      channel: 'referral',
      productType: 'matte',
      quoteTotal: new Decimal(12500.00),
      paymentPlan: '50/25/25',
      overheadOverridePct: null, // Use default
      warrantyReservePct: new Decimal(3.0),
      notes: 'Example job for demonstration purposes',
    },
  })

  console.log('✅ Created example job')

  // Create purchase for the example job
  const purchase = await prisma.purchase.create({
    data: {
      jobId: exampleJob.id,
      supplierName: 'StretchCeiling Supply Co',
      shippingCost: new Decimal(150.00),
      notes: 'Initial materials for Smith job',
      lines: {
        create: [
          {
            inventoryItemId: inventoryItems[0].id, // Stretch Membrane
            description: 'Stretch Membrane – White Matte',
            unit: 'SQFT',
            quantity: new Decimal(200.0),
            unitCost: new Decimal(2.90),
          },
          {
            inventoryItemId: inventoryItems[1].id, // Edge Profile
            description: 'AL06 Edge Lighting Profile 78"',
            unit: 'PIECE',
            quantity: new Decimal(4.0),
            unitCost: new Decimal(42.00),
          },
          {
            inventoryItemId: inventoryItems[3].id, // LED Strip
            description: 'LED Strip 4000K 16.4ft',
            unit: 'ROLL',
            quantity: new Decimal(2.0),
            unitCost: new Decimal(68.00),
          },
          {
            inventoryItemId: inventoryItems[4].id, // Transformer
            description: 'Transformer 200W',
            unit: 'PIECE',
            quantity: new Decimal(1.0),
            unitCost: new Decimal(150.00),
          },
        ],
      },
    },
  })

  console.log('✅ Created purchase for example job')

  // Create labor entries
  await Promise.all([
    prisma.laborEntry.create({
      data: {
        jobId: exampleJob.id,
        kind: 'subcontract_daily',
        rate: new Decimal(300.00),
        units: new Decimal(2.0), // 2 days
        notes: 'Subcontractor installation work',
      },
    }),
    prisma.laborEntry.create({
      data: {
        jobId: exampleJob.id,
        kind: 'inhouse_hourly',
        rate: new Decimal(0.00), // Free for now
        units: new Decimal(10.0), // 10 hours
        notes: 'In-house project management',
      },
    }),
  ])

  console.log('✅ Created labor entries')

  // Create travel entry
  await prisma.travelEntry.create({
    data: {
      jobId: exampleJob.id,
      miles: new Decimal(120.0),
      perDiemDays: new Decimal(1.0),
      lodging: new Decimal(0.0),
      other: new Decimal(0.0),
      notes: 'Travel to job site',
    },
  })

  console.log('✅ Created travel entry')

  // Create change order
  await prisma.changeOrder.create({
    data: {
      jobId: exampleJob.id,
      name: 'Additional LED strips for accent lighting',
      amount: new Decimal(500.00),
    },
  })

  console.log('✅ Created change order')

  // Create payment
  await prisma.payment.create({
    data: {
      jobId: exampleJob.id,
      kind: 'Deposit',
      amount: new Decimal(6250.00), // 50% of quote
      feePct: new Decimal(2.9), // Credit card fee
      feeFlat: new Decimal(0.30),
      receivedAt: new Date(),
    },
  })

  console.log('✅ Created payment')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 