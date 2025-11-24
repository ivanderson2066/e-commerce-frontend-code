// Database Schema Definition - Use com Supabase, Neon ou PlanetScale

export const databaseSchema = {
  // Tabela de usuários
  users: {
    id: "uuid PRIMARY KEY",
    email: "varchar UNIQUE NOT NULL",
    password_hash: "varchar NOT NULL",
    name: "varchar NOT NULL",
    cpf: "varchar",
    role: "enum('customer', 'admin') DEFAULT 'customer'",
    avatar_url: "text",
    created_at: "timestamp DEFAULT now()",
    updated_at: "timestamp DEFAULT now()"
  },

  // Tabela de produtos
  products: {
    id: "uuid PRIMARY KEY",
    name: "varchar NOT NULL",
    slug: "varchar UNIQUE NOT NULL",
    description: "text",
    price: "decimal(10,2) NOT NULL",
    original_price: "decimal(10,2)",
    category: "varchar NOT NULL",
    images: "text[] NOT NULL",
    stock: "integer DEFAULT 0",
    featured: "boolean DEFAULT false",
    sku: "varchar UNIQUE",
    rating: "decimal(3,2)",
    reviews_count: "integer DEFAULT 0",
    created_at: "timestamp DEFAULT now()",
    updated_at: "timestamp DEFAULT now()"
  },

  // Tabela de pedidos
  orders: {
    id: "uuid PRIMARY KEY",
    user_id: "uuid NOT NULL REFERENCES users(id)",
    order_number: "varchar UNIQUE NOT NULL",
    items: "jsonb NOT NULL",
    subtotal: "decimal(10,2) NOT NULL",
    shipping_price: "decimal(10,2) NOT NULL",
    total: "decimal(10,2) NOT NULL",
    status: "enum('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending'",
    shipping_address: "jsonb",
    billing_address: "jsonb",
    payment_method: "varchar",
    payment_id: "varchar",
    tracking_number: "varchar",
    notes: "text",
    created_at: "timestamp DEFAULT now()",
    updated_at: "timestamp DEFAULT now()"
  },

  // Tabela de favoritos
  favorites: {
    id: "uuid PRIMARY KEY",
    user_id: "uuid NOT NULL REFERENCES users(id)",
    product_id: "uuid NOT NULL REFERENCES products(id)",
    created_at: "timestamp DEFAULT now()",
    constraint: "UNIQUE(user_id, product_id)"
  },

  // Tabela de reviews
  reviews: {
    id: "uuid PRIMARY KEY",
    product_id: "uuid NOT NULL REFERENCES products(id)",
    user_id: "uuid NOT NULL REFERENCES users(id)",
    rating: "integer NOT NULL CHECK (rating >= 1 AND rating <= 5)",
    comment: "text",
    created_at: "timestamp DEFAULT now()",
    updated_at: "timestamp DEFAULT now()"
  },

  // Tabela de cupons
  coupons: {
    id: "uuid PRIMARY KEY",
    code: "varchar UNIQUE NOT NULL",
    discount_percentage: "decimal(5,2)",
    discount_amount: "decimal(10,2)",
    valid_from: "timestamp",
    valid_until: "timestamp",
    min_purchase: "decimal(10,2)",
    max_uses: "integer",
    current_uses: "integer DEFAULT 0",
    active: "boolean DEFAULT true",
    created_at: "timestamp DEFAULT now()"
  }
};

// Índices recomendados para performance
export const indexes = [
  "CREATE INDEX idx_products_category ON products(category);",
  "CREATE INDEX idx_products_featured ON products(featured);",
  "CREATE INDEX idx_orders_user_id ON orders(user_id);",
  "CREATE INDEX idx_orders_status ON orders(status);",
  "CREATE INDEX idx_reviews_product_id ON reviews(product_id);",
  "CREATE INDEX idx_favorites_user_id ON favorites(user_id);",
];
