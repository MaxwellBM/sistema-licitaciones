'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import shared from '@/styles/shared.module.css'

export const dynamic = 'force-dynamic'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
  createdAt: string
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token) { router.push('/login'); return }
    const parsed = JSON.parse(userData || '{}')
    if (parsed.role !== 'admin') { router.push('/'); return }
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (res.ok) setUsers(data.data)
    } catch { } finally { setLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error'); return }
      setForm({ name: '', email: '', password: '', role: 'user' })
      setShowForm(false)
      fetchUsers()
    } catch { } finally { setSubmitting(false) }
  }

  return (
    <div className={shared.page}>
      <div className={shared.header}>
        <div>
          <h1 className={shared.headerTitle}>Usuarios</h1>
          <p className={shared.headerSub}>Administración de usuarios del sistema</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={shared.createBtn}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Usuario
        </button>
      </div>

      {showForm && (
        <div className={shared.card} style={{ marginBottom: '2rem' }}>
          <div className={shared.cardHeader}><h2>Nuevo Usuario</h2></div>
          <div className={shared.cardBody}>
            <form onSubmit={handleSubmit} className={shared.formGrid}>
              <input className={shared.input} placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className={shared.input} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <input className={shared.input} type="password" placeholder="Contraseña" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <select className={shared.input} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
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
                  <th>Rol</th>
                  <th>Creado</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`${shared.roleBadge} ${u.role === 'admin' ? shared.roleAdmin : shared.roleUser}`}>
                        {u.role === 'admin' ? 'Administrador' : 'Usuario'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
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
