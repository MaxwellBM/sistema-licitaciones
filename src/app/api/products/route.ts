/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Listar productos
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos
 *       401:
 *         description: Sin token
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      updatedBy: { select: { id: true, name: true, email: true } },
    },
  })

  return NextResponse.json({ data: products })
}

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear producto
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, sku, unitPrice, description]
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               unitPrice:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Producto creado
 *       403:
 *         description: Sin permisos de admin
 *       422:
 *         description: SKU duplicado o error de validación
 */
export async function POST(request: NextRequest) {
  const auth = requireAdmin(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { name, sku, unitPrice, description } = await request.json()

    if (!name || !sku || !unitPrice || !description) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 422 })
    }

    const price = parseFloat(unitPrice)
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: 'El precio unitario debe ser mayor a 0' }, { status: 422 })
    }

    const existingSku = await prisma.product.findUnique({ where: { sku } })
    if (existingSku) {
      return NextResponse.json({ error: 'El SKU ya existe' }, { status: 422 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        unitPrice: price,
        description,
        createdById: auth.userId,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({ data: product }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
