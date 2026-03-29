# Documentación de Endpoints - Módulo de Búsqueda (Search)

Endpoint base: `http://<API_URL>/search`

Todos los endpoints están protegidos por **`FirebaseAuthGuard`** y **`RestaurantOwnerGuard`**.  
El contexto se extrae automáticamente mediante los headers `x-restaurant-id` y (opcionalmente) `x-menu-id`. No se requiere pasar estos IDs de forma manual en el cuerpo de la petición.

---

## 1. Búsqueda Global (Productos y Categorías)
**Ruta:** `GET /search`

Este endpoint permite buscar productos y categorías cuyo nombre coincida con el término de búsqueda ingresado. Devuelve los mismos esquemas usados en los endpoints nativos de `products` y `categories`, añadiendo un campo discriminador `type`.

### Parámetros Query (En la URL)
- `q` (string, **requerido**): El término de búsqueda para filtrar por coincidencia de nombre (`ILIKE`).
- `type` (string, *opcional*): Filtra el tipo de resultados. Valores permitidos: `products`, `categories`, o `all`. Por defecto es `all`.
- `menu_id` (string, *opcional*): UUID del menú específico para acotar la búsqueda. Si no se pasa pero existe en los headers (`x-menu-id`), lo usará por defecto.
- `page` (number, *opcional*): Número de página para la paginación. Por defecto `1`.
- `limit` (number, *opcional*): Cantidad de registros por página. Por defecto `10`.

Ejemplo: `/search?q=café&type=all&page=1&limit=10`

### Qué Devuelve (Respuesta)
**Status:** `200 OK`

La propiedad `data` será un arreglo que puede mezclar resultados de productos y categorías (ordenados alfabéticamente por `name`). Podrás distinguirlos en el frontend utilizando la propiedad **`type`** (`"product"` o `"category"`).

```json
{
  "success": true,
  "message": "Resultados de búsqueda obtenidos correctamente",
  "data": [
    {
      "id": "e082f921-5371-4410-a9bf-e8b5370c8caa",
      "restaurant_id": "803a50be-7740-4eaf-b399-2b1ad06f1406",
      "menu_id": "de9a492f-8a1c-480e-a9ac-e4ee50036de6",
      "name": "Cafetería",
      "description": "Categoría de bebidas",
      "display_order": 1,
      "is_active": true,
      "created_at": "2026-03-28T22:26:23.51348+00:00",
      "updated_at": "2026-03-28T22:26:23.51348+00:00",
      "type": "category"
    },
    {
      "id": "eb9d9f1d-4438-44cf-848b-65202c0c06e4",
      "restaurant_id": "803a50be-7740-4eaf-b399-2b1ad06f1406",
      "category_id": "fb279896-3589-482c-9c0c-e91ccf1f6a32",
      "name": "Café Americano",
      "description": "Bebida caliente de 8 oz",
      "price": "12.50",
      "image_url": null,
      "is_available": true,
      "display_order": 0,
      "created_at": "2026-02-28T03:28:24.097231+00:00",
      "updated_at": "2026-02-28T03:28:24.097231+00:00",
      "category_name": "Bebidas Calientes",
      "type": "product"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1,
    "sort_by": "name",
    "order": "ASC"
  }
}
```
