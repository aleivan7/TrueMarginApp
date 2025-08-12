import { router } from '@/lib/trpc/server'
import { jobsRouter } from './routers/jobs'
import { inventoryRouter } from './routers/inventory'
import { settingsRouter } from './routers/settings'
import { calcRouter } from './routers/calc'

export const appRouter = router({
  jobs: jobsRouter,
  inventory: inventoryRouter,
  settings: settingsRouter,
  calc: calcRouter,
})

export type AppRouter = typeof appRouter 