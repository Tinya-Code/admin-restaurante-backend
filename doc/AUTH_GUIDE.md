# 🔐 Guía API REST y Gestión de Contexto (SaaS)

Este documento detalla exhaustivamente todos los endpoints del backend, detallando sus requerimientos de autorización, *Request Payloads* (Cuerpos de petición) y *Response Objects* (Cuerpos de respuesta).

El sistema utiliza un modelo de **Multi-tenancy SaaS** donde un usuario puede pertenecer a múltiples restaurantes con distintos roles y cada restaurante tiene múltiples sucursales independientes.

---

## 🔑 Conceptos Fundamentales

1.  **Proveedor de Identidad**: Utilizamos **Firebase Authentication**. El frontend es responsable de obtener el `ID Token` (JWT).
2.  **Sincronización de Usuario**: El backend valida el token de Firebase contra la base de datos local para asegurar que el usuario esté registrado y activo (`is_active: true`).
3.  **Jerarquía de Contexto**: Para las operaciones de negocio, el backend requiere conocer el contexto actual. Esto se maneja globalmente a través de Headers:
    - **Restaurante**: Determinado por el header `x-restaurant-id`.
    - **Sucursal**: Determinado por el header `x-branch-id` (La mayoría de los recursos operan a este nivel).
    - **Menú**: Determinado por el header `x-menu-id`.

---

## 📡 Autenticación (`/auth`)

Todos los endpoints de esta sección requieren el encabezado:
`Authorization: Bearer <Firebase_ID_Token>`

### 1. Validación de Login
`GET /auth/login`

Verifica si el token es válido y si el usuario tiene una cuenta activa en el sistema.

**Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "id": "uuid",
    "email": "user@ex.com",
    "displayName": "Name",
    "photoUrl": "https://...",
    "activeContext": "owner",
    "createdAt": "2026-04-20T10:00:00.000Z",
    "globalRoles": ["super_admin"]
  }
}
```

### 2. Listado de Membresías
`GET /auth/memberships`

Retorna la lista de todos los restaurantes a los que el usuario tiene acceso y su rol.

**Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "message": "Membresías obtenidas correctamente",
  "data": [
    {
      "restaurantId": "uuid",
      "restaurantName": "Tinya",
      "role": "owner",
      "restaurantIsActive": true,
      "planName": "Free",
      "subscriptionStatus": "active"
    }
  ]
}
```

---

## 🛡️ Gestión de Contexto (Headers)

Para acceder a cualquier recurso protegido, el frontend **debe** establecer el contexto mediante Headers.

| Header | Requerido en | Descripción | Fallback si se omite |
| :--- | :--- | :--- | :--- |
| `x-restaurant-id` | Casi todos | ID del restaurante activo. | Primera membresía activa. |
| `x-branch-id` | Operaciones de Catálogo | ID de la sucursal activa. | Sucursal principal (`is_main: true`). |
| `x-menu-id` | `/categories` | ID del menú a afectar. | Primer menú activo de la sucursal. |

> [!IMPORTANT]
> Todos los endpoints protegidos devuelven el siguiente formato estandarizado para la respuesta, el cual será omitido por brevedad en las siguientes secciones a menos que haya paginación:
> ```json
> { "success": true, "message": "String", "data": <Objeto o Array> }
> ```

---

## 📚 Módulo: Menús (`/menus`)

*Gestión de las diferentes cartas/menús de una sucursal (ej: "Menú Principal", "Carta de Bebidas").*
- **Headers Mínimos**: `Authorization`, `x-restaurant-id`, `x-branch-id`.

### 1. Listar Menús (`GET /menus`)
**Respuesta:** Array de objetos de menús asociados a la sucursal activa.
```json
[
  {
    "id": "uuid",
    "branch_id": "uuid",
    "name": "Menú Principal",
    "description": "Carta principal del restaurante",
    "is_active": true,
    "display_order": 0,
    "created_at": "...",
    "updated_at": "..."
  }
]
```

### 2. Crear Menú (`POST /menus`)
**Payload (Body):**
```json
{
  "name": "Carta Nocturna",
  "description": "Disponible de 6pm a 11pm",
  "is_active": true,
  "display_order": 1
}
```
**Respuesta:** Retorna el objeto del menú creado. **Error 403** si el límite del plan SaaS es excedido.

