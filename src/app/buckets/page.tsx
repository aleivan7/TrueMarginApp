'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PiggyBank, Plus, Edit, Trash2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function BucketsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingBucketSet, setEditingBucketSet] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [bucketName, setBucketName] = useState('')
  const [bucketPercent, setBucketPercent] = useState('')
  const [buckets, setBuckets] = useState<Array<{ name: string; percent: number }>>([])

  const utils = trpc.useUtils()

  const { data: bucketSets, isLoading } = trpc.settings.listBucketSets.useQuery()
  const { data: orgSettings } = trpc.settings.getOrgSettings.useQuery()

  const createBucketSet = trpc.settings.createBucketSet.useMutation({
    onSuccess: () => {
      utils.settings.listBucketSets.invalidate()
      setIsCreateDialogOpen(false)
      setBuckets([])
      toast.success('Bucket set created successfully')
    },
    onError: (error) => {
      toast.error(`Failed to create bucket set: ${error.message}`)
    },
  })

  const updateBucketSet = trpc.settings.updateBucketSet.useMutation({
    onSuccess: () => {
      utils.settings.listBucketSets.invalidate()
      setIsEditDialogOpen(false)
      setEditingBucketSet(null)
      setBuckets([])
      toast.success('Bucket set updated successfully')
    },
    onError: (error) => {
      toast.error(`Failed to update bucket set: ${error.message}`)
    },
  })

  const deleteBucketSet = trpc.settings.deleteBucketSet.useMutation({
    onSuccess: () => {
      utils.settings.listBucketSets.invalidate()
      toast.success('Bucket set deleted successfully')
    },
    onError: (error) => {
      toast.error(`Failed to delete bucket set: ${error.message}`)
    },
  })

  const setDefaultBucketSet = trpc.settings.setDefaultBucketSet.useMutation({
    onSuccess: () => {
      utils.settings.getOrgSettings.invalidate()
      toast.success('Default bucket set updated')
    },
    onError: (error) => {
      toast.error(`Failed to set default bucket set: ${error.message}`)
    },
  })

  const addBucket = () => {
    if (bucketName && bucketPercent) {
      const percent = parseFloat(bucketPercent)
      if (percent > 0 && percent <= 100) {
        setBuckets([...buckets, { name: bucketName, percent }])
        setBucketName('')
        setBucketPercent('')
      } else {
        toast.error('Percentage must be between 0 and 100')
      }
    }
  }

  const removeBucket = (index: number) => {
    setBuckets(buckets.filter((_, i) => i !== index))
  }

  const handleCreateBucketSet = (formData: FormData) => {
    const name = formData.get('name') as string
    const totalPercent = buckets.reduce((sum, bucket) => sum + bucket.percent, 0)
    
    if (Math.abs(totalPercent - 100) > 0.01) {
      toast.error('Total percentage must equal 100%')
      return
    }

    createBucketSet.mutate({ name, buckets })
  }

  const handleUpdateBucketSet = (formData: FormData) => {
    if (!editingBucketSet) return

    const name = formData.get('name') as string
    const totalPercent = buckets.reduce((sum, bucket) => sum + bucket.percent, 0)
    
    if (Math.abs(totalPercent - 100) > 0.01) {
      toast.error('Total percentage must equal 100%')
      return
    }

    updateBucketSet.mutate({ id: editingBucketSet.id, data: { name, buckets } })
  }

  const handleEdit = (bucketSet: any) => {
    setEditingBucketSet(bucketSet)
    setBuckets(bucketSet.buckets.map((b: any) => ({ name: b.name, percent: parseFloat(b.percent.toString()) })))
    setIsEditDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this bucket set?')) {
      deleteBucketSet.mutate(id)
    }
  }

  const handleSetDefault = (id: string) => {
    setDefaultBucketSet.mutate(id)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <PiggyBank className="h-6 w-6 text-gray-600 dark:text-gray-400 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Profit Buckets
              </h1>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Bucket Set</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Bucket Set</DialogTitle>
                  <DialogDescription>
                    Create a new profit allocation bucket set. Total percentage must equal 100%.
                  </DialogDescription>
                </DialogHeader>
                <form action={handleCreateBucketSet} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Bucket Set Name</Label>
                    <Input id="name" name="name" required placeholder="e.g., Standard Profit Split" />
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Buckets</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="bucketName">Bucket Name</Label>
                        <Input
                          id="bucketName"
                          value={bucketName}
                          onChange={(e) => setBucketName(e.target.value)}
                          placeholder="e.g., Owner Profit"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bucketPercent">Percentage (%)</Label>
                        <Input
                          id="bucketPercent"
                          type="number"
                          step="0.01"
                          value={bucketPercent}
                          onChange={(e) => setBucketPercent(e.target.value)}
                          placeholder="e.g., 60"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button type="button" onClick={addBucket} className="w-full">
                          Add Bucket
                        </Button>
                      </div>
                    </div>
                  </div>

                  {buckets.length > 0 && (
                    <div className="space-y-2">
                      <Label>Current Buckets</Label>
                      <div className="border rounded-md p-4 space-y-2">
                        {buckets.map((bucket, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span>{bucket.name} - {bucket.percent}%</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeBucket(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <div className="pt-2 border-t">
                          <strong>Total: {buckets.reduce((sum, bucket) => sum + bucket.percent, 0)}%</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createBucketSet.isPending || buckets.length === 0}>
                      {createBucketSet.isPending ? 'Creating...' : 'Create Bucket Set'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bucket Sets */}
        <Card>
          <CardHeader>
            <CardTitle>Profit Bucket Sets</CardTitle>
            <CardDescription>
              Manage profit allocation buckets for job calculations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Buckets</TableHead>
                    <TableHead>Total %</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bucketSets?.map((bucketSet) => (
                    <TableRow key={bucketSet.id}>
                      <TableCell className="font-medium">{bucketSet.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {bucketSet.buckets.map((bucket: any) => (
                            <div key={bucket.id} className="text-sm">
                              {bucket.name}: {bucket.percent.toString()}%
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {bucketSet.buckets.reduce((sum: number, bucket: any) => sum + parseFloat(bucket.percent.toString()), 0)}%
                      </TableCell>
                      <TableCell>
                        {orgSettings?.bucketSetId === bucketSet.id ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefault(bucketSet.id)}
                          >
                            Set Default
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(bucketSet)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(bucketSet.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Bucket Set</DialogTitle>
            <DialogDescription>
              Update the bucket set configuration.
            </DialogDescription>
          </DialogHeader>
          {editingBucketSet && (
            <form action={handleUpdateBucketSet} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Bucket Set Name</Label>
                <Input id="edit-name" name="name" defaultValue={editingBucketSet.name} required />
              </div>
              
              <div className="space-y-4">
                <Label>Buckets</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-bucketName">Bucket Name</Label>
                    <Input
                      id="edit-bucketName"
                      value={bucketName}
                      onChange={(e) => setBucketName(e.target.value)}
                      placeholder="e.g., Owner Profit"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-bucketPercent">Percentage (%)</Label>
                    <Input
                      id="edit-bucketPercent"
                      type="number"
                      step="0.01"
                      value={bucketPercent}
                      onChange={(e) => setBucketPercent(e.target.value)}
                      placeholder="e.g., 60"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" onClick={addBucket} className="w-full">
                      Add Bucket
                    </Button>
                  </div>
                </div>
              </div>

              {buckets.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Buckets</Label>
                  <div className="border rounded-md p-4 space-y-2">
                    {buckets.map((bucket, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{bucket.name} - {bucket.percent}%</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeBucket(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <div className="pt-2 border-t">
                      <strong>Total: {buckets.reduce((sum, bucket) => sum + bucket.percent, 0)}%</strong>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateBucketSet.isPending || buckets.length === 0}>
                  {updateBucketSet.isPending ? 'Updating...' : 'Update Bucket Set'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 