import { readFile, stat } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

// MIME types
const mimeTypes: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
}

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const pathSegments = params.path
    const filePath = path.join(process.cwd(), 'data', 'uploads', ...pathSegments)

    // Security: prevent directory traversal
    const resolvedPath = path.resolve(filePath)
    const allowedBase = path.resolve(path.join(process.cwd(), 'data', 'uploads'))
    if (!resolvedPath.startsWith(allowedBase)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check file exists
    const fileStat = await stat(resolvedPath).catch(() => null)
    if (!fileStat || !fileStat.isFile()) {
      return NextResponse.json({ error: 'Fayl topilmadi' }, { status: 404 })
    }

    // Read file
    const fileBuffer = await readFile(resolvedPath)
    const ext = path.extname(resolvedPath).toLowerCase()
    const contentType = mimeTypes[ext] || 'application/octet-stream'

    // Cache for 30 days
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=2592000, immutable',
        'Content-Length': fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('File serve error:', error)
    return NextResponse.json({ error: 'Faylni oqishda xatolik' }, { status: 500 })
  }
}
