import { initTRPC } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { PrismaClient } from '@prisma/client'
import superjson from 'superjson'

const prisma = new PrismaClient()

export const createContext = async (opts: any) => {
  return {
    prisma,
  }
}

const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure 