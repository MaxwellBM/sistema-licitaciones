'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '@/styles/dashboard.module.css'

export const dynamic = 'force-dynamic'

interface TenderProduct {
  id: number
  productId: number
  quantity: number
  unitPrice: number
  product: { id: number; name: string; sku: string }
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
  client: { id: number; name: string; company: string }
  tenderProducts: TenderProduct[]
  createdBy: { id: number; name: string }
}

export default function DashboardPage() {
  const router = useRouter()
  const [tenders, setTenders] = useState<Tender[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchTenders()
  }, [statusFilter, page])

  const fetchTenders = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({ page: page.toString(), limit: '10' })
      if (statusFilter) params.append('status', statusFilter)

      const res = await fetch(`/api/tenders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setTenders(data.data)
        setTotalPages(data.pagination.totalPages)
      }
    } catch {
      console.error('Error fetching tenders')
    } finally {
      setLoading(false)
    }
  }

  const statusBadgeClass = (status: string) => {
    const map: Record<string, string> = {
      activa: styles.badgeActiva,
      por_cobrar: styles.badgePorCobrar,
      perdida: styles.badgePerdida,
      finalizada: styles.badgeFinalizada,
    }
    return map[status] || styles.badgeActiva
  }

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      activa: 'Activa',
      por_cobrar: 'Por Cobrar',
      perdida: 'Perdida',
      finalizada: 'Finalizada',
    }
    return map[status] || status
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>Licitaciones</h1>
          <p className={styles.headerSub}>Gestiona y da seguimiento a tus licitaciones</p>
        </div>
        <Link href="/tenders/new" className={styles.newBtn}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Licitación
        </Link>
      </div>

      <div className={styles.filterCard}>
        <div className={styles.filterBody}>
          <div className={styles.filterGroup}>
            <button onClick={() => { setStatusFilter(''); setPage(1) }} className={`${styles.filterBtn} ${!statusFilter ? styles.active : ''}`}>
              Todas
            </button>
            {['activa', 'por_cobrar', 'perdida', 'finalizada'].map((s) => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }} className={`${styles.filterBtn} ${statusFilter === s ? styles.active : ''}`}>
                {statusLabel(s)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.spinner}>
          <div className={styles.spinnerCircle} />
        </div>
      ) : tenders.length === 0 ? (
        <div className={styles.filterCard}>
          <div className={styles.empty}>
            <svg className={styles.emptyIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className={styles.emptyText}>No hay licitaciones</p>
            <Link href="/tenders/new" className={styles.newBtn} style={{ display: 'inline-flex', marginTop: '1rem' }}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear primera licitación
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {tenders.map((tender) => {
              const pct = Number(tender.maxBudget) > 0 ? (Number(tender.totalAmount) / Number(tender.maxBudget)) * 100 : 0
              return (
                <Link key={tender.id} href={`/tenders/${tender.id}`} className={styles.tenderCard}>
                  <div className={styles.tenderBody}>
                    <div className={styles.tenderRow}>
                      <div className={styles.tenderInfo}>
                        <div className={styles.tenderTop}>
                          <span className={styles.tenderTitle}>{tender.title}</span>
                          <span className={statusBadgeClass(tender.status)}>{statusLabel(tender.status)}</span>
                        </div>
                        <p className={styles.tenderClient}>{tender.client?.name || 'Sin cliente'} - {tender.client?.company || ''}</p>
                      </div>
                      <div className={styles.tenderStats}>
                        <div className={styles.stat}>
                          <div className={styles.statLabel}>Presupuesto</div>
                          <div className={styles.statValue}>${Number(tender.maxBudget).toFixed(2)}</div>
                        </div>
                        <div className={styles.stat}>
                          <div className={styles.statLabel}>Total</div>
                          <div className={styles.statValue}>${Number(tender.totalAmount).toFixed(2)}</div>
                        </div>
                        <div className={styles.progress}>
                          <div className={styles.progressHeader}>
                            <span className={styles.progressLabel}>Progreso</span>
                            <span className={`${styles.progressPct} ${pct > 100 ? styles.progressPctOver : styles.progressPctOk}`}>{pct.toFixed(0)}%</span>
                          </div>
                          <div className={styles.progressBar}>
                            <div className={`${styles.progressFill} ${pct > 100 ? styles.progressFillOver : styles.progressFillOk}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className={styles.pageBtn}>
                Anterior
              </button>
              <span className={styles.pageInfo}>Página {page} de {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className={styles.pageBtn}>
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