### 3. Actualizar Menú (`PATCH /menus/:id`)
**Payload (Opcional):**
```json
{
  "name": "Carta Nocturna Editada",
  "is_active": false
}
```
**Respuesta:** Retorna el objeto del menú actualizado.

### 4. Borrar Menú (`DELETE /menus/:id`)
**Respuesta:** `204 No Content`. Borra en cascada todas sus categorías y productos.

---

## 📚 Módulo: Categorías (`/categories`)

*Gestión de los grupos de productos.*
- **Headers Mínimos**: `Authorization`, `x-restaurant-id`, `x-branch-id`, `x-menu-id`.

### 1. Catálogo de Tipos (`GET /category-types`)
Obtiene la lista global del sistema. No requiere context headers.
```json
[
  {
    "id": "uuid",
    "name": "Sección del menú 1",
    "metadata": { "section": 1, "suggestions": ["entradas", "sopas"] }
  }
]
```

### 2. Listar Categorías (`GET /categories`)
**Query Params:** `page`, `limit`, `is_active`, `type_id`, `sort_by`, `order`.
**Respuesta:**
```json
{
  "success": true,
  "message": "Listado de categorías",
  "data": [
    {
      "id": "uuid",
      "menu_id": "uuid",
      "branch_id": "uuid",
      "name": "Bebidas",
      "description": "Frías y calientes",
      "display_order": 0,
      "is_active": true,
      "type_id": "uuid-tipo",
      "type_name": "Sección del menú 6"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1, "lastPage": 1 }
}
```

### 3. Crear Categoría (`POST /categories`)
**Payload:**
```json
{
  "name": "Bebidas",
  "description": "Frías y calientes",
  "display_order": 0,
  "is_active": true,
  "type_id": "uuid-tipo"
}
```
**Respuesta:** Objeto creado. **Error 403** si el límite del plan es excedido.

### 4. Actualizar Categoría (`PATCH /categories/:id`)
**Payload (Opcional):**
```json
{ "name": "Bebidas Heladas", "is_active": false }
```
**Respuesta:** Objeto actualizado.

### 5. Borrar Categoría (`DELETE /categories/:id`)
**Respuesta:** `204 No Content`. Borra en cascada todos sus productos.

---

## 🍔 Módulo: Productos (`/products`)

*Catálogo de ítems a la venta.*
- **Headers Mínimos**: `Authorization`, `x-restaurant-id`, `x-branch-id`.

### 1. Listar Productos (`GET /products`)
**Query Params:** `category_id`, `is_available`, `page`, `limit`, `sort_by`, `order`.
**Respuesta:**
```json
{
  "success": true,
  "message": "Productos obtenidos",
  "data": [
    {
      "id": "uuid",
      "category_id": "uuid",
      "category_name": "Bebidas",
      "name": "Café Americano",
      "description": "Recién pasado",
      "price": "12.50",
      "image_url": "https://...",
      "cloudinary_id": "products/123",
      "is_available": true,
      "is_recommended": true
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1 }
}
```

### 2. Crear Producto (`POST /products`)
**Payload:**
```json
{
  "category_id": "uuid",
  "name": "Café Americano",
  "description": "Recién pasado",
  "price": 12.50,
  "is_available": true,
  "is_recommended": true,
  "image_url": "https://...",
  "cloudinary_id": "products/123"
}
```
**Respuesta:** Objeto creado. **Error 403** si el límite del plan es excedido.

### 3. Obtener Producto (`GET /products/:id`)
**Respuesta:** Objeto del producto singular (incluye `category_name`).

### 4. Actualizar Producto (`PATCH /products/:id`)
**Payload (Opcional):**
```json
{ "price": 14.00, "is_recommended": false }
```

### 5. Deshabilitar Producto (`PATCH /products/:id/disable`)
Cambia `is_available` a `false`. Retorna el objeto actualizado.

### 6. Borrar Producto (`DELETE /products/:id`)
**Respuesta:** `204 No Content`. Elimina el producto y de paso borra la imagen física referenciada en `cloudinary_id`.

---

## ⚙️ Módulo: Configuraciones (`/settings`)

### A. Perfil Global de Restaurante
**Headers Mínimos**: `Authorization`, `x-restaurant-id`.

