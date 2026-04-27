import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = { isActive: true }

    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId
    }

    if (featured === 'true') {
      where.isFeatured = true
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameUz: { contains: search } },
      ]
    }

    const products = await db.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, nameUz, categoryId, price, oldPrice, unit, image, stock, isFeatured } = body

    const product = await db.product.create({
      data: {
        name,
        nameUz,
        categoryId,
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        unit: unit || 'kg',
        image: image || '',
        stock: parseInt(stock) || 100,
        isFeatured: isFeatured || false,
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Product create error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { productId, name, nameUz, price, oldPrice, unit, image, stock, isActive } = body

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (nameUz !== undefined) updateData.nameUz = nameUz
    if (price !== undefined) updateData.price = parseFloat(price)
    if (oldPrice !== undefined) updateData.oldPrice = oldPrice ? parseFloat(oldPrice) : null
    if (unit !== undefined) updateData.unit = unit
    if (image !== undefined) updateData.image = image
    if (stock !== undefined) updateData.stock = parseInt(stock)
    if (isActive !== undefined) updateData.isActive = isActive

    const product = await db.product.update({
      where: { id: productId },
      data: updateData,
      include: { category: true },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('id')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    await db.warehouseStock.deleteMany({ where: { productId } })
    await db.orderItem.deleteMany({ where: { productId } })
    await db.product.delete({ where: { id: productId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Product delete error:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
