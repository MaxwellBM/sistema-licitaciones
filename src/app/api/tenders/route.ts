import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (status && ['activa', 'por_cobrar', 'perdida', 'finalizada'].includes(status)) {
    where.status = status
  }

  const [tenders, total] = await Promise.all([
    prisma.tender.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        client: true,
        createdBy: { select: { id: true, name: true, email: true } },
        tenderProducts: {
          include: {
            product: true,
          },
        },
      },
    }),
    prisma.tender.count({ where }),
  ])

  return NextResponse.json({
    data: tenders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { title, description, maxBudget, startDate, endDate, clientId } = await request.json()

    if (!title || !description || !maxBudget || !startDate || !endDate || !clientId) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 422 })
    }

    const budget = parseFloat(maxBudget)
    if (isNaN(budget) || budget <= 0) {
      return NextResponse.json({ error: 'El presupuesto máximo debe ser mayor a 0' }, { status: 422 })
    }

    const client = await prisma.client.findUnique({ where: { id: parseInt(clientId) } })
    if (!client) {
      return NextResponse.json({ error: 'El cliente no existe' }, { status: 422 })
    }

    const tender = await prisma.tender.create({
      data: {
        title,
        description,
        maxBudget: budget,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        clientId: parseInt(clientId),
        createdById: auth.userId,
      },
      include: {
        client: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({ data: tender }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
