# TrustTix

## Requisitos

**Para el front:**

- [Node.js](https://nodejs.org/) 20.19 o superior (incluye npm).
- Git.
- La extensión [Freighter](https://www.freighter.app) en Chrome, Edge o Brave, configurada en **Testnet** y con saldo de prueba (botón **Fund with Friendbot** dentro de la extensión).

**Para el contrato (opcional; ya está desplegado en Testnet):**

- [Rust](https://www.rust-lang.org/tools/install) 1.84 o superior y el target `wasm32v1-none`.
- [Stellar CLI](https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup).
- En Windows, las herramientas de compilación de C++ de Visual Studio (Build Tools).

## Instalación

```bash
git clone https://github.com/DanielRosalesAlanis/TrustTix.git
cd TrustTix/frontend
npm install
```

Para el contrato:

```bash
rustup target add wasm32v1-none
```

## Cómo correrlo

**Front:**

```bash
cd frontend
npm run dev
```

Antes de la primera vez, copia `frontend/.env.example` como `frontend/.env.local` y pon el ID de cliente de Google en `VITE_GOOGLE_CLIENT_ID` (ver [Inicio de sesión con Google](#inicio-de-sesión-con-google)).

Abre <http://localhost:5173>, inicia sesión con Google y conecta Freighter. El front ya apunta al contrato desplegado en Testnet (`CCWWMLZANZV54WMJQ5JQ6XP2AAUE5BGKK3Q5CPQZEJMREJ4OYRVN36GD`).

**Portales:** la misma app se publica en tres direcciones, una por rol.

| Portal | En producción | En local |
| --- | --- | --- |
| Compradores | trusttix.xyz | <http://localhost:5173> |
| Organizadores: crear eventos y asignar personal | admin.trusttix.xyz | <http://localhost:5173/?portal=admin> |
| Personal de acceso: escanear boletos | staff.trusttix.xyz | <http://localhost:5173/?portal=staff> |

El personal abre su portal, conecta su billetera y muestra su código QR; el organizador lo escanea desde el panel del evento y firma para autorizarlo en el contrato.

**Pruebas del contrato:**

```bash
cd contracts
cargo test
```

**Compilar el contrato:**

```bash
cd contracts
stellar contract build
```

**Desplegar una instancia propia en Testnet (opcional):**

```bash
stellar keys generate mi-cuenta --network testnet --fund
stellar contract deploy --wasm target/wasm32v1-none/release/trusttix.wasm \
  --source-account mi-cuenta --network testnet \
  -- --token $(stellar contract id asset --asset native --network testnet)
```

Para usar esa instancia en el front, agrega `VITE_CONTRATO_ID=<id del contrato>` a `frontend/.env.local` y vuelve a correr `npm run dev`. Para crear los eventos de ejemplo en ella: `.\scripts\sembrar.ps1 -Contrato <id del contrato>` desde la carpeta `contracts`.

## Inicio de sesión con Google

1. En [Google Cloud Console](https://console.cloud.google.com/), crea un proyecto y abre **Google Auth Platform**.
2. En **Branding**, llena el nombre de la app y el correo de soporte. En **Audience**, elige **External** y publica la app.
3. En **Clients**, crea un cliente de tipo **Web application** y agrega estos orígenes de JavaScript autorizados:
   `http://localhost`, `http://localhost:5173`, `https://trust-tix.vercel.app`, `https://trusttix.xyz`, `https://www.trusttix.xyz`, `https://admin.trusttix.xyz` y `https://staff.trusttix.xyz`.
4. Copia el ID de cliente en `VITE_GOOGLE_CLIENT_ID` (en `frontend/.env.local` y en las variables de entorno de Vercel).

La cuenta de Google solo identifica la sesión; los permisos dentro de TrustTix los da la firma de la billetera.

## Ubicación

La app pide la ubicación solo cuando la persona pulsa **Usar mi ubicación**. Con ella ordena los eventos por distancia y muestra el mapa del recinto. Las direcciones se convierten en coordenadas con [Nominatim](https://nominatim.org/) de OpenStreetMap, sin llave y con un límite de una consulta por segundo.
