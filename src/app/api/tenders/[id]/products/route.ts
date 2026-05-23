/**
 * @swagger
 * /api/tenders/{id}/products:
 *   post:
 *     summary: Agregar producto a licitación
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
 *             required: [productId, quantity]
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Producto agregado, totalAmount actualizado
 *       422:
 *         description: >
 *           Posibles errores: licitación no activa, presupuesto excedido,
 *           producto duplicado
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/permissions'

export async function POST(
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
    const { productId, quantity } = await request.json()

    if (!productId || !quantity) {
      return NextResponse.json({ error: 'Producto y cantidad son requeridos' }, { status: 422 })
    }

    const tender = await prisma.tender.findUnique({
      where: { id },
      include: { tenderProducts: true },
    })
    if (!tender) {
      return NextResponse.json({ error: 'Licitación no encontrada' }, { status: 404 })
    }

    if (tender.status !== 'activa') {
      return NextResponse.json(
        { error: 'No se pueden agregar productos a una licitación que no esté en estado "activa"' },
        { status: 422 }
      )
    }

    const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } })
    if (!product) {
      return NextResponse.json({ error: 'El producto no existe' }, { status: 422 })
    }

    const qty = parseInt(quantity)
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({ error: 'La cantidad debe ser mayor a 0' }, { status: 422 })
    }

    const existing = await prisma.tenderProduct.findUnique({
      where: { tenderId_productId: { tenderId: id, productId: parseInt(productId) } },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'El producto ya está agregado a esta licitación' },
        { status: 422 }
      )
    }

    const newTotal = Number(tender.totalAmount) + Number(product.unitPrice) * qty
    if (newTotal > Number(tender.maxBudget)) {
      const disponible = Number(tender.maxBudget) - Number(tender.totalAmount)
      return NextResponse.json(
        {
          error: `El total excede el presupuesto máximo de $${Number(tender.maxBudget).toFixed(2)}. Disponible: $${disponible.toFixed(2)}`,
        },
        { status: 422 }
      )
    }

    const [tenderProduct] = await prisma.$transaction([
      prisma.tenderProduct.create({
        data: {
          tenderId: id,
          productId: parseInt(productId),
          quantity: qty,
          unitPrice: product.unitPrice,
        },
        include: { product: true },
      }),
      prisma.tender.update({
        where: { id },
        data: {
          totalAmount: newTotal,
          updatedById: auth.userId,
        },
      }),
    ])

    return NextResponse.json({ data: tenderProduct }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
