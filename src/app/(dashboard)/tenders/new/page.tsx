'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '@/styles/tender-new.module.css'

export const dynamic = 'force-dynamic'

interface Client {
  id: number
  name: string
  company: string
}

export default function NewTenderPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [form, setForm] = useState({ title: '', description: '', maxBudget: '', clientId: '', startDate: '', endDate: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/clients', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (res.ok) setClients(data.data)
    } catch { }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/tenders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error'); return }
      router.push(`/tenders/${data.data.id}`)
    } catch {
      setError('Error de conexión')
    } finally { setSubmitting(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>Nueva Licitación</h1>
        <p className={styles.headerSub}>Completa los datos para crear una licitación</p>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Título</label>
            <input className={styles.input} placeholder="Título de la licitación" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>

          <div className={styles.field}>
            <label>Descripción</label>
            <textarea className={`${styles.input} ${styles.textarea}`} rows={3} placeholder="Descripción detallada" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Presupuesto Máximo</label>
              <input className={styles.input} type="number" step="0.01" min="0.01" placeholder="0.00" value={form.maxBudget} onChange={(e) => setForm({ ...form, maxBudget: e.target.value })} required />
            </div>
            <div className={styles.field}>
              <label>Cliente</label>
              <select className={styles.input} value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} required>
                <option value="">Seleccionar cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} - {c.company}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Fecha de Inicio</label>
              <input className={styles.input} type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div className={styles.field}>
              <label>Fecha de Cierre</label>
              <input className={styles.input} type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button type="submit" disabled={submitting} className={styles.submitBtn}>
              {submitting ? 'Creando...' : 'Crear Licitación'}
            </button>
            <button type="button" onClick={() => router.push('/')} className={styles.cancelBtn}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
