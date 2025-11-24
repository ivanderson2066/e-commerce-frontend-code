#!/usr/bin/env node
// scripts/check-env.js
// Checa variáveis de ambiente mínimas necessárias para rodar o backend.

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'MERCADO_PAGO_ACCESS_TOKEN',
  'NEXT_PUBLIC_APP_URL'
];

const missing = required.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error('[check-env] Variáveis faltando:', missing.join(', '));
  console.error('[check-env] Copie .env.example para .env.local e preencha as chaves.');
  process.exit(1);
} else {
  console.log('[check-env] Todas as variáveis essenciais estão definidas.');
}
