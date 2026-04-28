import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, copyFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Fayl topilmadi' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Faqat JPG, PNG, WebP, GIF ruxsat etiladi' }, { status: 400 })
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fayl hajmi 5MB dan oshmasligi kerak' }, { status: 400 })
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${randomUUID()}.${ext}`

    // Save to data/uploads/products — served via /api/files/ route
    const uploadDir = join(process.cwd(), 'data', 'uploads', 'products')
    await mkdir(uploadDir, { recursive: true })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Also copy to source project public/products/ for backup
    try {
      const srcDir = join(process.cwd(), '..', '..', 'public', 'products')
      await mkdir(srcDir, { recursive: true })
      await copyFile(filepath, join(srcDir, filename))
    } catch {
      // Ignore — not always running from standalone
    }

    // URL served by /api/files/[...path] route
    const url = `/api/files/products/${filename}`

    return NextResponse.json({ url, filename })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Rasm yuklashda xatolik yuz berdi' }, { status: 500 })
  }
}
