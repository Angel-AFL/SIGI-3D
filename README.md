# SIGI 3D

SIGI 3D es un PWA, el cual es un Sistema Inteligente para la Gestión de Impresoras 3D. El problema a resolver es la falta de un control centralizado, la gestión de material (como PLA, PLA+ o PETG), la falta de control del flujo de pedidos, además de la necesidad de contar con un espacio para almacenar y visualizar modelos 3D sin necesidad de software especializado.

## 📌 Estado del proyecto

> **Fase actual: scaffold inicial.** El repositorio contiene la base de Next.js (App Router), TypeScript y Tailwind CSS. La lógica de negocio, la integración con Supabase y el chatbot aún no están implementados.

- [x] Base de Next.js (App Router) + TypeScript
- [x] Tailwind CSS v4 configurado
- [ ] Integración con Supabase
- [ ] Módulos funcionales (inventario, pedidos, visor 3D, producción)
- [ ] Chatbot DeepSeek

## ✨ Funciones

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

| Variable                        | Descripción                                               |
| ------------------------------- | --------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL del proyecto de Supabase.                             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima pública de Supabase.                        |
| `DEEPSEEK_API_KEY`              | Clave de API de DeepSeek para el chatbot (solo servidor). |

> Las variables con prefijo `NEXT_PUBLIC_` son visibles en el cliente. No expongas secretos con ese prefijo.

## 📜 Scripts disponibles

| Comando         | Descripción                           |
| --------------- | ------------------------------------- |
| `npm run dev`   | Inicia el servidor de desarrollo.     |
| `npm run build` | Genera la compilación de producción.  |
| `npm run start` | Ejecuta la compilación de producción. |
| `npm run lint`  | Ejecuta ESLint sobre el código.       |

## 📁 Estructura del proyecto

```
sigi-3d/
├─ app/
│  ├─ layout.tsx                    # Layout raíz
│  ├─ page.tsx                      # Landing / redirect a /dashboard
│  ├─ globals.css                   # Estilos globales (Tailwind)
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
│  ├─ ui/                           # Primitivas reutilizables (Button, Card, Modal...)
│  ├─ layout/                       # Sidebar, Header, ChatWidget
│  ├─ inventory/                    # Componentes de inventario
│  ├─ orders/                       # KanbanBoard, Column, OrderCard
│  ├─ viewer/                       # Visor STL
│  └─ production/                   # Componentes de producción en serie
├─ lib/
│  ├─ supabase/
│  │  ├─ client.ts                  # Cliente de navegador
│  │  └─ server.ts                  # Cliente para RSC / route handlers
│  ├─ deepseek.ts                   # Integración con la API de DeepSeek
│  └─ utils.ts                      # Utilidades compartidas
├─ hooks/                           # Hooks personalizados (useFilaments, useOrders...)
├─ types/
│  └─ database.ts                   # Tipos generados de Supabase
├─ supabase/
│  └─ migrations/                   # Migraciones SQL del esquema
├─ public/
│  └─ models/                       # Modelos STL de ejemplo
├─ .env.example                     # Plantilla de variables de entorno
└─ README.md
```

> Las carpetas de `components/`, `lib/`, `hooks/`, `types/` y `supabase/` son la estructura propuesta; se irán creando a medida que se implementen los módulos.

## ☁️ Despliegue en Vercel

1. Sube el repositorio a GitHub.
2. Importa el proyecto en [Vercel](https://vercel.com/new).
3. Configura las variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DEEPSEEK_API_KEY`).
4. Despliega. Vercel detecta Next.js automáticamente.

Consulta la [documentación de despliegue de Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para más detalles.
