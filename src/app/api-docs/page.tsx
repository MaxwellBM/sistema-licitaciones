'use client'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'
import { useEffect, useState } from 'react'

export default function ApiDocs() {
  const [spec, setSpec] = useState(null)

  useEffect(() => {
    fetch('/api/docs')
      .then(res => res.json())
      .then(data => setSpec(data))
  }, [])

  if (!spec) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Cargando documentación...</p>
    </div>
  )

  return (
    <div className="swagger-wrapper">
      <SwaggerUI spec={spec} />
    </div>
  )
}
