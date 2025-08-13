'use client'

import { useParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function JobDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id as string

  const { data: job, isLoading } = trpc.jobs.get.useQuery(id, {
    enabled: !!id,
  })

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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{job.name}</CardTitle>
            <CardDescription>
              {job.clientName} • {job.code}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-sm text-gray-500">Property Type</div>
                <div className="font-medium">{job.propertyType}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Contract Type</div>
                <div className="font-medium">{job.contractType}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Quote Total</div>
                <div className="font-medium">${job.quoteTotal?.toString?.() ?? '0.00'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Sales Tax Rate</div>
                <div className="font-medium">{job.salesTaxRatePct ? `${job.salesTaxRatePct.toString()}%` : '—'}</div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => router.push('/jobs')}>Back</Button>
              <Button variant="outline" onClick={() => router.push(`/jobs/${job.id}/edit`)}>Edit</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 