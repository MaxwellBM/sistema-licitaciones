'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import styles from '@/styles/tender-detail.module.css'

interface Product {
  id: number
  name: string
  sku: string
  unitPrice: number
}

interface TenderProduct {
  id: number
  tenderId: number
  productId: number
  quantity: number
  unitPrice: number
  product: Product
}

interface Client {
  id: number
  name: string
  email: string
  phone: string
  company: string
}

interface Tender {
  id: number
  title: string
  description: string
  maxBudget: number
  totalAmount: number
  status: 'activa' | 'por_cobrar' | 'perdida' | 'finalizada'
  startDate: string
  endDate: string
  client: Client
  clientId: number
  tenderProducts: TenderProduct[]
  createdBy: { id: number; name: string }
  updatedBy: { id: number; name: string } | null
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  activa: ['por_cobrar', 'perdida'],
  por_cobrar: ['finalizada'],
  finalizada: [],
  perdida: [],
}

const STATUS_LABELS: Record<string, string> = {
  activa: 'Activa',
  por_cobrar: 'Por Cobrar',
  perdida: 'Perdida',
  finalizada: 'Finalizada',
}

export default function TenderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [tender, setTender] = useState<Tender | null>(null)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetchTender()
  }, [])

  const fetchTender = async () => {
    try {
      const token = localStorage.getItem('token')
      const [tenderRes, productsRes] = await Promise.all([
        fetch(`/api/tenders/${params.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const tenderData = await tenderRes.json()
      const productsData = await productsRes.json()
      if (tenderRes.ok) setTender(tenderData.data)
      if (productsRes.ok) setProducts(productsData.data)
    } catch { } finally { setLoading(false) }
  }

  const handleAddProduct = async () => {
    if (!selectedProduct || !quantity) return
    setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/tenders/${params.id}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: parseInt(selectedProduct), quantity: parseInt(quantity) }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error'); return }
      setSelectedProduct('')
      setQuantity('1')
      fetchTender()
    } catch {
      setError('Error de conexión')
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/tenders/${params.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error'); return }
      setTender(data.data)
    } catch { }
  }

  if (loading) {
    return (
      <div className={styles.spinner}>
        <div className={styles.spinnerCircle} />
      </div>
    )
  }

  if (!tender) {
    return (
      <div className={styles.notFound}>
        <p className={styles.notFoundText}>Licitación no encontrada</p>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all">
          Volver
        </Link>
      </div>
    )
  }

  const pct = Number(tender.maxBudget) > 0 ? (Number(tender.totalAmount) / Number(tender.maxBudget)) * 100 : 0
  const availableTransitions = VALID_TRANSITIONS[tender.status] || []
  const isTerminal = tender.status === 'finalizada' || tender.status === 'perdida'
  const isActive = tender.status === 'activa'

  const badgeClass = (status: string) => {
    const map: Record<string, string> = {
      activa: styles.badgeActiva,
      por_cobrar: styles.badgePorCobrar,
      perdida: styles.badgePerdida,
      finalizada: styles.badgeFinalizada,
    }
    return map[status] || styles.badgeActiva
  }

  return (
    <div className={styles.page}>
      <Link href="/" className={styles.backLink}>
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </Link>

      <div className={styles.tenderHeader}>
        <h1 className={styles.tenderTitle}>{tender.title}</h1>
        <span className={badgeClass(tender.status)}>{STATUS_LABELS[tender.status]}</span>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}><h2>Información General</h2></div>
            <div className={styles.cardBody}>
              <p className={styles.description}>{tender.description}</p>
              <div style={{ marginTop: '1.5rem' }} className={styles.metaGrid}>
                <div>
                  <div className={styles.metaLabel}>Fecha Inicio</div>
                  <div className={styles.metaValue}>{new Date(tender.startDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Fecha Cierre</div>
                  <div className={styles.metaValue}>{new Date(tender.endDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Creado por</div>
                  <div className={styles.metaValue}>{tender.createdBy?.name || '—'}</div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Actualizado por</div>
                  <div className={styles.metaValue}>{tender.updatedBy?.name || '—'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Productos</h2>
              {isActive && (
                <span className={styles.activeIndicator}>
                  <span className={styles.activeDot} />
                  Agregando productos
                </span>
              )}
            </div>
            <div className={styles.cardBody}>
              {tender.tenderProducts.length === 0 ? (
                <p className={styles.emptyProducts}>No hay productos agregados</p>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>SKU</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tender.tenderProducts.map((tp) => (
                        <tr key={tp.id}>
                          <td>{tp.product.name}</td>
                          <td><span className={styles.skuTag}>{tp.product.sku}</span></td>
                          <td>{tp.quantity}</td>
                          <td>${Number(tp.unitPrice).toFixed(2)}</td>
                          <td className={styles.subtotalCell}>${(Number(tp.unitPrice) * tp.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {isActive && (
                <div className={styles.productForm}>
                  <h3 className={styles.productFormTitle}>Agregar Producto</h3>
                  <div className={styles.productRow}>
                    <select className={styles.productSelect} value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                      <option value="">Seleccionar producto</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} - ${Number(p.unitPrice).toFixed(2)}</option>
                      ))}
                    </select>
                    <input className={styles.qtyInput} type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                    <button onClick={handleAddProduct} disabled={!selectedProduct} className={styles.addBtn}>
                      Agregar
                    </button>
                  </div>
                  {selectedProduct && (
                    <div className={styles.subtotalInfo}>
                      Subtotal: <span className={styles.subtotalValue}>
                        ${(Number(products.find(p => p.id === parseInt(selectedProduct))?.unitPrice || 0) * parseInt(quantity || '0')).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}><h2>Presupuesto</h2></div>
            <div className={styles.cardBody}>
              <div className={styles.budgetRow}>
                <span className={styles.budgetLabel}>Presupuesto Máximo</span>
                <span className={styles.budgetValue}>${Number(tender.maxBudget).toFixed(2)}</span>
              </div>
              <div className={styles.budgetRow}>
                <span className={styles.budgetLabel}>Total Utilizado</span>
                <span className={styles.budgetValue}>${Number(tender.totalAmount).toFixed(2)}</span>
              </div>
              <div className={styles.budgetRow}>
                <span className={styles.budgetLabel}>Disponible</span>
                <span className={pct > 100 ? styles.availableOver : styles.available}>
                  ${Math.max(0, Number(tender.maxBudget) - Number(tender.totalAmount)).toFixed(2)}
                </span>
              </div>
              <div className={styles.budgetBar}>
                <div className={`${styles.budgetFill} ${pct > 100 ? styles.budgetFillOver : styles.budgetFillOk}`} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <div className={`${styles.budgetPct} ${pct > 100 ? styles.budgetPctOver : styles.budgetPctOk}`}>
                {pct.toFixed(1)}% utilizado
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}><h2>Cliente</h2></div>
            <div className={styles.cardBody}>
              <div className={styles.clientField}>
                <div className={styles.clientLabel}>Nombre</div>
                <div className={styles.clientValue}>{tender.client?.name || '—'}</div>
              </div>
              <div className={styles.clientField}>
                <div className={styles.clientLabel}>Empresa</div>
                <div className={styles.clientValue}>{tender.client?.company || '—'}</div>
              </div>
              <div className={styles.clientField}>
                <div className={styles.clientLabel}>Email</div>
                <div className={styles.clientValue}>{tender.client?.email || '—'}</div>
              </div>
              <div className={styles.clientField}>
                <div className={styles.clientLabel}>Teléfono</div>
                <div className={styles.clientValue}>{tender.client?.phone || '—'}</div>
              </div>
            </div>
          </div>

          {!isTerminal && (
            <div className={styles.card}>
              <div className={styles.cardHeader}><h2>Cambiar Estado</h2></div>
              <div className={styles.cardBody}>
                <p className={styles.statusCurrent}>
                  Estado actual: <strong>{STATUS_LABELS[tender.status]}</strong>
                </p>
                <div className={styles.statusBtns}>
                  {availableTransitions.map((transition) => (
                    <button key={transition} onClick={() => handleStatusChange(transition)} className={styles.statusBtn}>
                      Marcar como {STATUS_LABELS[transition]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
