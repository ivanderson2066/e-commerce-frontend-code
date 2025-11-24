// API Endpoints Documentation - Ready for backend implementation

export const apiEndpoints = {
  // Auth
  auth: {
    login: "POST /api/auth/login",
    register: "POST /api/auth/register",
    logout: "POST /api/auth/logout",
    refreshToken: "POST /api/auth/refresh",
    currentUser: "GET /api/auth/me"
  },

  // Products
  products: {
    list: "GET /api/products",
    getById: "GET /api/products/:id",
    search: "GET /api/products/search?q=:query",
    byCategory: "GET /api/products?category=:slug",
    featured: "GET /api/products?featured=true"
  },

  // Cart
  cart: {
    get: "GET /api/cart",
    addItem: "POST /api/cart/items",
    updateItem: "PUT /api/cart/items/:id",
    removeItem: "DELETE /api/cart/items/:id",
    clear: "DELETE /api/cart"
  },

  // Orders
  orders: {
    create: "POST /api/orders",
    list: "GET /api/orders",
    getById: "GET /api/orders/:id",
    cancel: "POST /api/orders/:id/cancel",
    track: "GET /api/orders/:id/track"
  },

  // Checkout
  checkout: {
    createSession: "POST /api/checkout/session",
    validateCoupon: "POST /api/checkout/validate-coupon",
    calculateShipping: "POST /api/checkout/shipping",
    processPayment: "POST /api/checkout/payment"
  },

  // Admin
  admin: {
    products: {
      create: "POST /api/admin/products",
      update: "PUT /api/admin/products/:id",
      delete: "DELETE /api/admin/products/:id",
      list: "GET /api/admin/products"
    },
    orders: {
      list: "GET /api/admin/orders",
      updateStatus: "PUT /api/admin/orders/:id/status"
    },
    users: {
      list: "GET /api/admin/users",
      updateRole: "PUT /api/admin/users/:id/role"
    }
  }
};
