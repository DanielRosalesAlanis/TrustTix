// Mapas y ubicaciones con OpenStreetMap. Nominatim convierte direcciones en
// coordenadas (y al revés) sin llave, con un límite de una consulta por
// segundo; por eso las consultas van en fila y se guardan en el navegador.

const NOMINATIM = 'https://nominatim.openstreetmap.org'
const CLAVE = 'trusttix-lugares'

let fila = Promise.resolve()
const espera = (ms) => new Promise((r) => setTimeout(r, ms))

function leerCache() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) ?? {}
  } catch {
    return {}
  }
}

function guardarCache(clave, valor) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ ...leerCache(), [clave]: valor }))
  } catch {
    // Sin almacenamiento: se vuelve a consultar la próxima vez.
  }
}

function enFila(tarea) {
  const resultado = fila.then(tarea)
  fila = resultado.catch(() => {}).then(() => espera(1100))
  return resultado
}

// Coordenadas de una dirección o recinto en México, o null si no se encuentra.
export function buscarLugar(texto) {
  const clave = texto.trim().toLowerCase()
  if (!clave) return Promise.resolve(null)
  const cache = leerCache()
  if (clave in cache) return Promise.resolve(cache[clave])
  return enFila(async () => {
    const r = await fetch(
      `${NOMINATIM}/search?format=jsonv2&limit=1&countrycodes=mx&accept-language=es&q=${encodeURIComponent(texto)}`,
    )
    if (!r.ok) throw new Error('No pudimos consultar el mapa.')
    const [lugar] = await r.json()
    const punto = lugar ? { lat: Number(lugar.lat), lng: Number(lugar.lon) } : null
    guardarCache(clave, punto)
    return punto
  })
}

// Nombre de la ciudad en la que está un punto, por ejemplo "Cuernavaca, Morelos".
export function ciudadDe({ lat, lng }) {
  return enFila(async () => {
    const r = await fetch(`${NOMINATIM}/reverse?format=jsonv2&zoom=10&accept-language=es&lat=${lat}&lon=${lng}`)
    if (!r.ok) throw new Error('No pudimos consultar el mapa.')
    const { address = {} } = await r.json()
    const ciudad = address.city ?? address.town ?? address.village ?? address.municipality ?? address.county
    const estado = address.state
    return [ciudad, estado !== ciudad ? estado : null].filter(Boolean).join(', ') || null
  })
}

// Distancia en línea recta entre dos puntos (fórmula del haverseno).
export function distanciaKm(a, b) {
  const rad = (g) => (g * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

export function textoDistancia(km) {
  if (km < 1) return 'A menos de 1 km'
  if (km < 10) return `A ${km.toLocaleString('es-MX', { maximumFractionDigits: 1 })} km`
  return `A ${Math.round(km).toLocaleString('es-MX')} km`
}

export function mapaEmbebido({ lat, lng }) {
  const d = 0.006
  const caja = [lng - d, lat - d * 0.6, lng + d, lat + d * 0.6].map((n) => n.toFixed(5)).join(',')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${caja}&layer=mapnik&marker=${lat},${lng}`
}

export const comoLlegar = ({ lat, lng }) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
