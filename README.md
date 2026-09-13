# SIGI 3D

SIGI 3D es un Sistema Inteligente para la Gestión de Impresoras 3D. El problema a resolver es la falta de un control centralizado, la gestión de material (como PLA, PLA+ o PETG), falta de control del flujo de pedidos, además de la necesidad de contar con un espacio para almacenar y visualizar modelos 3D sin necesidad de software especializado.

### Algunas de las funciones son:

- Inventario dinámico de filamentos con cálculo de gramaje restante.
- Visor web 3D integrado para previsualizar modelos STL sin software de terceros.
- Tablero Kanban para la gestión del ciclo de vida de los pedidos (cotizado, imprimiendo, entregado).
- Botón flotante con chatbot impulsado por DeepSeek para consultas rápidas sobre parámetros o stock.
- Estadísticas escenciales del dashboard general
- Módulo de producción en serie para gestionar lotes por camas de impresión y registrar mermas.

## 🚀 Tecnologías Principales

- **Framework:** [Next.js](https://nextjs.org/) (App Router / Pages Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Base de Datos:** Supabase
- **Despliegue:** Vercel

## ⚙️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 18.17 o superior)
- npm, yarn o pnpm

## 🛠️ Instalación y Configuración Local

1. **Clona el repositorio:**
   ```bash
   git clone [https://github.com/Angel-AFL/SIGI-3D.git](https://github.com/Angel-AFL/SIGI-3D.git)
   cd SIGI-3D
   ```
2. **Instala las dependencias:**

   ```bash
   npm install
   ```
