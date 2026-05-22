'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import styles from '@/styles/login.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión')
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/')
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Image src="/images/Logo2_color_wb_edited.avif" alt="Logo" width={140} height={140} style={{ objectFit: 'contain' }} />
          </div>
          <h1 className={styles.title}>Sistema de Licitaciones</h1>
          <p className={styles.subtitle}>Inicia sesión para continuar</p>
        </div>

        <div className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={styles.input} placeholder="tu@correo.com" required />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Contraseña</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={styles.input} placeholder="••••••••" required />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>

        <p className={styles.demo}>Demo: admin@csc.com / admin123</p>
        <p className={styles.demo} style={{ marginTop: '0.5rem' }}>
          ¿No tenés cuenta?{' '}
          <Link href="/register" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 500 }}>
            Registrarse
          </Link>
        </p>
      </div>
    </div>
  )
}
