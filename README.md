# SIGI 3D

SIGI 3D es un PWA, el cual es un Sistema Inteligente para la Gestión de Impresoras 3D. El problema a resolver es la falta de un control centralizado, la gestión de material (como PLA, PLA+ o PETG), la falta de control del flujo de pedidos, además de la necesidad de contar con un espacio para almacenar y visualizar modelos 3D sin necesidad de software especializado.

## 📌 Estado del proyecto

> **Fase actual: base de PWA lista, autenticación, inventario y visor 3D.** El proyecto ya es una PWA instalable (manifest, iconos, service worker y modo offline), con notificaciones push persistidas en Supabase, autenticación de usuarios con Supabase Auth, el módulo de inventario de filamentos y el visor 3D con carga de modelos STL a Supabase Storage. Los módulos de pedidos, producción y el chatbot aún no están implementados.

- [x] Base de Next.js (App Router) + TypeScript
- [x] Tailwind CSS v4 configurado
- [x] Integración con Supabase (clientes de navegador y servidor)
- [x] PWA instalable (manifest, iconos y metadata)
- [x] Service worker con soporte offline
- [x] Notificaciones push (Web Push + VAPID)
- [x] Autenticación con Supabase Auth (email + contraseña)
- [x] Módulo de inventario (filamentos, CRUD, consumo y alertas)
- [x] Módulo de visor 3D (STL, metadatos, miniaturas y visor interactivo)
- [ ] Módulos de pedidos y producción
- [ ] Chatbot DeepSeek

## ✨ Funciones

### Implementadas

- PWA instalable en escritorio y móvil (manifest, iconos y modo `standalone`).
- Autenticación con Supabase Auth (email + contraseña), registro abierto y protección de todas las rutas del panel.
- Funcionamiento offline básico mediante service worker y página `/offline`.
- Notificaciones push (Web Push + VAPID) con suscripciones persistidas en Supabase y asociadas a cada usuario.
- Página de ajustes (`/ajustes`) para instalar la app y gestionar las notificaciones.
- Inventario de filamentos por usuario: CRUD de carretes, búsqueda y filtro por estado, y registro de consumo con descuento de gramaje.
- Visor 3D por usuario: carga de modelos STL a Supabase Storage, metadatos (material, tiempo estimado y dimensiones), miniaturas autogeneradas y visor interactivo (rotación, zoom, reset y pantalla completa).

