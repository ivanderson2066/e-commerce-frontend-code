// Barrel exports para `lib/` — facilita imports centralizados
export * from './data';
export * from './payment-utils';
export * from './mercado-pago-config';
export * from './env';
export * from './utils';
export { getSupabaseAdmin } from './supabase-server';
export { AuthProvider, useAuth } from './auth-context';
export { CartProvider, useCart } from './cart-context';
export { ShippingProvider, useShipping } from './shipping-context';
