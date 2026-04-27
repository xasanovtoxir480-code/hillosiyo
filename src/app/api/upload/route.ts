import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Fayl topilmadi' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Faqat rasm fayllari (JPG, PNG, WebP, GIF) ruxsat etiladi' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fayl hajmi 5MB dan oshmasligi kerak' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg'
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

    // Save to data/uploads/products/ (writable directory, not public/)
    const uploadDir = path.join(process.cwd(), 'data', 'uploads', 'products')
    await mkdir(uploadDir, { recursive: true })

    // Write file
    const filePath = path.join(uploadDir, uniqueName)
    await writeFile(filePath, buffer)

    // Return URL pointing to our file serving API
    return NextResponse.json({
      url: `/api/files/products/${uniqueName}`,
      name: uniqueName,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Fayl yuklashda xatolik yuz berdi' }, { status: 500 })
  }
}
