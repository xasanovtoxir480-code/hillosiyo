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
        image: image || '/products/default.jpg',
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
