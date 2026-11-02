import { NavLink } from 'react-router-dom'
import Logo from './Logo'
import { IconoBoleto, IconoCalendario, IconoEscaner, IconoEscudo, IconoInicio, IconoMas, IconoPerfil } from './Iconos'
import { NOMBRE_PORTAL, PORTAL } from '../portal'

const ENLACES = {
  publico: [
    { a: '/inicio', texto: 'Inicio', Icono: IconoInicio },
    { a: '/boletos', texto: 'Mis boletos', Icono: IconoBoleto },
    { a: '/verificar', texto: 'Verificar', Icono: IconoEscudo },
    { a: '/perfil', texto: 'Perfil', Icono: IconoPerfil },
  ],
  admin: [
    { a: '/organizador', texto: 'Mis eventos', Icono: IconoCalendario, exacto: true },
    { a: '/organizador/crear', texto: 'Crear evento', Icono: IconoMas },
    { a: '/perfil', texto: 'Perfil', Icono: IconoPerfil },
  ],
  staff: [
    { a: '/acceso', texto: 'Eventos', Icono: IconoEscaner },
    { a: '/perfil', texto: 'Mi cuenta', Icono: IconoPerfil },
  ],
}

// En celular es una barra inferior; en pantallas grandes se vuelve barra lateral.
export default function Navegacion() {
  return (
    <nav className="navegacion" aria-label="Principal">
      <div className="navegacion__marca">
        <Logo size={40} />
        <span>
          TrustTix
          {PORTAL !== 'publico' && <small>{NOMBRE_PORTAL[PORTAL]}</small>}
        </span>
      </div>
      {ENLACES[PORTAL].map(({ a, texto, Icono, exacto }) => (
        <NavLink key={a} to={a} end={exacto} className="navegacion__enlace">
          <Icono width={22} height={22} />
          <span>{texto}</span>
        </NavLink>
      ))}
    </nav>
  )
}
