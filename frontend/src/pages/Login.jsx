import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Logo from '../components/Logo'
import { mostrarBotonGoogle } from '../auth/google'
import { PORTAL } from '../portal'

const LEMAS = {
  publico: ['TU ACCESO', 'AL MUNDO'],
  admin: ['PANEL DE', 'ORGANIZADORES'],
  staff: ['PERSONAL', 'DE ACCESO'],
}

export default function Login() {
  const { usuario, iniciarSesion } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const destino = location.state?.desde ?? '/'
  const contenedor = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (usuario || !contenedor.current) return
    mostrarBotonGoogle(contenedor.current, (perfil) => {
      iniciarSesion(perfil)
      navigate(destino, { replace: true })
    }).catch((e) => setError(e.message))
  }, [usuario, iniciarSesion, navigate, destino])

  if (usuario) return <Navigate to={destino} replace />

  const [fuerte, suave] = LEMAS[PORTAL]

  return (
    <main className="login">
      <div className="login__marca">
        <Logo size={150} />
        <h1 className="login__lema">
          <strong>{fuerte}</strong>
          <span>{suave}</span>
        </h1>
      </div>
      <div className="login__acciones">
        <div ref={contenedor} className="login__google" />
        {error && <p className="alerta alerta--error" role="alert">{error}</p>}
        <p className="login__nota">
          Tu cuenta de Google solo identifica tu sesión. Para comprar, crear eventos o registrar entradas firmas con tu billetera.
        </p>
      </div>
    </main>
  )
}
