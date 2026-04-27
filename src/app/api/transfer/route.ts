import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fromWarehouseId, toWarehouseId, productId, quantity } = body

    if (!fromWarehouseId || !toWarehouseId || !productId || quantity <= 0) {
      return NextResponse.json({ error: 'Barcha maydonlarni to\'ldiring' }, { status: 400 })
    }

    if (fromWarehouseId === toWarehouseId) {
      return NextResponse.json({ error: 'Omborlar bir xil' }, { status: 400 })
    }

    // Check source stock using raw query
    const sourceStock = await db.$queryRawUnsafe<Array<{ quantity: number }>>(
      'SELECT quantity FROM WarehouseStock WHERE warehouseId = ? AND productId = ?',
      fromWarehouseId, productId
    )

    const available = Number(sourceStock[0]?.quantity || 0)
    if (available < quantity) {
      return NextResponse.json(
        { error: `Yetarli mahsulot yoq. Mavjud: ${available}` },
        { status: 400 }
      )
    }

    // Decrement source
    await db.$executeRawUnsafe(
      'UPDATE WarehouseStock SET quantity = quantity - ?, updatedAt = datetime(\'now\') WHERE warehouseId = ? AND productId = ?',
      quantity, fromWarehouseId, productId
    )

    // Upsert destination
    await db.$executeRawUnsafe(`
      INSERT INTO WarehouseStock (id, warehouseId, productId, quantity, createdAt, updatedAt)
      VALUES (lower(hex(randomblob(16))), ?, ?, ?, datetime('now'), datetime('now'))
      ON CONFLICT(warehouseId, productId) DO UPDATE SET quantity = quantity + ?, updatedAt = datetime('now')
    `, toWarehouseId, productId, quantity)

    // Get names for response
    const product = await db.product.findUnique({ where: { id: productId } })
    const fromWh = await db.warehouse.findUnique({ where: { id: fromWarehouseId } })
    const toWh = await db.warehouse.findUnique({ where: { id: toWarehouseId } })

    return NextResponse.json({
      success: true,
      message: `${product?.nameUz} (${quantity} ${product?.unit}) ${fromWh?.name} dan ${toWh?.name} ga o'tkazildi`,
    })
  } catch (error) {
    console.error('Transfer error:', error)
    return NextResponse.json({ error: 'O\'tkazish xatosi' }, { status: 500 })
  }
}
