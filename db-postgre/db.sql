-- Extensión para búsqueda de texto
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Tabla: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid TEXT UNIQUE,
    email TEXT NOT NULL,
    phone TEXT,
    display_name TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla: plans
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    max_restaurants INTEGER NOT NULL DEFAULT 1,
    max_products INTEGER,
    max_categories INTEGER,
    features JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(features) = 'object'),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla: templates
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    preview_url TEXT,
    config JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(config) = 'object'),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla: restaurants
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    phone TEXT,
    address TEXT,
    logo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_restaurant_slug UNIQUE NULLS NOT DISTINCT (slug)
);

-- Tabla: restaurant_settings
CREATE TABLE restaurant_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    whatsapp_config JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(whatsapp_config) = 'object'),
    display_config JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(display_config) = 'object'),
    order_config JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(order_config) = 'object'),
    business_config JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(business_config) = 'object'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_settings_per_restaurant UNIQUE (restaurant_id)
);

-- Tabla: menus
CREATE TABLE menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Menu Principal',
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_menu_per_restaurant UNIQUE (restaurant_id, name)
);

-- Tabla: categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_category_per_restaurant UNIQUE (restaurant_id, name)
);

-- Tabla: products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para users
CREATE UNIQUE INDEX idx_users_email_lower ON users (LOWER(email));
CREATE INDEX idx_users_phone ON users (phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_users_created_at ON users (created_at);

-- Índices para plans
CREATE INDEX idx_plans_is_active ON plans (is_active) WHERE is_active = true;
CREATE INDEX idx_plans_created_at ON plans (created_at);

-- Índices para templates
CREATE INDEX idx_templates_plan_id ON templates (plan_id);
CREATE INDEX idx_templates_is_active ON templates (is_active) WHERE is_active = true;
CREATE INDEX idx_templates_created_at ON templates (created_at);

-- Índices para restaurants
CREATE INDEX idx_restaurants_owner_id ON restaurants (owner_id);
CREATE INDEX idx_restaurants_plan_id ON restaurants (plan_id) WHERE plan_id IS NOT NULL;
CREATE INDEX idx_restaurants_template_id ON restaurants (template_id) WHERE template_id IS NOT NULL;
CREATE INDEX idx_restaurants_slug ON restaurants (slug);
CREATE INDEX idx_restaurants_is_active ON restaurants (is_active) WHERE is_active = true;
CREATE INDEX idx_restaurants_created_at ON restaurants (created_at);

-- Índices para restaurant_settings
CREATE INDEX idx_restaurant_settings_restaurant_id ON restaurant_settings (restaurant_id);
CREATE INDEX idx_restaurant_settings_whatsapp_config ON restaurant_settings USING GIN (whatsapp_config);
CREATE INDEX idx_restaurant_settings_display_config ON restaurant_settings USING GIN (display_config);

-- Índices para menus
CREATE INDEX idx_menus_restaurant_id ON menus (restaurant_id);
CREATE INDEX idx_menus_is_active ON menus (is_active) WHERE is_active = true;
CREATE INDEX idx_menus_display_order ON menus (restaurant_id, display_order);
CREATE INDEX idx_menus_created_at ON menus (created_at);

-- Índices para categories
CREATE INDEX idx_categories_restaurant_id ON categories (restaurant_id);
CREATE INDEX idx_categories_menu_id ON categories (menu_id) WHERE menu_id IS NOT NULL;
CREATE INDEX idx_categories_name ON categories USING GIN (name gin_trgm_ops);
CREATE INDEX idx_categories_is_active ON categories (is_active) WHERE is_active = true;
CREATE INDEX idx_categories_display_order ON categories (restaurant_id, display_order);
CREATE INDEX idx_categories_created_at ON categories (created_at);

-- Índices para products
CREATE INDEX idx_products_restaurant_id ON products (restaurant_id);
CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_name ON products USING GIN (name gin_trgm_ops);
CREATE INDEX idx_products_is_available ON products (is_available) WHERE is_available = true;
CREATE INDEX idx_products_display_order ON products (category_id, display_order);
CREATE INDEX idx_products_price ON products (price);
CREATE INDEX idx_products_created_at ON products (created_at);

-- 1. Crear un usuario
INSERT INTO users (firebase_uid, email, display_name, created_at, updated_at)
VALUES ('df47R6nUfYUgXnQFZ4FjLsA1vq12', 'alejandroleonpedro7@gmail.com', 'Admin', now(), now());

-- 2. Crear un restaurante
INSERT INTO restaurants (id, name, slug, owner_id, created_at, updated_at)
VALUES (gen_random_uuid(), 'Mi Restaurante', 'mi-restaurante', 
        (SELECT id FROM users LIMIT 1), now(), now());

-- 3. Crear un menú
INSERT INTO menus (id, restaurant_id, name, created_at, updated_at)
VALUES (gen_random_uuid(), (SELECT id FROM restaurants LIMIT 1), 
        'Menú Principal', now(), now());

-- 4. Crear una categoría
INSERT INTO categories (id, restaurant_id, menu_id, name, created_at, updated_at)
VALUES (gen_random_uuid(), (SELECT id FROM restaurants LIMIT 1), 
        (SELECT id FROM menus LIMIT 1), 'Bebidas Calientes', now(), now());

-- 5. Crear un producto
INSERT INTO products (id, restaurant_id, category_id, name, price, created_at, updated_at)
VALUES (gen_random_uuid(), (SELECT id FROM restaurants LIMIT 1), 
        (SELECT id FROM categories LIMIT 1), 'Café Americano', 12.50, now(), now());

SELECT 
    u.email,
    r.name AS restaurant_name,
    m.name AS menu_name,
    c.name AS category_name,
    p.name AS product_name,
    p.price
FROM users u
JOIN restaurants r ON r.owner_id = u.id
JOIN menus m ON m.restaurant_id = r.id
JOIN categories c ON c.menu_id = m.id
JOIN products p ON p.category_id = c.id;

SELECT * FROM users;
SELECT * FROM restaurants;
SELECT * FROM menus;
SELECT * FROM categories;
SELECT * FROM products;

SELECT json_build_object(
  'user', u,
  'restaurants', json_agg(
    json_build_object(
      'restaurant', r,
      'settings', rs,
      'plan', pl,
      'template', t,
      'menus', (
        SELECT json_agg(
          json_build_object(
            'menu', m,
            'categories', (
              SELECT json_agg(
                json_build_object(
                  'category', c,
                  'products', (
                    SELECT json_agg(p)
                    FROM products p
                    WHERE p.category_id = c.id
                  )
                )
              )
              FROM categories c
              WHERE c.menu_id = m.id
            )
          )
        )
        FROM menus m
        WHERE m.restaurant_id = r.id
      )
    )
  )
) AS full_data
FROM users u
LEFT JOIN restaurants r ON r.owner_id = u.id
LEFT JOIN restaurant_settings rs ON rs.restaurant_id = r.id
LEFT JOIN plans pl ON r.plan_id = pl.id
LEFT JOIN templates t ON r.template_id = t.id
GROUP BY u.id;



