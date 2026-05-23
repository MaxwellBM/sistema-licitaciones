/**
 * @swagger
 * /api/tenders/{id}/status:
 *   patch:
 *     summary: Cambiar estado de licitación
 *     tags: [Tenders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [por_cobrar, perdida, finalizada]
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       422:
 *         description: Transición de estado inválida
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/permissions'

const VALID_TRANSITIONS: Record<string, string[]> = {
  activa: ['por_cobrar', 'perdida'],
  por_cobrar: ['finalizada'],
  finalizada: [],
  perdida: [],
}

export async function PATCH(
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

  try {
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: 'El estado es requerido' }, { status: 422 })
    }

    const validStatuses = ['activa', 'por_cobrar', 'perdida', 'finalizada']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 422 })
    }

    const tender = await prisma.tender.findUnique({ where: { id } })
    if (!tender) {
      return NextResponse.json({ error: 'Licitación no encontrada' }, { status: 404 })
    }

    const allowedTransitions = VALID_TRANSITIONS[tender.status]
    if (!allowedTransitions.includes(status)) {
      return NextResponse.json(
        { error: `No se puede cambiar de "${tender.status}" a "${status}". Transición no válida.` },
        { status: 422 }
      )
    }

    const updated = await prisma.tender.update({
      where: { id },
      data: {
        status,
        updatedById: auth.userId,
      },
      include: {
        client: true,
        tenderProducts: {
          include: { product: true },
        },
      },
    })

    return NextResponse.json({ data: updated })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
