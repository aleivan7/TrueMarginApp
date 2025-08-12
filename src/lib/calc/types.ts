import { Decimal } from '@prisma/client/runtime/library'

export interface JobCalculationInput {
  quoteTotal: Decimal
  changeOrders: Array<{ amount: Decimal }>
  purchases: Array<{
    shippingCost: Decimal
    lines: Array<{
      quantity: Decimal
      unitCost: Decimal
    }>
  }>
  laborEntries: Array<{
    rate: Decimal
    units: Decimal
  }>
  travelEntries: Array<{
    miles: Decimal
    perDiemDays: Decimal
    lodging: Decimal
    other: Decimal
  }>
  payments: Array<{
    amount: Decimal
    feePct: Decimal | null
    feeFlat: Decimal | null
  }>
  overheadOverridePct: Decimal | null
  warrantyReservePct: Decimal | null
}

export interface OrgSettingsInput {
  overheadPercent: Decimal
  mileageRatePerMile: Decimal
  perDiemPerDay: Decimal
}

export interface BucketDefInput {
  name: string
  percent: Decimal
  meta?: any
}

export interface CalculationResult {
  revenue: Decimal
  directMaterialCost: Decimal
  directLaborCost: Decimal
  travelCost: Decimal
  paymentFees: Decimal
  warrantyReserve: Decimal
  overheadAllocation: Decimal
  contributionMargin: Decimal
  fullyLoadedProfit: Decimal
  profitForAllocation: Decimal
  bucketAllocations: Array<{
    name: string
    percent: Decimal
    amount: Decimal
    meta?: any
  }>
}

export interface BucketAllocationResult {
  buckets: Array<{
    name: string
    percent: Decimal
    amount: Decimal
    meta?: any
  }>
  basis: string
  totals: {
    profitForAllocation: Decimal
    totalAllocated: Decimal
  }
} 