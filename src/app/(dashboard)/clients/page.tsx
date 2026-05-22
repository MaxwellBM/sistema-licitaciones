'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import shared from '@/styles/shared.module.css'

interface Client {
  id: number
  name: string
  email: string
  phone: string
  company: string
  createdAt: string
}

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [user, setUser] = useState<{ role: string } | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token) { router.push('/login'); return }
    setUser(JSON.parse(userData || '{}'))
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/clients', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (res.ok) setClients(data.data)
    } catch { } finally { setLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error'); return }
      setForm({ name: '', email: '', phone: '', company: '' })
      setShowForm(false)
      fetchClients()
    } catch { } finally { setSubmitting(false) }
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className={shared.page}>
      <div className={shared.header}>
        <div>
          <h1 className={shared.headerTitle}>Clientes</h1>
          <p className={shared.headerSub}>Gestiona tus clientes</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} className={shared.createBtn}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Cliente
          </button>
        )}
      </div>

      {showForm && (
        <div className={shared.card} style={{ marginBottom: '2rem' }}>
          <div className={shared.cardHeader}><h2>Nuevo Cliente</h2></div>
          <div className={shared.cardBody}>
            <form onSubmit={handleSubmit} className={shared.formGrid}>
              <input className={shared.input} placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className={shared.input} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <input className={shared.input} placeholder="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              <input className={shared.input} placeholder="Empresa" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
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
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Empresa</th>
                  <th>Creado</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td>{c.company}</td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
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