### Planificadas (Roadmap)

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
├─ proxy.ts                          # Proxy (middleware de Next 16): refresca sesión y protege rutas
├─ app/
│  ├─ layout.tsx                    # Layout raíz (metadata PWA + service worker)
│  ├─ page.tsx                      # Landing / redirect a /dashboard
│  ├─ globals.css                   # Estilos globales (Tailwind)
│  ├─ manifest.ts                   # Web App Manifest (PWA)
│  ├─ icon.png / apple-icon.png     # Iconos generados
│  ├─ actions.ts                    # Server Actions (suscripción y envío push)
│  ├─ ajustes/page.tsx              # Instalación PWA + notificaciones
│  ├─ offline/page.tsx              # Fallback sin conexión
│  ├─ (auth)/                       # Route group público (login / registro)
│  │  ├─ layout.tsx                 # Layout centrado con branding
│  │  ├─ actions.ts                 # Server Actions de auth (signIn, signUp, signOut)
│  │  ├─ login/page.tsx             # Inicio de sesión
│  │  └─ registro/page.tsx          # Registro de cuenta
│  ├─ auth/callback/route.ts        # Intercambio de código (confirmación por email)
│  ├─ (app)/                        # Route group con layout del dashboard (protegido)
│  │  ├─ layout.tsx                 # Verifica sesión + Sidebar + Header + ChatWidget
│  │  ├─ dashboard/page.tsx         # Estadísticas generales
│  │  ├─ inventario/
│  │  │  ├─ page.tsx                # Filamentos y gramaje
│  │  │  └─ actions.ts              # Server Actions de inventario (CRUD + consumo)
│  │  ├─ pedidos/page.tsx           # Tablero Kanban
│  │  ├─ modelos/
│  │  │  ├─ page.tsx                # Galería + visor STL
│  │  │  └─ actions.ts              # Server Actions de modelos 3D
│  │  └─ produccion/page.tsx        # Lotes por camas / mermas
│  └─ api/
│     └─ chat/route.ts              # Proxy seguro a DeepSeek
├─ components/
│  ├─ pwa/                          # register-sw, offline-banner, push-manager, install-prompt
│  ├─ auth/                         # LoginForm, SignupForm, UserMenu
│  ├─ ui/                           # Primitivas (Button, Card, Input, Select, Modal, ...)
│  ├─ layout/                       # Sidebar, Header, ChatWidget
│  ├─ dashboard/                    # Componentes del dashboard
│  ├─ inventory/                    # Stats, toolbar, tabla, formulario y consumo
│  ├─ orders/                       # KanbanBoard, Column, OrderCard
│  ├─ viewer/                       # Visor STL, lista, detalles y formulario de modelos
│  └─ production/                   # Componentes de producción en serie
├─ hooks/
│  └─ use-client-value.ts           # Valores solo-cliente sin hydration mismatch
├─ lib/
│  ├─ auth.ts                       # DAL de autenticación (getUser, requireUser)
│  ├─ supabase/
│  │  ├─ client.ts                  # Cliente de navegador
│  │  ├─ server.ts                  # Cliente para RSC / Server Actions (cookies + RLS)
│  │  ├─ admin.ts                   # Cliente service role (solo servidor)
│  │  └─ proxy.ts                   # Helper de sesión para proxy.ts
│  ├─ push.ts                       # Envío de notificaciones Web Push
│  ├─ inventory.ts                  # Acceso a datos del inventario (server-only)
│  ├─ inventory-utils.ts            # Estado, formato de gramos y % restante
│  ├─ models.ts                     # Acceso a datos de modelos 3D (server-only)
│  ├─ viewer-utils.ts               # Formatos de tiempo, dimensiones y tamaño
│  ├─ stl-client.ts                 # Parseo de STL, dimensiones y miniaturas (cliente)
│  ├─ deepseek.ts                   # Integración con la API de DeepSeek
│  └─ utils.ts                      # Utilidades compartidas
├─ types/
│  ├─ database.ts                   # Tipos de Supabase
│  ├─ inventory.ts                  # Tipos del inventario
│  └─ viewer.ts                     # Tipos del visor 3D
├─ supabase/
│  └─ migrations/                   # Migraciones SQL del esquema
├─ scripts/
│  └─ generate-icons.mjs            # Genera los iconos PWA desde public/logo.png
├─ public/
│  ├─ sw.js                         # Service worker (offline + push)
│  ├─ logo.png                      # Logo fuente
│  ├─ icon-192x192.png              # Iconos PWA
│  ├─ icon-512x512.png
│  └─ icon-maskable-512x512.png
├─ .env.example                     # Plantilla de variables de entorno
└─ README.md
```

> La base de la PWA (`app/manifest.ts`, `app/offline`, `components/pwa`, `public/sw.js`, `lib/push.ts`), la autenticación, el módulo de inventario (`app/(app)/inventario`, `components/inventory`, `lib/inventory.ts`) y el visor 3D (`app/(app)/modelos`, `components/viewer`, `lib/models.ts`) ya existen. Las carpetas de pedidos y producción (`components/orders`, `production`) son la estructura propuesta para los módulos pendientes.

## 🔐 Autenticación

SIGI 3D usa **Supabase Auth** (email + contraseña) con sesiones basadas en cookies mediante `@supabase/ssr`.

- **Registro abierto:** cualquiera puede crear una cuenta en `/registro`.
- **Rutas públicas:** `/login`, `/registro`, `/auth/callback` y `/offline`.
- **Rutas protegidas:** todo el panel (`/dashboard`, `/inventario`, `/pedidos`, `/produccion`, `/modelos`) y `/ajustes`. `proxy.ts` refresca la sesión y redirige a `/login` si no hay sesión; los layouts y páginas vuelven a verificarla en el servidor como defensa en profundidad.
- **Cerrar sesión:** desde el menú de usuario en la cabecera.

### Configuración en Supabase

1. En **Authentication → Providers**, habilita **Email**.
2. En **Authentication → URL Configuration**, define:
   - **Site URL:** `http://localhost:3000` (o tu dominio de producción).
   - **Redirect URLs:** añade `http://localhost:3000/auth/callback` y `https://tu-dominio/auth/callback`.
