# Bingo del Agente GIRSU

App de bingo en vivo para el "Viernes de Inteligencia Colectiva". Las personas
prueban el agente GIRSU, marcan casillas según lo que va pasando en la
conversación, y cuando alguien hace bingo se anuncia a todos.

## Rutas

- `/` — Pantalla de entrada: nickname + ficha (situación)
- `/play` — Cartón de bingo. Estado guardado en `localStorage` por ficha.
- `/juez?key=...` — Vista del jurado (protegida por `JUEZ_KEY`). Lista de
  bingos cantados con la conversación pegada por el jugador para validar.
- `/pantalla` — Vista de proyección con scoreboard y "¡BINGO!" flash.

## Stack

- Next.js 16 + React 19 + Tailwind 4
- [Pusher Channels](https://pusher.com) para realtime
- [Upstash Redis](https://upstash.com) para persistir bingos cantados y
  aprobados (se enchufa desde el Marketplace de Vercel)

## Setup local

```bash
cd bingo-app
npm install
cp .env.local.example .env.local   # completar las claves
npm run dev
```

Abrir http://localhost:3001

## Variables de entorno

### Pusher (realtime)

Crear cuenta gratis en [pusher.com](https://pusher.com) → crear una app de
Channels → tomar las credenciales del tab "App Keys".

```
PUSHER_APP_ID=...
PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_CLUSTER=mt1

NEXT_PUBLIC_PUSHER_KEY=...      # mismo valor que PUSHER_KEY
NEXT_PUBLIC_PUSHER_CLUSTER=mt1  # mismo valor que PUSHER_CLUSTER
```

### Upstash Redis (persistencia)

En el proyecto de Vercel: **Storage → Marketplace → Upstash → Redis →
Create**. Conectarlo al proyecto y Vercel inyecta automáticamente:

```
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

(Si el integration usa los nombres `UPSTASH_REDIS_REST_URL` /
`UPSTASH_REDIS_REST_TOKEN`, también los lee el código.)

### Auth del jurado

```
JUEZ_KEY=elegite-una-frase-secreta
```

Si no la definís, la vista del jurado queda pública.

## Deploy en Vercel

1. Crear proyecto nuevo en Vercel apuntando al repo y al directorio
   `bingo-app/` como **Root Directory**.
2. Agregar variables de entorno de Pusher listadas arriba (y `JUEZ_KEY`).
3. Storage → Marketplace → Upstash Redis → conectar al proyecto.
4. Deploy.

## Personalizar fichas

Editar `src/lib/fichas.ts`. Cada ficha tiene `id`, `title`, `description`.

## Personalizar casillas del bingo

Editar `src/lib/bingo-card.ts`. Son 9 casillas (3x3). El bingo se considera
hecho cuando se completa una fila, columna o diagonal.
