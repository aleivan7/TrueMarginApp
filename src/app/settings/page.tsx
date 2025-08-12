'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false)

  const utils = trpc.useUtils()

  const { data: orgSettings, isLoading } = trpc.settings.getOrgSettings.useQuery()
  const { data: bucketSets } = trpc.settings.listBucketSets.useQuery()

  const updateOrgSettings = trpc.settings.updateOrgSettings.useMutation({
    onSuccess: () => {
      utils.settings.getOrgSettings.invalidate()
      setIsSaving(false)
      toast.success('Settings updated successfully')
    },
    onError: (error) => {
      setIsSaving(false)
      toast.error(`Failed to update settings: ${error.message}`)
    },
  })

  const handleSubmit = (formData: FormData) => {
    setIsSaving(true)
    
    const data = {
      overheadPercent: parseFloat(formData.get('overheadPercent') as string),
      mileageRatePerMile: parseFloat(formData.get('mileageRatePerMile') as string),
      perDiemPerDay: parseFloat(formData.get('perDiemPerDay') as string),
      defaultSalesTaxRatePct: formData.get('defaultSalesTaxRatePct') 
        ? parseFloat(formData.get('defaultSalesTaxRatePct') as string)
        : undefined,
      bucketSetId: formData.get('bucketSetId') as string || undefined,
    }

    updateOrgSettings.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Settings className="h-6 w-6 text-gray-600 dark:text-gray-400 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Organization Settings
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form action={handleSubmit}>
          {/* General Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure default rates and percentages for job calculations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="overheadPercent">Overhead Percentage (%)</Label>
                  <Input
                    id="overheadPercent"
                    name="overheadPercent"
                    type="number"
                    step="0.01"
                    defaultValue={orgSettings?.overheadPercent.toString() || '15.0'}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Default overhead percentage applied to job costs
                  </p>
                </div>
                <div>
                  <Label htmlFor="mileageRatePerMile">Mileage Rate ($/mile)</Label>
                  <Input
                    id="mileageRatePerMile"
                    name="mileageRatePerMile"
                    type="number"
                    step="0.01"
                    defaultValue={orgSettings?.mileageRatePerMile.toString() || '0.70'}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Default mileage reimbursement rate
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="perDiemPerDay">Per Diem Rate ($/day)</Label>
                  <Input
                    id="perDiemPerDay"
                    name="perDiemPerDay"
                    type="number"
                    step="0.01"
                    defaultValue={orgSettings?.perDiemPerDay.toString() || '30.00'}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Default daily per diem allowance
                  </p>
                </div>
                <div>
                  <Label htmlFor="defaultSalesTaxRatePct">Default Sales Tax Rate (%)</Label>
                  <Input
                    id="defaultSalesTaxRatePct"
                    name="defaultSalesTaxRatePct"
                    type="number"
                    step="0.01"
                    defaultValue={orgSettings?.defaultSalesTaxRatePct?.toString() || ''}
                    placeholder="Optional"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Default sales tax rate (optional)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profit Bucket Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Profit Bucket Settings</CardTitle>
              <CardDescription>
                Configure default profit allocation buckets for job calculations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="bucketSetId">Default Bucket Set</Label>
                <select
                  id="bucketSetId"
                  name="bucketSetId"
                  className="w-full mt-1 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  defaultValue={orgSettings?.bucketSetId || ''}
                >
                  <option value="">No default bucket set</option>
                  {bucketSets?.map((bucketSet) => (
                    <option key={bucketSet.id} value={bucketSet.id}>
                      {bucketSet.name} ({bucketSet.buckets.reduce((sum: number, bucket: any) => sum + parseFloat(bucket.percent.toString()), 0)}%)
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Select the default bucket set to use for new jobs
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving} className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
} 