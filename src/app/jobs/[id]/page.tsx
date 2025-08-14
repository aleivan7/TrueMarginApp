'use client'

import { useParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'

export default function JobDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id as string

  const utils = trpc.useUtils()

  const { data: job, isLoading } = trpc.jobs.get.useQuery(id, { enabled: !!id })
  const { data: pnl } = trpc.jobs.pnl.useQuery(id, { enabled: !!id })

  const finalize = trpc.jobs.finalize.useMutation({
    onSuccess: () => {
      utils.jobs.get.invalidate(id)
      toast.success('Job finalized and allocation snapshot saved')
    },
    onError: (e) => toast.error(e.message),
  })

  const addChangeOrder = trpc.jobs.addChangeOrder.useMutation({
    onSuccess: () => { utils.jobs.get.invalidate(id); toast.success('Change order added') },
    onError: (e) => toast.error(e.message),
  })

  const addPurchase = trpc.jobs.addPurchase.useMutation({
    onSuccess: () => { utils.jobs.get.invalidate(id); toast.success('Purchase added') },
    onError: (e) => toast.error(e.message),
  })

  const addLabor = trpc.jobs.addLaborEntry.useMutation({
    onSuccess: () => { utils.jobs.get.invalidate(id); toast.success('Labor entry added') },
    onError: (e) => toast.error(e.message),
  })

  const addTravel = trpc.jobs.addTravelEntry.useMutation({
    onSuccess: () => { utils.jobs.get.invalidate(id); toast.success('Travel entry added') },
    onError: (e) => toast.error(e.message),
  })

  const addPayment = trpc.jobs.addPayment.useMutation({
    onSuccess: () => { utils.jobs.get.invalidate(id); toast.success('Payment added') },
    onError: (e) => toast.error(e.message),
  })

  const addMaterial = trpc.jobs.addMaterial.useMutation({
    onSuccess: () => { utils.jobs.get.invalidate(id); toast.success('Material added') },
    onError: (e) => toast.error(e.message),
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
              <Button onClick={() => finalize.mutate(job.id)} disabled={finalize.isPending}>
                {finalize.isPending ? 'Finalizing...' : 'Finalize (Snapshot)'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* P&L Summary */}
        <Card>
          <CardHeader>
            <CardTitle>P&L Summary</CardTitle>
            <CardDescription>Computed from purchases, labor, travel, fees, overhead and warranty.</CardDescription>
          </CardHeader>
          <CardContent>
            {pnl ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Revenue</div>
                  <div className="font-semibold">${pnl.revenue.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Direct Materials</div>
                  <div className="font-semibold">${pnl.directMaterialCost.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Direct Labor</div>
                  <div className="font-semibold">${pnl.directLaborCost.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Travel</div>
                  <div className="font-semibold">${pnl.travelCost.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Payment Fees</div>
                  <div className="font-semibold">${pnl.paymentFees.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Warranty Reserve</div>
                  <div className="font-semibold">${pnl.warrantyReserve.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Overhead Allocation</div>
                  <div className="font-semibold">${pnl.overheadAllocation.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Contribution Margin</div>
                  <div className="font-semibold">${pnl.contributionMargin.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Fully Loaded Profit</div>
                  <div className="font-semibold">${pnl.fullyLoadedProfit.toFixed(2)}</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No P&L yet.</div>
            )}
          </CardContent>
        </Card>

        {/* Latest Allocation Snapshot */}
        {job.bucketAllocations?.length ? (
          <Card>
            <CardHeader>
              <CardTitle>Latest Allocation Snapshot</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bucket</TableHead>
                    <TableHead>Percent</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {((job.bucketAllocations?.[0]?.snapshot as any)?.buckets ?? []).map((b: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>{b.name}</TableCell>
                      <TableCell>{b.percent}%</TableCell>
                      <TableCell>${Number(b.amount).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}

        {/* Quick Add Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Change Order</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={(fd) => {
                const name = (fd.get('name') as string) || ''
                const amount = parseFloat((fd.get('amount') as string) || '0')
                addChangeOrder.mutate({ jobId: id, changeOrder: { name, amount } })
              }} className="space-y-3">
                <div>
                  <Label htmlFor="co-name">Name</Label>
                  <Input id="co-name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="co-amount">Amount ($)</Label>
                  <Input id="co-amount" name="amount" type="number" step="0.01" required />
                </div>
                <Button type="submit" disabled={addChangeOrder.isPending}>{addChangeOrder.isPending ? 'Adding...' : 'Add Change Order'}</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Purchase (single line)</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={(fd) => {
                const supplierName = (fd.get('supplierName') as string) || ''
                const shippingCost = parseFloat((fd.get('shippingCost') as string) || '0')
                const description = (fd.get('desc') as string) || ''
                const unit = (fd.get('unit') as string) as any
                const quantity = parseFloat((fd.get('quantity') as string) || '0')
                const unitCost = parseFloat((fd.get('unitCost') as string) || '0')
                addPurchase.mutate({ jobId: id, purchase: { supplierName, shippingCost, notes: undefined, lines: [{ description, unit, quantity, unitCost }] } })
              }} className="space-y-3">
                <div>
                  <Label htmlFor="p-supplier">Supplier</Label>
                  <Input id="p-supplier" name="supplierName" required />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="p-desc">Line Desc</Label>
                    <Input id="p-desc" name="desc" required />
                  </div>
                  <div>
                    <Label htmlFor="p-unit">Unit</Label>
                    <Input id="p-unit" name="unit" placeholder="SQFT|LF|PIECE|ROLL|DAY|HOUR" required />
                  </div>
                  <div>
                    <Label htmlFor="p-qty">Qty</Label>
                    <Input id="p-qty" name="quantity" type="number" step="0.01" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="p-unitCost">Unit Cost</Label>
                    <Input id="p-unitCost" name="unitCost" type="number" step="0.01" required />
                  </div>
                  <div>
                    <Label htmlFor="p-ship">Shipping</Label>
                    <Input id="p-ship" name="shippingCost" type="number" step="0.01" defaultValue="0" />
                  </div>
                </div>
                <Button type="submit" disabled={addPurchase.isPending}>{addPurchase.isPending ? 'Adding...' : 'Add Purchase'}</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Labor</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={(fd) => {
                const kind = (fd.get('kind') as string) || 'inhouse_hourly'
                const rate = parseFloat((fd.get('rate') as string) || '0')
                const units = parseFloat((fd.get('units') as string) || '0')
                addLabor.mutate({ jobId: id, laborEntry: { kind, rate, units } })
              }} className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="l-kind">Kind</Label>
                    <Input id="l-kind" name="kind" defaultValue="inhouse_hourly" />
                  </div>
                  <div>
                    <Label htmlFor="l-rate">Rate</Label>
                    <Input id="l-rate" name="rate" type="number" step="0.01" required />
                  </div>
                  <div>
                    <Label htmlFor="l-units">Units</Label>
                    <Input id="l-units" name="units" type="number" step="0.01" required />
                  </div>
                </div>
                <Button type="submit" disabled={addLabor.isPending}>{addLabor.isPending ? 'Adding...' : 'Add Labor'}</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Travel</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={(fd) => {
                const miles = parseFloat((fd.get('miles') as string) || '0')
                const perDiemDays = parseFloat((fd.get('perDiemDays') as string) || '0')
                const lodging = parseFloat((fd.get('lodging') as string) || '0')
                const other = parseFloat((fd.get('other') as string) || '0')
                addTravel.mutate({ jobId: id, travelEntry: { miles, perDiemDays, lodging, other } })
              }} className="space-y-3">
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <Label htmlFor="t-miles">Miles</Label>
                    <Input id="t-miles" name="miles" type="number" step="0.1" required />
                  </div>
                  <div>
                    <Label htmlFor="t-days">Per Diem Days</Label>
                    <Input id="t-days" name="perDiemDays" type="number" step="0.1" required />
                  </div>
                  <div>
                    <Label htmlFor="t-lodging">Lodging</Label>
                    <Input id="t-lodging" name="lodging" type="number" step="0.01" defaultValue="0" />
                  </div>
                  <div>
                    <Label htmlFor="t-other">Other</Label>
                    <Input id="t-other" name="other" type="number" step="0.01" defaultValue="0" />
                  </div>
                </div>
                <Button type="submit" disabled={addTravel.isPending}>{addTravel.isPending ? 'Adding...' : 'Add Travel'}</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={(fd) => {
                const kind = (fd.get('kind') as string) || 'Deposit'
                const amount = parseFloat((fd.get('amount') as string) || '0')
                const feePct = (fd.get('feePct') as string) ? parseFloat(fd.get('feePct') as string) : undefined
                const feeFlat = (fd.get('feeFlat') as string) ? parseFloat(fd.get('feeFlat') as string) : undefined
                addPayment.mutate({ jobId: id, payment: { kind, amount, feePct, feeFlat } })
              }} className="space-y-3">
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <Label htmlFor="p-kind">Kind</Label>
                    <Input id="p-kind" name="kind" defaultValue="Deposit" />
                  </div>
                  <div>
                    <Label htmlFor="p-amount">Amount</Label>
                    <Input id="p-amount" name="amount" type="number" step="0.01" required />
                  </div>
                  <div>
                    <Label htmlFor="p-feePct">Fee %</Label>
                    <Input id="p-feePct" name="feePct" type="number" step="0.01" />
                  </div>
                  <div>
                    <Label htmlFor="p-feeFlat">Fee $</Label>
                    <Input id="p-feeFlat" name="feeFlat" type="number" step="0.01" />
                  </div>
                </div>
                <Button type="submit" disabled={addPayment.isPending}>{addPayment.isPending ? 'Adding...' : 'Add Payment'}</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Material</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={(fd) => {
                const description = (fd.get('description') as string) || ''
                const unit = (fd.get('unit') as string) as any
                const quantityUsed = parseFloat((fd.get('quantityUsed') as string) || '0')
                addMaterial.mutate({ jobId: id, material: { description, unit, quantityUsed } })
              }} className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="m-desc">Description</Label>
                    <Input id="m-desc" name="description" required />
                  </div>
                  <div>
                    <Label htmlFor="m-unit">Unit</Label>
                    <Input id="m-unit" name="unit" placeholder="SQFT|LF|PIECE|ROLL|DAY|HOUR" required />
                  </div>
                  <div>
                    <Label htmlFor="m-qty">Quantity Used</Label>
                    <Input id="m-qty" name="quantityUsed" type="number" step="0.01" required />
                  </div>
                </div>
                <Button type="submit" disabled={addMaterial.isPending}>{addMaterial.isPending ? 'Adding...' : 'Add Material'}</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Lists */}
        <Card>
          <CardHeader>
            <CardTitle>Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Shipping</TableHead>
                  <TableHead>Lines</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {job.purchases.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.supplierName}</TableCell>
                    <TableCell>${p.shippingCost.toString()}</TableCell>
                    <TableCell>
                      {p.lines.map((l) => `${l.description} (${l.unit}) x ${l.quantity.toString()} @ $${l.unitCost.toString()}`).join('; ')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Labor</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kind</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Units</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {job.laborEntries.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.kind}</TableCell>
                    <TableCell>${l.rate.toString()}</TableCell>
                    <TableCell>{l.units.toString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Travel</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Miles</TableHead>
                  <TableHead>Per Diem Days</TableHead>
                  <TableHead>Lodging</TableHead>
                  <TableHead>Other</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {job.travelEntries.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.miles.toString()}</TableCell>
                    <TableCell>{t.perDiemDays.toString()}</TableCell>
                    <TableCell>${t.lodging.toString()}</TableCell>
                    <TableCell>${t.other.toString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kind</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Fee %</TableHead>
                  <TableHead>Fee $</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {job.payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.kind}</TableCell>
                    <TableCell>${p.amount.toString()}</TableCell>
                    <TableCell>{p.feePct?.toString?.() ?? '-'}</TableCell>
                    <TableCell>{p.feeFlat?.toString?.() ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 