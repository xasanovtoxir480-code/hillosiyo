import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const warehouseId = searchParams.get('warehouseId')

    // Build WHERE clause — only products with warehouse stock > 0
    const conditions: string[] = []
    const params: any[] = []

    conditions.push('p.isActive = 1')
    conditions.push('COALESCE(ws_total.totalStock, 0) > 0')

    if (categoryId && categoryId !== 'all') {
      conditions.push('p.categoryId = ?')
      params.push(categoryId)
    }

    if (featured === 'true') {
      conditions.push('p.isFeatured = 1')
    }

    if (search) {
      conditions.push("(p.name LIKE ? OR p.nameUz LIKE ?)")
      params.push(`%${search}%`, `%${search}%`)
    }

    if (warehouseId) {
      conditions.push('EXISTS (SELECT 1 FROM WarehouseStock ws2 WHERE ws2.productId = p.id AND ws2.warehouseId = ? AND ws2.quantity > 0)')
      params.push(warehouseId)
    }

    const whereClause = conditions.join(' AND ')

    // Main query: products with their total warehouse stock and warehouse info
    const products = await db.$queryRawUnsafe<Array<{
      id: string
      name: string
      nameUz: string
      price: number
      oldPrice: number | null
      unit: string
      image: string
      stock: number
      isFeatured: number
      categoryId: string
      catId: string
      catName: string
      catNameUz: string
      catIcon: string
      totalStock: number
      warehouseIds: string
      warehouseNames: string
      warehouseAddresses: string
    }>>(
      `SELECT
        p.id, p.name, p.nameUz, p.price, p.oldPrice, p.unit, p.image, p.stock as productStock,
        p.isFeatured, p.categoryId,
        c.id as catId, c.name as catName, c.nameUz as catNameUz, c.icon as catIcon,
        COALESCE(ws_total.totalStock, 0) as stock,
        ws_total.warehouseIds,
        ws_total.warehouseNames,
        ws_total.warehouseAddresses
      FROM Product p
      JOIN Category c ON p.categoryId = c.id
      LEFT JOIN (
        SELECT
          ws.productId,
          SUM(ws.quantity) as totalStock,
          GROUP_CONCAT(ws.warehouseId) as warehouseIds,
          GROUP_CONCAT(w.name, '|||' || COALESCE(w.address, '')) as warehouseNames,
          GROUP_CONCAT(COALESCE(w.address, '')) as warehouseAddresses
        FROM WarehouseStock ws
        LEFT JOIN Warehouse w ON ws.warehouseId = w.id
        WHERE ws.quantity > 0
        GROUP BY ws.productId
      ) ws_total ON ws_total.productId = p.id
      WHERE ${whereClause}
      ORDER BY p.createdAt DESC`,
      ...params
    )

    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      nameUz: p.nameUz,
      price: Number(p.price),
      oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
      unit: p.unit,
      image: p.image,
      stock: Number(p.totalStock), // warehouse stock, not product stock
      isFeatured: !!p.isFeatured,
      categoryId: p.categoryId,
      category: {
        id: p.catId,
        name: p.catName,
        nameUz: p.catNameUz,
        icon: p.catIcon,
      },
      warehouses: (p.warehouseNames || '').split('|||').filter(Boolean).map((name, i) => {
        const addresses = (p.warehouseAddresses || '').split(',').filter(Boolean) || []
        return {
          name: name.trim(),
          address: (addresses[i] || '').trim(),
        }
      }),
    }))

    return NextResponse.json({ products: formatted })
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
