# 🌿 Caiçara - E-commerce de Cosméticos Naturais

Plataforma de e-commerce moderna construída com Next.js, TailwindCSS e arquitetura pronta para produção.

## ✨ Características

- ✅ **Homepage Responsiva** com carousel de promoções
- ✅ **Busca em Tempo Real** de produtos
- ✅ **Carrinho Persistente** com localStorage
- ✅ **Checkout com Frete Dinâmico** (calculado por CEP)
- ✅ **Pagamento** com Cartão e PIX
- ✅ **Autenticação Completa** (Login/Cadastro)
- ✅ **Painel do Usuário** com histórico de pedidos
- ✅ **Painel Administrativo** com gerenciamento de produtos e pedidos
- ✅ **Design Profissional** e Premium
- ✅ **Mobile-First** e totalmente responsivo

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: TailwindCSS v4
- **Components**: shadcn/ui
- **State**: React Context API
- **Storage**: localStorage (pronto para integração com Supabase)
- **Icons**: Lucide React
- **Deployment**: Vercel

## 🚀 Quick Start

### 1. Clonar o repositório
\`\`\`bash
git clone <seu-repo>
cd caiçara-ecommerce
\`\`\`

### 2. Instalar dependências
\`\`\`bash
npm install
\`\`\`

### 3. Configurar variáveis de ambiente
\`\`\`bash
cp .env.example .env.local
\`\`\`

### 4. Rodar em desenvolvimento
\`\`\`bash
npm run dev
\`\`\`

Acesse http://localhost:3000

## ⚙️ Configuração de Ambiente (consolidado)

1. Copie o exemplo e crie seu arquivo local (NÃO comite este arquivo):

```bash
cp .env.example .env.local
```

2. Preencha as chaves em `.env.local`. Variáveis importantes:

```env
# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# MERCADO PAGO
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=
MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_WEBHOOK_SECRET=

# APP
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Cheque rapidamente se as variáveis essenciais estão definidas:

```bash
npm run check:env
```

4. Segurança e boas práticas:

- Mantenha chaves sensíveis (ex.: `SUPABASE_SERVICE_ROLE_KEY`, `MERCADO_PAGO_ACCESS_TOKEN`) apenas em ambiente servidor (Vercel Secrets, Cloud Provider).
- Nunca comite `.env.local` para o repositório.


## 📁 Estrutura do Projeto

\`\`\`
├── app/
│   ├── page.tsx                 # Homepage
│   ├── layout.tsx              # Layout raiz
│   ├── globals.css             # Estilos globais
│   ├── login/                  # Página de login
│   ├── register/               # Página de cadastro
│   ├── checkout/               # Página de checkout
│   ├── account/                # Painel do usuário
│   ├── admin/                  # Painel administrativo
│   ├── category/[slug]/        # Página de categorias
│   └── product/[slug]/         # Página de produto
├── components/
│   ├── layout/                 # Navbar e Footer
│   ├── ui/                     # ProductCard, Button, etc
│   ├── cart/                   # CartSheet, AddToCartButton
│   └── search/                 # SearchModal
├── lib/
│   ├── data.ts                 # Dados de produtos e categorias
│   ├── auth-context.tsx        # Contexto de autenticação
│   ├── cart-context.tsx        # Contexto do carrinho
│   ├── payment-utils.ts        # Utilitários de pagamento
│   └── shipping-context.tsx    # Contexto de frete
└── public/                     # Imagens e assets
\`\`\`

## 🔐 Autenticação

Sistema de autenticação simulado pronto para integração:

\`\`\`typescript
// Login
const { user, login } = useAuth();
login(email, password);

// Verificar se logado
if (user) { /* mostrar painel */ }

// Admin check
if (user?.role === "admin") { /* mostrar admin */ }
\`\`\`

## 💳 Sistema de Pagamento

Dois métodos suportados:

- **Cartão de Crédito**: Simulado com validação de formato
- **PIX**: Com QR Code simulado e chave aleatória

Integração com Stripe pronta em `lib/payment-utils.ts`

## 🛒 Carrinho de Compras

\`\`\`typescript
const { addItem, removeItem, updateQuantity, items, totalPrice } = useCart();

addItem(product, quantidade);
removeItem(productId);
updateQuantity(productId, novaQuantidade);
\`\`\`

## 📦 Frete Dinâmico

Calcule frete por CEP:

\`\`\`typescript
const { calculateShipping } = useShipping();
const options = calculateShipping("01310100", totalPrice);
// Retorna: Econômica, Padrão, Express com prazos e preços
\`\`\`

## 🔗 Integrações Recomendadas

### Banco de Dados
- Supabase (PostgreSQL)
- Neon (PostgreSQL serverless)

### Pagamentos
- Stripe (Cartão + Boleto)
- Mercado Pago (PIX)

### Email
- SendGrid
- Resend

### Storage
- Vercel Blob (imagens)

### Analytics
- Vercel Analytics

## 📝 Variáveis de Ambiente

\`\`\`env
# Database
DATABASE_URL=
SUPABASE_URL=
SUPABASE_KEY=

# Payment
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Mercado Pago
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=
MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe (opcional)
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

### Migrações
Crie a tabela `orders` no seu banco (ex.: Supabase). Um arquivo de migração de exemplo foi adicionado em `supabase/migrations/001_create_orders.sql`.

### Testes locais de webhook
Para testar webhooks do Mercado Pago em desenvolvimento, exponha sua aplicação local com ngrok e registre a URL `https://<token>.ngrok.io/api/mercado-pago/webhook` no painel do Mercado Pago. Use as credenciais de sandbox.
\`\`\`

## 🚀 Deploy na Vercel

1. Push para GitHub
2. Vá para vercel.com e importe o repositório
3. Configure variáveis de ambiente
4. Deploy automático em push para main

Ver `DEPLOYMENT.md` para instruções detalhadas.

## 📱 Responsividade

- ✅ Mobile (< 640px)
- ✅ Tablet (640px - 1024px)
- ✅ Desktop (> 1024px)

## 🎨 Tema Caiçara

Cores principais:
- **Verde Primário**: `#166534` (emerald-700)
- **Branco**: `#ffffff`
- **Cinza Neutro**: `#6b7280`

## 📄 Licença

MIT

## 🤝 Contribuindo

Pull requests são bem-vindos! 

## 📞 Suporte

- Documentação: `/docs`
- Issues: GitHub Issues
- Email: suporte@caicara.com.br

---

**Pronto para produção e integração com serviços reais!** 🚀
