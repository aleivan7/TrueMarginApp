import { describe, it, expect } from 'vitest'
import { Decimal } from '@prisma/client/runtime/library'
import { calculateJobProfit, validateBucketSet, formatCurrency, formatPercent } from '../job-calculations'
import type { JobCalculationInput, OrgSettingsInput, BucketDefInput } from '../types'

describe('Job Calculations', () => {
  const mockOrgSettings: OrgSettingsInput = {
    overheadPercent: new Decimal(15.0),
    mileageRatePerMile: new Decimal(0.70),
    perDiemPerDay: new Decimal(30.00),
  }

  const mockBucketSet: BucketDefInput[] = [
    { name: 'Taxes', percent: new Decimal(20.0) },
    { name: 'Owner Pay', percent: new Decimal(10.0), meta: { owners: ['Alejandro', 'Jason'] } },
    { name: 'Retained Earnings', percent: new Decimal(10.0) },
    { name: 'Marketing', percent: new Decimal(15.0) },
    { name: 'Payroll Growth', percent: new Decimal(15.0) },
    { name: 'Equipment', percent: new Decimal(12.0) },
    { name: 'Tech/Software', percent: new Decimal(5.0) },
    { name: 'Training', percent: new Decimal(3.0) },
    { name: 'Warranty', percent: new Decimal(3.0) },
    { name: 'Referrals', percent: new Decimal(2.0) },
    { name: 'Flex Fund', percent: new Decimal(5.0) },
  ]

  describe('calculateJobProfit', () => {
    it('should calculate profit for a basic job', () => {
      const job: JobCalculationInput = {
        quoteTotal: new Decimal(12500.00),
        changeOrders: [{ amount: new Decimal(500.00) }],
        purchases: [{
          shippingCost: new Decimal(150.00),
          lines: [
            { quantity: new Decimal(200.0), unitCost: new Decimal(2.90) },
            { quantity: new Decimal(4.0), unitCost: new Decimal(42.00) },
          ]
        }],
        laborEntries: [
          { rate: new Decimal(300.00), units: new Decimal(2.0) },
          { rate: new Decimal(0.00), units: new Decimal(10.0) },
        ],
        travelEntries: [
          { miles: new Decimal(120.0), perDiemDays: new Decimal(1.0), lodging: new Decimal(0.0), other: new Decimal(0.0) },
        ],
        payments: [
          { amount: new Decimal(6250.00), feePct: new Decimal(2.9), feeFlat: new Decimal(0.30) },
        ],
        overheadOverridePct: null,
        warrantyReservePct: new Decimal(3.0),
      }

      const result = calculateJobProfit(job, mockOrgSettings, mockBucketSet)

      // Revenue = 12500 + 500 = 13000
      expect(result.revenue.toNumber()).toBe(13000.00)

      // Direct Material Cost = (200 * 2.90) + (4 * 42.00) + 150 = 580 + 168 + 150 = 898
      expect(result.directMaterialCost.toNumber()).toBe(898.00)

      // Direct Labor Cost = 300 * 2 + 0 * 10 = 600
      expect(result.directLaborCost.toNumber()).toBe(600.00)

      // Travel Cost = 120 * 0.70 + 1 * 30 = 84 + 30 = 114
      expect(result.travelCost.toNumber()).toBe(114.00)

      // Payment Fees = 6250 * 0.029 + 0.30 = 181.25 + 0.30 = 181.55
      expect(result.paymentFees.toNumber()).toBeCloseTo(181.55, 2)

      // Warranty Reserve = 13000 * 0.03 = 390
      expect(result.warrantyReserve.toNumber()).toBe(390.00)

      // Overhead Allocation = 13000 * 0.15 = 1950
      expect(result.overheadAllocation.toNumber()).toBe(1950.00)

      // Contribution Margin = 13000 - 898 - 600 - 114 = 11388
      expect(result.contributionMargin.toNumber()).toBe(11388.00)

      // Fully Loaded Profit = 13000 - 898 - 600 - 114 - 1950 - 390 - 181.55 = 8866.45
      expect(result.fullyLoadedProfit.toNumber()).toBeCloseTo(8866.45, 2)

      // Profit for Allocation should equal Fully Loaded Profit
      expect(result.profitForAllocation.toNumber()).toBeCloseTo(8866.45, 2)
    })

    it('should handle zero revenue correctly', () => {
      const job: JobCalculationInput = {
        quoteTotal: new Decimal(0.00),
        changeOrders: [],
        purchases: [],
        laborEntries: [],
        travelEntries: [],
        payments: [],
        overheadOverridePct: null,
        warrantyReservePct: null,
      }

      const result = calculateJobProfit(job, mockOrgSettings, mockBucketSet)

      expect(result.revenue.toNumber()).toBe(0.00)
      expect(result.fullyLoadedProfit.toNumber()).toBe(0.00)
      expect(result.profitForAllocation.toNumber()).toBe(0.00)
      expect(result.bucketAllocations.every(bucket => bucket.amount.toNumber() === 0)).toBe(true)
    })

    it('should handle negative change orders', () => {
      const job: JobCalculationInput = {
        quoteTotal: new Decimal(10000.00),
        changeOrders: [{ amount: new Decimal(-1000.00) }],
        purchases: [],
        laborEntries: [],
        travelEntries: [],
        payments: [],
        overheadOverridePct: null,
        warrantyReservePct: null,
      }

      const result = calculateJobProfit(job, mockOrgSettings, mockBucketSet)

      // Revenue = 10000 - 1000 = 9000
      expect(result.revenue.toNumber()).toBe(9000.00)
    })

    it('should handle job-specific overhead override', () => {
      const job: JobCalculationInput = {
        quoteTotal: new Decimal(10000.00),
        changeOrders: [],
        purchases: [],
        laborEntries: [],
        travelEntries: [],
        payments: [],
        overheadOverridePct: new Decimal(20.0), // Override default 15%
        warrantyReservePct: null,
      }

      const result = calculateJobProfit(job, mockOrgSettings, mockBucketSet)

      // Overhead Allocation = 10000 * 0.20 = 2000
      expect(result.overheadAllocation.toNumber()).toBe(2000.00)
    })
  })

  describe('validateBucketSet', () => {
    it('should validate a valid bucket set', () => {
      const result = validateBucketSet(mockBucketSet)
      expect(result.isValid).toBe(true)
      expect(result.total.toNumber()).toBe(100.0)
    })

    it('should reject bucket set that does not sum to 100%', () => {
      const invalidBucketSet: BucketDefInput[] = [
        { name: 'Taxes', percent: new Decimal(20.0) },
        { name: 'Owner Pay', percent: new Decimal(10.0) },
        // Missing 70%
      ]

      const result = validateBucketSet(invalidBucketSet)
      expect(result.isValid).toBe(false)
      expect(result.total.toNumber()).toBe(30.0)
      expect(result.error).toContain('must sum to 100%')
    })

    it('should allow small tolerance for rounding errors', () => {
      const bucketSetWithRounding: BucketDefInput[] = [
        { name: 'Bucket 1', percent: new Decimal(33.333) },
        { name: 'Bucket 2', percent: new Decimal(33.333) },
        { name: 'Bucket 3', percent: new Decimal(33.334) }, // Total: 100.000
      ]

      const result = validateBucketSet(bucketSetWithRounding)
      expect(result.isValid).toBe(true)
    })
  })

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(new Decimal(1234.56))).toBe('$1,234.56')
      expect(formatCurrency(new Decimal(0.00))).toBe('$0.00')
      expect(formatCurrency(new Decimal(1000000.00))).toBe('$1,000,000.00')
    })
  })

  describe('formatPercent', () => {
    it('should format percentage correctly', () => {
      expect(formatPercent(new Decimal(15.0))).toBe('15.00%')
      expect(formatPercent(new Decimal(0.0))).toBe('0.00%')
      expect(formatPercent(new Decimal(100.0))).toBe('100.00%')
    })
  })
}) 