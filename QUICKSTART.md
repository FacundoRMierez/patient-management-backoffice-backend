# Quick Start Guide

## 🚀 Pasos Rápidos para Comenzar

### 1. Configurar Base de Datos PostgreSQL

**Opción más fácil - Docker:**
```powershell
docker run --name postgres-patient -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=patient_management -p 5432:5432 -d postgres:latest
```

**Verificar que está corriendo:**
```powershell
docker ps
```

**Si ya isnstalaste PotgreSQL localmente:**
- Asegúrate que está corriendo en el puerto 5432
- Crea una base de datos llamada `patient_management`

---

### 2. Configurar Variables de Entorno

El archivo `.env` ya está creado con valores por defecto. Si usas Docker con los comandos de arriba, ¡no necesitas cambiar nada!

Si usas otra configuración, edita `.env`:
```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/patient_management"
```

---

### 3. Generar Prisma Client y Ejecutar Migraciones

```powershell
npm run prisma:generate
npm run prisma:migrate
```

Cuando te pregunte el nombre de la migración, puedes escribir: `initial_user_model`

---

### 4. Iniciar el Servidor

```powershell
npm run dev
```

Deberías ver:
```
✅ Database connected successfully
🚀 Server is running on port 3000
📍 Environment: development
🔗 API URL: http://localhost:3000
```

---

### 5. Probar la API

Abre otro terminal o usa Thunder Client / Postman.

**Test 1 - Health Check:**
```powershell
curl http://localhost:3000/api/health
```

**Test 2 - Registrar Usuario:**
```powershell
$body = @{
    email = "admin@test.com"
    password = "Admin123"
    firstName = "Admin"
    lastName = "User"
    organizationName = "Test Hospital"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/users/register" -Method Post -Body $body -ContentType "application/json"
```

Guarda el token que recibes en la respuesta.

**Test 3 - Obtener Perfil (con token):**
```powershell
$token = "tu-token-aqui"
Invoke-RestMethod -Uri "http://localhost:3000/api/users/me" -Method Get -Headers @{"Authorization"="Bearer $token"}
```

---

## 🔥 Comandos Útiles del Día a Día

### Desarrollo
```powershell
npm run dev                  # Iniciar servidor con hot reload
npm run build               # Compilar TypeScript
npm start                   # Iniciar servidor compilado
```

### Base de Datos
```powershell
npm run prisma:studio       # Abrir interfaz visual de BD (muy útil!)
npm run prisma:migrate      # Crear nueva migración
npm run db:push             # Sincronizar esquema sin crear migración
npm run db:reset            # Resetear BD (cuidado!)
```

### Ver Logs
```powershell
# Prisma mostrará todas las queries SQL en consola
# Express mostrará todas las peticiones HTTP
```

---

## 🛠️ Troubleshooting

### Error: "Cannot connect to database"
```powershell
# Verifica que Docker está corriendo
docker ps

# Si no aparece, inicia el contenedor
docker start postgres-patient

# O créalo de nuevo
docker run --name postgres-patient -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=patient_management -p 5432:5432 -d postgres:latest
```

### Error: "Port 3000 already in use"
- Cambia el puerto en `.env`: `PORT=3001`
- O mata el proceso que está usando el puerto 3000

### Error: "Prisma Client not found"
```powershell
npm run prisma:generate
```

### Ver logs de Docker
```powershell
docker logs postgres-patient
```

---

## 📦 Instalar Thunder Client (Recomendado)

1. En VS Code, ve a Extensions (Ctrl+Shift+X)
2. Busca "Thunder Client"
3. Instala
4. Aparecerá un ícono de rayo ⚡ en la barra lateral

### Crear una colección de pruebas:
1. Abre Thunder Client
2. Click en "New Request"
3. Configura tus requests según `API_TESTING.md`

---

## 🎯 Flujo de Trabajo Típico

### Agregar un nuevo campo al modelo User:

1. **Edita** `prisma/schema.prisma`
```prisma
model User {
  // ... campos existentes
  dateOfBirth  DateTime?  @map("date_of_birth")  // NUEVO
}
```

2. **Crea la migración**
```powershell
npm run prisma:migrate
# Nombre: add_date_of_birth
```

3. **Actualiza el validator** en `src/validators/user.validator.ts`
```typescript
dateOfBirth: z.string().datetime().optional()
```

4. **Actualiza el service** si es necesario

5. **Prueba** con Thunder Client

---

## 📊 Visualizar la Base de Datos

### Opción 1: Prisma Studio (Recomendado)
```powershell
npm run prisma:studio
```
Se abrirá en `http://localhost:5555`

### Opción 2: DBeaver (Cliente de BD)
- Descarga: https://dbeaver.io/
- Conecta con:
  - Host: localhost
  - Port: 5432
  - Database: patient_management
  - User: postgres
  - Password: postgres

---

## 📚 Próximos Pasos

1. **Revisa** `LEARNING_GUIDE.md` para entender los conceptos
2. **Explora** el código en `src/`
3. **Modifica** algo y ve cómo reacciona el sistema
4. **Experimenta** agregando nuevos campos o endpoints
5. **Construye** el siguiente módulo: Pacientes

---

## 💡 Tips

- **Mantén el servidor corriendo** mientras desarrollas (hot reload automático)
- **Usa Prisma Studio** para ver los datos en tiempo real
- **Lee los logs** en la consola para entender qué está pasando
- **Comenta tu código** para recordar qué hace cada parte
- **Commitea frecuentemente** a Git (¡no olvides hacer `git init`!)

---

## 🎉 ¡Listo!

Ya tienes un backend profesional con:
- ✅ TypeScript
- ✅ Express.js
- ✅ Prisma ORM
- ✅ PostgreSQL
- ✅ JWT Authentication
- ✅ Validación con Zod
- ✅ Arquitectura en capas
- ✅ Buenas prácticas

**¡Ahora a construir más features!** 🚀
