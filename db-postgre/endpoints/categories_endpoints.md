# Documentación de Endpoints - Módulo de Categorías

Endpoints base: `http://<API_URL>/categories`

**Nota de Autenticación y Contexto:**
Todos los endpoints están protegidos por `FirebaseAuthGuard` y `RestaurantOwnerGuard`.
- El cliente **obligatoriamente** debe enviar el token JWT en las cabeceras: `Authorization: Bearer <Token_Firebase>`.
- El sistema resuelve automáticamente el `restaurant_id` (del header `x-restaurant-id` o toma el primer restaurante del usuario).
- En creación y listado, el sistema resuelve automáticamente el menú activo al vuelo si no se envía `menu_id`. **¡Por lo que no es necesario enviarlo explícitamente desde el frontend en casi ningún caso!**

---

## 1. Crear Categoría
**Ruta:** `POST /categories`

### Datos a Enviar (Body)
```json
{
  "name": "Bebidas Calientes",      // Requerido, string (min 2, max 255)
  "description": "Café y tés",      // Opcional, string (max 500)
  "display_order": 0,               // Opcional, int, mínimo 0 (Por defecto: 0)
  "is_active": true,                // Opcional, boolean (Por defecto: true)
  "menu_id": "UUID-del-menu",        // OPCIONAL. Si no lo envías, se asigna al menú por defecto del restaurante.
  "type_id": "UUID-del-tipo"         // OPCIONAL. FK a category_types.
}
```

### Qué Devuelve (Respuesta)
**Status:** `201 Created`
```json
{
  "success": true,
  "message": "Categoría creada exitosamente",
  "data": {
    "id": "abc-123-uuid...",
    "menu_id": "ghi-789-uuid...",
    "type_id": null,
    "name": "Bebidas Calientes",
    "description": "Café y tés",
    "display_order": 0,
    "is_active": true,
    "created_at": "2026-03-28...",
    "updated_at": "2026-03-28..."
  }
}
```

---

## 2. Listar Categorías Paginadas
**Ruta:** `GET /categories`

### Posibles Query Params (En la URL de la petición GET)
Todos son **opcionales**. Ejemplo: `/categories?page=1&limit=20&is_active=true`
- `page` (number): Número de página (Por defecto: 1)
- `limit` (number): Items por página, máximo 100 (Por defecto: 10)
- `is_active` (boolean): `true` o `false` para filtrar visibles/ocultos.
- `menu_id` (UUID): Filtrar de un menú específico. Si se omite, se usa el menú principal resuelto por defecto.
- `sort_by` (string): Campo para ordenar: `"display_order"`, `"name"`, `"created_at"` (Por defecto: `"display_order"`)
- `order` (string): `"ASC"` o `"DESC"` (Por defecto: `"ASC"`)

### Qué Devuelve (Respuesta)
**Status:** `200 OK`
```json
{
  "success": true,
  "message": "Listado de categorías obtenido correctamente",
  "data": [
    {
      "id": "abc-123-uuid...",
      "name": "Bebidas Calientes",
      "description": "Café y tés",
      "display_order": 0,
      "is_active": true,
      "menu_id": "...",
      "type_id": "..."
    }
  ],
  "meta": {
    "itemsPerPage": 10,
    "totalItems": 15,
    "currentPage": 1,
    "totalPages": 2,
    "sortBy": "display_order"
  }
}
```

---

## 3. Obtener UNA sola categoría (Detalle)
**Ruta:** `GET /categories/:id`

### Parámetros HTTP
- En la ruta de la petición: el `id` (UUID) de la categoría. No requiere body ni queries.

### Qué Devuelve (Respuesta)
**Status:** `200 OK`
```json
{
  "success": true,
  "message": "Categoría obtenida correctamente",
  "data": {
    "id": "abc-123-uuid...",
    "name": "Bebidas Calientes",
    ...
  }
}
```
*(Da Error 404 Not Found si la categoría no existe o pertenece a otro restaurante).*

---

## 4. Actualizar Categoría
**Ruta:** `PATCH /categories/:id`

### Datos a Enviar (Body)
*Todo es opcional. Solo se envía lo que se desea cambiar.*
```json
{
  "name": "Bebidas Frías",
  "description": "Refrescos y jugos",
  "display_order": 1,
  "is_active": false,
  "menu_id": "UUID-de-otro-menu"
}
```

### Qué Devuelve (Respuesta)
**Status:** `200 OK`
```json
{
  "success": true,
  "message": "Categoría actualizada exitosamente",
  "data": {
    "id": "abc-123-uuid...",
    "name": "Bebidas Frías",
    "description": "Refrescos y jugos",
    ...
  }
}
```

---

## 5. Eliminar Categoría
**Ruta:** `DELETE /categories/:id`

### Parámetros HTTP
- En la ruta de la petición: el `id` (UUID) de la categoría. No requiere nada más.

### Qué Devuelve (Respuesta)
**Status:** `204 No Content`
- No devuelve ningún JSON como respuesta, pero borra permanentemente la categoría (Hard Delete).

---
