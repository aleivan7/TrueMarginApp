'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function NewJobPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createJob = trpc.jobs.create.useMutation({
    onSuccess: (job) => {
      toast.success('Job created')
      router.push(`/jobs/${job.id}`)
    },
    onError: (error) => {
      setIsSubmitting(false)
      toast.error(`Failed to create job: ${error.message}`)
    },
  })

  const handleSubmit = (formData: FormData) => {
    setIsSubmitting(true)
    const payload = {
      code: (formData.get('code') as string) || '',
      name: (formData.get('name') as string) || '',
      clientName: (formData.get('clientName') as string) || '',
      address: (formData.get('address') as string) || undefined,
      propertyType: (formData.get('propertyType') as 'Residential' | 'Nonresidential') || 'Residential',
      contractType: (formData.get('contractType') as 'LumpSum' | 'Separated') || 'LumpSum',
      salesTaxRatePct: (formData.get('salesTaxRatePct') as string) ? parseFloat(formData.get('salesTaxRatePct') as string) : undefined,
      salesperson: (formData.get('salesperson') as string) || undefined,
      channel: (formData.get('channel') as string) || undefined,
      productType: (formData.get('productType') as string) || undefined,
      quoteTotal: parseFloat((formData.get('quoteTotal') as string) || '0'),
      paymentPlan: (formData.get('paymentPlan') as string) || '',
      overheadOverridePct: (formData.get('overheadOverridePct') as string) ? parseFloat(formData.get('overheadOverridePct') as string) : undefined,
      warrantyReservePct: (formData.get('warrantyReservePct') as string) ? parseFloat(formData.get('warrantyReservePct') as string) : undefined,
      notes: (formData.get('notes') as string) || undefined,
    }

    createJob.mutate(payload)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Job</CardTitle>
            <CardDescription>Enter job details to start tracking this project.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Job Code</Label>
                  <Input id="code" name="code" placeholder="JOB-001" required />
                </div>
                <div>
                  <Label htmlFor="name">Job Name</Label>
                  <Input id="name" name="name" placeholder="Smith Residence - Living Room" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input id="clientName" name="clientName" placeholder="John Smith" required />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" placeholder="123 Main St" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select name="propertyType" defaultValue="Residential">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Residential">Residential</SelectItem>
                      <SelectItem value="Nonresidential">Nonresidential</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="contractType">Contract Type</Label>
                  <Select name="contractType" defaultValue="LumpSum">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LumpSum">Lump Sum</SelectItem>
                      <SelectItem value="Separated">Separated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quoteTotal">Quote Total ($)</Label>
                  <Input id="quoteTotal" name="quoteTotal" type="number" step="0.01" placeholder="0.00" required />
                </div>
                <div>
                  <Label htmlFor="salesTaxRatePct">Sales Tax Rate (%)</Label>
                  <Input id="salesTaxRatePct" name="salesTaxRatePct" type="number" step="0.01" placeholder="Optional" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentPlan">Payment Plan</Label>
                  <Input id="paymentPlan" name="paymentPlan" placeholder="e.g., 50/50" required />
                </div>
                <div>
                  <Label htmlFor="salesperson">Salesperson</Label>
                  <Input id="salesperson" name="salesperson" placeholder="Optional" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="channel">Channel</Label>
                  <Input id="channel" name="channel" placeholder="Optional" />
                </div>
                <div>
                  <Label htmlFor="productType">Product Type</Label>
                  <Input id="productType" name="productType" placeholder="Optional" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="overheadOverridePct">Overhead Override (%)</Label>
                  <Input id="overheadOverridePct" name="overheadOverridePct" type="number" step="0.01" placeholder="Optional" />
                </div>
                <div>
                  <Label htmlFor="warrantyReservePct">Warranty Reserve (%)</Label>
                  <Input id="warrantyReservePct" name="warrantyReservePct" type="number" step="0.01" placeholder="Optional" />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" placeholder="Additional details..." />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Job'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 