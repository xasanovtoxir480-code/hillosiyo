import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (username === 'admin' && password === 'admin123') {
      return NextResponse.json({
        success: true,
        token: 'admin-token-pickup-market-2026',
        user: { name: 'Admin', role: 'superadmin' },
      })
    }

    return NextResponse.json({ success: false, error: "Login yoki parol noto'g'ri" }, { status: 401 })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
