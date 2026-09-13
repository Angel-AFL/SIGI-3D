# SIGI 3D

SIGI 3D es un PWA, el cual es un Sistema Inteligente para la Gestión de Impresoras 3D. El problema a resolver es la falta de un control centralizado, la gestión de material (como PLA, PLA+ o PETG), la falta de control del flujo de pedidos, además de la necesidad de contar con un espacio para almacenar y visualizar modelos 3D sin necesidad de software especializado.

## 📌 Estado del proyecto

> **Fase actual: base de PWA lista.** El proyecto ya es una PWA instalable (manifest, iconos, service worker y modo offline), con notificaciones push persistidas en Supabase. La lógica de negocio de los módulos y el chatbot aún no están implementados.

- [x] Base de Next.js (App Router) + TypeScript
- [x] Tailwind CSS v4 configurado
- [x] Integración con Supabase (clientes de navegador y servidor)
- [x] PWA instalable (manifest, iconos y metadata)
- [x] Service worker con soporte offline
- [x] Notificaciones push (Web Push + VAPID)
- [ ] Módulos funcionales (inventario, pedidos, visor 3D, producción)
- [ ] Chatbot DeepSeek

## ✨ Funciones

### Implementadas

- PWA instalable en escritorio y móvil (manifest, iconos y modo `standalone`).
- Funcionamiento offline básico mediante service worker y página `/offline`.
- Notificaciones push (Web Push + VAPID) con suscripciones persistidas en Supabase.
- Página de ajustes (`/ajustes`) para instalar la app y gestionar las notificaciones.

### Planificadas (Roadmap)

- Inventario dinámico de filamentos con cálculo de gramaje restante.
- Visor web 3D integrado para previsualizar modelos STL sin software de terceros.
- Tablero Kanban para la gestión del ciclo de vida de los pedidos (cotizado, imprimiendo, entregado).
- Botón flotante con chatbot impulsado por DeepSeek para consultas rápidas sobre parámetros o stock.
- Estadísticas esenciales del dashboard general.
- Módulo de producción en serie para gestionar lotes por camas de impresión y registrar mermas.

## 🚀 Tecnologías

