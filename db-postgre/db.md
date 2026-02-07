# Documentación de Base de Datos - Sistema de Menús para Restaurantes

## Índice
1. [Arquitectura General](#arquitectura-general)
2. [Tablas y Estructuras](#tablas-y-estructuras)
3. [Tipos TypeScript para Angular](#tipos-typescript-para-angular)
4. [Tipos TypeScript para NestJS](#tipos-typescript-para-nestjs)
5. [Ejemplos de Inserción JSON](#ejemplos-de-inserción-json)
6. [Queries SQL Comunes](#queries-sql-comunes)

---

## Arquitectura General

El sistema está dividido en 3 backends:

1. **Admin Developers** - Gestión de usuarios, planes y plantillas
2. **Admin Restaurant** - Gestión de restaurantes, menús, categorías y productos
3. **Menu Público** - Vista pública del menú por slug

### Relaciones entre tablas

```
users (1) ──→ (N) restaurants
plans (1) ──→ (N) templates
plans (1) ──→ (N) restaurants
templates (1) ──→ (N) restaurants
restaurants (1) ──→ (1) restaurant_settings
restaurants (1) ──→ (N) menus
restaurants (1) ──→ (N) categories
restaurants (1) ──→ (N) products
menus (1) ──→ (N) categories
categories (1) ──→ (N) products
```

---

## Tablas y Estructuras

### 1. **users**
Almacena información de usuarios (sincronizada con Firebase Auth).

**Columnas:**
- `id` (UUID): ID de Firebase Auth
- `email` (TEXT): Email único del usuario
- `phone` (TEXT): Teléfono opcional
- `display_name` (TEXT): Nombre a mostrar
- `photo_url` (TEXT): URL de foto de perfil
- `created_at` (TIMESTAMPTZ): Fecha de creación
- `updated_at` (TIMESTAMPTZ): Fecha de actualización

**Índices:**
- Único en `LOWER(email)` para búsquedas case-insensitive
- Índice en `phone` (solo valores no nulos)
- Índice en `created_at`

**Uso:** Esta tabla se sincroniza automáticamente cuando un usuario se registra vía Firebase.

---

### 2. **plans**
Define los planes de suscripción disponibles.

**Columnas:**
- `id` (UUID): Identificador único
- `name` (TEXT): Nombre del plan (ej: "Basic", "Premium")
- `description` (TEXT): Descripción del plan
- `price` (NUMERIC): Precio mensual
- `max_restaurants` (INTEGER): Cantidad máxima de restaurantes
- `max_products` (INTEGER): Cantidad máxima de productos (null = ilimitado)
- `max_categories` (INTEGER): Cantidad máxima de categorías (null = ilimitado)
- `features` (JSONB): Características adicionales del plan
- `is_active` (BOOLEAN): Si el plan está disponible
- `created_at` (TIMESTAMPTZ): Fecha de creación
- `updated_at` (TIMESTAMPTZ): Fecha de actualización

**features (JSONB):**
```json
{
  "whatsapp_integration": true,
  "custom_domain": false,
  "analytics": true,
  "priority_support": false,
  "custom_branding": true
}
```

---

### 3. **templates**
Plantillas de diseño asociadas a planes.

**Columnas:**
- `id` (UUID): Identificador único
- `plan_id` (UUID): FK a plans
- `name` (TEXT): Nombre de la plantilla
- `description` (TEXT): Descripción
- `preview_url` (TEXT): URL de imagen preview
- `config` (JSONB): Configuración de la plantilla
- `is_active` (BOOLEAN): Si está disponible
- `created_at` (TIMESTAMPTZ): Fecha de creación
- `updated_at` (TIMESTAMPTZ): Fecha de actualización

**config (JSONB):**
```json
{
  "theme": "modern",
  "colors": {
    "primary": "#FF6B6B",
    "secondary": "#4ECDC4",
    "background": "#FFFFFF",
    "text": "#2C3E50"
  },
  "fonts": {
    "heading": "Montserrat",
    "body": "Open Sans"
  },
  "layout": "grid",
  "components": {
    "show_logo": true,
    "show_search": true,
    "card_style": "elevated"
  }
}
```

---

### 4. **restaurants**
Información de cada restaurante.

**Columnas:**
- `id` (UUID): Identificador único
- `name` (TEXT): Nombre del restaurante
- `slug` (TEXT): Slug único para URL (ej: "mi-restaurante")
- `owner_id` (UUID): FK a users
- `plan_id` (UUID): FK a plans (nullable)
- `template_id` (UUID): FK a templates (nullable)
- `phone` (TEXT): Teléfono de contacto
- `address` (TEXT): Dirección física
- `logo_url` (TEXT): URL del logo
- `is_active` (BOOLEAN): Si el restaurante está activo
- `created_at` (TIMESTAMPTZ): Fecha de creación
- `updated_at` (TIMESTAMPTZ): Fecha de actualización

**Constraint:** `slug` debe ser único (NULLS NOT DISTINCT)

---

### 5. **restaurant_settings**
Configuraciones específicas de cada restaurante.

**Columnas:**
- `id` (UUID): Identificador único
- `restaurant_id` (UUID): FK a restaurants (1:1)
- `whatsapp_config` (JSONB): Configuración de WhatsApp
- `display_config` (JSONB): Configuración de visualización
- `order_config` (JSONB): Configuración de pedidos
- `business_config` (JSONB): Configuración de negocio
- `created_at` (TIMESTAMPTZ): Fecha de creación
- `updated_at` (TIMESTAMPTZ): Fecha de actualización

**whatsapp_config (JSONB):**
```json
{
  "enabled": true,
  "number": "+51987654321",
  "message_template": "Hola, me gustaría ordenar: {{products}}",
  "show_prices": true,
  "greeting": "¡Bienvenido a nuestro menú!",
  "auto_include_restaurant_name": true
}
```

**display_config (JSONB):**
```json
{
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
}
```

**order_config (JSONB):**
```json
{
  "enabled": false,
  "min_order_amount": 15.00,
  "delivery_fee": 5.00,
  "payment_methods": ["cash", "card", "yape", "plin"],
  "accepts_reservations": true,
  "delivery_enabled": true,
  "pickup_enabled": true
}
```

**business_config (JSONB):**
```json
{
  "business_hours": {
    "monday": { "open": "09:00", "close": "22:00", "closed": false },
    "tuesday": { "open": "09:00", "close": "22:00", "closed": false },
    "wednesday": { "open": "09:00", "close": "22:00", "closed": false },
    "thursday": { "open": "09:00", "close": "22:00", "closed": false },
    "friday": { "open": "09:00", "close": "23:00", "closed": false },
    "saturday": { "open": "10:00", "close": "23:00", "closed": false },
    "sunday": { "open": "10:00", "close": "20:00", "closed": false }
  },
  "timezone": "America/Lima",
  "delivery_zones": [
    { "name": "Miraflores", "fee": 5.00 },
    { "name": "San Isidro", "fee": 7.00 }
  ],
  "social_media": {
    "facebook": "https://facebook.com/mirestaurante",
    "instagram": "@mirestaurante",
    "tiktok": "@mirestaurante"
  }
}
```

---

### 6. **menus**
Menús de un restaurante (ej: "Desayunos", "Almuerzos", "Carta Nocturna").

**Columnas:**
- `id` (UUID): Identificador único
- `restaurant_id` (UUID): FK a restaurants
- `name` (TEXT): Nombre del menú
- `description` (TEXT): Descripción
- `is_active` (BOOLEAN): Si está visible
- `display_order` (INTEGER): Orden de visualización
- `created_at` (TIMESTAMPTZ): Fecha de creación
- `updated_at` (TIMESTAMPTZ): Fecha de actualización

**Constraint:** Combinación única de `(restaurant_id, name)`

---

### 7. **categories**
Categorías de productos dentro de un menú.

**Columnas:**
- `id` (UUID): Identificador único
- `restaurant_id` (UUID): FK a restaurants
- `menu_id` (UUID): FK a menus (nullable)
- `name` (TEXT): Nombre de la categoría
- `description` (TEXT): Descripción
- `display_order` (INTEGER): Orden de visualización
- `is_active` (BOOLEAN): Si está visible
- `created_at` (TIMESTAMPTZ): Fecha de creación
- `updated_at` (TIMESTAMPTZ): Fecha de actualización

**Constraint:** Combinación única de `(restaurant_id, name)`

**Nota:** `menu_id` puede ser null si la categoría no pertenece a un menú específico.

---

### 8. **products**
Productos/platos del menú.

**Columnas:**
- `id` (UUID): Identificador único
- `restaurant_id` (UUID): FK a restaurants
- `category_id` (UUID): FK a categories
- `name` (TEXT): Nombre del producto
- `description` (TEXT): Descripción
- `price` (NUMERIC): Precio
- `image_url` (TEXT): URL de imagen
- `is_available` (BOOLEAN): Si está disponible
- `display_order` (INTEGER): Orden de visualización
- `created_at` (TIMESTAMPTZ): Fecha de creación
- `updated_at` (TIMESTAMPTZ): Fecha de actualización

---

## Tipos TypeScript para Angular

```typescript
// src/app/core/models/database.model.ts

export interface TimestampEntity {
  created_at: string; // ISO 8601 format
  updated_at: string;
}

// ============================================
// USER
// ============================================
export interface User extends TimestampEntity {
  id: string; // UUID from Firebase
  email: string;
  phone?: string;
  display_name?: string;
  photo_url?: string;
}

// ============================================
// PLAN
// ============================================
export interface PlanFeatures {
  whatsapp_integration?: boolean;
  custom_domain?: boolean;
  analytics?: boolean;
  priority_support?: boolean;
  custom_branding?: boolean;
  [key: string]: any;
}

export interface Plan extends TimestampEntity {
  id: string;
  name: string;
  description?: string;
  price: number;
  max_restaurants: number;
  max_products?: number;
  max_categories?: number;
  features: PlanFeatures;
  is_active: boolean;
}

// ============================================
// TEMPLATE
// ============================================
export interface TemplateColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

export interface TemplateFonts {
  heading: string;
  body: string;
}

export interface TemplateComponents {
  show_logo: boolean;
  show_search: boolean;
  card_style: 'flat' | 'elevated' | 'outlined';
}

export interface TemplateConfig {
  theme: 'modern' | 'classic' | 'minimal';
  colors: TemplateColors;
  fonts: TemplateFonts;
  layout: 'grid' | 'list' | 'masonry';
  components: TemplateComponents;
}

export interface Template extends TimestampEntity {
  id: string;
  plan_id: string;
  name: string;
  description?: string;
  preview_url?: string;
  config: TemplateConfig;
  is_active: boolean;
}

// ============================================
// RESTAURANT
// ============================================
export interface Restaurant extends TimestampEntity {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  plan_id?: string;
  template_id?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  is_active: boolean;
}

// ============================================
// RESTAURANT SETTINGS
// ============================================
export interface WhatsAppConfig {
  enabled?: boolean;
  number?: string;
  message_template?: string;
  show_prices?: boolean;
  greeting?: string;
  auto_include_restaurant_name?: boolean;
}

export interface DisplayColors {
  primary: string;
  secondary: string;
}

export interface DisplayConfig {
  show_images?: boolean;
  show_descriptions?: boolean;
  show_categories?: boolean;
  currency?: string;
  currency_symbol?: string;
  theme?: 'light' | 'dark' | 'auto';
  colors?: DisplayColors;
  language?: string;
  show_availability_badge?: boolean;
}

export interface OrderConfig {
  enabled?: boolean;
  min_order_amount?: number;
  delivery_fee?: number;
  payment_methods?: ('cash' | 'card' | 'yape' | 'plin' | 'transfer')[];
  accepts_reservations?: boolean;
  delivery_enabled?: boolean;
  pickup_enabled?: boolean;
}

export interface BusinessHours {
  open: string; // "HH:mm"
  close: string; // "HH:mm"
  closed: boolean;
}

export interface DeliveryZone {
  name: string;
  fee: number;
}

export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  twitter?: string;
}

export interface BusinessConfig {
  business_hours?: Record<string, BusinessHours>;
  timezone?: string;
  delivery_zones?: DeliveryZone[];
  social_media?: SocialMedia;
}

export interface RestaurantSettings extends TimestampEntity {
  id: string;
  restaurant_id: string;
  whatsapp_config: WhatsAppConfig;
  display_config: DisplayConfig;
  order_config: OrderConfig;
  business_config: BusinessConfig;
}

// ============================================
// MENU
// ============================================
export interface Menu extends TimestampEntity {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  display_order: number;
}

// ============================================
// CATEGORY
// ============================================
export interface Category extends TimestampEntity {
  id: string;
  restaurant_id: string;
  menu_id?: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

// ============================================
// PRODUCT
// ============================================
export interface Product extends TimestampEntity {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  display_order: number;
}

// ============================================
// DTOs for API (sin timestamps automáticos)
// ============================================

export interface CreateUserDto {
  id: string; // Firebase UID
  email: string;
  phone?: string;
  display_name?: string;
  photo_url?: string;
}

export interface UpdateUserDto {
  phone?: string;
  display_name?: string;
  photo_url?: string;
}

export interface CreatePlanDto {
  name: string;
  description?: string;
  price: number;
  max_restaurants: number;
  max_products?: number;
  max_categories?: number;
  features?: PlanFeatures;
  is_active?: boolean;
}

export interface UpdatePlanDto extends Partial<CreatePlanDto> {}

export interface CreateTemplateDto {
  plan_id: string;
  name: string;
  description?: string;
  preview_url?: string;
  config?: TemplateConfig;
  is_active?: boolean;
}

export interface UpdateTemplateDto extends Partial<Omit<CreateTemplateDto, 'plan_id'>> {}

export interface CreateRestaurantDto {
  name: string;
  slug: string;
  owner_id: string;
  plan_id?: string;
  template_id?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
}

export interface UpdateRestaurantDto extends Partial<Omit<CreateRestaurantDto, 'owner_id'>> {
  is_active?: boolean;
}

export interface UpdateRestaurantSettingsDto {
  whatsapp_config?: Partial<WhatsAppConfig>;
  display_config?: Partial<DisplayConfig>;
  order_config?: Partial<OrderConfig>;
  business_config?: Partial<BusinessConfig>;
}

export interface CreateMenuDto {
  restaurant_id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  display_order?: number;
}

export interface UpdateMenuDto extends Partial<Omit<CreateMenuDto, 'restaurant_id'>> {}

export interface CreateCategoryDto {
  restaurant_id: string;
  menu_id?: string;
  name: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateCategoryDto extends Partial<Omit<CreateCategoryDto, 'restaurant_id'>> {}

export interface CreateProductDto {
  restaurant_id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available?: boolean;
  display_order?: number;
}

export interface UpdateProductDto extends Partial<Omit<CreateProductDto, 'restaurant_id'>> {}
```

---

## Tipos TypeScript para NestJS (sin ORM)

```typescript
// src/common/types/database.types.ts

export interface DatabaseTimestamps {
  created_at: Date;
  updated_at: Date;
}

// ============================================
// DATABASE ROW TYPES
// ============================================

export interface UserRow extends DatabaseTimestamps {
  id: string;
  email: string;
  phone: string | null;
  display_name: string | null;
  photo_url: string | null;
}

export interface PlanRow extends DatabaseTimestamps {
  id: string;
  name: string;
  description: string | null;
  price: string; // NUMERIC viene como string desde pg
  max_restaurants: number;
  max_products: number | null;
  max_categories: number | null;
  features: Record<string, any>;
  is_active: boolean;
}

export interface TemplateRow extends DatabaseTimestamps {
  id: string;
  plan_id: string;
  name: string;
  description: string | null;
  preview_url: string | null;
  config: Record<string, any>;
  is_active: boolean;
}

export interface RestaurantRow extends DatabaseTimestamps {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  plan_id: string | null;
  template_id: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  is_active: boolean;
}

export interface RestaurantSettingsRow extends DatabaseTimestamps {
  id: string;
  restaurant_id: string;
  whatsapp_config: Record<string, any>;
  display_config: Record<string, any>;
  order_config: Record<string, any>;
  business_config: Record<string, any>;
}

export interface MenuRow extends DatabaseTimestamps {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
}

export interface CategoryRow extends DatabaseTimestamps {
  id: string;
  restaurant_id: string;
  menu_id: string | null;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

export interface ProductRow extends DatabaseTimestamps {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: string; // NUMERIC viene como string desde pg
  image_url: string | null;
  is_available: boolean;
  display_order: number;
}

// ============================================
// QUERY PARAMETER TYPES
// ============================================

export interface InsertUserParams {
  id: string;
  email: string;
  phone?: string;
  display_name?: string;
  photo_url?: string;
}

export interface UpdateUserParams {
  phone?: string;
  display_name?: string;
  photo_url?: string;
}

export interface InsertPlanParams {
  name: string;
  description?: string;
  price: number;
  max_restaurants: number;
  max_products?: number;
  max_categories?: number;
  features?: Record<string, any>;
  is_active?: boolean;
}

export interface UpdatePlanParams extends Partial<InsertPlanParams> {}

export interface InsertTemplateParams {
  plan_id: string;
  name: string;
  description?: string;
  preview_url?: string;
  config?: Record<string, any>;
  is_active?: boolean;
}

export interface UpdateTemplateParams extends Partial<Omit<InsertTemplateParams, 'plan_id'>> {}

export interface InsertRestaurantParams {
  name: string;
  slug: string;
  owner_id: string;
  plan_id?: string;
  template_id?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
}

export interface UpdateRestaurantParams extends Partial<Omit<InsertRestaurantParams, 'owner_id'>> {
  is_active?: boolean;
}

export interface UpdateRestaurantSettingsParams {
  whatsapp_config?: Record<string, any>;
  display_config?: Record<string, any>;
  order_config?: Record<string, any>;
  business_config?: Record<string, any>;
}

export interface InsertMenuParams {
  restaurant_id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  display_order?: number;
}

export interface UpdateMenuParams extends Partial<Omit<InsertMenuParams, 'restaurant_id'>> {}

export interface InsertCategoryParams {
  restaurant_id: string;
  menu_id?: string;
  name: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateCategoryParams extends Partial<Omit<InsertCategoryParams, 'restaurant_id'>> {}

export interface InsertProductParams {
  restaurant_id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available?: boolean;
  display_order?: number;
}

export interface UpdateProductParams extends Partial<Omit<InsertProductParams, 'restaurant_id'>> {}

// ============================================
// HELPER TYPE FOR QUERY RESULTS
// ============================================

export type QueryResult<T> = T[];
export type SingleResult<T> = T | null;
```

---

## Ejemplos de Inserción JSON

### 1. **Insertar Usuario**

```typescript
// Angular Service
createUser(userData: CreateUserDto): Observable<User> {
  return this.http.post<User>('/api/users', userData);
}

// Datos a enviar
const newUser: CreateUserDto = {
  id: 'firebase-uid-123', // Del Firebase Auth
  email: 'usuario@example.com',
  phone: '+51987654321',
  display_name: 'Juan Pérez',
  photo_url: 'https://example.com/photo.jpg'
};
```

**SQL en NestJS:**
```typescript
async createUser(params: InsertUserParams): Promise<UserRow> {
  const query = `
    INSERT INTO users (id, email, phone, display_name, photo_url)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  
  const values = [
    params.id,
    params.email,
    params.phone ?? null,
    params.display_name ?? null,
    params.photo_url ?? null
  ];
  
  const result = await this.pool.query<UserRow>(query, values);
  return result.rows[0];
}
```

---

### 2. **Insertar Plan**

```typescript
const newPlan: CreatePlanDto = {
  name: 'Premium',
  description: 'Plan completo con todas las funcionalidades',
  price: 49.99,
  max_restaurants: 5,
  max_products: null, // ilimitado
  max_categories: null, // ilimitado
  features: {
    whatsapp_integration: true,
    custom_domain: true,
    analytics: true,
    priority_support: true,
    custom_branding: true
  },
  is_active: true
};
```

**SQL en NestJS:**
```typescript
async createPlan(params: InsertPlanParams): Promise<PlanRow> {
  const query = `
    INSERT INTO plans (
      name, description, price, max_restaurants, 
      max_products, max_categories, features, is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  
  const values = [
    params.name,
    params.description ?? null,
    params.price,
    params.max_restaurants,
    params.max_products ?? null,
    params.max_categories ?? null,
    JSON.stringify(params.features ?? {}),
    params.is_active ?? true
  ];
  
  const result = await this.pool.query<PlanRow>(query, values);
  return result.rows[0];
}
```

---

### 3. **Insertar Template**

```typescript
const newTemplate: CreateTemplateDto = {
  plan_id: 'uuid-del-plan',
  name: 'Moderno Oscuro',
  description: 'Plantilla moderna con tema oscuro',
  preview_url: 'https://example.com/preview.jpg',
  config: {
    theme: 'modern',
    colors: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      background: '#1A1A1A',
      text: '#FFFFFF'
    },
    fonts: {
      heading: 'Montserrat',
      body: 'Open Sans'
    },
    layout: 'grid',
    components: {
      show_logo: true,
      show_search: true,
      card_style: 'elevated'
    }
  },
  is_active: true
};
```

**SQL en NestJS:**
```typescript
async createTemplate(params: InsertTemplateParams): Promise<TemplateRow> {
  const query = `
    INSERT INTO templates (
      plan_id, name, description, preview_url, config, is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const values = [
    params.plan_id,
    params.name,
    params.description ?? null,
    params.preview_url ?? null,
    JSON.stringify(params.config ?? {}),
    params.is_active ?? true
  ];
  
  const result = await this.pool.query<TemplateRow>(query, values);
  return result.rows[0];
}
```

---

### 4. **Insertar Restaurant**

```typescript
const newRestaurant: CreateRestaurantDto = {
  name: 'La Buena Mesa',
  slug: 'la-buena-mesa',
  owner_id: 'firebase-uid-123',
  plan_id: 'uuid-del-plan',
  template_id: 'uuid-del-template',
  phone: '+51987654321',
  address: 'Av. Principal 123, Miraflores',
  logo_url: 'https://example.com/logo.jpg'
};
```

**SQL en NestJS:**
```typescript
async createRestaurant(params: InsertRestaurantParams): Promise<RestaurantRow> {
  const query = `
    INSERT INTO restaurants (
      name, slug, owner_id, plan_id, template_id,
      phone, address, logo_url
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  
  const values = [
    params.name,
    params.slug,
    params.owner_id,
    params.plan_id ?? null,
    params.template_id ?? null,
    params.phone ?? null,
    params.address ?? null,
    params.logo_url ?? null
  ];
  
  const result = await this.pool.query<RestaurantRow>(query, values);
  return result.rows[0];
}
```

---

### 5. **Actualizar Restaurant Settings**

```typescript
const settings: UpdateRestaurantSettingsDto = {
  whatsapp_config: {
    enabled: true,
    number: '+51987654321',
    message_template: 'Hola, me gustaría ordenar: {{products}}',
    show_prices: true,
    greeting: '¡Bienvenido!'
  },
  display_config: {
    show_images: true,
    show_descriptions: true,
    currency: 'PEN',
    currency_symbol: 'S/',
    theme: 'light'
  },
  order_config: {
    enabled: true,
    min_order_amount: 15.00,
    delivery_fee: 5.00,
    payment_methods: ['cash', 'yape', 'plin']
  },
  business_config: {
    business_hours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      sunday: { open: '10:00', close: '20:00', closed: false }
    },
    timezone: 'America/Lima'
  }
};
```

**SQL en NestJS:**
```typescript
async updateRestaurantSettings(
  restaurantId: string,
  params: UpdateRestaurantSettingsParams
): Promise<RestaurantSettingsRow> {
  
  // Primero obtener la configuración actual
  const current = await this.getRestaurantSettings(restaurantId);
  
  const query = `
    UPDATE restaurant_settings
    SET 
      whatsapp_config = $1,
      display_config = $2,
      order_config = $3,
      business_config = $4,
      updated_at = now()
    WHERE restaurant_id = $5
    RETURNING *
  `;
  
  const values = [
    JSON.stringify({ ...current.whatsapp_config, ...params.whatsapp_config }),
    JSON.stringify({ ...current.display_config, ...params.display_config }),
    JSON.stringify({ ...current.order_config, ...params.order_config }),
    JSON.stringify({ ...current.business_config, ...params.business_config }),
    restaurantId
  ];
  
  const result = await this.pool.query<RestaurantSettingsRow>(query, values);
  return result.rows[0];
}
```

---

### 6. **Insertar Menú**

```typescript
const newMenu: CreateMenuDto = {
  restaurant_id: 'uuid-del-restaurant',
  name: 'Desayunos',
  description: 'Desayunos disponibles de 8am a 12pm',
  is_active: true,
  display_order: 0
};
```

**SQL en NestJS:**
```typescript
async createMenu(params: InsertMenuParams): Promise<MenuRow> {
  const query = `
    INSERT INTO menus (
      restaurant_id, name, description, is_active, display_order
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  
  const values = [
    params.restaurant_id,
    params.name,
    params.description ?? null,
    params.is_active ?? true,
    params.display_order ?? 0
  ];
  
  const result = await this.pool.query<MenuRow>(query, values);
  return result.rows[0];
}
```

---

### 7. **Insertar Categoría**

```typescript
const newCategory: CreateCategoryDto = {
  restaurant_id: 'uuid-del-restaurant',
  menu_id: 'uuid-del-menu', // opcional
  name: 'Bebidas Calientes',
  description: 'Café, té y chocolate caliente',
  display_order: 2,
  is_active: true
};
```

**SQL en NestJS:**
```typescript
async createCategory(params: InsertCategoryParams): Promise<CategoryRow> {
  const query = `
    INSERT INTO categories (
      restaurant_id, menu_id, name, description, 
      display_order, is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const values = [
    params.restaurant_id,
    params.menu_id ?? null,
    params.name,
    params.description ?? null,
    params.display_order ?? 0,
    params.is_active ?? true
  ];
  
  const result = await this.pool.query<CategoryRow>(query, values);
  return result.rows[0];
}
```

---

### 8. **Insertar Producto**

```typescript
const newProduct: CreateProductDto = {
  restaurant_id: 'uuid-del-restaurant',
  category_id: 'uuid-de-categoria',
  name: 'Café Americano',
  description: 'Café de origen peruano, tostado medio',
  price: 8.50,
  image_url: 'https://example.com/cafe.jpg',
  is_available: true,
  display_order: 0
};
```

**SQL en NestJS:**
```typescript
async createProduct(params: InsertProductParams): Promise<ProductRow> {
  const query = `
    INSERT INTO products (
      restaurant_id, category_id, name, description,
      price, image_url, is_available, display_order
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  
  const values = [
    params.restaurant_id,
    params.category_id,
    params.name,
    params.description ?? null,
    params.price,
    params.image_url ?? null,
    params.is_available ?? true,
    params.display_order ?? 0
  ];
  
  const result = await this.pool.query<ProductRow>(query, values);
  return result.rows[0];
}
```

---

## Queries SQL Comunes

### 1. **Obtener menú completo de un restaurante por slug**

```typescript
async getPublicMenu(slug: string): Promise<any> {
  const query = `
    SELECT 
      r.id as restaurant_id,
      r.name as restaurant_name,
      r.slug,
      r.phone,
      r.address,
      r.logo_url,
      rs.display_config,
      rs.whatsapp_config,
      json_agg(
        DISTINCT jsonb_build_object(
          'id', m.id,
          'name', m.name,
          'description', m.description,
          'display_order', m.display_order
        ) ORDER BY m.display_order
      ) FILTER (WHERE m.id IS NOT NULL) as menus
    FROM restaurants r
    LEFT JOIN restaurant_settings rs ON rs.restaurant_id = r.id
    LEFT JOIN menus m ON m.restaurant_id = r.id AND m.is_active = true
    WHERE r.slug = $1 AND r.is_active = true
    GROUP BY r.id, rs.id
  `;
  
  const result = await this.pool.query(query, [slug]);
  return result.rows[0];
}
```

### 2. **Obtener productos de una categoría**

```typescript
async getProductsByCategory(categoryId: string): Promise<ProductRow[]> {
  const query = `
    SELECT *
    FROM products
    WHERE category_id = $1
    AND is_available = true
    ORDER BY display_order, name
  `;
  
  const result = await this.pool.query<ProductRow>(query, [categoryId]);
  return result.rows;
}
```

### 3. **Buscar productos por nombre**

```typescript
async searchProducts(restaurantId: string, searchTerm: string): Promise<ProductRow[]> {
  const query = `
    SELECT p.*
    FROM products p
    WHERE p.restaurant_id = $1
    AND p.name ILIKE $2
    AND p.is_available = true
    ORDER BY p.name
    LIMIT 20
  `;
  
  const result = await this.pool.query<ProductRow>(query, [
    restaurantId,
    `%${searchTerm}%`
  ]);
  return result.rows;
}
```

### 4. **Verificar disponibilidad de slug**

```typescript
async isSlugAvailable(slug: string, excludeRestaurantId?: string): Promise<boolean> {
  let query = `
    SELECT EXISTS(
      SELECT 1 FROM restaurants WHERE slug = $1
  `;
  const values: any[] = [slug];
  
  if (excludeRestaurantId) {
    query += ` AND id != $2`;
    values.push(excludeRestaurantId);
  }
  
  query += `) as exists`;
  
  const result = await this.pool.query(query, values);
  return !result.rows[0].exists;
}
```

### 5. **Obtener estadísticas de restaurante**

```typescript
async getRestaurantStats(restaurantId: string): Promise<any> {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM menus WHERE restaurant_id = $1) as total_menus,
      (SELECT COUNT(*) FROM categories WHERE restaurant_id = $1) as total_categories,
      (SELECT COUNT(*) FROM products WHERE restaurant_id = $1) as total_products,
      (SELECT COUNT(*) FROM products WHERE restaurant_id = $1 AND is_available = true) as available_products,
      (SELECT AVG(price::numeric) FROM products WHERE restaurant_id = $1) as avg_price,
      (SELECT MIN(price::numeric) FROM products WHERE restaurant_id = $1) as min_price,
      (SELECT MAX(price::numeric) FROM products WHERE restaurant_id = $1) as max_price
  `;
  
  const result = await this.pool.query(query, [restaurantId]);
  return result.rows[0];
}
```

### 6. **Actualizar orden de productos**

```typescript
async reorderProducts(updates: Array<{ id: string; display_order: number }>): Promise<void> {
  const client = await this.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    for (const update of updates) {
      await client.query(
        'UPDATE products SET display_order = $1, updated_at = now() WHERE id = $2',
        [update.display_order, update.id]
      );
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

