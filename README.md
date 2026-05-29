# Bingo del Agente GIRSU

App para el "Viernes de Inteligencia Colectiva". Cada participante recibe una
ficha (un caso de funcionario municipal), prueba el agente GIRSU en otra
pantalla, y va marcando casillas según lo que el agente hace bien o mal.
Al final deja feedback escrito. No es un bingo competitivo: es un **mecanismo
de feedback gamificado** — el cartón estructura la observación y el textarea
recoge la reflexión.

## Rutas

- `/` — Entrada: nickname + elección de ficha (situación).
- `/play` — Tabs **Caso / Bingo**. El caso (situación + pregunta + seguimientos)
  y el cartón 3×3. El feedback se auto-guarda al servidor cada ~2s. Estado del
  jugador persistido en `localStorage`.
- `/admin?key=...` — Panel de feedback recibido. Lista todas las entregas y
  permite **descargar un CSV** con nickname, ficha, casillas buenas/malas
  marcadas, feedback y fecha. Protegido por `ADMIN_KEY` (ver abajo).

## Cartón

Grid 3×3 (`src/lib/bingo-card.ts`):
- **6 casillas "buenas"** (filas 1-2): comportamientos deseados del agente
  (pide contexto, cita caso concreto, nombra programa RIL, ofrece recurso
  interno, trata como funcionario, reconoce lo que no sabe).
- **3 casillas "malas"** (fila 3): fallas a detectar (arma documento sin
  pedírselo, respuesta genérica, no ofrece próximo paso). Marcar las malas
  también es feedback válido.

## Stack

- Next.js 16 (App Router) + React 19 + Tailwind 4 (paleta RIL custom).
- [Upstash Redis](https://upstash.com) para persistir el feedback de los
  jugadores (se enchufa desde el Marketplace de Vercel).
- Sin realtime / sin Pusher: esta versión se simplificó respecto del plan
  original (que tenía `/juez`, `/pantalla`, `/ranking` y cantar línea/bingo).

### Fallback en memoria

Si las env vars de Upstash no están seteadas, `src/lib/kv.ts` cae a un `Map`
en memoria: permite probar el flujo entero en local sin configurar nada (la
data se pierde al matar el proceso). La consola avisa
`[kv] Sin Upstash configurado. Usando store en memoria`.

## Setup local

```bash
npm install
cp .env.local.example .env.local   # opcional: completar claves
npm run dev
```

Abrir http://localhost:3001

## Variables de entorno

### Upstash Redis (persistencia — requerido en producción)

En el proyecto de Vercel: **Storage → Marketplace → Upstash → Redis →
Create**. Al conectarlo, Vercel inyecta automáticamente:

```
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

(El código también acepta los nombres `UPSTASH_REDIS_REST_URL` /
`UPSTASH_REDIS_REST_TOKEN`.)

### Auth del panel admin

```
ADMIN_KEY=elegite-una-frase-secreta
```

Protege `/admin`. Si **no** la definís, el panel queda **público** (cualquiera
con la URL `/admin` ve y descarga todo el feedback). Con la clave seteada, se
entra por `/admin?key=<tu-frase>`.

## Deploy en Vercel

1. Proyecto en Vercel apuntando al repo (rama `main` autodeploya).
2. Storage → Marketplace → Upstash Redis → conectar al proyecto.
3. Agregar `ADMIN_KEY` en Environment Variables (Production + Preview) y
   redeployar.

## Personalizar

- **Fichas (situaciones):** `src/lib/fichas.ts` — una por rango de apellido,
  cada una con caso + pregunta principal + preguntas de seguimiento.
- **Casillas del bingo:** `src/lib/bingo-card.ts` — textos y tipo `good`/`bad`.

## Notas técnicas

- `params` y `searchParams` en Next 16 son **Promises** — siempre se `await`
  (ver `admin/page.tsx`).
- Tailwind v4 usa `@theme inline` con CSS variables; los colores están en
  `src/app/globals.css`.
- API: `POST /api/player` (upsert estado del jugador), `GET /api/admin/all`
  (lista de jugadores, protegida por `ADMIN_KEY`).
