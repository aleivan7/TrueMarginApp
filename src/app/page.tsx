import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Briefcase, 
  Package, 
  PiggyBank, 
  Settings,
  Calculator,
  TrendingUp,
  DollarSign,
  Users
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome to TrueMargin
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Calculate true per-job profit for your stretch-ceiling business and allocate profits into configurable buckets.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Quick Actions
          </h3>
          <div className="flex space-x-4">
            <Link href="/jobs/new">
              <Button className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4" />
                <span>Create New Job</span>
              </Button>
            </Link>
            <Link href="/calculator">
              <Button variant="outline" className="flex items-center space-x-2">
                <Calculator className="h-4 w-4" />
                <span>Profit Calculator</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Active jobs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">
                Available items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Buckets</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">11</div>
              <p className="text-xs text-muted-foreground">
                Total buckets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">
                Team members
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Profit Overview
              </CardTitle>
              <CardDescription>Recent profit performance and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Coming soon: charts and analytics.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Quick Tips
              </CardTitle>
              <CardDescription>Improve margins and track costs</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>Track actual installer time per job</li>
                <li>Update inventory prices monthly</li>
                <li>Use buckets to enforce profit allocation</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Get Started
              </CardTitle>
              <CardDescription>Set up your defaults</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Link href="/settings">
                  <Button size="sm">Settings</Button>
                </Link>
                <Link href="/buckets">
                  <Button size="sm" variant="outline">Buckets</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
