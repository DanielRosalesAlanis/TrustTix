import { useCallback, useEffect, useState } from 'react'
import { ciudadDe } from '../utils/mapas'

const CLAVE = 'trusttix-ubicacion'
const VIGENCIA = 30 * 60 * 1000

function guardada() {
  try {
    const u = JSON.parse(localStorage.getItem(CLAVE))
    return u && Date.now() - u.fecha < VIGENCIA ? u : null
  } catch {
    return null
  }
}

// Ubicación de quien usa la app. El permiso se pide solo cuando la persona
// pulsa el botón; si ya lo había dado antes, se actualiza sin preguntar.
// estado: inactiva | buscando | lista | denegada | error
export default function useUbicacion() {
  const [ubicacion, setUbicacion] = useState(guardada)
  const [estado, setEstado] = useState(() => (guardada() ? 'lista' : 'inactiva'))

  const localizar = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setEstado('error')
      return
    }
    setEstado('buscando')
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const punto = { lat: coords.latitude, lng: coords.longitude }
        const ciudad = await ciudadDe(punto).catch(() => null)
        const nueva = { ...punto, ciudad, fecha: Date.now() }
        try {
          localStorage.setItem(CLAVE, JSON.stringify(nueva))
        } catch {
          // Sin almacenamiento: se vuelve a pedir en la siguiente visita.
        }
        setUbicacion(nueva)
        setEstado('lista')
      },
      (e) => setEstado(e.code === e.PERMISSION_DENIED ? 'denegada' : 'error'),
      { timeout: 15000, maximumAge: 10 * 60 * 1000 },
    )
  }, [])

  useEffect(() => {
    if (ubicacion || !navigator.permissions) return
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((p) => {
        if (p.state === 'granted') localizar()
        else if (p.state === 'denied') setEstado('denegada')
      })
      .catch(() => {})
  }, [ubicacion, localizar])

  return { ubicacion, estado, localizar }
}
