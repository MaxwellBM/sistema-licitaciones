import { NextResponse } from 'next/server'
import { getUserFromRequest, JwtPayload } from './auth'
import { NextRequest } from 'next/server'

export function requireAuth(request: NextRequest): JwtPayload | NextResponse {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  return user
}

export function requireAdmin(request: NextRequest): JwtPayload | NextResponse {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Acción permitida solo para administradores' }, { status: 403 })
  }
  return user
}
