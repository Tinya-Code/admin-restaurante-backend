# Documentación de Endpoints - Módulo de Statistics

Endpoints base: `http://<API_URL>/statistics`

Todos los endpoints están protegidos por **`FirebaseAuthGuard`** y **`RestaurantOwnerGuard`**.  
No es necesario enviar el `restaurant_id` en las URLs o cuerpos de la petición.

---

## 1. Conteo Total de Productos
**Ruta:** `GET /statistics/products/count`

### Parámetros
- **No requiere body ni query.** Obtiene el total del restaurante actual.

### Qué Devuelve (Respuesta)
**Status:** `200 OK`
```json
{
  "success": true,
  "message": "Products count retrieved successfully",
  "data": {
    "total_products": 45
  }
}
```

---

## 2. Conteo Total de Categorías
**Ruta:** `GET /statistics/categories/count`

### Parámetros
- **No requiere body ni query.** Obtiene el total del restaurante actual.

### Qué Devuelve (Respuesta)
**Status:** `200 OK`
```json
{
  "success": true,
  "message": "Categories count retrieved successfully",
  "data": {
    "total_categories": 12
  }
}
```

---

## 3. Obtener Productos Recientes
**Ruta:** `GET /statistics/products/recent`

### Parámetros Query (En la URL, Opcionales)
- `limit` (number): Límite de la lista a devolver. Por defecto es 5. (Mínimo 1, Máximo 20).
Ejemplo: `/statistics/products/recent?limit=10`

### Qué Devuelve (Respuesta)
**Status:** `200 OK`
```json
{
  "success": true,
  "message": "Recent products retrieved successfully",
  "data": {
    "products": [
      {
        "id": "abc-123-uuid...",
        "name": "Café Americano",
        "price": 12.50,
        "category_id": "xyz-789-uuid...",
        "created_at": "2026-03-28T..."
      },
      {
        "id": "hij-456-uuid...",
        "name": "Pizza Margarita",
        "price": 30.00,
        "category_id": "klm-123-uuid...",
        "created_at": "2026-03-27T..."
      }
    ]
  }
}
```
