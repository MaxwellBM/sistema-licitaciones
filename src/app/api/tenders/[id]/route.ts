import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/permissions'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const id = parseInt(params.id)
  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 422 })
  }

  const tender = await prisma.tender.findUnique({
    where: { id },
    include: {
      client: true,
      createdBy: { select: { id: true, name: true, email: true } },
      updatedBy: { select: { id: true, name: true, email: true } },
      tenderProducts: {
        include: {
          product: true,
        },
      },
    },
  })

  if (!tender) {
    return NextResponse.json({ error: 'Licitación no encontrada' }, { status: 404 })
  }

  return NextResponse.json({ data: tender })
}
