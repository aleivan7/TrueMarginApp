import { Decimal } from '@prisma/client/runtime/library'
import { JobCalculationInput, OrgSettingsInput, BucketDefInput, CalculationResult, BucketAllocationResult } from './types'

export function calculateJobProfit(
  job: JobCalculationInput,
  orgSettings: OrgSettingsInput,
  bucketSet: BucketDefInput[]
): CalculationResult {
  // Revenue calculation
  const revenue = job.quoteTotal.plus(
    job.changeOrders.reduce((sum, co) => sum.plus(co.amount), new Decimal(0))
  )

  // Direct Material Cost
  const directMaterialCost = job.purchases.reduce((total, purchase) => {
    const lineCosts = purchase.lines.reduce((sum, line) => 
      sum.plus(line.quantity.mul(line.unitCost)), new Decimal(0)
    )
    return total.plus(lineCosts).plus(purchase.shippingCost)
  }, new Decimal(0))

  // Direct Labor Cost
  const directLaborCost = job.laborEntries.reduce((sum, entry) => 
    sum.plus(entry.rate.mul(entry.units)), new Decimal(0)
  )

  // Travel Cost
  const travelCost = job.travelEntries.reduce((sum, entry) => {
    const mileageCost = entry.miles.mul(orgSettings.mileageRatePerMile)
    const perDiemCost = entry.perDiemDays.mul(orgSettings.perDiemPerDay)
    return sum.plus(mileageCost).plus(perDiemCost).plus(entry.lodging).plus(entry.other)
  }, new Decimal(0))

  // Payment Fees
  const paymentFees = job.payments.reduce((sum, payment) => {
    let fee = new Decimal(0)
    if (payment.feePct) {
      fee = fee.plus(payment.amount.mul(payment.feePct).div(100))
    }
    if (payment.feeFlat) {
      fee = fee.plus(payment.feeFlat)
    }
    return sum.plus(fee)
  }, new Decimal(0))

  // Warranty Reserve
  const warrantyReservePct = job.warrantyReservePct || new Decimal(3)
  const warrantyReserve = revenue.mul(warrantyReservePct).div(100)

  // Overhead Allocation
  const overheadPct = job.overheadOverridePct || orgSettings.overheadPercent
  const overheadAllocation = revenue.mul(overheadPct).div(100)

  // Contribution Margin
  const contributionMargin = revenue.minus(directMaterialCost).minus(directLaborCost).minus(travelCost)

  // Fully Loaded Profit
  const fullyLoadedProfit = revenue
    .minus(directMaterialCost)
    .minus(directLaborCost)
    .minus(travelCost)
    .minus(overheadAllocation)
    .minus(warrantyReserve)
    .minus(paymentFees)

  // Profit for Allocation (basis for buckets)
  const profitForAllocation = fullyLoadedProfit

  // Bucket Allocations
  const bucketAllocations = calculateBucketAllocations(profitForAllocation, bucketSet)

  return {
    revenue,
    directMaterialCost,
    directLaborCost,
    travelCost,
    paymentFees,
    warrantyReserve,
    overheadAllocation,
    contributionMargin,
    fullyLoadedProfit,
    profitForAllocation,
    bucketAllocations
  }
}

export function calculateBucketAllocations(
  profitForAllocation: Decimal,
  bucketSet: BucketDefInput[]
): Array<{ name: string; percent: Decimal; amount: Decimal; meta?: any }> {
  if (profitForAllocation.lte(0)) {
    return bucketSet.map(bucket => ({
      name: bucket.name,
      percent: bucket.percent,
      amount: new Decimal(0),
      meta: bucket.meta
    }))
  }

  return bucketSet.map(bucket => {
    const amount = profitForAllocation.mul(bucket.percent).div(100)
    
    // Handle Owner Pay split (50/50 between two owners)
    let meta = bucket.meta
    if (bucket.name === 'Owner Pay' && bucket.meta?.owners) {
      const ownerAmount = amount.div(2)
      meta = {
        ...bucket.meta,
        ownerAmounts: bucket.meta.owners.map((owner: string) => ({
          name: owner,
          amount: ownerAmount
        }))
      }
    }

    return {
      name: bucket.name,
      percent: bucket.percent,
      amount,
      meta
    }
  })
}

export function validateBucketSet(bucketSet: BucketDefInput[]): { isValid: boolean; total: Decimal; error?: string } {
  const total = bucketSet.reduce((sum, bucket) => sum.plus(bucket.percent), new Decimal(0))
  const tolerance = new Decimal(0.01)
  
  if (total.sub(100).abs().gt(tolerance)) {
    return {
      isValid: false,
      total,
      error: `Bucket percentages must sum to 100%. Current total: ${total.toString()}%`
    }
  }

  return { isValid: true, total }
}

export function formatCurrency(amount: Decimal): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount.toNumber())
}

export function formatPercent(amount: Decimal): string {
  return `${amount.toFixed(2)}%`
} 