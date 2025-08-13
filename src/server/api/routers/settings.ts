import { z } from 'zod'
import { router, publicProcedure } from '@/lib/trpc/server'
import { Decimal } from '@prisma/client/runtime/library'

const orgSettingsSchema = z.object({
  overheadPercent: z.coerce.number(),
  mileageRatePerMile: z.coerce.number(),
  perDiemPerDay: z.coerce.number(),
  defaultSalesTaxRatePct: z.coerce.number().optional(),
  bucketSetId: z.string().optional(),
})

const bucketDefSchema = z.object({
  name: z.string(),
  percent: z.coerce.number(),
  meta: z.any().optional(),
})

const bucketSetSchema = z.object({
  name: z.string(),
  buckets: z.array(bucketDefSchema),
})

function assertBucketTotalIsHundred(buckets: Array<{ percent: number }>) {
  const total = buckets.reduce((sum, b) => sum + b.percent, 0)
  if (Math.abs(total - 100) > 0.01) {
    throw new Error(`Bucket percentages must sum to 100%. Current total: ${total.toFixed(2)}%`)
  }
}

export const settingsRouter = router({
  // Organization Settings
  getOrgSettings: publicProcedure
    .query(async ({ ctx }) => {
      const settings = await ctx.prisma.orgSettings.findFirst()
      if (!settings) {
        // Create default settings if none exist
        return ctx.prisma.orgSettings.create({
          data: {
            overheadPercent: new Decimal(15.0),
            mileageRatePerMile: new Decimal(0.70),
            perDiemPerDay: new Decimal(30.00),
          },
        })
      }
      return settings
    }),

  updateOrgSettings: publicProcedure
    .input(orgSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const settings = await ctx.prisma.orgSettings.findFirst()
      if (!settings) {
        return ctx.prisma.orgSettings.create({
          data: {
            ...input,
            overheadPercent: new Decimal(input.overheadPercent),
            mileageRatePerMile: new Decimal(input.mileageRatePerMile),
            perDiemPerDay: new Decimal(input.perDiemPerDay),
            defaultSalesTaxRatePct: input.defaultSalesTaxRatePct 
              ? new Decimal(input.defaultSalesTaxRatePct)
              : null,
          },
        })
      }

      return ctx.prisma.orgSettings.update({
        where: { id: settings.id },
        data: {
          overheadPercent: new Decimal(input.overheadPercent),
          mileageRatePerMile: new Decimal(input.mileageRatePerMile),
          perDiemPerDay: new Decimal(input.perDiemPerDay),
          defaultSalesTaxRatePct: input.defaultSalesTaxRatePct 
            ? new Decimal(input.defaultSalesTaxRatePct)
            : null,
          bucketSetId: input.bucketSetId,
        },
      })
    }),

  // Bucket Sets
  createBucketSet: publicProcedure
    .input(bucketSetSchema)
    .mutation(async ({ ctx, input }) => {
      assertBucketTotalIsHundred(input.buckets)
      return ctx.prisma.bucketSet.create({
        data: {
          name: input.name,
          buckets: {
            create: input.buckets.map(bucket => ({
              name: bucket.name,
              percent: new Decimal(bucket.percent),
              meta: bucket.meta,
            })),
          },
        },
        include: {
          buckets: true,
        },
      })
    }),

  updateBucketSet: publicProcedure
    .input(z.object({
      id: z.string(),
      data: bucketSetSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      assertBucketTotalIsHundred(input.data.buckets)
      // Delete existing buckets and recreate
      await ctx.prisma.bucketDef.deleteMany({
        where: { bucketSetId: input.id },
      })

      return ctx.prisma.bucketSet.update({
        where: { id: input.id },
        data: {
          name: input.data.name,
          buckets: {
            create: input.data.buckets.map(bucket => ({
              name: bucket.name,
              percent: new Decimal(bucket.percent),
              meta: bucket.meta,
            })),
          },
        },
        include: {
          buckets: true,
        },
      })
    }),

  getBucketSet: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.bucketSet.findUnique({
        where: { id: input },
        include: {
          buckets: true,
        },
      })
    }),

  listBucketSets: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.bucketSet.findMany({
        include: {
          buckets: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    }),

  deleteBucketSet: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.bucketSet.delete({
        where: { id: input },
      })
    }),

  setDefaultBucketSet: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const settings = await ctx.prisma.orgSettings.findFirst()
      if (!settings) {
        return ctx.prisma.orgSettings.create({
          data: {
            overheadPercent: new (await import('@prisma/client/runtime/library')).Decimal(15.0),
            mileageRatePerMile: new (await import('@prisma/client/runtime/library')).Decimal(0.70),
            perDiemPerDay: new (await import('@prisma/client/runtime/library')).Decimal(30.00),
            bucketSetId: input,
          },
        })
      }

      return ctx.prisma.orgSettings.update({
        where: { id: settings.id },
        data: {
          bucketSetId: input,
        },
      })
    }),
}) 