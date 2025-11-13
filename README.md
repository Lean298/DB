# Tuki FoodStore API

API REST para un e-commerce desarrollada con Express y MongoDB. Incluye rutas protegidas con JWT para gestionar usuarios, productos, categorías, carritos, pedidos y reseñas.

## Requisitos

- [Node.js 20+](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/try/download/community) en ejecución (local o remoto)
- [Postman](https://www.postman.com/downloads/) o [Newman](https://www.npmjs.com/package/newman) para ejecutar la colección de pruebas (opcional)

## Configuración inicial

1. Instala las dependencias del proyecto:

   ```bash
   npm install
   ```

2. Copia las variables de entorno base y ajusta los valores según tu entorno:

   ```bash
   cp .env.example .env
   ```

   El archivo por defecto apunta a una instancia local de MongoDB sin autenticación.

3. Levanta MongoDB (por ejemplo con `mongod --dbpath ./data` o tu método preferido).

## Ejecutar la API

- **Desarrollo con recarga automática:**

  ```bash
  npm run dev
  ```

- **Ejecución normal:**

  ```bash
  npm start
  ```

La API quedará disponible en `http://localhost:3000`. Puedes verificar el estado con:

```bash
curl http://localhost:3000/
```

## Colección de Postman

Se incluye la colección `postman/TukiFoodStore.postman_collection.json` con una secuencia sugerida para probar la API de punta a punta.

1. Importa la colección en Postman.
2. Ejecuta las solicitudes en el siguiente orden para preparar los datos y capturar los tokens automáticamente:

   1. **Usuarios → Registrar administrador**
   2. **Usuarios → Registrar cliente**
   3. **Usuarios → Login administrador**
   4. **Usuarios → Login cliente**
   5. **Categorías → Crear categoría**
   6. **Productos → Crear producto (admin)**
   7. **Carrito → Crear carrito**
   8. **Carrito → Agregar producto**
   9. **Pedidos → Crear pedido**
   10. **Reseñas → Crear reseña**

   > La colección almacena automáticamente el email generado y los tokens (`adminToken` y `token`) como variables de colección para que el resto de las peticiones funcionen sin ediciones manuales.

3. El resto de las peticiones (listar, estadísticas, totales, etc.) se pueden ejecutar cuando lo necesites.

### Ejecutar la colección con Newman (opcional)

Si prefieres automatizar las pruebas desde la línea de comandos:

```bash
newman run postman/TukiFoodStore.postman_collection.json \
  --env-var baseUrl=http://localhost:3000/api
```

## Variables de entorno

| Variable             | Descripción                                             | Valor por defecto en `.env.example` |
|----------------------|---------------------------------------------------------|-------------------------------------|
| `PORT`               | Puerto donde se expone Express                          | `3000`                              |
| `MONGO_URI`          | Cadena de conexión completa a MongoDB                   | `mongodb://localhost:27017/Tuki-FoodStore` |
| `MONGO_URL`          | Host base de MongoDB (opcional si usas `MONGO_URI`)     | –                                   |
| `MONGO_DB_NAME`      | Nombre de la base de datos (usado si defines `MONGO_URL`)| –                                   |
| `MONGO_USER`         | Usuario de MongoDB (opcional)                           | –                                   |
| `MONGO_PASS`         | Contraseña del usuario (opcional)                       | –                                   |
| `MONGO_AUTH_SOURCE`  | Base de datos donde está definido el usuario (opcional) | –                                   |
| `JWT_SECRET`         | Clave para firmar los JWT                               | `tu_clave_super_secreta`            |
| `JWT_EXPIRES_IN`     | Tiempo de expiración de los tokens                      | `1d`                                |

## Estructura de carpetas

```
src/
  config/            # Configuración de la conexión a MongoDB
  controllers/       # Lógica de negocio por recurso
  middlewares/       # Middlewares de autenticación, roles, etc.
  models/            # Esquemas de Mongoose
  routes/            # Definición de rutas Express
postman/             # Colección Postman lista para importar
```

## Endpoints principales

- `POST /api/usuarios/register` – Registro de clientes.
- `POST /api/usuarios/admin` – Registro de administradores (requiere posteriormente login para obtener token).
- `POST /api/usuarios/login` – Autenticación y obtención de token JWT.
- `GET /api/productos` – Listado público de productos.
- `POST /api/productos` – Creación de producto (solo administradores autenticados).
- `POST /api/carrito` – Crea o reutiliza el carrito del usuario autenticado.
- `POST /api/ordenes` – Genera un pedido a partir del carrito o items enviados.
- `POST /api/resenas` – Publica una reseña si el usuario compró el producto.

Consulta los controladores en `src/controllers/` para ver validaciones y respuestas detalladas.
