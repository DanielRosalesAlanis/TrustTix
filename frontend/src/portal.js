// TrustTix es una sola app que se publica como tres portales:
//   trusttix.xyz          compradores (eventos, boletos y verificación)
//   admin.trusttix.xyz    organizadores (crear eventos y asignar personal)
//   staff.trusttix.xyz    personal de acceso (escanear boletos en la puerta)
// Fuera de ese dominio (localhost, vistas previas de Vercel) el portal se elige
// con ?portal=admin o ?portal=staff, y se recuerda mientras la pestaña siga abierta.

export const DOMINIO = import.meta.env.VITE_DOMINIO ?? 'trusttix.xyz'

const PORTALES = ['publico', 'admin', 'staff']
const CLAVE = 'trusttix-portal'

function detectar() {
  const sub = window.location.hostname.split('.')[0]
  if (sub === 'admin' || sub === 'staff') return sub
  const pedido = new URLSearchParams(window.location.search).get('portal')
  try {
    if (PORTALES.includes(pedido)) sessionStorage.setItem(CLAVE, pedido)
    const guardado = sessionStorage.getItem(CLAVE)
    if (PORTALES.includes(guardado)) return guardado
  } catch {
    // Sin almacenamiento: vale lo que diga la dirección.
  }
  return PORTALES.includes(pedido) ? pedido : 'publico'
}

export const PORTAL = detectar()

export const NOMBRE_PORTAL = {
  publico: 'TrustTix',
  admin: 'Organizadores',
  staff: 'Personal de acceso',
}

// Dirección de una ruta en otro portal: subdominio en el dominio real,
// ?portal= en cualquier otro host.
export function urlPortal(portal, ruta = '/') {
  const { protocol, hostname, origin } = window.location
  const base = hostname.replace(/^(admin|staff|www)\./, '')
  if (base === DOMINIO) return `${protocol}//${portal === 'publico' ? '' : `${portal}.`}${base}${ruta}`
  return `${origin}${ruta}?portal=${portal}`
}
