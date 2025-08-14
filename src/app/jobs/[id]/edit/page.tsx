"use client"

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function EditJobPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id as string

  const { data: job, isLoading } = trpc.jobs.get.useQuery(id, { enabled: !!id })
  const updateJob = trpc.jobs.update.useMutation({
    onSuccess: () => {
      toast.success('Job updated')
      router.push(`/jobs/${id}`)
    },
    onError: (error) => {
      setIsSubmitting(false)
      toast.error(`Failed to update job: ${error.message}`)
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (formData: FormData) => {
    setIsSubmitting(true)
    const payload = {
      code: (formData.get('code') as string) || undefined,
      name: (formData.get('name') as string) || undefined,
      clientName: (formData.get('clientName') as string) || undefined,
      address: (formData.get('address') as string) || undefined,
      propertyType: (formData.get('propertyType') as 'Residential' | 'Nonresidential') || undefined,
      contractType: (formData.get('contractType') as 'LumpSum' | 'Separated') || undefined,
      salesTaxRatePct: (formData.get('salesTaxRatePct') as string) ? parseFloat(formData.get('salesTaxRatePct') as string) : undefined,
      salesperson: (formData.get('salesperson') as string) || undefined,
      channel: (formData.get('channel') as string) || undefined,
      productType: (formData.get('productType') as string) || undefined,
      quoteTotal: (formData.get('quoteTotal') as string) ? parseFloat(formData.get('quoteTotal') as string) : undefined,
      paymentPlan: (formData.get('paymentPlan') as string) || undefined,
      overheadOverridePct: (formData.get('overheadOverridePct') as string) ? parseFloat(formData.get('overheadOverridePct') as string) : undefined,
      warrantyReservePct: (formData.get('warrantyReservePct') as string) ? parseFloat(formData.get('warrantyReservePct') as string) : undefined,
      notes: (formData.get('notes') as string) || undefined,
    }

    updateJob.mutate({ id, data: payload })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        Loading...
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Job not found</CardTitle>
            <CardDescription>The requested job does not exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/jobs')}>Back to Jobs</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit Job</CardTitle>
            <CardDescription>Update job details and save changes.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Job Code</Label>
                  <Input id="code" name="code" defaultValue={job.code} required />
                </div>
                <div>
                  <Label htmlFor="name">Job Name</Label>
                  <Input id="name" name="name" defaultValue={job.name} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input id="clientName" name="clientName" defaultValue={job.clientName} required />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" defaultValue={job.address ?? ''} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select name="propertyType" defaultValue={job.propertyType}>
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
                  <Select name="contractType" defaultValue={job.contractType}>
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
                  <Input id="quoteTotal" name="quoteTotal" type="number" step="0.01" defaultValue={job.quoteTotal?.toString?.() ?? '0.00'} required />
                </div>
                <div>
                  <Label htmlFor="salesTaxRatePct">Sales Tax Rate (%)</Label>
                  <Input id="salesTaxRatePct" name="salesTaxRatePct" type="number" step="0.01" defaultValue={job.salesTaxRatePct?.toString?.() ?? ''} placeholder="Optional" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentPlan">Payment Plan</Label>
                  <Input id="paymentPlan" name="paymentPlan" defaultValue={job.paymentPlan} required />
                </div>
                <div>
                  <Label htmlFor="salesperson">Salesperson</Label>
                  <Input id="salesperson" name="salesperson" defaultValue={job.salesperson ?? ''} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="channel">Channel</Label>
                  <Input id="channel" name="channel" defaultValue={job.channel ?? ''} />
                </div>
                <div>
                  <Label htmlFor="productType">Product Type</Label>
                  <Input id="productType" name="productType" defaultValue={job.productType ?? ''} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="overheadOverridePct">Overhead Override (%)</Label>
                  <Input id="overheadOverridePct" name="overheadOverridePct" type="number" step="0.01" defaultValue={job.overheadOverridePct?.toString?.() ?? ''} placeholder="Optional" />
                </div>
                <div>
                  <Label htmlFor="warrantyReservePct">Warranty Reserve (%)</Label>
                  <Input id="warrantyReservePct" name="warrantyReservePct" type="number" step="0.01" defaultValue={job.warrantyReservePct?.toString?.() ?? ''} placeholder="Optional" />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" defaultValue={job.notes ?? ''} />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => router.push(`/jobs/${id}`)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 