'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calculator, DollarSign, TrendingUp, Package } from 'lucide-react'

export default function CalculatorPage() {
  const [formData, setFormData] = useState({
    revenue: '',
    materialCost: '',
    laborCost: '',
    overheadPercent: '',
    mileage: '',
    perDiemDays: '',
    salesTaxRate: '',
    bucketSetId: '',
  })

  const { data: orgSettings } = trpc.settings.getOrgSettings.useQuery()
  const { data: bucketSets } = trpc.settings.listBucketSets.useQuery()
  const { data: inventoryItems } = trpc.inventory.listItems.useQuery({ active: true })

  const calculateProfit = () => {
    const revenue = parseFloat(formData.revenue) || 0
    const materialCost = parseFloat(formData.materialCost) || 0
    const laborCost = parseFloat(formData.laborCost) || 0
    const overheadPercent = parseFloat(formData.overheadPercent) || (orgSettings?.overheadPercent ? parseFloat(orgSettings.overheadPercent.toString()) : 15)
    const mileage = parseFloat(formData.mileage) || 0
    const perDiemDays = parseFloat(formData.perDiemDays) || 0
    const salesTaxRate = parseFloat(formData.salesTaxRate) || (orgSettings?.defaultSalesTaxRatePct ? parseFloat(orgSettings.defaultSalesTaxRatePct.toString()) : 0)
    const mileageRate = orgSettings?.mileageRatePerMile ? parseFloat(orgSettings.mileageRatePerMile.toString()) : 0.70
    const perDiemRate = orgSettings?.perDiemPerDay ? parseFloat(orgSettings.perDiemPerDay.toString()) : 30

    // Calculate costs
    const mileageCost = mileage * mileageRate
    const perDiemCost = perDiemDays * perDiemRate
    const totalDirectCosts = materialCost + laborCost + mileageCost + perDiemCost
    const overheadCost = totalDirectCosts * (overheadPercent / 100)
    const totalCosts = totalDirectCosts + overheadCost

    // Calculate profit
    const grossProfit = revenue - totalCosts
    const profitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0

    // Calculate sales tax
    const salesTax = revenue * (salesTaxRate / 100)
    const netRevenue = revenue - salesTax
    const netProfit = netRevenue - totalCosts
    const netProfitMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0

    // Calculate bucket allocations
    const selectedBucketSet = bucketSets?.find(bs => bs.id === formData.bucketSetId)
    const bucketAllocations = selectedBucketSet?.buckets.map((bucket: any) => ({
      name: bucket.name,
      amount: netProfit * (parseFloat(bucket.percent.toString()) / 100),
      percentage: parseFloat(bucket.percent.toString())
    })) || []

    return {
      revenue,
      materialCost,
      laborCost,
      mileageCost,
      perDiemCost,
      overheadCost,
      totalCosts,
      grossProfit,
      profitMargin,
      salesTax,
      netRevenue,
      netProfit,
      netProfitMargin,
      bucketAllocations
    }
  }

  const results = calculateProfit()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calculator className="h-6 w-6 text-gray-600 dark:text-gray-400 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Profit Calculator
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>
                Enter the job information to calculate profit margins.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="revenue">Revenue ($)</Label>
                <Input
                  id="revenue"
                  type="number"
                  step="0.01"
                  value={formData.revenue}
                  onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="materialCost">Material Cost ($)</Label>
                  <Input
                    id="materialCost"
                    type="number"
                    step="0.01"
                    value={formData.materialCost}
                    onChange={(e) => setFormData({ ...formData, materialCost: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="laborCost">Labor Cost ($)</Label>
                  <Input
                    id="laborCost"
                    type="number"
                    step="0.01"
                    value={formData.laborCost}
                    onChange={(e) => setFormData({ ...formData, laborCost: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mileage">Mileage</Label>
                  <Input
                    id="mileage"
                    type="number"
                    step="0.1"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="perDiemDays">Per Diem Days</Label>
                  <Input
                    id="perDiemDays"
                    type="number"
                    step="0.5"
                    value={formData.perDiemDays}
                    onChange={(e) => setFormData({ ...formData, perDiemDays: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="overheadPercent">Overhead %</Label>
                  <Input
                    id="overheadPercent"
                    type="number"
                    step="0.01"
                    value={formData.overheadPercent}
                    onChange={(e) => setFormData({ ...formData, overheadPercent: e.target.value })}
                    placeholder={orgSettings?.overheadPercent?.toString() || "15.0"}
                  />
                </div>
                <div>
                  <Label htmlFor="salesTaxRate">Sales Tax %</Label>
                  <Input
                    id="salesTaxRate"
                    type="number"
                    step="0.01"
                    value={formData.salesTaxRate}
                    onChange={(e) => setFormData({ ...formData, salesTaxRate: e.target.value })}
                    placeholder={orgSettings?.defaultSalesTaxRatePct?.toString() || "0"}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bucketSetId">Profit Bucket Set</Label>
                <Select value={formData.bucketSetId} onValueChange={(value) => setFormData({ ...formData, bucketSetId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bucket set (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {bucketSets?.map((bucketSet) => (
                      <SelectItem key={bucketSet.id} value={bucketSet.id}>
                        {bucketSet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Profit Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Revenue</Label>
                    <div className="text-lg font-semibold">${results.revenue.toFixed(2)}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Total Costs</Label>
                    <div className="text-lg font-semibold text-red-600">${results.totalCosts.toFixed(2)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Gross Profit</Label>
                    <div className={`text-lg font-semibold ${results.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${results.grossProfit.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Profit Margin</Label>
                    <div className={`text-lg font-semibold ${results.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {results.profitMargin.toFixed(1)}%
                    </div>
                  </div>
                </div>
                {results.salesTax > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-500">Sales Tax</Label>
                      <div className="text-lg font-semibold">${results.salesTax.toFixed(2)}</div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Net Revenue</Label>
                      <div className="text-lg font-semibold">${results.netRevenue.toFixed(2)}</div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Net Profit</Label>
                    <div className={`text-lg font-semibold ${results.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${results.netProfit.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Net Profit Margin</Label>
                    <div className={`text-lg font-semibold ${results.netProfitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {results.netProfitMargin.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Material Cost</span>
                  <span>${results.materialCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Labor Cost</span>
                  <span>${results.laborCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mileage Cost</span>
                  <span>${results.mileageCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Per Diem Cost</span>
                  <span>${results.perDiemCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Overhead Cost</span>
                  <span>${results.overheadCost.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Costs</span>
                  <span>${results.totalCosts.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Bucket Allocations */}
            {results.bucketAllocations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Profit Allocations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {results.bucketAllocations.map((bucket, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{bucket.name}</span>
                      <span>${bucket.amount.toFixed(2)} ({bucket.percentage}%)</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 