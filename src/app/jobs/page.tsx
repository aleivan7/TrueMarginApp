'use client'

import Link from 'next/link'
import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Plus, Search } from 'lucide-react'

export default function JobsPage() {
  const [search, setSearch] = useState('')

  const { data: jobsRaw, isLoading } = trpc.jobs.list.useQuery({
    search: search || undefined,
  })
  const jobs = Array.isArray(jobsRaw) ? jobsRaw : []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Jobs
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your stretch-ceiling projects and track profitability.
            </p>
          </div>
          <Link href="/jobs/new">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Job</span>
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search jobs (name, client, code)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="grid gap-6">
          {isLoading ? (
            <Card className="text-center py-12"><CardContent>Loading...</CardContent></Card>
          ) : jobs.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create your first job to get started.
                </p>
                <Link href="/jobs/new">
                  <Button className="flex items-center space-x-2 mx-auto">
                    <Plus className="h-4 w-4" />
                    <span>Create Job</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            jobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5" />
                    <span>{job.name}</span>
                  </CardTitle>
                  <CardDescription>
                    {job.clientName} • {job.code}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Quote:</span>
                      <p className="text-gray-900 dark:text-gray-100">${job.quoteTotal?.toString?.() ?? '0.00'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Contract:</span>
                      <p className="text-gray-900 dark:text-gray-100">{job.contractType}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Property:</span>
                      <p className="text-gray-900 dark:text-gray-100">{job.propertyType}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Created:</span>
                      <p className="text-gray-900 dark:text-gray-100">{new Date(job.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Link href={`/jobs/${job.id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                    <Link href={`/jobs/${job.id}/edit`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
} 