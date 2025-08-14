Build “TrueMargin” (Next.js + TS + Prisma + Postgres)

You are an elite full-stack engineer. Create a production-ready web app that calculates true per-job profit for a stretch-ceiling business and allocates the profit into configurable buckets.
Tech stack & project setup

    Next.js (App Router) + TypeScript

    Tailwind + shadcn/ui + lucide-react

    Prisma ORM + PostgreSQL

    tRPC for typesafe server calls

    Zod for schema validation

    React Hook Form + ZodResolver

    Vitest + Testing Library for unit/UI tests

    ESLint + Prettier

    Docker Compose for local Postgres

    Seed script

Project name: true-margin
Core concepts (business rules)

    Unit of work = Job. Each Job has its own P&L.

    Change Orders are separate records tied to a Job (affect revenue and cost).

    Materials: purchased per job (USD), with optional leftover to central inventory for reuse (profiles, LEDs, etc.). Membranes are job-specific.

    Units: SQFT, LF, PIECE, ROLL, DAY, HOUR.

    Labor: in-house hourly and/or subcontract daily rate.

    Travel: miles × rate + per-diem × days.

    Overhead allocation: % of revenue (global default = 15%, editable at org level and override per job).

    Warranty reserve: % of revenue (toggle per job; default 3%).

    Payment plans: presets (50/25/25, 50/50, 100% up-front) + custom.

    Sales tax handling (per job, config only; do not implement jurisdiction logic):

        Property type: Residential | Nonresidential

        Contract type: LumpSum | Separated

        Sales tax rate (editable); treat collected sales tax as pass-through (excluded from profit).

    Franchise/income tax reserve: support bucket allocations (below). No tax filing logic—just reserve/allocate dollars.

    No live margin gauge; show read-only computed totals.

Default settings (editable in Settings UI)

    Overhead % of revenue: 15%

    Travel:

        mileage_rate_per_mile: 0.70

        per_diem_per_day: 30

    Profit Buckets (must total 100%; editable globally and per job):

        Taxes: 20%

        Owner Pay (split 50/50 between two owners): 10%

        Retained Earnings (cash buffer): 10%

        Marketing – Growth: 15%

        Payroll Growth Fund: 15%

        Equipment/Tools/Showroom: 12%

        Tech/Software: 5%

        Training/Education: 3%

        Warranty/Callbacks Reserve: 3%

        Partner/Referral Spiffs: 2%

        Flex/Opportunity Fund: 5%

Data model (Prisma)

Create the following schema (names/fields can be adjusted for best practice, but must cover all data):

enum Unit { SQFT LF PIECE ROLL DAY HOUR }
enum PropertyType { Residential Nonresidential }
enum ContractType { LumpSum Separated }

model User {
  id           String @id @default(cuid())
  email        String @unique
  name         String
  role         String   // "Owner", "Sales", "Marketing" (RBAC minimal for now)
  createdAt    DateTime @default(now())
}

model OrgSettings {
  id                       String   @id @default(cuid())
  overheadPercent          Decimal  @default(15.0)
  mileageRatePerMile       Decimal  @default(0.70)
  perDiemPerDay            Decimal  @default(30.00)
  defaultSalesTaxRatePct   Decimal? // optional default, can be null
  bucketSetId              String?
  bucketSet                BucketSet? @relation(fields: [bucketSetId], references: [id])
  createdAt                DateTime @default(now())
  updatedAt                DateTime @updatedAt
}

model BucketSet {
  id        String @id @default(cuid())
  name      String
  // sum to 100
  buckets   BucketDef[]
  createdAt DateTime @default(now())
}

model BucketDef {
  id          String   @id @default(cuid())
  bucketSetId String
  name        String
  percent     Decimal  // validate total = 100
  // metadata (e.g., owner split, category)
  meta        Json?
  BucketSet   BucketSet @relation(fields: [bucketSetId], references: [id], onDelete: Cascade)
}

model InventoryItem {
  id           String  @id @default(cuid())
  sku          String? @unique
  name         String
  unit         Unit
  defaultCost  Decimal // our cost basis
  defaultPrice Decimal // typical sell price (optional anchor)
  active       Boolean @default(true)
  notes        String?
  createdAt    DateTime @default(now())
}

model InventoryStock {
  id             String @id @default(cuid())
  inventoryItemId String
  quantity       Decimal // in unit terms
  location       String? // optional
  InventoryItem  InventoryItem @relation(fields: [inventoryItemId], references: [id])
  createdAt      DateTime @default(now())
}

model Job {
  id                 String @id @default(cuid())
  code               String @unique
  name               String
  clientName         String
  address            String?
  propertyType       PropertyType
  contractType       ContractType
  salesTaxRatePct    Decimal? // per-job override
  salesperson        String?
  channel            String?  // e.g., referral, IG, showroom
  productType        String?  // e.g., star, matte, fascia
  quoteTotal         Decimal  // user-entered selling price (excl. sales tax)
  paymentPlan        String   // '50/25/25' etc.
  overheadOverridePct Decimal? // optional per-job override
  warrantyReservePct Decimal?  // per-job override (default 3)
  notes              String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  changeOrders       ChangeOrder[]
  materials          JobMaterial[]
  purchases          Purchase[]
  laborEntries       LaborEntry[]
  travelEntries      TravelEntry[]
  payments           Payment[]
  bucketAllocations  BucketAllocation[] // calculated snapshot at time of "Finalize"
}

model ChangeOrder {
  id       String  @id @default(cuid())
  jobId    String
  name     String
  amount   Decimal // +revenue impact; costs recorded via additional materials/labor if needed
  Job      Job     @relation(fields: [jobId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}

model Purchase {
  id            String @id @default(cuid())
  jobId         String
  supplierName  String
  shippingCost  Decimal @default(0)
  notes         String?
  createdAt     DateTime @default(now())
  Job           Job     @relation(fields: [jobId], references: [id], onDelete: Cascade)
  lines         PurchaseLine[]
}

model PurchaseLine {
  id              String @id @default(cuid())
  purchaseId      String
  inventoryItemId String?
  description     String
  unit            Unit
  quantity        Decimal
  unitCost        Decimal
  Purchase        Purchase @relation(fields: [purchaseId], references: [id], onDelete: Cascade)
  InventoryItem   InventoryItem? @relation(fields: [inventoryItemId], references: [id])
}

model JobMaterial {
  id              String @id @default(cuid())
  jobId           String
  inventoryItemId String?
  description     String
  unit            Unit
  quantityUsed    Decimal
  fromStock       Boolean @default(false) // true if pulled from InventoryStock
  wastePercent    Decimal @default(0)     // optional
  Job             Job @relation(fields: [jobId], references: [id], onDelete: Cascade)
  InventoryItem   InventoryItem? @relation(fields: [inventoryItemId], references: [id])
}

model LaborEntry {
  id          String @id @default(cuid())
  jobId       String
  kind        String // "inhouse_hourly" | "subcontract_daily"
  rate        Decimal
  units       Decimal // hours or days
  notes       String?
  Job         Job @relation(fields: [jobId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
}

model TravelEntry {
  id          String @id @default(cuid())
  jobId       String
  miles       Decimal @default(0)
  perDiemDays Decimal @default(0)
  lodging     Decimal @default(0) // optional
  other       Decimal @default(0)
  notes       String?
  Job         Job @relation(fields: [jobId], references: [id], onDelete: Cascade)
}

model Payment {
  id          String @id @default(cuid())
  jobId       String
  kind        String // "Deposit" | "Progress" | "Final" | "Upfront"
  amount      Decimal
  feePct      Decimal? // optional processing fee %
  feeFlat     Decimal? // optional flat fee
  receivedAt  DateTime?
  Job         Job @relation(fields: [jobId], references: [id], onDelete: Cascade)
}

model BucketAllocation {
  id          String @id @default(cuid())
  jobId       String
  snapshot    Json   // { buckets: [{name, percent, amount}], basis: "profit_for_allocation", totals... }
  createdAt   DateTime @default(now())
  Job         Job @relation(fields: [jobId], references: [id], onDelete: Cascade)
}

Calculations (pure functions in /lib/calc/*.ts)

All currency math must use decimals (e.g., decimal.js or Prisma Decimal). Round display to 2 decimals; keep internal precision high.

Given a Job:

    Revenue = job.quoteTotal + sum(changeOrders.amount) (exclude sales tax).

    Direct Material Cost = sum of purchaseLine.quantity * unitCost + sum(purchases.shippingCost).
    If JobMaterial.fromStock = true, cost still reflected via purchase history; for simplicity, you can ignore moving average and treat inventory pulls as zero new cost on that job (we will improve later).

    Direct Labor Cost = sum of LaborEntry.rate * units.

    Travel Cost = sum of miles * mileageRate + perDiemDays * perDiem + lodging + other (using OrgSettings unless overridden).

    Other Direct Costs (optional): payment fees = amount * feePct + feeFlat (sum over Payments).

    Warranty Reserve = revenue * warrantyReservePct (job override or default 3%).

    Overhead Allocation = (overheadOverridePct ?? org.overheadPercent) * revenue / 100.

    Contribution Margin = revenue - (materials + labor + travel).

    Fully Loaded Profit = revenue - (materials + labor + travel + overhead + warranty + paymentFees).

    Profit for Allocation (basis for buckets) = Fully Loaded Profit (exclude sales tax; change orders already included).

    Bucket Allocation = split Profit for Allocation by current BucketSet percentages and return amounts per bucket.

        Owner Pay auto-splits 50/50 into two sub-amounts in the snapshot metadata.

Provide TypeScript unit tests to validate each function with edge cases (zero values, rounding, very small margins, negative change orders).
UI/UX

    Top nav: Jobs, Inventory, Buckets, Settings.

    Jobs > New Job: stepper

        Job Basics (client, propertyType, contractType, salesTaxRate, quoteTotal, payment plan, salesperson, channel, productType)

        Materials (add purchases with lines; add job material usage; optional stock pull checkbox)

        Labor (in-house hourly, subcontract daily)

        Travel (miles, per-diem days, lodging/other)

        Overhead & Reserves (override overhead %, warranty % toggle)

        Taxes & Buckets (view current BucketSet; edit per-job override percentages if needed)

        Review (read-only P&L and Profit Waterfall)

    Right side panel (sticky) on steps: show running totals (Revenue, Direct Costs breakdown, Overhead, Warranty, Profit for Allocation, and Allocated buckets in a simple list). No gauges.

    Jobs List: table with search/filter; columns include margin %, profit $, salesperson, channel, productType, createdAt.

    Job Detail: P&L card; Change Orders tab; Allocations (with snapshot & export CSV).

    Inventory: Items & Stock (basic add/edit).

    Buckets: manage BucketSets (validate sum to 100). Mark one as default.

    Settings: Org settings (overhead %, mileage, per-diem, default sales tax rate), owner names for owner-pay split.

Seed data

Create /prisma/seed.ts to insert:

    OrgSettings (15% overhead, $0.70/mi, $30/day).

    Default BucketSet with the 11 buckets and percentages above (Owner Pay meta includes owners ["Alejandro","Jason"], split 50/50).

    A few InventoryItems typical for projects (editable later), e.g.:

        Stretch Membrane – White Matte (SQFT, defaultCost 2.90, defaultPrice 8.00)

        AL06 Edge Lighting Profile 78" (PIECE, defaultCost 42.00, defaultPrice 95.00)

        AL08 30 Linear Light Profile 79" (PIECE, defaultCost 60.00, defaultPrice 120.00)

        LED Strip 4000K 16.4ft (ROLL, defaultCost 68.00, defaultPrice 149.00)

        Transformer 200W (PIECE, defaultCost 150.00, defaultPrice 260.00)

        Welded Corner (PIECE, defaultCost 5.00, defaultPrice 15.00)

    Example Job with:

        quoteTotal = 12,500

        a purchase with mixed lines and $150 shipping

        labor: 2 subcontract days @ $300/day, 10 in-house hours @ $0 (for now)

        travel: 120 miles, 1 per-diem day

tRPC routers

    jobs: create/update/get/list; finalize to snapshot allocations

    purchases: add/remove lines; attach to jobs

    materials: add job usage; optional “pull from stock”

    labor: CRUD entries

    travel: CRUD entries

    settings: read/update org and bucket sets

    inventory: CRUD items & stock

    calc: pure calc endpoint to recompute a job P&L (returns full breakdown + bucket amounts)

Validation & safeguards

    Zod schemas for all mutations.

    BucketSet must sum to 100 (±0.01 tolerance).

    On “Finalize Job”, write a BucketAllocation snapshot with exact amounts (immutable).

    Treat sales tax as pass-through (excluded from revenue/profit).

    Currency formatting USD; round only on display.

    No auth complexity for now; gate profit pages behind a basic “owner mode” toggle in Settings.

Tests (Vitest)

    Unit tests for all calc functions with at least:

        Base case with the seed job

        Edge case: zero revenue → zero allocations

        Low-margin job where overhead pushes profit near zero

        Change order positive and negative

        Payment fees impact

    Component tests: stepper renders; bucket sum validation error; review page shows correct totals.

    Snapshot for a finalized allocation.

Developer experience

    Scripts:

        dev: next dev

        db:up: docker compose up -d

        db:reset: prisma migrate reset && prisma db seed

        test: vitest run

    .env.example with DATABASE_URL=postgresql://...

    CI-friendly (no flakey tests; all calc tests deterministic).

Acceptance criteria

    I can create a Job, enter materials (with shipping), labor (hourly & daily), travel, overhead %, warranty %, change orders, and see a read-only P&L and Profit Waterfall.

    Bucket allocations use the Fully Loaded Profit basis and match the configured percentages.

    Overhead defaults to 15% of revenue but is editable globally and per job.

    Travel computes from OrgSettings defaults (0.70/mi, 30/day) unless overridden in the entry.

    Sales tax is configurable on the Job and excluded from profit.

    Change Orders are listed separately and included in revenue/calc.

    I can edit the global BucketSet and create per-job overrides.

    Seed data runs clean on a fresh database and shows at least one example job with non-zero allocations.

    All calc unit tests pass.

Non-goals (v1)

    No external integrations (HubSpot/QuickBooks).

    No advanced inventory costing (use simple purchase costs; stock pulls don’t recalc weighted average).

    No tax compliance logic (just reserves/allocations).

    No real auth/permissions beyond a simple owner view toggle.

If you want, I can also generate the initial Prisma schema, seed script, and calc functions as code next.
