import { useCallback, useEffect, useState } from 'react'
import { buscarLugar } from '../utils/mapas'

const mismo = (a, b) => a?.lat === b?.lat && a?.lng === b?.lng

// Coordenadas de cada evento. Las del catálogo y las de eventos creados en
// este navegador ya vienen en el evento; para los demás se busca en el mapa
// el recinto registrado en el contrato.
export default function useCoordenadas(eventos, activo = true) {
  const [buscadas, setBuscadas] = useState({})

  useEffect(() => {
    if (!activo) return undefined
    let vigente = true
    for (const ev of eventos) {
      if (ev.coordenadas) continue
      buscarLugar(ev.recinto)
        .then((punto) => vigente && setBuscadas((b) => (ev.id in b && mismo(b[ev.id], punto) ? b : { ...b, [ev.id]: punto })))
        .catch(() => {})
    }
    return () => {
      vigente = false
    }
  }, [eventos, activo])

  return useCallback((ev) => ev.coordenadas ?? buscadas[ev.id] ?? null, [buscadas])
}