3. Decide si dejas **Confirm email** activado (recomendado con registro abierto). Si lo desactivas, el usuario entra directamente tras registrarse.

> Las suscripciones push se asocian al usuario autenticado. Aplica las migraciones `0001` a `0005` de `supabase/migrations/` en el SQL Editor de Supabase.

## 📦 Inventario

El módulo de inventario permite gestionar los carretes de filamento de cada usuario.

- **Datos por carrete:** material, color, marca, ubicación, peso actual, peso inicial (opcional) y mínimo de stock.
- **Estado calculado:** `En stock` (peso actual ≥ mínimo), `Bajo stock` (0 < peso actual < mínimo) y `Agotado` (0 g).
- **Operaciones:** crear, editar, eliminar y registrar consumo (descuenta los gramos del peso actual).
- **Búsqueda y filtro:** por material, color, marca o ubicación, y por estado.
- **Aislamiento:** cada usuario ve y gestiona únicamente su propio inventario (RLS por `user_id`).
- **Esquema:** aplica `supabase/migrations/0003_filaments.sql` en el SQL Editor de Supabase.

## 🧊 Visor 3D

El módulo del visor permite cargar y previsualizar modelos STL sin software de terceros.

- **Carga:** formulario con nombre, material y tiempo estimado (min). El archivo `.stl` (máximo 50 MB) se sube directamente a Supabase Storage desde el navegador.
- **Metadatos:** dimensiones XYZ calculadas automáticamente desde el bounding box del STL y miniatura PNG generada en el cliente al cargar el modelo.
- **Visor:** canvas interactivo con `three.js` + `@react-three/fiber`; rotación, zoom, reset de cámara y pantalla completa.
- **Galería:** búsqueda por nombre/material y filtro por material, con estadísticas de modelos cargados y vistas recientes.
- **Operaciones:** editar metadatos y eliminar el modelo (borra el STL y la miniatura del Storage).
- **Asistente IA:** el botón del visor abre el `ChatWidget` (el chatbot DeepSeek aún está pendiente).
- **Aislamiento:** cada usuario ve y gestiona únicamente sus propios modelos (RLS por `user_id` y políticas de Storage por carpeta `{user_id}/…`).
- **Esquema:** aplica `supabase/migrations/0004_models.sql` y `supabase/migrations/0005_models_storage.sql` en el SQL Editor de Supabase (esta última crea el bucket privado `models`).

## 📱 PWA

La aplicación es instalable y funciona como app nativa en modo `standalone`.

- **Instalar:** desde el navegador (Chrome/Edge) o en iOS mediante Compartir → "Añadir a pantalla de inicio". También hay controles en `/ajustes`.
- **Offline:** el service worker (`public/sw.js`) cachea el shell y muestra `/offline` cuando no hay conexión. Solo se registra en producción, así que pruébalo con `npm run build && npm run start`.
- **Notificaciones push:** requieren claves VAPID y la tabla `push_subscriptions` en Supabase. Se gestionan desde `/ajustes` y quedan vinculadas al usuario autenticado.
- **Iconos:** se generan desde `public/logo.png` con `npm run icons` (192, 512 y maskable, más `app/icon.png` y `app/apple-icon.png`).
- **Aplicar el esquema:** ejecuta las migraciones de `supabase/migrations/` (`0001_push_subscriptions.sql`, `0002_push_subscriptions_user.sql`, `0003_filaments.sql`, `0004_models.sql` y `0005_models_storage.sql`) en el SQL Editor de Supabase.

> **Brave:** bloquea el push por defecto. Activa "Use Google services for push messaging" en `brave://settings/privacy`, o usa Chrome/Edge.

## ☁️ Despliegue en Vercel

1. Sube el repositorio a GitHub.
2. Importa el proyecto en [Vercel](https://vercel.com/new).
3. Configura las variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `DEEPSEEK_API_KEY`).
4. Despliega. Vercel detecta Next.js automáticamente.

Consulta la [documentación de despliegue de Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para más detalles.
