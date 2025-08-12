import { z } from 'zod'
import { router, publicProcedure } from '@/lib/trpc/server'

const inventoryItemSchema = z.object({
  sku: z.string().optional(),
  name: z.string(),
  unit: z.enum(['SQFT', 'LF', 'PIECE', 'ROLL', 'DAY', 'HOUR']),
  defaultCost: z.number(),
  defaultPrice: z.number(),
  active: z.boolean().default(true),
  notes: z.string().optional(),
})

const inventoryStockSchema = z.object({
  inventoryItemId: z.string(),
  quantity: z.number(),
  location: z.string().optional(),
})

export const inventoryRouter = router({
  // Inventory Items
  createItem: publicProcedure
    .input(inventoryItemSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.inventoryItem.create({
        data: {
          ...input,
          defaultCost: new (await import('@prisma/client/runtime/library')).Decimal(input.defaultCost),
          defaultPrice: new (await import('@prisma/client/runtime/library')).Decimal(input.defaultPrice),
        },
      })
    }),

  updateItem: publicProcedure
    .input(z.object({
      id: z.string(),
      data: inventoryItemSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input
      const updateData: any = { ...data }
      
      if (data.defaultCost !== undefined) {
        updateData.defaultCost = new (await import('@prisma/client/runtime/library')).Decimal(data.defaultCost)
      }
      if (data.defaultPrice !== undefined) {
        updateData.defaultPrice = new (await import('@prisma/client/runtime/library')).Decimal(data.defaultPrice)
      }

      return ctx.prisma.inventoryItem.update({
        where: { id },
        data: updateData,
      })
    }),

  getItem: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.inventoryItem.findUnique({
        where: { id: input },
        include: {
          stock: true,
        },
      })
    }),

  listItems: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      active: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {}
      
      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { sku: { contains: input.search, mode: 'insensitive' } },
        ]
      }
      
      if (input.active !== undefined) {
        where.active = input.active
      }

      return ctx.prisma.inventoryItem.findMany({
        where,
        include: {
          stock: true,
        },
        orderBy: { name: 'asc' },
      })
    }),

  deleteItem: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.inventoryItem.delete({
        where: { id: input },
      })
    }),

  // Inventory Stock
  addStock: publicProcedure
    .input(inventoryStockSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.inventoryStock.create({
        data: {
          ...input,
          quantity: new (await import('@prisma/client/runtime/library')).Decimal(input.quantity),
        },
        include: {
          InventoryItem: true,
        },
      })
    }),

  updateStock: publicProcedure
    .input(z.object({
      id: z.string(),
      quantity: z.number(),
      location: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.inventoryStock.update({
        where: { id: input.id },
        data: {
          quantity: new (await import('@prisma/client/runtime/library')).Decimal(input.quantity),
          location: input.location,
        },
        include: {
          InventoryItem: true,
        },
      })
    }),

  listStock: publicProcedure
    .input(z.object({
      inventoryItemId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {}
      
      if (input.inventoryItemId) {
        where.inventoryItemId = input.inventoryItemId
      }

      return ctx.prisma.inventoryStock.findMany({
        where,
        include: {
          InventoryItem: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    }),
}) 