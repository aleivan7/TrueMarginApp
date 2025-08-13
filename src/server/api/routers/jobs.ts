import { z } from 'zod'
import { router, publicProcedure } from '@/lib/trpc/server'
import { Prisma } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

const jobInputSchema = z.object({
  code: z.string(),
  name: z.string(),
  clientName: z.string(),
  address: z.string().optional(),
  propertyType: z.enum(['Residential', 'Nonresidential']),
  contractType: z.enum(['LumpSum', 'Separated']),
  salesTaxRatePct: z.coerce.number().optional(),
  salesperson: z.string().optional(),
  channel: z.string().optional(),
  productType: z.string().optional(),
  quoteTotal: z.coerce.number(),
  paymentPlan: z.string(),
  overheadOverridePct: z.coerce.number().optional(),
  warrantyReservePct: z.coerce.number().optional(),
  notes: z.string().optional(),
})

const changeOrderSchema = z.object({
  name: z.string(),
  amount: z.coerce.number(),
})

const purchaseLineSchema = z.object({
  inventoryItemId: z.string().optional(),
  description: z.string(),
  unit: z.enum(['SQFT', 'LF', 'PIECE', 'ROLL', 'DAY', 'HOUR']),
  quantity: z.coerce.number(),
  unitCost: z.coerce.number(),
})

const purchaseSchema = z.object({
  supplierName: z.string(),
  shippingCost: z.coerce.number(),
  notes: z.string().optional(),
  lines: z.array(purchaseLineSchema),
})

const laborEntrySchema = z.object({
  kind: z.string(),
  rate: z.coerce.number(),
  units: z.coerce.number(),
  notes: z.string().optional(),
})

const travelEntrySchema = z.object({
  miles: z.coerce.number(),
  perDiemDays: z.coerce.number(),
  lodging: z.coerce.number(),
  other: z.coerce.number(),
  notes: z.string().optional(),
})

const paymentSchema = z.object({
  kind: z.string(),
  amount: z.coerce.number(),
  feePct: z.coerce.number().optional(),
  feeFlat: z.coerce.number().optional(),
  receivedAt: z.date().optional(),
})

export const jobsRouter = router({
  create: publicProcedure
    .input(jobInputSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.job.create({
        data: {
          ...input,
          quoteTotal: new Decimal(input.quoteTotal),
          salesTaxRatePct: input.salesTaxRatePct ? new Decimal(input.salesTaxRatePct) : null,
          overheadOverridePct: input.overheadOverridePct ? new Decimal(input.overheadOverridePct) : null,
          warrantyReservePct: input.warrantyReservePct ? new Decimal(input.warrantyReservePct) : null,
        },
      })
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string(),
      data: jobInputSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input
      const updateData: any = { ...data }
      
      if (data.quoteTotal !== undefined) {
        updateData.quoteTotal = new Prisma.Decimal(data.quoteTotal)
      }
      if (data.salesTaxRatePct !== undefined) {
        updateData.salesTaxRatePct = data.salesTaxRatePct ? new Prisma.Decimal(data.salesTaxRatePct) : null
      }
      if (data.overheadOverridePct !== undefined) {
        updateData.overheadOverridePct = data.overheadOverridePct ? new Prisma.Decimal(data.overheadOverridePct) : null
      }
      if (data.warrantyReservePct !== undefined) {
        updateData.warrantyReservePct = data.warrantyReservePct ? new Prisma.Decimal(data.warrantyReservePct) : null
      }

      return ctx.prisma.job.update({
        where: { id },
        data: updateData,
      })
    }),

  get: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.job.findUnique({
        where: { id: input },
        include: {
          changeOrders: true,
          purchases: {
            include: {
              lines: {
                include: {
                  InventoryItem: true,
                },
              },
            },
          },
          materials: {
            include: {
              InventoryItem: true,
            },
          },
          laborEntries: true,
          travelEntries: true,
          payments: true,
          bucketAllocations: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      })
    }),

  list: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      salesperson: z.string().optional(),
      channel: z.string().optional(),
      productType: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const where: Prisma.JobWhereInput = {}
      
      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { clientName: { contains: input.search, mode: 'insensitive' } },
          { code: { contains: input.search, mode: 'insensitive' } },
        ]
      }
      
      if (input.salesperson) {
        where.salesperson = input.salesperson
      }
      
      if (input.channel) {
        where.channel = input.channel
      }
      
      if (input.productType) {
        where.productType = input.productType
      }

      return ctx.prisma.job.findMany({
        where,
        include: {
          changeOrders: true,
          purchases: {
            include: {
              lines: true,
            },
          },
          laborEntries: true,
          travelEntries: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    }),

  addChangeOrder: publicProcedure
    .input(z.object({
      jobId: z.string(),
      changeOrder: changeOrderSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.changeOrder.create({
        data: {
          jobId: input.jobId,
          name: input.changeOrder.name,
          amount: new Prisma.Decimal(input.changeOrder.amount),
        },
      })
    }),

  addPurchase: publicProcedure
    .input(z.object({
      jobId: z.string(),
      purchase: purchaseSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.purchase.create({
        data: {
          jobId: input.jobId,
          supplierName: input.purchase.supplierName,
          shippingCost: new Prisma.Decimal(input.purchase.shippingCost),
          notes: input.purchase.notes,
          lines: {
            create: input.purchase.lines.map(line => ({
              inventoryItemId: line.inventoryItemId,
              description: line.description,
              unit: line.unit,
              quantity: new Prisma.Decimal(line.quantity),
              unitCost: new Prisma.Decimal(line.unitCost),
            })),
          },
        },
        include: {
          lines: {
            include: {
              InventoryItem: true,
            },
          },
        },
      })
    }),

  addLaborEntry: publicProcedure
    .input(z.object({
      jobId: z.string(),
      laborEntry: laborEntrySchema,
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.laborEntry.create({
        data: {
          jobId: input.jobId,
          kind: input.laborEntry.kind,
          rate: new Prisma.Decimal(input.laborEntry.rate),
          units: new Prisma.Decimal(input.laborEntry.units),
          notes: input.laborEntry.notes,
        },
      })
    }),

  addTravelEntry: publicProcedure
    .input(z.object({
      jobId: z.string(),
      travelEntry: travelEntrySchema,
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.travelEntry.create({
        data: {
          jobId: input.jobId,
          miles: new Prisma.Decimal(input.travelEntry.miles),
          perDiemDays: new Prisma.Decimal(input.travelEntry.perDiemDays),
          lodging: new Prisma.Decimal(input.travelEntry.lodging),
          other: new Prisma.Decimal(input.travelEntry.other),
          notes: input.travelEntry.notes,
        },
      })
    }),

  addPayment: publicProcedure
    .input(z.object({
      jobId: z.string(),
      payment: paymentSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.payment.create({
        data: {
          jobId: input.jobId,
          kind: input.payment.kind,
          amount: new Prisma.Decimal(input.payment.amount),
          feePct: input.payment.feePct ? new Prisma.Decimal(input.payment.feePct) : null,
          feeFlat: input.payment.feeFlat ? new Prisma.Decimal(input.payment.feeFlat) : null,
          receivedAt: input.payment.receivedAt,
        },
      })
    }),

  finalize: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      // This will be implemented to create a BucketAllocation snapshot
      // For now, return the job with all related data
      return ctx.prisma.job.findUnique({
        where: { id: input },
        include: {
          changeOrders: true,
          purchases: {
            include: {
              lines: true,
            },
          },
          laborEntries: true,
          travelEntries: true,
          payments: true,
        },
      })
    }),
}) 