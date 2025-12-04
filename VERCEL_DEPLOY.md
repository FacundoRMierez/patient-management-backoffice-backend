# 🚀 Deploy en Vercel - Guía Rápida

## Pasos para Deploy

### 1. Preparar Base de Datos (Neon.tech)

1. Ve a [Neon.tech](https://neon.tech)
2. Crea un nuevo proyecto
3. Copia la connection string (pooled connection)
4. Guárdala para el paso 3

### 2. Preparar Repositorio

El código ya está en GitHub:
```
https://github.com/FacundoRMierez/patient-management-backoffice-backend
```

### 3. Deploy en Vercel

1. **Conectar con Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Importa el repositorio de GitHub
   - Selecciona: `patient-management-backoffice-backend`

2. **Configurar Variables de Entorno:**
   
   En Vercel Dashboard → Settings → Environment Variables, agrega:

   ```
   DATABASE_URL = postgresql://user:pass@host/db?sslmode=require
   JWT_SECRET = your-super-secret-jwt-key-min-32-chars
   JWT_EXPIRES_IN = 7d
   NODE_ENV = production
   PORT = 3000
   CORS_ORIGIN = https://your-frontend-url.vercel.app
   ```

3. **Configuración de Build:**
   - Framework Preset: `Other`
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy:**
   - Click en "Deploy"
   - Espera a que termine el build

### 4. Ejecutar Migraciones (Primera vez)

Una vez deployado, necesitas ejecutar las migraciones:

**Opción A: Desde tu máquina local**
```bash
# Exportar la DATABASE_URL de producción
$env:DATABASE_URL="postgresql://user:pass@host/db"

# Ejecutar migraciones
npx prisma migrate deploy

# Ejecutar seed
npx prisma db seed
```

**Opción B: Usando Vercel CLI**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Link al proyecto
vercel link

# Ejecutar comando
vercel env pull .env.production
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

### 5. Verificar Deployment

```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health

# Test raíz
curl https://your-app.vercel.app/

# Swagger docs
https://your-app.vercel.app/api-docs
```

## 📋 Checklist de Deploy

- [ ] Base de datos creada en Neon.tech
- [ ] Variables de entorno configuradas en Vercel
- [ ] Build exitoso en Vercel
- [ ] Migraciones ejecutadas
- [ ] Seed de roles y permisos ejecutado
- [ ] Endpoints respondiendo correctamente
- [ ] Swagger docs funcionando

## 🔧 Troubleshooting

### Error: PrismaClient not found

**Solución:** Asegúrate que `vercel-build` incluye `prisma generate`:
```json
"vercel-build": "prisma generate && prisma migrate deploy && tsc"
```

### Error: Database connection failed

**Solución:** Verifica que `DATABASE_URL`:
- Usa la conexión "pooled" de Neon
- Incluye `?sslmode=require`
- Las credenciales son correctas

### Error: CORS issues

**Solución:** Actualiza `CORS_ORIGIN` con la URL de tu frontend:
```
CORS_ORIGIN=https://your-frontend.vercel.app,https://your-app.vercel.app
```

### Error: JWT secret too short

**Solución:** `JWT_SECRET` debe tener al menos 32 caracteres:
```bash
# Generar secreto seguro (PowerShell)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

## 🔄 Re-deploy

Para actualizar el código:

```bash
# Commit cambios
git add .
git commit -m "Update: descripción"
git push

# Vercel deployará automáticamente
```

## 📊 Monitoreo

- **Logs:** Vercel Dashboard → Deployment → Logs
- **Errors:** Vercel Dashboard → Runtime Logs
- **Analytics:** Vercel Dashboard → Analytics

## 🌐 URLs Post-Deploy

```
Producción: https://your-app.vercel.app
API Docs:   https://your-app.vercel.app/api-docs
Health:     https://your-app.vercel.app/api/health
```

## 🔐 Seguridad Post-Deploy

1. **Cambiar JWT_SECRET:**
   - Usa un valor fuerte y único
   - Mínimo 32 caracteres
   - Mezcla de letras, números, símbolos

2. **Restringir CORS:**
   - Solo dominios conocidos
   - No usar `*` en producción

3. **Variables sensibles:**
   - NUNCA commitear `.env`
   - Usar variables de Vercel

4. **Rate Limiting:**
   - Considerar agregar middleware de rate limiting
   - Proteger endpoints de registro/login

## 📝 Notas Importantes

- ⚠️ Vercel tiene límite de 10 segundos para respuestas
- ⚠️ Las serverless functions tienen límite de memoria
- ⚠️ Prisma genera el cliente en cada deploy
- ✅ Neon.tech maneja las conexiones automáticamente
- ✅ Migrations se ejecutan con `prisma migrate deploy`

## 🆘 Support

Si tienes problemas:
1. Revisa logs en Vercel Dashboard
2. Verifica variables de entorno
3. Asegura que migraciones corrieron
4. Revisa esta guía de troubleshooting
