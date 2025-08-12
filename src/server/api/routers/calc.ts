import { z } from 'zod'
import { router, publicProcedure } from '@/lib/trpc/server'
import { calculateJobProfit } from '@/lib/calc/job-calculations'

const jobCalculationInputSchema = z.object({
  quoteTotal: z.number(),
  changeOrders: z.array(z.object({
    amount: z.number(),
  })),
  purchases: z.array(z.object({
    shippingCost: z.number(),
    lines: z.array(z.object({
      quantity: z.number(),
      unitCost: z.number(),
    })),
  })),
  laborEntries: z.array(z.object({
    rate: z.number(),
    units: z.number(),
  })),
  travelEntries: z.array(z.object({
    miles: z.number(),
    perDiemDays: z.number(),
    lodging: z.number(),
    other: z.number(),
  })),
  payments: z.array(z.object({
    amount: z.number(),
    feePct: z.number().optional(),
    feeFlat: z.number().optional(),
  })),
  overheadOverridePct: z.number().optional(),
  warrantyReservePct: z.number().optional(),
})

const orgSettingsInputSchema = z.object({
  overheadPercent: z.number(),
  mileageRatePerMile: z.number(),
  perDiemPerDay: z.number(),
})

const bucketDefInputSchema = z.object({
  name: z.string(),
  percent: z.number(),
  meta: z.any().optional(),
})

export const calcRouter = router({
  calculateJobProfit: publicProcedure
    .input(z.object({
      job: jobCalculationInputSchema,
      orgSettings: orgSettingsInputSchema,
      bucketSet: z.array(bucketDefInputSchema),
    }))
    .query(async ({ input }) => {
      const { job, orgSettings, bucketSet } = input
      
      // Convert numbers to Decimal
      const Decimal = (await import('@prisma/client/runtime/library')).Decimal
      
      const jobWithDecimals = {
        ...job,
        quoteTotal: new Decimal(job.quoteTotal),
        changeOrders: job.changeOrders.map(co => ({
          amount: new Decimal(co.amount),
        })),
        purchases: job.purchases.map(purchase => ({
          shippingCost: new Decimal(purchase.shippingCost),
          lines: purchase.lines.map(line => ({
            quantity: new Decimal(line.quantity),
            unitCost: new Decimal(line.unitCost),
          })),
        })),
        laborEntries: job.laborEntries.map(entry => ({
          rate: new Decimal(entry.rate),
          units: new Decimal(entry.units),
        })),
        travelEntries: job.travelEntries.map(entry => ({
          miles: new Decimal(entry.miles),
          perDiemDays: new Decimal(entry.perDiemDays),
          lodging: new Decimal(entry.lodging),
          other: new Decimal(entry.other),
        })),
        payments: job.payments.map(payment => ({
          amount: new Decimal(payment.amount),
          feePct: payment.feePct ? new Decimal(payment.feePct) : null,
          feeFlat: payment.feeFlat ? new Decimal(payment.feeFlat) : null,
        })),
        overheadOverridePct: job.overheadOverridePct ? new Decimal(job.overheadOverridePct) : null,
        warrantyReservePct: job.warrantyReservePct ? new Decimal(job.warrantyReservePct) : null,
      }

      const orgSettingsWithDecimals = {
        overheadPercent: new Decimal(orgSettings.overheadPercent),
        mileageRatePerMile: new Decimal(orgSettings.mileageRatePerMile),
        perDiemPerDay: new Decimal(orgSettings.perDiemPerDay),
      }

      const bucketSetWithDecimals = bucketSet.map(bucket => ({
        name: bucket.name,
        percent: new Decimal(bucket.percent),
        meta: bucket.meta,
      }))

      const result = calculateJobProfit(jobWithDecimals, orgSettingsWithDecimals, bucketSetWithDecimals)

      // Convert Decimal results back to numbers for JSON serialization
      return {
        revenue: result.revenue.toNumber(),
        directMaterialCost: result.directMaterialCost.toNumber(),
        directLaborCost: result.directLaborCost.toNumber(),
        travelCost: result.travelCost.toNumber(),
        paymentFees: result.paymentFees.toNumber(),
        warrantyReserve: result.warrantyReserve.toNumber(),
        overheadAllocation: result.overheadAllocation.toNumber(),
        contributionMargin: result.contributionMargin.toNumber(),
        fullyLoadedProfit: result.fullyLoadedProfit.toNumber(),
        profitForAllocation: result.profitForAllocation.toNumber(),
        bucketAllocations: result.bucketAllocations.map(bucket => ({
          name: bucket.name,
          percent: bucket.percent.toNumber(),
          amount: bucket.amount.toNumber(),
          meta: bucket.meta,
        })),
      }
    }),
}) 