import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      updatedBy: { select: { id: true, name: true, email: true } },
    },
  })

  return NextResponse.json({ data: clients })
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { name, email, phone, company } = await request.json()

    if (!name || !email || !phone || !company) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 422 })
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        company,
        createdById: auth.userId,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({ data: client }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
