import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const warehouseId = searchParams.get('warehouseId')

    if (!warehouseId) {
      return NextResponse.json({ error: 'warehouseId required' }, { status: 400 })
    }

    const warehouse = await db.warehouse.findUnique({
      where: { id: warehouseId },
    })

    // Use raw query to avoid Prisma client cache issues
    const stockRaw = await db.$queryRawUnsafe<Array<{
      id: string; warehouseId: string; productId: string; quantity: number;
      nameUz: string; price: number; unit: string; image: string;
      catNameUz: string; catIcon: string;
    }>>(
      `SELECT ws.id, ws.warehouseId, ws.productId, ws.quantity,
              p.nameUz, p.price, p.unit, p.image,
              c.nameUz as catNameUz, c.icon as catIcon
       FROM WarehouseStock ws
       JOIN Product p ON ws.productId = p.id
       JOIN Category c ON p.categoryId = c.id
       WHERE ws.warehouseId = ? AND ws.quantity > 0
       ORDER BY ws.quantity DESC`,
      warehouseId
    )

    const stock = stockRaw.map((s) => ({
      id: s.id,
      warehouseId: s.warehouseId,
      productId: s.productId,
      quantity: s.quantity,
      product: {
        id: s.productId,
        nameUz: s.nameUz,
        price: s.price,
        unit: s.unit,
        image: s.image,
        category: { icon: s.catIcon, nameUz: s.catNameUz },
      },
    }))

    return NextResponse.json({ stock, warehouse })
  } catch (error) {
    console.error('Stock fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch stock' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { warehouseId, productId, quantity } = body

    if (!warehouseId || !productId || quantity <= 0) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // Use raw query for upsert
    await db.$executeRawUnsafe(`
      INSERT INTO WarehouseStock (id, warehouseId, productId, quantity, createdAt, updatedAt)
      VALUES (lower(hex(randomblob(16))), ?, ?, ?, datetime('now'), datetime('now'))
      ON CONFLICT(warehouseId, productId) DO UPDATE SET quantity = quantity + ?, updatedAt = datetime('now')
    `, warehouseId, productId, quantity, quantity)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Stock create error:', error)
    return NextResponse.json({ error: 'Failed to add stock' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { stockId, quantity } = body

    if (!stockId || quantity < 0) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    await db.$executeRawUnsafe(
      'UPDATE WarehouseStock SET quantity = ?, updatedAt = datetime(\'now\') WHERE id = ?',
      quantity, stockId
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Stock update error:', error)
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 })
  }
}