| Área          | Tecnología                                                                         |
| ------------- | ---------------------------------------------------------------------------------- |
| Framework     | [Next.js 16](https://nextjs.org/) (App Router)                                     |
| Lenguaje      | [TypeScript](https://www.typescriptlang.org/)                                      |
| UI            | [React 19](https://react.dev/)                                                     |
| Estilos       | [Tailwind CSS v4](https://tailwindcss.com/)                                        |
| Base de datos | [Supabase](https://supabase.com/)                                                  |
| Visor 3D      | [three.js](https://threejs.org/) + [@react-three/fiber](https://r3f.docs.pmnd.rs/) |
| Chatbot       | [DeepSeek](https://www.deepseek.com/)                                              |
| Despliegue    | [Vercel](https://vercel.com/)                                                      |

## ⚙️ Requisitos previos

- [Node.js](https://nodejs.org/) **20 o superior** (requerido por Next.js 16)
- [npm](https://www.npmjs.com/) (gestor de paquetes del proyecto)

## 🛠️ Instalación y configuración local

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/Angel-AFL/SIGI-3D.git
   cd SIGI-3D
   ```

2. **Instala las dependencias:**

   ```bash
   npm install
   ```

3. **Configura las variables de entorno:** copia el archivo de ejemplo y completa los valores.

   ```bash
   cp .env.example .env.local
   ```

4. **Inicia el servidor de desarrollo:**

   ```bash
   npm run dev
   ```

   La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## 🔐 Variables de entorno

Crea un archivo `.env.local` a partir de `.env.example` con las siguientes claves:

| Variable                            | Descripción                                                                  |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`          | URL del proyecto de Supabase.                                                |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública (o `anon key` legacy). Visible en el cliente.               |
| `SUPABASE_SECRET_KEY`               | Clave secreta (o `service_role` legacy) para el servidor.                    |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`      | Clave pública VAPID para Web Push.                                           |
| `VAPID_PRIVATE_KEY`                 | Clave privada VAPID para firmar notificaciones (solo servidor).              |
| `VAPID_SUBJECT`                     | Contacto `mailto:` para el servicio de push.                                 |
| `DEEPSEEK_API_KEY`                  | Clave de API de DeepSeek para el chatbot (solo servidor).                    |

> Las variables con prefijo `NEXT_PUBLIC_` son visibles en el cliente. No expongas secretos con ese prefijo.
> Las claves VAPID se generan con `npx web-push generate-vapid-keys`.

## 📜 Scripts disponibles

| Comando         | Descripción                                        |
| --------------- | -------------------------------------------------- |
| `npm run dev`   | Inicia el servidor de desarrollo.                  |
| `npm run build` | Genera la compilación de producción.               |
| `npm run start` | Ejecuta la compilación de producción.              |
| `npm run lint`  | Ejecuta ESLint sobre el código.                    |
| `npm run icons` | Regenera los iconos de la PWA desde `logo.png`.    |

## 📁 Estructura del proyecto

```
sigi-3d/
├─ app/
│  ├─ layout.tsx                    # Layout raíz (metadata PWA + service worker)
│  ├─ page.tsx                      # Landing / redirect a /dashboard
│  ├─ globals.css                   # Estilos globales (Tailwind)
│  ├─ manifest.ts                   # Web App Manifest (PWA)
│  ├─ icon.png / apple-icon.png     # Iconos generados
│  ├─ actions.ts                    # Server Actions (suscripción y envío push)
│  ├─ ajustes/page.tsx              # Instalación PWA + notificaciones
│  ├─ offline/page.tsx              # Fallback sin conexión
│  ├─ (app)/                        # Route group con layout del dashboard
│  │  ├─ layout.tsx                 # Sidebar + Header + ChatWidget
│  │  ├─ dashboard/page.tsx         # Estadísticas generales
│  │  ├─ inventario/page.tsx        # Filamentos y gramaje
│  │  ├─ pedidos/page.tsx           # Tablero Kanban
│  │  ├─ modelos/page.tsx           # Galería + visor STL
│  │  └─ produccion/page.tsx        # Lotes por camas / mermas
│  └─ api/
│     └─ chat/route.ts              # Proxy seguro a DeepSeek
├─ components/
│  ├─ pwa/                          # register-sw, offline-banner, push-manager, install-prompt
│  ├─ ui/                           # Primitivas reutilizables (Button, Card, Modal...)
│  ├─ layout/                       # Sidebar, Header, ChatWidget
│  ├─ inventory/                    # Componentes de inventario
│  ├─ orders/                       # KanbanBoard, Column, OrderCard
│  ├─ viewer/                       # Visor STL
│  └─ production/                   # Componentes de producción en serie
├─ hooks/
│  └─ use-client-value.ts           # Valores solo-cliente sin hydration mismatch
├─ lib/
│  ├─ supabase/
│  │  ├─ client.ts                  # Cliente de navegador
│  │  └─ server.ts                  # Cliente para RSC / route handlers
│  ├─ push.ts                       # Envío de notificaciones Web Push
│  ├─ deepseek.ts                   # Integración con la API de DeepSeek
│  └─ utils.ts                      # Utilidades compartidas
├─ types/
│  └─ database.ts                   # Tipos de Supabase
├─ supabase/
│  └─ migrations/                   # Migraciones SQL del esquema
├─ scripts/
│  └─ generate-icons.mjs            # Genera los iconos PWA desde public/logo.png
├─ public/
│  ├─ sw.js                         # Service worker (offline + push)
│  ├─ logo.png                      # Logo fuente
│  ├─ icon-192x192.png              # Iconos PWA
│  ├─ icon-512x512.png
│  ├─ icon-maskable-512x512.png
│  └─ models/                       # Modelos STL de ejemplo
├─ .env.example                     # Plantilla de variables de entorno
└─ README.md
```

> La base de la PWA (`app/manifest.ts`, `app/offline`, `components/pwa`, `public/sw.js`, `lib/push.ts`) ya existe. Las carpetas del dashboard (`app/(app)`, `components/ui`, `inventory`, `orders`, `viewer`, `production`) son la estructura propuesta para los módulos pendientes.

## 📱 PWA

La aplicación es instalable y funciona como app nativa en modo `standalone`.

- **Instalar:** desde el navegador (Chrome/Edge) o en iOS mediante Compartir → "Añadir a pantalla de inicio". También hay controles en `/ajustes`.
- **Offline:** el service worker (`public/sw.js`) cachea el shell y muestra `/offline` cuando no hay conexión. Solo se registra en producción, así que pruébalo con `npm run build && npm run start`.
- **Notificaciones push:** requieren claves VAPID y la tabla `push_subscriptions` en Supabase. Se gestionan desde `/ajustes`.
- **Iconos:** se generan desde `public/logo.png` con `npm run icons` (192, 512 y maskable, más `app/icon.png` y `app/apple-icon.png`).
- **Aplicar el esquema:** ejecuta `supabase/migrations/0001_push_subscriptions.sql` en el SQL Editor de Supabase.

> **Brave:** bloquea el push por defecto. Activa "Use Google services for push messaging" en `brave://settings/privacy`, o usa Chrome/Edge.

## ☁️ Despliegue en Vercel

1. Sube el repositorio a GitHub.
2. Importa el proyecto en [Vercel](https://vercel.com/new).
3. Configura las variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `DEEPSEEK_API_KEY`).
4. Despliega. Vercel detecta Next.js automáticamente.

Consulta la [documentación de despliegue de Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para más detalles.
