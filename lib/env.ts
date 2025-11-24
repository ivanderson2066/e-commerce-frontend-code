// lib/env.ts
// Centraliza e tipa variáveis de ambiente.
// ⚠️ ATENÇÃO: Este arquivo contém chaves sensíveis hardcoded para facilitar o teste local.
// NÃO COMITE ESTE ARQUIVO COM AS CHAVES REAIS EM REPOSITÓRIOS PÚBLICOS.

export const CLIENT = {
  // URL do projeto Supabase
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nxiimjpdzhpwidguhkdy.supabase.co',
  
  // Chave Anônima (Pública) do Supabase
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54aWltanBkemhwd2lkZ3Voa2R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0ODk4MDYsImV4cCI6MjA3NzA2NTgwNn0.6kAdVp648xUbyBRGlP1XGDDyC7_L_Rgf9Mo4Z9Qg9ac',
  
  // Chave Pública do Mercado Pago
  NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY: process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY || 'APP_USR-a606c4aa-f10a-45dc-835c-c68e81cb592e',
  
  // URL da Aplicação
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};

export const SERVER = {
  // 🔴 SEGREDO: Chave de Serviço do Supabase (Admin) - NUNCA EXPOR NO CLIENTE
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54aWltanBkemhwd2lkZ3Voa2R5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ4OTgwNiwiZXhwIjoyMDc3MDY1ODA2fQ.2Vu5DOmCS8KMwxHtQ5Ax0Hfn5ODwBpo32h9LV5HS1pY',
  
  // 🔴 SEGREDO: Token de Acesso do Mercado Pago (Servidor)
  MERCADO_PAGO_ACCESS_TOKEN: process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-2637236821869288-111821-c2f5b0006a3186f5293a2768a24e4799-2059339906',
  
  // Segredo do Webhook (opcional por enquanto, se vazio a validação falhará silenciosamente ou deve ser desativada)
  MERCADO_PAGO_WEBHOOK_SECRET: process.env.MERCADO_PAGO_WEBHOOK_SECRET || '89c36d4558aaa0f0c6a9e2c9359241035e82311a9b17ee55723f59c9fb7cc73a',
  
  // NextAuth Secret (opcional se não estiver usando NextAuth.js diretamente)
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
};

export function validateServerEnv(): void {
  const missing: string[] = [];
  // Verifica se as chaves críticas do servidor estão presentes (seja por env var ou hardcoded acima)
  if (!SERVER.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!SERVER.MERCADO_PAGO_ACCESS_TOKEN) missing.push('MERCADO_PAGO_ACCESS_TOKEN');

  if (missing.length > 0) {
    const msg = `Missing required server env vars: ${missing.join(', ')}`;
    console.error(msg);
    // throw new Error(msg); // Descomente para forçar erro em build se faltar config
  }
}

export default { CLIENT, SERVER, validateServerEnv };