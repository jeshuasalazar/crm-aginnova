'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Correo o contraseña incorrectos. Verifica tus datos.')
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Debes confirmar tu correo antes de ingresar.')
        } else {
          setError(authError.message)
        }
        setLoading(false)
        return
      }

      router.push('/')
      router.refresh()
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
      setLoading(false)
    }
  }

  const fillDemo = (role: 'consultor' | 'director' | 'cliente') => {
    const demos = {
      consultor: { email: 'consultor@aginnova.mx', password: 'aginnova2026' },
      director:  { email: 'director@aginnova.mx',  password: 'aginnova2026' },
      cliente:   { email: 'admin@nalua.mx',         password: 'aginnova2026' },
    }
    setEmail(demos[role].email)
    setPassword(demos[role].password)
    setError('')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: '#F4F6F9',
    }}>
      {/* ─── PANEL IZQUIERDO ─────────────────────────────────── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '64px',
        position: 'relative',
        overflow: 'hidden',
        color: 'white',
        background: 'linear-gradient(135deg, #1C3F6E 0%, #0f2540 55%, #1a3560 100%)',
      }}>
        {/* Círculos decorativos */}
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: '#4A7BB5', opacity: 0.18, top: -120, right: -160,
        }} />
        <div style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: '#4A7BB5', opacity: 0.10, bottom: -80, left: -60,
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1, marginBottom: 48 }}>
          <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.5px' }}>aginnova</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>
            Agencia de Transformación Digital
          </div>
        </div>

        {/* Heading */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.2, margin: '0 0 16px', color: 'white' }}>
            CRM Inteligente<br />
            <span style={{ color: 'rgba(255,255,255,0.55)' }}>para el crecimiento</span><br />
            de tus clientes.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.7, maxWidth: 380, margin: 0 }}>
            Gestiona KPIs, comisiones y recomendaciones de IA en tiempo real.
            Toda tu cartera de clientes, en un solo lugar.
          </p>
        </div>

        {/* Feature list */}
        <div style={{ position: 'relative', zIndex: 1, marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            'Panel ROI con cálculo automático de comisiones',
            'Recomendaciones de IA aprobadas por consultor',
            'Alertas en tiempo real por área y cliente',
            'Multi-tenant seguro para cada MIPYME',
          ].map((feat) => (
            <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.45)', flexShrink: 0 }} />
              {feat}
            </div>
          ))}
        </div>

        {/* Dots decorativos */}
        <div style={{
          position: 'absolute', bottom: 36, right: 36, zIndex: 1,
          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8,
        }}>
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.18)' }} />
          ))}
        </div>
      </div>

      {/* ─── PANEL DERECHO — FORMULARIO ──────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'white',
        padding: '48px 32px',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#1C3F6E', margin: '0 0 4px' }}>
            Bienvenido
          </h2>
          <p style={{ fontSize: 14, color: '#718096', margin: '0 0 32px' }}>
            Ingresa tus credenciales para continuar
          </p>

          {/* Error message */}
          {error && (
            <div style={{
              background: '#FFF5F5', border: '1px solid #FEB2B2', color: '#C53030',
              padding: '12px 16px', borderRadius: 8, marginBottom: 24, fontSize: 14,
              display: 'flex', alignItems: 'flex-start', gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#5A6472' }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="consultor@aginnova.mx"
                style={{
                  height: 48, padding: '0 16px', fontSize: 14.5,
                  borderRadius: 8, border: '2px solid #e2e8f0',
                  background: '#f7f9fc', outline: 'none',
                  fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#4A7BB5'; e.target.style.background = 'white'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f7f9fc'; }}
              />
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#5A6472' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  height: 48, padding: '0 16px', fontSize: 14.5,
                  borderRadius: 8, border: '2px solid #e2e8f0',
                  background: '#f7f9fc', outline: 'none',
                  fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#4A7BB5'; e.target.style.background = 'white'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f7f9fc'; }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                height: 50, background: loading ? '#8fa8c8' : '#1C3F6E',
                color: 'white', border: 'none', borderRadius: 8,
                fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.3px', transition: 'background 0.2s',
                marginTop: 4, fontFamily: 'inherit',
              }}
            >
              {loading ? 'Verificando...' : 'Ingresar al CRM'}
            </button>
          </form>

          <a href="#" style={{
            display: 'block', textAlign: 'center', marginTop: 20,
            fontSize: 13, color: '#718096', textDecoration: 'none',
          }}>
            ¿Olvidaste tu contraseña?
          </a>

          {/* Demo section */}
          <div style={{ margin: '32px 0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ fontSize: 11.5, color: '#b0bec5', whiteSpace: 'nowrap' }}>acceso de demostración</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {(['consultor', 'director', 'cliente'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => fillDemo(role)}
                style={{
                  flex: 1, padding: '10px 4px', border: '2px solid #e2e8f0',
                  borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: '#f7f9fc', color: '#5A6472', cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.15s', textTransform: 'capitalize',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.borderColor = '#4A7BB5';
                  (e.target as HTMLElement).style.color = '#1C3F6E';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.borderColor = '#e2e8f0';
                  (e.target as HTMLElement).style.color = '#5A6472';
                }}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 36, fontSize: 11.5, color: '#b0bec5', textAlign: 'center' }}>
            CRM Aginnova v1.0 · © 2026 Aginnova · Todos los derechos reservados
          </div>
        </div>
      </div>
    </div>
  )
}
