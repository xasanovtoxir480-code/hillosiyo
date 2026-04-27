import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const warehouses = await db.warehouse.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ warehouses })
  } catch (error) {
    console.error('Warehouses fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch warehouses' }, { status: 500 })
  }
}