#### `GET /settings/restaurant`
**Respuesta:**
```json
{
  "id": "uuid",
  "name": "Tinya",
  "slug": "tinya-rest",
  "phone": "+51...",
  "address": "Av. Principal",
  "plan": {
    "name": "Pro",
    "max_branches": 3,
    "max_products": 500
  }
}
```

#### `PATCH /settings/restaurant`
**Payload (Opcional):**
```json
{
  "name": "Tinya Restobar",
  "phone": "+51 987654321",
  "address": "Av. Central 123"
}
```

### B. Configuraciones Operativas por Sucursal
**Headers Mínimos**: `Authorization`, `x-restaurant-id`, `x-branch-id`.

#### `GET /settings/branch`
Retorna todos los overrides de la sucursal.
```json
{
  "id": "uuid",
  "whatsapp_config": { "number": "900111222", "message_template": "Hola!" },
  "display_config": { "currency": "PEN", "language": "es" },
  "order_config": { "enabled": true, "delivery_fee": 5.0 },
  "business_config": { "social_media": {}, "business_hours": {}, "delivery_zones": [] },
  "schedule": { "monday": { "open": "08:00", "close": "20:00", "isOpen": true } },
  "description": "Sucursal Centro",
  "logo_url": "https://...",
  "logo_cloudinary_id": "logos/123"
}
```

#### `PUT /settings/branch`
Actualiza usando "Partial JSONB Merge". Puedes mandar solo los nodos a editar sin perder la data de los demás.
**Payload:**
```json
{
  "whatsapp_config": { "number": "999888777" }
}
```

### C. Gestión de Banners de Sucursal (`/banners`)
*Este módulo fue separado de `/settings` para una mejor organización.*

#### `GET /banners`
**Respuesta:** Array de banners de la sucursal activa.
```json
[
  {
    "id": "uuid",
    "branch_id": "uuid",
    "image_url": "https://...",
    "cloudinary_id": "banners/123",
    "link_url": "https://promo.com",
    "description": "Promoción 2x1",
    "display_order": 0,
    "is_active": true
  }
]
```

#### `POST /banners`
**Payload:**
```json
{
  "image_base64": "data:image/png;base64,...",
  "link_url": "https://promo.com",
  "description": "Promoción 2x1",
  "display_order": 0
}
```
**Respuesta:** Objeto creado. La imagen se sube automáticamente a Cloudinary.

#### `PATCH /banners/reorder`
**Payload:** `{ "bannerIds": ["uuid-2", "uuid-1", "uuid-3"] }`

#### `PATCH /banners/:id`
**Payload (Opcional):** `{ "description": "Nueva promo", "is_active": false }`

#### `DELETE /banners/:id`
Elimina el registro y el archivo físico en Cloudinary.

---

## 🥡 Módulo: Combos (`/combos`)

*Gestión de paquetes de productos a precio especial.*
- **Headers Mínimos**: `Authorization`, `x-restaurant-id`, `x-branch-id`.

### 1. Listar Combos (`GET /combos`)
**Respuesta:**
```json
[
  {
    "id": "uuid",
    "name": "Dúo Power",
    "price": 45.50,
    "products": [
      { "product_id": "uuid-p1", "name": "Hamburguesa", "quantity": 1 },
      { "product_id": "uuid-p2", "name": "Gaseosa", "quantity": 1 }
    ]
  }
]
```

### 2. Detalle de Combo (`GET /combos/:id`)
Retorna el objeto completo incluyendo imágenes y descripción.

### 3. Crear Combo (`POST /combos`)
**Payload:**
```json
{
  "name": "Combo Familiar",
  "price": 85.00,
  "image_base64": "...",
  "products": [
    { "product_id": "uuid-1", "quantity": 2 },
    { "product_id": "uuid-2", "quantity": 1 }
  ]
}
```

### 4. Actualizar Combo (`PATCH /combos/:id`)
Permite actualizar datos básicos y sincronizar la lista de productos asociados.

### 5. Borrar Combo (`DELETE /combos/:id`)
Borra el combo y su imagen de la nube.

---

## 🏷️ Módulo: Promociones (`/promotions`)

*Gestión de descuentos aplicados a productos, categorías, combos o toda la sucursal.*
- **Headers Mínimos**: `Authorization`, `x-restaurant-id`, `x-branch-id`.

