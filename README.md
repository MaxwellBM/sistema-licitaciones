# Sistema de Gestión de Licitaciones

Plataforma web fullstack para la gestión y seguimiento de licitaciones. Construida con Next.js 14, TypeScript, Tailwind CSS, Prisma 6 y PostgreSQL (Neon).

## Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **ORM**: Prisma 6
- **Base de Datos**: PostgreSQL (Neon)
- **Autenticación**: JWT (jsonwebtoken + bcryptjs)
- **Gestor de Paquetes**: pnpm

## Requisitos

- Node.js 18+
- pnpm (instalar con `npm install -g pnpm`)

## Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
DATABASE_URL="postgresql://user:password@ep-example-123456.us-east-2.aws.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-example-123456.us-east-2.aws.neon.tech/dbname?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

## Instalación

```bash
pnpm install
```

## Migraciones

```bash
pnpm dlx prisma migrate dev --name init
```

## Seed

```bash
pnpm dlx prisma db seed
```

Esto crea el usuario administrador inicial:
- **Email**: admin@csc.com
- **Password**: admin123
- **Rol**: admin

## Desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Despliegue

[Placeholder - agregar URL del despliegue aquí]

## API Endpoints

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | /api/auth/login | Iniciar sesión | Público |
| GET | /api/users | Listar usuarios | Admin |
| POST | /api/users | Crear usuario | Admin |
| GET | /api/clients | Listar clientes | Autenticado |
| POST | /api/clients | Crear cliente | Admin |
| GET | /api/products | Listar productos | Autenticado |
| POST | /api/products | Crear producto | Admin |
| GET | /api/tenders | Listar licitaciones | Autenticado |
| POST | /api/tenders | Crear licitación | Autenticado |
| GET | /api/tenders/[id] | Detalle licitación | Autenticado |
| PATCH | /api/tenders/[id]/status | Cambiar estado | Autenticado |
| POST | /api/tenders/[id]/products | Agregar producto | Autenticado |
