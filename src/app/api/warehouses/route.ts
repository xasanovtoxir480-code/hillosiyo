import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const warehouses = await db.warehouse.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    })

    // Get counts using raw queries for compatibility
    const warehousesWithCounts = await Promise.all(
      warehouses.map(async (wh) => {
        const stockCount = await db.$queryRawUnsafe<number[]>(
          'SELECT COUNT(*) as count FROM WarehouseStock WHERE warehouseId = ? AND quantity > 0',
          wh.id
        )
        const orderCount = await db.$queryRawUnsafe<number[]>(
          'SELECT COUNT(*) as count FROM "Order" WHERE warehouseId = ?',
          wh.id
        )
        return {
          ...wh,
          _count: {
            stock: Number(stockCount[0]?.count || 0),
            orders: Number(orderCount[0]?.count || 0),
          },
        }
      })
    )

    return NextResponse.json({ warehouses: warehousesWithCounts })
  } catch (error) {
    console.error('Warehouses fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch warehouses' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, address, district } = body

    if (!name || !address || !district) {
      return NextResponse.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 })
    }

    const warehouse = await db.warehouse.create({
      data: { name, address, district, isActive: true },
    })

    return NextResponse.json({ warehouse }, { status: 201 })
  } catch (error) {
    console.error('Warehouse create error:', error)
    return NextResponse.json({ error: 'Failed to create warehouse' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { warehouseId, name, address, district, isActive } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (address !== undefined) updateData.address = address
    if (district !== undefined) updateData.district = district
    if (isActive !== undefined) updateData.isActive = isActive

    const warehouse = await db.warehouse.update({
      where: { id: warehouseId },
      data: updateData,
    })

    return NextResponse.json({ warehouse })
  } catch (error) {
    console.error('Warehouse update error:', error)
    return NextResponse.json({ error: 'Failed to update warehouse' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const warehouseId = searchParams.get('id')

    if (!warehouseId) {
      return NextResponse.json({ error: 'Warehouse ID required' }, { status: 400 })
    }

    // Check active orders
    const activeOrders = await db.order.count({
      where: { warehouseId, status: { in: ['pending', 'preparing', 'ready'] } },
    })

    if (activeOrders > 0) {
      return NextResponse.json(
        { error: `Bu omborda ${activeOrders} ta faol buyurtma bor.` },
        { status: 400 }
      )
    }

    // Delete stock and warehouse
    await db.$executeRawUnsafe('DELETE FROM WarehouseStock WHERE warehouseId = ?', warehouseId)
    await db.warehouse.delete({ where: { id: warehouseId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Warehouse delete error:', error)
    return NextResponse.json({ error: 'Failed to delete warehouse' }, { status: 500 })
  }
}
