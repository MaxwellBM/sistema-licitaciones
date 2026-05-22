'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import shared from '@/styles/shared.module.css'

interface Product {
  id: number
  name: string
  sku: string
  unitPrice: number
  description: string
  createdAt: string
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [user, setUser] = useState<{ role: string } | null>(null)
  const [form, setForm] = useState({ name: '', sku: '', unitPrice: '', description: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token) { router.push('/login'); return }
    setUser(JSON.parse(userData || '{}'))
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (res.ok) setProducts(data.data)
    } catch { } finally { setLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, unitPrice: parseFloat(form.unitPrice) }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error'); return }
      setForm({ name: '', sku: '', unitPrice: '', description: '' })
      setShowForm(false)
      fetchProducts()
    } catch { } finally { setSubmitting(false) }
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className={shared.page}>
      <div className={shared.header}>
        <div>
          <h1 className={shared.headerTitle}>Productos</h1>
          <p className={shared.headerSub}>Catálogo de productos</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} className={shared.createBtn}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Producto
          </button>
        )}
      </div>

      {showForm && (
        <div className={shared.card} style={{ marginBottom: '2rem' }}>
          <div className={shared.cardHeader}><h2>Nuevo Producto</h2></div>
          <div className={shared.cardBody}>
            <form onSubmit={handleSubmit} className={shared.formGrid}>
              <input className={shared.input} placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className={shared.input} placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
              <input className={shared.input} type="number" step="0.01" min="0.01" placeholder="Precio Unitario" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} required />
              <input className={shared.input} placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              {error && <div className={shared.formGridFull}><div className={shared.error}>{error}</div></div>}
              <div className={shared.formGridFull}>
                <div className={shared.formActions}>
                  <button type="submit" disabled={submitting} className={shared.submitBtn}>{submitting ? 'Guardando...' : 'Guardar'}</button>
                  <button type="button" onClick={() => setShowForm(false)} className={shared.cancelBtn}>Cancelar</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className={shared.spinner}><div className={shared.spinnerCircle} /></div>
      ) : (
        <div className={shared.card}>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>SKU</th>
                  <th>Precio Unitario</th>
                  <th>Descripción</th>
                  <th>Creado</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><span className={shared.sku}>{p.sku}</span></td>
                    <td>${Number(p.unitPrice).toFixed(2)}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
