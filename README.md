# Patient Management System - Backend

Backend API para sistema de gestión de pacientes. Construido con Node.js, TypeScript, Express y Prisma ORM.

## 🚀 Stack Tecnológico

- **Node.js** + **TypeScript** - Entorno de ejecución y tipado estático
- **Express.js** - Framework web
- **Prisma ORM** - ORM moderno con migraciones automáticas
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación basada en tokens
- **Bcrypt** - Encriptación de contraseñas
- **Zod** - Validación de esquemas

## 📁 Estructura del Proyecto

```
src/
├── config/           # Configuración de la aplicación
├── controllers/      # Controladores (lógica de rutas)
├── database/         # Conexión a la base de datos
├── middlewares/      # Middlewares (auth, validación, errores)
├── routes/           # Definición de rutas
├── services/         # Lógica de negocio
├── validators/       # Esquemas de validación (Zod)
└── index.ts          # Punto de entrada de la aplicación

prisma/
└── schema.prisma     # Esquema de la base de datos
```

## 🛠️ Configuración Inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` y renómbralo a `.env`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/patient_management"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
```

### 3. Configurar PostgreSQL

**Opción A: Instalación local**
- Descarga PostgreSQL desde [postgresql.org](https://www.postgresql.org/download/)
- Instala y configura con usuario y contraseña
- Crea una base de datos llamada `patient_management`

**Opción B: Docker (recomendado)**
```bash
docker run --name postgres-patient -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=patient_management -p 5432:5432 -d postgres:latest
```

**Opción C: PostgreSQL en la nube (GRATIS)**
- [Supabase](https://supabase.com/) - 500MB gratis
- [Neon](https://neon.tech/) - 3GB gratis
- [Railway](https://railway.app/) - $5 de crédito mensual

### 4. Generar Prisma Client y ejecutar migraciones

```bash
# Generar el cliente de Prisma
npm run prisma:generate

# Crear y aplicar la migración inicial
npm run prisma:migrate

# (Opcional) Abrir Prisma Studio para ver la BD visualmente
npm run prisma:studio
```

### 5. Iniciar el servidor

**Modo desarrollo (con hot reload):**
```bash
npm run dev
```

**Modo producción:**
```bash
npm run build
npm start
```

El servidor estará corriendo en: `http://localhost:3000`

## 📚 API Endpoints

### **Usuarios (Users)**

#### 🔓 Públicos (sin autenticación)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/users/register` | Registrar nuevo usuario |
| POST | `/api/users/login` | Iniciar sesión |

#### 🔒 Protegidos (requieren autenticación)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users/me` | Obtener perfil del usuario actual |
| GET | `/api/users` | Listar todos los usuarios |
| GET | `/api/users/:id` | Obtener usuario por ID |
| PUT | `/api/users/:id` | Actualizar usuario |
| DELETE | `/api/users/:id` | Eliminar usuario (soft delete) |
| PATCH | `/api/users/:id/approve` | Aprobar usuario |
| POST | `/api/users/change-password` | Cambiar contraseña |

### Ejemplos de uso

#### 1. Registrar usuario

```bash
POST http://localhost:3000/api/users/register
Content-Type: application/json

{
  "email": "doctor@example.com",
  "password": "SecurePass123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "organizationName": "Hospital Central",
  "address": "Av. Principal 123",
  "phoneNumber": "+54 11 1234-5678"
}
```

**Respuesta:**
```json
{
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "doctor@example.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      ...
    },
    "token": "jwt-token-here"
  }
}
```

#### 2. Iniciar sesión

```bash
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "email": "doctor@example.com",
  "password": "SecurePass123"
}
```

#### 3. Obtener perfil (requiere token)

```bash
GET http://localhost:3000/api/users/me
Authorization: Bearer <tu-jwt-token>
```

#### 4. Actualizar usuario

```bash
PUT http://localhost:3000/api/users/:id
Authorization: Bearer <tu-jwt-token>
Content-Type: application/json

{
  "firstName": "Juan Carlos",
  "phoneNumber": "+54 11 9999-8888"
}
```

## 🔐 Autenticación

El sistema usa **JWT (JSON Web Tokens)** para autenticación. 

1. El usuario se registra o inicia sesión
2. El servidor devuelve un token JWT
3. El cliente envía el token en el header `Authorization` para rutas protegidas:
   ```
   Authorization: Bearer <token>
   ```

## 🗄️ Modelo de Datos - Usuario

```prisma
model User {
  id                String    @id @default(uuid())
  email             String    @unique
  password          String
  firstName         String
  lastName          String
  organizationName  String?
  address           String?
  phoneNumber       String?
  role              String    @default("user")
  isDeleted         Boolean   @default(false)
  isApproved        Boolean   @default(false)
  isActive          Boolean   @default(true)
  emailVerified     Boolean   @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  lastLoginAt       DateTime?
}
```

## 🎯 Buenas Prácticas Implementadas

### Arquitectura en Capas
- **Controllers**: Manejan las peticiones HTTP
- **Services**: Contienen la lógica de negocio
- **Validators**: Validan los datos de entrada
- **Middlewares**: Procesan las peticiones (auth, validación, errores)

### Seguridad
- ✅ Contraseñas encriptadas con bcrypt
- ✅ Autenticación JWT
- ✅ Validación de datos con Zod
- ✅ Soft delete (los usuarios no se eliminan físicamente)
- ✅ Variables de entorno para datos sensibles

### Código Limpio
- ✅ TypeScript para tipado estático
- ✅ Código en inglés
- ✅ Nomenclatura clara y consistente
- ✅ Separación de responsabilidades
- ✅ Comentarios explicativos

## 🧪 Testing con Thunder Client / Postman

1. Instala la extensión **Thunder Client** en VS Code
2. Importa la colección de endpoints (próximamente)
3. Configura la variable `{{baseUrl}}` como `http://localhost:3000`

## 📈 Próximos Pasos

### Mejoras sugeridas:
1. **Roles y Permisos** - Implementar middleware para roles (admin, doctor, etc.)
2. **Email Verification** - Enviar email de verificación al registrarse
3. **Password Reset** - Flujo completo de recuperación de contraseña
4. **Rate Limiting** - Limitar peticiones para prevenir ataques
5. **Logging** - Sistema de logs con Winston o Morgan
6. **Tests** - Tests unitarios y de integración con Jest
7. **Documentación API** - Swagger/OpenAPI
8. **Paginación** - Implementar paginación en listados

### Nuevos módulos:
1. **Pacientes** - CRUD de pacientes
2. **Citas** - Sistema de turnos y citas médicas
3. **Historias Clínicas** - Registros médicos
4. **Recetas** - Prescripciones médicas

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
- Verifica que PostgreSQL esté corriendo
- Revisa las credenciales en el archivo `.env`
- Asegúrate de que la base de datos existe

### Error: "Prisma Client not generated"
```bash
npm run prisma:generate
```

### Error: "Module not found"
```bash
npm install
```

## 📝 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar en modo desarrollo

# Prisma
npm run prisma:generate  # Generar cliente de Prisma
npm run prisma:migrate   # Crear y aplicar migración
npm run prisma:studio    # Abrir interfaz visual de la BD
npm run db:push          # Sincronizar esquema sin migración
npm run db:reset         # Resetear base de datos

# Producción
npm run build            # Compilar TypeScript
npm start                # Iniciar servidor compilado
```

## 🤝 Contribución

Este es un proyecto de aprendizaje. ¡Siéntete libre de experimentar y mejorar!

## 📄 Licencia

ISC
