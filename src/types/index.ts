export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
  createdAt: string
  updatedAt: string
}

export interface Client {
  id: number
  name: string
  email: string
  phone: string
  company: string
  createdAt: string
  updatedAt: string
  createdById: number
  updatedById: number | null
}

export interface Product {
  id: number
  name: string
  sku: string
  unitPrice: number
  description: string
  createdAt: string
  updatedAt: string
  createdById: number
  updatedById: number | null
}

export interface Tender {
  id: number
  title: string
  description: string
  maxBudget: number
  totalAmount: number
  status: 'activa' | 'por_cobrar' | 'perdida' | 'finalizada'
  startDate: string
  endDate: string
  clientId: number
  client?: Client
  createdAt: string
  updatedAt: string
  createdById: number
  updatedById: number | null
  tenderProducts?: TenderProduct[]
}

export interface TenderProduct {
  id: number
  tenderId: number
  productId: number
  quantity: number
  unitPrice: number
  product?: Product
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}
