import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useApp } from './context/AppContext'
import { PORTAL, urlPortal } from './portal'
import Navegacion from './components/Navegacion'
import Login from './pages/Login'
import Inicio from './pages/Inicio'
import DetalleEvento from './pages/DetalleEvento'
import MisBoletos from './pages/MisBoletos'
import DetalleBoleto from './pages/DetalleBoleto'
import Transferir from './pages/Transferir'
import Verificar from './pages/Verificar'
import Perfil from './pages/Perfil'
import Organizador from './pages/Organizador'
import CrearEvento from './pages/CrearEvento'
import AdminEvento from './pages/AdminEvento'
import Acceso from './pages/Acceso'
import Escaner from './pages/Escaner'

function Plantilla() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <div className="plantilla">
      <Navegacion />
      <main className="contenido">
        <Outlet />
      </main>
    </div>
  )
}

function ConSesion({ children }) {
  const { usuario } = useApp()
  const location = useLocation()
  if (!usuario) return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  return children
}

// Las rutas viejas del organizador y del personal ahora viven en su propio portal.
function IrAPortal({ portal }) {
  const { pathname } = useLocation()
  useEffect(() => {
    window.location.replace(urlPortal(portal, pathname))
  }, [portal, pathname])
  return null
}

const INICIO = { publico: '/inicio', admin: '/organizador', staff: '/acceso' }

function rutas() {
  if (PORTAL === 'admin') {
    return (
      <>
        <Route path="/organizador" element={<ConSesion><Organizador /></ConSesion>} />
        <Route path="/organizador/crear" element={<ConSesion><CrearEvento /></ConSesion>} />
        <Route path="/organizador/:id" element={<ConSesion><AdminEvento /></ConSesion>} />
        <Route path="/perfil" element={<ConSesion><Perfil /></ConSesion>} />
      </>
    )
  }
  if (PORTAL === 'staff') {
    return (
      <>
        <Route path="/acceso" element={<ConSesion><Acceso /></ConSesion>} />
        <Route path="/acceso/:eventoId" element={<ConSesion><Escaner /></ConSesion>} />
        <Route path="/perfil" element={<ConSesion><Perfil /></ConSesion>} />
      </>
    )
  }
  return (
    <>
      {/* La verificación es pública: cualquiera puede consultar un boleto. */}
      <Route path="/verificar" element={<Verificar />} />
      <Route path="/inicio" element={<ConSesion><Inicio /></ConSesion>} />
      <Route path="/eventos/:id" element={<ConSesion><DetalleEvento /></ConSesion>} />
      <Route path="/boletos" element={<ConSesion><MisBoletos /></ConSesion>} />
      <Route path="/boletos/:id" element={<ConSesion><DetalleBoleto /></ConSesion>} />
      <Route path="/boletos/:id/transferir" element={<ConSesion><Transferir /></ConSesion>} />
      <Route path="/perfil" element={<ConSesion><Perfil /></ConSesion>} />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Plantilla />}>{rutas()}</Route>
      {PORTAL === 'publico' && <Route path="/organizador/*" element={<IrAPortal portal="admin" />} />}
      {PORTAL === 'publico' && <Route path="/acceso/*" element={<IrAPortal portal="staff" />} />}
      <Route path="*" element={<Navigate to={INICIO[PORTAL]} replace />} />
    </Routes>
  )
}
