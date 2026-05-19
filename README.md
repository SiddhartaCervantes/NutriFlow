# NutriFlow

Plataforma para nutriólogos que permite gestionar pacientes, planes alimenticios semanales, recetas y citas de forma sencilla.

---

## Requisitos previos

Asegúrate de tener instalado lo siguiente antes de comenzar:

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Node.js | 22.x | https://nodejs.org |
| npm | 10.x | (incluido con Node) |
| .NET SDK | 8.0 | https://dotnet.microsoft.com/download/dotnet/8.0 |
| Git | cualquiera | https://git-scm.com |

Verifica tus versiones con:
```bash
node --version
npm --version
dotnet --version
```

---

## Clonar el repositorio

```bash
git clone <URL-del-repositorio>
cd NutriFlow
```

---

## Configuración de credenciales

El proyecto usa **Supabase** como base de datos y autenticación. Los archivos con credenciales **no están incluidos en el repositorio** por seguridad — debes crearlos manualmente antes de correr el proyecto.

**Frontend** — edita [frontend/src/environments/environment.ts](frontend/src/environments/environment.ts):
```typescript
export const environment = {
  supabaseUrl: 'TU_SUPABASE_URL',
  supabaseAnonKey: 'TU_SUPABASE_PUBLISHABLE_KEY',
  pexelsApiKey: 'TU_PEXELS_API_KEY',
  apiUrl: 'http://localhost:5105',
};
```

**Backend** — crea el archivo `backend/Nutriflow.api/appsettings.json` basándote en la plantilla [`appsettings.Example.json`](backend/Nutriflow.api/appsettings.Example.json):
```json
{
  "AllowedHosts": "*",
  "AllowedOrigins": [ "http://localhost:4200" ],
  "Supabase": {
    "Url": "TU_SUPABASE_URL",
    "Key": "TU_SUPABASE_SECRET_KEY"
  }
}
```

> `appsettings.json` está en `.gitignore` — nunca se sube al repositorio.

### Deploy en producción

- **Vercel (frontend):** las variables de entorno se configuran en el dashboard de Vercel o directamente en `environment.ts`.
- **Railway (backend):** agrega las variables de entorno en el dashboard de Railway usando la notación de doble guion bajo:

| Variable Railway | Equivalente en appsettings |
|---|---|
| `Supabase__Url` | `Supabase.Url` |
| `Supabase__Key` | `Supabase.Key` |
| `AllowedOrigins__0` | primer origen CORS permitido |

---

## Migraciones de base de datos

Si estás usando un proyecto de Supabase nuevo, ejecuta los siguientes archivos SQL en el **SQL Editor** de tu dashboard de Supabase, en este orden:

1. [supabase_measurements.sql](supabase_measurements.sql)
2. [supabase_appointments.sql](supabase_appointments.sql)
3. [supabase_recipes_seed.sql](supabase_recipes_seed.sql)
4. [supabase_recipes_extra.sql](supabase_recipes_extra.sql)

Si usas las credenciales del proyecto compartido del equipo, **omite este paso**.

---

## Correr el Frontend

```bash
cd frontend
npm install
npm start
```

La app estará disponible en: **http://localhost:4200**

---

## Correr el Backend

Abre una terminal separada desde la raíz del proyecto:

```bash
dotnet run --project backend/Nutriflow.api
```

El API estará disponible en:
- HTTP: **http://localhost:5105**
- Swagger (documentación): **http://localhost:5105/swagger**

> El backend corre únicamente en HTTP en modo desarrollo. No uses el perfil `https` — el frontend está configurado para conectarse a `http://localhost:5105`.

---

## Orden de inicio recomendado

1. Inicia el **backend** primero
2. Luego inicia el **frontend**
3. Abre **http://localhost:4200** en tu navegador
4. Regístrate o inicia sesión con una cuenta de Supabase

---

## Estructura del proyecto

```
NutriFlow/
├── frontend/          # Angular 21 + TypeScript + Angular Material
├── backend/           # ASP.NET Core .NET 8 Web API
├── *.sql              # Migraciones de base de datos (Supabase)
└── NutriFlow.sln      # Solución de Visual Studio
```

### Rutas principales (Frontend)

**Nutriólogo**

| Ruta | Descripción |
|---|---|
| `/` | Pantalla de bienvenida (selección de rol) |
| `/login` | Inicio de sesión del nutriólogo |
| `/dashboard` | Dashboard: estadísticas, citas próximas, pacientes recientes |
| `/patients` | Lista de pacientes |
| `/patients/new` | Agregar nuevo paciente |
| `/patients/:id` | Detalle del paciente + plan semanal + QR |
| `/recetas` | Catálogo de recetas |
| `/calendar` | Calendario de citas |
| `/profile` | Perfil del nutriólogo |

**Portal del paciente**

| Ruta | Descripción |
|---|---|
| `/patient-portal` | Login del paciente |
| `/mi-plan` | Vista del plan semanal (solo lectura) |

---

## Scripts disponibles

### Frontend (`cd frontend`)

| Comando | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm test` | Ejecutar pruebas unitarias |

### Backend (desde la raíz)

| Comando | Descripción |
|---|---|
| `dotnet run --project backend/Nutriflow.api` | Servidor de desarrollo |
| `dotnet build` | Compilar el proyecto |
| `dotnet test` | Ejecutar pruebas |

---

## Solución de problemas comunes

**Error de CORS** — Asegúrate de que el backend esté corriendo antes de iniciar el frontend.

**`npm install` falla** — Verifica que tienes Node 22+ con `node --version`.

**`dotnet run` falla** — Verifica que tienes .NET 8 SDK con `dotnet --version`. Descárgalo en https://dotnet.microsoft.com/download/dotnet/8.0

**Pantalla en blanco al iniciar sesión** — Verifica que las credenciales de Supabase en `environment.ts` y `appsettings.json` son correctas.

**Puerto 4200 ocupado** — Usa `npm start -- --port 4201` para cambiar el puerto.

**Puerto 5105 ocupado** — Edita `backend/Nutriflow.api/Properties/launchSettings.json` y cambia el puerto.
