import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Encabezado from '../components/Encabezado'
import BotonBilletera from '../components/BotonBilletera'
import CodigoCuenta from '../components/CodigoCuenta'
import { abreviar, fechaCorta } from '../utils/formato'

// Inicio de la app de acceso: el personal ve solo los eventos en los que el
// organizador autorizó su cuenta en el contrato.
export default function Acceso() {
  const { eventos, billetera, esPersonal } = useApp()
  const [permitidos, setPermitidos] = useState(null)

  useEffect(() => {
    setPermitidos(null)
    if (!billetera) return undefined
    let vigente = true
    Promise.all(eventos.map((ev) => esPersonal(ev.id).then((v) => v && ev.id).catch(() => false))).then(
      (ids) => vigente && setPermitidos(ids.filter(Boolean)),
    )
    return () => {
      vigente = false
    }
  }, [eventos, billetera, esPersonal])

  const mios = eventos.filter((ev) => permitidos?.includes(ev.id))

  return (
    <>
      <Encabezado titulo="Acceso" />
      {!billetera ? (
        <div className="vacio vacio--caja">
          <p>Conecta la billetera del personal de acceso.</p>
          <BotonBilletera grande />
        </div>
      ) : permitidos === null ? (
        <p className="vacio">Revisando en qué eventos puede registrar entradas esta cuenta…</p>
      ) : mios.length === 0 ? (
        <section className="tarjeta">
          <h3 className="tarjeta__titulo">Aún no tienes eventos asignados</h3>
          <p className="nota">
            Muéstrale este código al organizador. Cuando lo escanee desde su panel y firme, el evento aparecerá aquí.
          </p>
          <CodigoCuenta cuenta={billetera} />
        </section>
      ) : (
        <>
          <p className="introduccion">
            Cuenta del personal: <span className="mono">{abreviar(billetera)}</span>. Elige el evento en el que estás trabajando.
          </p>
          <ul className="lista">
            {mios.map((ev) => (
              <li key={ev.id}>
                <Link to={`/acceso/${ev.id}`} className="tarjeta lista__item lista__item--enlace">
                  <span className="lista__titulo">{ev.titulo}</span>
                  <span className="nota">{ev.recinto} · {fechaCorta(ev)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