### 1. Listar Promociones (`GET /promotions`)
**Respuesta:** Array de promociones.
```json
[
  {
    "id": "uuid",
    "name": "Happy Hour",
    "discount_type": "percentage",
    "discount_value": 20,
    "applies_to": "category",
    "target_id": "uuid-cat",
    "target_name": "Bebidas",
    "is_active": true
  }
]
```

### 2. Crear Promoción (`POST /promotions`)
**Payload:**
```json
{
  "name": "Promo Lunes",
  "discount_type": "fixed",
  "discount_value": 10.00,
  "applies_to": "product",
  "target_id": "uuid-prod",
  "start_date": "2024-05-01T00:00:00Z",
  "end_date": "2024-05-31T23:59:59Z"
}
```
**Validación:** `target_id` es obligatorio si `applies_to` no es `branch`.

### 3. Actualizar Promoción (`PATCH /promotions/:id`)
Permite actualizar cualquier campo, incluyendo fechas y estado de activación.

### 4. Borrar Promoción (`DELETE /promotions/:id`)
Eliminación física del registro.

---

## 🏷️ Módulo: Etiquetas de Restaurante (`/restaurant-tags`)

*Clasificación global de restaurantes (ej: "Vegano", "Pet-friendly", "Gourmet").*
- **Headers Mínimos**: `Authorization`, `x-restaurant-id`.
- **Nota**: Este módulo opera a nivel de **Restaurante**, no por sucursal.

### 1. Catálogo Global (`GET /restaurant-tags/catalog`)
Retorna todas las etiquetas disponibles en el sistema para que el usuario pueda elegir.
**Respuesta:**
```json
[
  { "id": "uuid-1", "name": "Vegetariano" },
  { "id": "uuid-2", "name": "Pet-friendly" }
]
```

### 2. Listar Etiquetas del Restaurante (`GET /restaurant-tags`)
Retorna solo las etiquetas vinculadas al restaurante actual.

### 3. Sincronizar Etiquetas (`PUT /restaurant-tags`)
Actualiza la lista completa de etiquetas vinculadas. Las etiquetas que no se envíen serán desvinculadas.
**Payload:**
```json
{
  "tag_ids": ["uuid-1", "uuid-3"]
}
```

---



## 📊 Módulo: Estadísticas (`/statistics`)

- **Headers Mínimos**: `Authorization`, `x-restaurant-id`, `x-branch-id`.

### `GET /statistics/products/count`
```json
{ "branch_id": "uuid", "total_products": 45 }
```

### `GET /statistics/categories/count`
```json
{ "branch_id": "uuid", "total_categories": 12 }
```

### `GET /statistics/combos/count`
```json
{ "branch_id": "uuid", "total_combos": 8 }
```

### `GET /statistics/products/recent`
**Query Params:** `limit` (Default 5)
```json
{
  "branch_id": "uuid",
  "products": [
    { "id": "uuid", "name": "Café", "price": 12.5, "category_id": "uuid", "created_at": "..." }
  ]
}
```

### `GET /statistics/visits/overview`
```json
{
  "branch_id": "uuid",
  "total_visits": 1205,
  "breakdown": [
    { "type": "view", "count": 850 },
    { "type": "checkin", "count": 200 }
  ]
}
```

---

## 🔍 Módulo: Búsqueda (`/search`)

*Busca unificadamente en el catálogo de la sucursal (Productos, Categorías y Combos).*
- **Headers Mínimos**: `Authorization`, `x-restaurant-id`, `x-branch-id`.

### `GET /search`
Busca unificadamente en el catálogo de la sucursal.
**Query Params:**
- `q`: Término a buscar (Requerido).
- `type`: `all` | `products` | `categories`. (Nota: Los combos se incluyen en `all` y `products`).
- `menu_id`: (Opcional) Si se envía, limita resultados a ese menú (solo para productos y categorías).
- `page`, `limit`

**Respuesta:**
```json
{
  "success": true,
  "message": "Resultados obtenidos correctamente",
  "data": [
    {
      "id": "uuid",
      "name": "Café",
      "type": "product", 
      "price": "12.50",
      "category_name": "Bebidas"
    },
    {
      "id": "uuid",
      "name": "Combo Familiar",
      "type": "combo",
      "price": 85.00
    },
    {
      "id": "uuid",
      "name": "Bebidas",
      "type": "category"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 3 }
}
```
*(Nota: El campo `type` en el objeto de respuesta permite al frontend distinguir si el resultado renderizado pertenece a un "product", "category" o "combo").*


