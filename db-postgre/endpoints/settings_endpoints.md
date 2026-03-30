# Documentación de Endpoints - Módulo de Settings

Endpoint base: `http://<API_URL>/business-settings`

Todos los endpoints están protegidos por **`FirebaseAuthGuard`** y **`RestaurantOwnerGuard`**.  
El contexto se extrae automáticamente mediante los headers `Authorization: Bearer <token>` y `x-restaurant-id`. No es necesario enviar el `restaurant_id` en el cuerpo de la petición.

---

## 1. Obtener Configuración de Negocio
**Ruta:** `GET /business-settings`

### Descripción
Retorna la configuración completa del restaurante para el contexto actual. Si no existe una configuración previa en la base de datos, el servicio generará y retornará un objeto con valores por defecto.

### Qué Devuelve (Respuesta)
**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Business settings retrieved successfully",
  "data": {
    "restaurant_id": "550e8400-e29b-41d4-a716-446655440000",
    "whatsapp_config": {
      "enabled": true,
      "number": "+51987654321",
      "message_template": "Hola, me gustaría ordenar: {{products}}",
      "show_prices": true,
      "greeting": "¡Bienvenido a nuestro menú!",
      "auto_include_restaurant_name": true
    },
    "display_config": {
      "show_images": true,
      "show_descriptions": true,
      "show_categories": true,
      "currency": "PEN",
      "currency_symbol": "S/",
      "theme": "light",
      "colors": {
        "primary": "#FF6B6B",
        "secondary": "#4ECDC4"
      },
      "language": "es",
      "show_availability_badge": true
    },
    "order_config": {
      "enabled": false,
      "max_order_quantity": 10,
      "delivery_fee": 5.0,
      "payment_methods": ["cash", "card", "yape", "plin"],
      "accepts_reservations": true,
      "delivery_enabled": true,
      "pickup_enabled": true
    },
    "business_config": {
      "business_hours": {
        "monday": { "open": "09:00", "close": "22:00", "isOpen": true },
        "tuesday": { "open": "09:00", "close": "22:00", "isOpen": true },
        "wednesday": { "open": "09:00", "close": "22:00", "isOpen": true },
        "thursday": { "open": "09:00", "close": "22:00", "isOpen": true },
        "friday": { "open": "10:00", "close": "23:00", "isOpen": true },
        "saturday": { "open": "10:00", "close": "23:00", "isOpen": true },
        "sunday": { "open": "10:00", "close": "20:00", "isOpen": true }
      },
      "timezone": "America/Lima",
      "delivery_zones": [
        { "name": "Zona A", "fee": 5.0 },
        { "name": "Zona B", "fee": 10.0 }
      ],
      "social_media": {
        "facebook": "https://facebook.com/mirestaurante",
        "instagram": "@mirestaurante",
        "tiktok": "@mirestaurante",
        "twitter": "@mirestaurante"
      }
    },
    "created_at": "2024-02-21T15:06:00.000Z",
    "updated_at": "2024-03-29T18:00:00.000Z"
  }
}
```

---

## 2. Actualizar Configuración (Upsert / Partial Update)
**Ruta:** `PUT /business-settings`

### Descripción
Actualiza parcialmente la configuración del restaurante. Solo los campos enviados en el body serán modificados; el resto conservará sus valores actuales. Si el restaurante no tenía configuración previa, se crea una nueva mezclando los valores por defecto con los enviados.

### Cuerpo de la Petición (Request Body)
Todos los campos y objetos son opcionales.

#### Estructura Detallada:

| Objeto | Campo | Tipo | Validación / Descripción |
| :--- | :--- | :--- | :--- |
| **whatsapp_config** | `enabled` | boolean | Activa/Desactiva integración WhatsApp. |
| | `number` | string | Máx 20 caracteres. Incluir código de país. |
| | `message_template` | string | Máx 500 caracteres. Template del mensaje final. |
| | `show_prices` | boolean | Mostrar precios en el mensaje de WhatsApp. |
| | `greeting` | string | Mensaje de bienvenida. |
| | `auto_include_restaurant_name` | boolean | Incluir nombre del local automáticamente. |
| **display_config** | `show_images` | boolean | Mostrar fotos de productos. |
| | `show_descriptions` | boolean | Mostrar descripciones de productos. |
| | `show_categories` | boolean | Mostrar navegación por categorías. |
| | `currency` | string | Código ISO (ej: PEN, USD). Máx 3 carac. |
| | `currency_symbol` | string | Símbolo visible (ej: S/, $). Máx 5 carac. |
| | `theme` | enum | `light`, `dark`, `auto`. |
| | `colors.primary` | string | Hex format (ej: #FF6B6B). Máx 7 carac. |
| | `colors.secondary` | string | Hex format. |
| | `language` | string | Código idioma (ej: es, en). Máx 10 carac. |
| | `show_availability_badge` | boolean | Mostrar etiqueta de disponibilidad. |
| **order_config** | `enabled` | boolean | Activa el carrito y sistema de pedidos. |
| | `max_order_quantity` | number | Mínimo 1. Cantidad máxima por producto. |
| | `delivery_fee` | number | Mínimo 0. Fee base de delivery. |
| | `payment_methods` | string[] | Ej: `["cash", "yape", "card"]`. |
| | `accepts_reservations` | boolean | Habilitar módulo de reservas. |
| | `delivery_enabled` | boolean | Habilitar opción de delivery. |
| | `pickup_enabled` | boolean | Habilitar opción de recojo en local. |
| **business_config** | `business_hours` | object | Mapa de días (`monday`...`sunday`) con `{open, close, isOpen}`. |
| | `timezone` | string | Ej: `America/Lima`. Máx 50 carac. |
| | `delivery_zones` | array | Lista de objetos `{name, fee}`. |
| | `social_media` | object | Campos: `facebook`, `instagram`, `tiktok`, `twitter`. |

#### Ejemplo de Body Parcial:
```json
{
  "whatsapp_config": {
    "enabled": true,
    "number": "+51987654321"
  },
  "display_config": {
    "theme": "dark",
    "colors": {
      "primary": "#00FF00"
    }
  }
}
```

### Qué Devuelve (Respuesta)
**Status:** `200 OK`
Devuelve el objeto completo de la configuración actualizada (mismo formato que el `GET`).

---

## 3. Manejo de Errores Comunes

### 400 Bad Request (Validación fallida)
Ocurre si se envían tipos de datos incorrectos o se exceden los límites de caracteres.
```json
{
  "status": "error",
  "code": "400",
  "message": "Validation failed",
  "error": {
    "code": "400",
    "message": "number must be a string",
    "details": {
      "field": "whatsapp_config.number",
      "value": 12345
    }
  }
}
```

### 404 Not Found
Ocurre si el restaurante asociado al token o al header no existe en el sistema o si el banner especificado no existe.

---

## 4. Gestión de Banners
Base: `/business-settings/banners`

### 4.1 Listar Banners
`GET /business-settings/banners`
Retorna todos los banners del restaurante ordenados por `display_order`.

### 4.2 Crear Banner
`POST /business-settings/banners`
**Body:**
```json
{
  "image_base64": "data:image/...",
  "description": "Oferta Verano",
  "display_order": 0
}
```

### 4.3 Actualizar Banner
`PATCH /business-settings/banners/:id`
Permite actualización parcial de `description`, `display_order` o `is_active`.

### 4.4 Borrar Banner
`DELETE /business-settings/banners/:id`
Elimina el registro de la DB y la imagen de Cloudinary.

### 4.5 Reordenar Banners
`PATCH /business-settings/banners/reorder`
**Body:**
```json
{
  "bannerIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```
Actualiza el `display_order` según la posición en el array.
