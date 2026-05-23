/**
 * @swagger
 * /api/tenders/{id}:
 *   get:
 *     summary: Detalle de licitación con productos
 *     tags: [Tenders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle de licitación
 *       404:
 *         description: Licitación no encontrada
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/permissions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const { id: idStr } = await params
  const id = parseInt(idStr)
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
