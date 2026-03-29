# Documentación de Endpoints - Módulo de Settings

Endpoints base: `http://<API_URL>/business-settings`

Todos los endpoints están protegidos por **`FirebaseAuthGuard`** y **`RestaurantOwnerGuard`**.  
No es necesario enviar el `restaurant_id` en las URLs o cuerpos de la petición.

---

## 1. Obtener Configuración
**Ruta:** `GET /business-settings`

### Parámetros
- **Headers:** `Authorization: Bearer <token>`
- **No requiere enviar body ni query params.**

### Qué Devuelve (Respuesta)
**Status:** `200 OK`
Devuelve la configuración general del restaurante. Si no hay una creada, devuelve una configuración por defecto.

```json
{
  "success": true,
  "message": "Business settings retrieved successfully",
  "data": {
    "restaurant_id": "def-456-uuid...",
    "whatsapp_config": {
      "enabled": true,
      "phone": "+51999888777"
    },
    "display_config": {
      "theme": "light",
      "language": "es"
    },
    "order_config": {
      "autoConfirm": true,
      "preparationTime": 20
    },
    "business_config": {
      "business_hours": {
        "monday": { "open": "09:00", "close": "22:00", "isOpen": true }
      },
      "timezone": "America/Lima",
      "delivery_zones": [
        { "name": "Centro", "fee": 5.0 }
      ],
      "social_media": {
        "facebook": "https://facebook.com/...",
        "instagram": "@..."
      }
    },
    "created_at": "2024-03-28...",
    "updated_at": "2024-03-28..."
  }
}
```

---

## 2. Actualizar Configuración (Upsert / Partial Update)
**Ruta:** `PUT /business-settings`

### Datos a Enviar (Body JSON)
Solo necesitas enviar los campos u objetos que deseas modificar. Internamente hace un merge o actualización parcial. Todo es opcional.

```json
{
  "whatsapp_config": {
    "enabled": false
  },
  "business_config": {
    "timezone": "America/Bogota"
  }
}
```

### Qué Devuelve (Respuesta)
**Status:** `200 OK`
Devuelve el objeto completo de la configuración tras aplicar la actualización.

```json
{
  "success": true,
  "message": "Business settings updated successfully",
  "data": {
    "restaurant_id": "def-456-...
    ... (toda la configuración actualizada)
  }
}
```
