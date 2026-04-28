import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const orders = await db.order.findMany({
      include: {
        items: true,
        warehouse: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customerName, customerPhone, items, totalAmount, warehouseId } = body

    // Generate order number
    const orderCount = await db.order.count()
    const orderNumber = `PK-${String(orderCount + 1).padStart(5, '0')}`

    // Create order with items
    const order = await db.order.create({
      data: {
        orderNumber,
        customerName,
        customerPhone,
        totalAmount: parseFloat(totalAmount),
        warehouseId: warehouseId || null,
        status: 'pending',
        items: {
          create: items.map((item: {
            productId: string;
            productName: string;
            productImage: string;
            price: number;
            quantity: number;
            unit: string;
          }) => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            price: item.price,
            quantity: item.quantity,
            unit: item.unit,
          })),
        },
      },
      include: {
        items: true,
        warehouse: true,
      },
    })

    // Update stock
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Order create error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { orderId, status, warehouseId, pickupTime } = body

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (warehouseId) updateData.warehouseId = warehouseId
    if (pickupTime) updateData.pickupTime = new Date(pickupTime)

    const order = await db.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: true,
        warehouse: true,
      },
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Order update error:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
