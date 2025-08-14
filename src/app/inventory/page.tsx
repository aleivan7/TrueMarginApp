'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Package, Plus, Search, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const utils = trpc.useUtils()

  const { data: inventoryItemsRaw, isLoading } = trpc.inventory.listItems.useQuery({
    search: searchTerm || undefined,
  })
  const inventoryItems = Array.isArray(inventoryItemsRaw) ? inventoryItemsRaw : []

  const createItem = trpc.inventory.createItem.useMutation({
    onSuccess: () => {
      utils.inventory.listItems.invalidate()
      setIsCreateDialogOpen(false)
      toast.success('Inventory item created successfully')
    },
    onError: (error) => {
      toast.error(`Failed to create item: ${error.message}`)
    },
  })

  const updateItem = trpc.inventory.updateItem.useMutation({
    onSuccess: () => {
      utils.inventory.listItems.invalidate()
      setIsEditDialogOpen(false)
      setEditingItem(null)
      toast.success('Inventory item updated successfully')
    },
    onError: (error) => {
      toast.error(`Failed to update item: ${error.message}`)
    },
  })

  const deleteItem = trpc.inventory.deleteItem.useMutation({
    onSuccess: () => {
      utils.inventory.listItems.invalidate()
      toast.success('Inventory item deleted successfully')
    },
    onError: (error) => {
      toast.error(`Failed to delete item: ${error.message}`)
    },
  })

  const handleCreateItem = (formData: FormData) => {
    const data = {
      sku: (formData.get('sku') as string) || undefined,
      name: formData.get('name') as string,
      unit: formData.get('unit') as 'SQFT' | 'LF' | 'PIECE' | 'ROLL' | 'DAY' | 'HOUR',
      defaultCost: parseFloat((formData.get('defaultCost') as string) ?? '0') || 0,
      defaultPrice: parseFloat((formData.get('defaultPrice') as string) ?? '0') || 0,
      notes: (formData.get('notes') as string) || undefined,
    }

    createItem.mutate(data)
  }

  const handleUpdateItem = (formData: FormData) => {
    if (!editingItem) return

    const data = {
      sku: (formData.get('sku') as string) || undefined,
      name: formData.get('name') as string,
      unit: formData.get('unit') as 'SQFT' | 'LF' | 'PIECE' | 'ROLL' | 'DAY' | 'HOUR',
      defaultCost: parseFloat((formData.get('defaultCost') as string) ?? '0') || 0,
      defaultPrice: parseFloat((formData.get('defaultPrice') as string) ?? '0') || 0,
      notes: (formData.get('notes') as string) || undefined,
    }

    updateItem.mutate({ id: editingItem.id, data })
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteItem.mutate(id)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="h-6 w-6 text-gray-600 dark:text-gray-400 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Inventory Management
              </h1>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Item</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Inventory Item</DialogTitle>
                  <DialogDescription>
                    Create a new inventory item with its details and pricing.
                  </DialogDescription>
                </DialogHeader>
                <form action={handleCreateItem} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sku">SKU (Optional)</Label>
                      <Input id="sku" name="sku" placeholder="SKU-001" />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Select name="unit" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SQFT">Square Feet</SelectItem>
                          <SelectItem value="LF">Linear Feet</SelectItem>
                          <SelectItem value="PIECE">Piece</SelectItem>
                          <SelectItem value="ROLL">Roll</SelectItem>
                          <SelectItem value="DAY">Day</SelectItem>
                          <SelectItem value="HOUR">Hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" required placeholder="Item name" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="defaultCost">Default Cost ($)</Label>
                      <Input id="defaultCost" name="defaultCost" type="number" step="0.01" required placeholder="0.00" />
                    </div>
                    <div>
                      <Label htmlFor="defaultPrice">Default Price ($)</Label>
                      <Input id="defaultPrice" name="defaultPrice" type="number" step="0.01" required placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea id="notes" name="notes" placeholder="Additional notes..." />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createItem.isPending}>
                      {createItem.isPending ? 'Creating...' : 'Create Item'}
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
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search inventory items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Inventory Items */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
            <CardDescription>
              Manage your inventory items, costs, and pricing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : inventoryItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No items found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.sku || '-'}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>${item.defaultCost.toString()}</TableCell>
                      <TableCell>${item.defaultPrice.toString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {item.active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Update the inventory item details.
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <form action={handleUpdateItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-sku">SKU (Optional)</Label>
                  <Input id="edit-sku" name="sku" defaultValue={editingItem.sku || ''} placeholder="SKU-001" />
                </div>
                <div>
                  <Label htmlFor="edit-unit">Unit</Label>
                  <Select name="unit" defaultValue={editingItem.unit} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SQFT">Square Feet</SelectItem>
                      <SelectItem value="LF">Linear Feet</SelectItem>
                      <SelectItem value="PIECE">Piece</SelectItem>
                      <SelectItem value="ROLL">Roll</SelectItem>
                      <SelectItem value="DAY">Day</SelectItem>
                      <SelectItem value="HOUR">Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input id="edit-name" name="name" defaultValue={editingItem.name} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-defaultCost">Default Cost ($)</Label>
                  <Input id="edit-defaultCost" name="defaultCost" type="number" step="0.01" defaultValue={editingItem.defaultCost.toString()} required />
                </div>
                <div>
                  <Label htmlFor="edit-defaultPrice">Default Price ($)</Label>
                  <Input id="edit-defaultPrice" name="defaultPrice" type="number" step="0.01" defaultValue={editingItem.defaultPrice.toString()} required />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-notes">Notes (Optional)</Label>
                <Textarea id="edit-notes" name="notes" defaultValue={editingItem.notes || ''} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateItem.isPending}>
                  {updateItem.isPending ? 'Updating...' : 'Update Item'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 