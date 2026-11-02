import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

// QR con la cuenta Stellar del personal. El organizador lo escanea desde su
// panel para autorizar esa cuenta, sin copiar direcciones a mano.
export default function CodigoCuenta({ cuenta }) {
  const [copiada, setCopiada] = useState(false)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(cuenta)
      setCopiada(true)
      setTimeout(() => setCopiada(false), 2000)
    } catch {
      // Sin portapapeles: la cuenta sigue visible para copiarla a mano.
    }
  }

  return (
    <div className="codigo-cuenta">
      <div className="codigo-cuenta__qr">
        <QRCodeSVG value={cuenta} size={176} level="M" marginSize={0} />
      </div>
      <p className="mono rompe codigo-cuenta__texto">{cuenta}</p>
      <button type="button" className="boton boton--contorno boton--chico" onClick={copiar}>
        {copiada ? 'Cuenta copiada' : 'Copiar cuenta'}
      </button>
    </div>
  )
}
