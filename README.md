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

El proyecto usa **Supabase** como base de datos y autenticación. Las credenciales ya están configuradas en los archivos del repo para el proyecto compartido del equipo. Si necesitas usar tu propio proyecto de Supabase, actualiza estos dos archivos:

**Frontend** — [frontend/src/environments/environment.ts](frontend/src/environments/environment.ts):
```typescript
export const environment = {
  supabaseUrl: 'TU_SUPABASE_URL',
  supabaseKey: 'TU_SUPABASE_ANON_KEY',
};
```

**Backend** — [backend/Nutriflow.api/appsettings.json](backend/Nutriflow.api/appsettings.json):
```json
{
  "Supabase": {
    "Url": "TU_SUPABASE_URL",
    "Key": "TU_SUPABASE_ANON_KEY"
  }
}
```

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

| Ruta | Descripción |
|---|---|
| `/login` | Inicio de sesión |
| `/patients` | Lista de pacientes |
| `/patients/new` | Agregar nuevo paciente |
| `/patients/:id` | Detalle del paciente + plan semanal |
| `/recetas` | Catálogo de recetas |
| `/calendar` | Calendario de citas |
| `/profile` | Perfil del nutriólogo |

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
