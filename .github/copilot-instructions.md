# Instruções rápidas para agentes de código (Caiçara e-commerce)

Resumo curto
- Projeto: frontend Next.js (App Router) para um e‑commerce (página, checkout, admin, account).
- Stack: Next.js 16, React 19, TailwindCSS v4, shadcn/ui, context API para estado (cart/auth/shipping).

O que é importante saber (arquitetura)
- App Router: a root layout (`app/layout.tsx`) monta providers em ordem: AuthProvider -> CartProvider -> ShippingProvider.
  - Arquivo chave: `app/layout.tsx`.
- React Contexts persistem em `localStorage`: `lib/cart-context.tsx`, `lib/auth-context.tsx`, `lib/shipping-context.tsx`.
  - Cart persistence é feita por hooks em `cart-context.tsx` (leitura/escrita em `localStorage`).
- Pagamentos são simulados no frontend em `lib/payment-utils.ts` com hooks prontos para integrar Mercado Pago / Stripe.
- Rotas de API Next (serverless) estão em `app/api/mercado-pago/*/route.ts` (create-preference, status, webhook).

Como rodar e comandos úteis
- Instalação: `npm install` (o projeto tem `pnpm-lock.yaml`, mas `package.json` usa scripts compatíveis npm/pnpm).
- Desenvolvimento: `npm run dev` (abre em http://localhost:3000)
- Build: `npm run build` / Start (produção): `npm run start`
- Lint: `npm run lint`

Padrões e convenções do repositório
- App Router + server/client: componentes que usam estado/hooks do browser têm `"use client"` (ex.: `app/page.tsx`, contexts em `lib/` são clientes).
- Componentes reutilizáveis ficam em `components/ui/*` e `components/layout/*`. Preferir essas APIs para UI consistente.
- Dados 'fakes' e catálogos: `lib/data.ts` (usar como fonte local para desenvolvimento).
- Nomes de rotas dinâmicas: usar diretórios `[slug]` em `app/` (ex.: `app/category/[slug]/page.tsx`).

Regras práticas para alterações
- Ao mudar providers ou ordem de wrappers, atualize `app/layout.tsx` — mudança impacta toda a app.
- Para adicionar métodos de pagamento, estenda `lib/payment-utils.ts` e as rotas em `app/api/mercado-pago/`.
- Para persistência do carrinho, mantenha compatibilidade com o shape definido em `lib/cart-context.tsx` (CartItem = Product + quantity).

Integrações e variáveis de ambiente
- Variáveis relevantes (ver `README.md`): STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY, SUPABASE_URL/KEY, NEXTAUTH_SECRET, DATABASE_URL.
- Deploy: Vercel (ver `DEPLOYMENT.md`). Webhooks e rotas de pagamento são tratadas em `app/api/mercado-pago/webhook/route.ts`.

Exemplos rápidos (como o código real usa)
- Usar o contexto do carrinho:
  - `const { addItem, items, totalPrice } = useCart();` — definido em `lib/cart-context.tsx`.
- Verificar autenticação:
  - `const { user, login, logout } = useAuth();` — definido em `lib/auth-context.tsx`.

Onde olhar primeiro (arquivos essenciais)
- `app/layout.tsx` — providers e layout global
- `lib/cart-context.tsx`, `lib/auth-context.tsx`, `lib/shipping-context.tsx` — fluxos de estado
- `lib/payment-utils.ts` — implementação de pagamento (simulada)
- `app/api/mercado-pago/*/route.ts` — exemplos de integração serverless
- `components/ui/*` e `components/layout/*` — padrões de UI (shadcn)

Notas finais
- Não invente infraestrutura: documente e estenda as rotas de API existentes em `app/api/` em vez de criar endpoints arbitrários.
- Prefira mudanças pequenas e testáveis: altere providers, rode `npm run dev` e teste flows (login, adicionar ao carrinho, checkout) manualmente.

Se algo estiver faltando ou impreciso, diga qual parte você quer que eu amplie (ex.: contratação de Stripe, testes, ou rotas API específicas).
