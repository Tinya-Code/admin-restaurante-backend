# Documentación de Endpoints - Módulo de Productos

Endpoints base: `http://<API_URL>/products`

**Nota de Autenticación y Contexto:**
Todos los endpoints están protegidos por `FirebaseAuthGuard` y `RestaurantOwnerGuard`.
- El cliente **obligatoriamente** debe enviar el token JWT en las cabeceras: `Authorization: Bearer <Token_Firebase>`.
- El sistema resuelve automáticamente el `restaurant_id` a través de toda la aplicación, **¡por lo que nunca es necesario enviarlo explícitamente desde el frontend!**.
- Todas las validaciones de si el producto/categoría pertenecen a ese restaurante específico transcurren detrás de escena.
- La subida de imágenes ahora mismo fue deshabilitada. Todos los datos son recibidos como **JSON (`application/json`)**.

---

## 1. Crear Producto
**Ruta:** `POST /products`

### Datos a Enviar (Body JSON)
```json
{
  "name": "Hamburguesa Doble",          // Requerido (string, min: 2, max: 255)
  "category_id": "abc-123-uuid...",     // Requerido (UUID)
  "price": 15.50,                       // Requerido (number, no puede ser negativo)
  "description": "Doble carne, queso",  // Opcional (string, max 1000)
  "is_available": true,                 // Opcional (boolean, por defecto: true)
  "display_order": 0                    // Opcional (int, por defecto: 0)
}
```
*(Nota: No envíes imágenes en el DTO, ya que esta funcionalidad está oculta/deshabilitada temporalmente).*

### Qué Devuelve (Respuesta)
**Status:** `201 Created`
```json
{
  "success": true,
  "message": "Producto creado exitosamente",
  "data": {
    "id": "def-456-uuid...",
    "category_id": "...",
    "name": "Hamburguesa Doble",
    "description": "Doble carne, queso",
    "price": "15.50",
    "image_url": null,
    "is_available": true,
    "display_order": 0,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

---

## 2. Listar Productos Paginados
**Ruta:** `GET /products`

### Posibles Query Params (Opcionales, en la URL)
Todos son **opcionales** para refinar búsquedas:
- `category_id` (UUID): Buscar solo los de una categoría en específico. 
- `is_available` (boolean): `true` o `false`.
- `page` (number): Número de página (Por defecto: 1)
- `limit` (number): Cantidad por página, máximo 100 (Por defecto: 10)
- `min_price` (number) y `max_price` (number): Rango de precios.
- `sort_by` (string): `"display_order"`, `"name"`, `"price"`, `"created_at"` (Por defecto: `"display_order"`)
- `order` (string): `"ASC"` o `"DESC"` (Por defecto: `"ASC"`)

### Qué Devuelve (Respuesta)
**Status:** `200 OK`
```json
{
  "success": true,
  "message": "Productos obtenidos exitosamente",
  "data": [
    { /* Objeto de producto */ }
  ],
  "meta": {
    "itemsPerPage": 10,
    "totalItems": 5,
    "currentPage": 1,
    ...
  }
}
```

---

## 3. Obtener UN SOLO Producto (Detalle)
**Ruta:** `GET /products/:id`

### Parámetros HTTP
- URL Param: `id` (UUID del producto).

### Qué Devuelve (Respuesta)
**Status:** `200 OK`
- Retornará `404 Not Found` si no existe o si le pertenece a OTRO restaurante distinto al de tu Token actual.

---

## 4. Actualizar Producto (Partial Patch)
**Ruta:** `PATCH /products/:id`

### Datos a Enviar (Body JSON)
Solo envía lo que cambia.
```json
{
  "price": 18.00,
  "is_available": false
}
```

### Qué Devuelve (Respuesta)
**Status:** `200 OK`
Devuelve el producto con los datos modificados en `data`.

---

## 5. Eliminar Producto Definitivamente (Hard Delete)
**Ruta:** `DELETE /products/:id`

### Parámetros HTTP
- URL Param: `id` (UUID del producto).

### Qué Devuelve (Respuesta)
**Status:** `204 No Content`
- Vacío (Sin JSON). Borrar base de datos permanente.

---

## 6. Deshabilitar Producto Ocultándolo (Soft Delete)
**Ruta:** `PATCH /products/:id/disable`

### Parámetros HTTP
- URL Param: `id` (UUID del producto).

### Qué Devuelve (Respuesta)
**Status:** `200 OK`
- Establece automáticamente el atributo interno de este producto `is_available = false`, manteniéndolo en la BD internamente.

---

## 7. Reordinar Múltiples Productos de Golpe (Bulk)
**Ruta:** `PATCH /products/reorder/bulk`

### Datos a Enviar (Body JSON)
Ideal para cuando arrastras y sueltas en tu panel de control y quieres mandarlo todo de una transacción.
```json
{
  "updates": [
    { "id": "uuid-producto-1", "display_order": 0 },
    { "id": "uuid-producto-2", "display_order": 1 },
    { "id": "uuid-producto-3", "display_order": 2 }
  ]
}
```

### Qué Devuelve (Respuesta)
**Status:** `200 OK`
```json
{
  "success": true,
  "message": "Orden de productos actualizado exitosamente",
  "data": null
}
```
