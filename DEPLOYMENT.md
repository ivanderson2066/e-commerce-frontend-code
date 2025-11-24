# Guia de Deploy - Caiçara E-commerce

## 📋 Pré-requisitos para Produção

### Integrations Necessárias (via Vercel Connect)
- [ ] **Banco de Dados**: Supabase, Neon, ou PlanetScale
- [ ] **Pagamentos**: Stripe
- [ ] **Autenticação**: Supabase Auth ou Auth.js
- [ ] **Storage**: Vercel Blob (para imagens de produtos)

## 🔧 Configuração de Variáveis de Ambiente

Adicione essas variáveis no Vercel Dashboard em **Settings > Environment Variables**:

### Database (Exemplo: Supabase)
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### Payment (Stripe)
\`\`\`
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
\`\`\`

### Payment (Mercado Pago)
```
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=your_public_key
MERCADO_PAGO_ACCESS_TOKEN=your_access_token
MERCADO_PAGO_WEBHOOK_SECRET=your_webhook_secret
```

### Authentication (Supabase)
\`\`\`
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

### Webhooks (Mercado Pago)

- Configure o webhook no painel do Mercado Pago apontando para:
   `https://<YOUR_DOMAIN>/api/mercado-pago/webhook`
- Defina `MERCADO_PAGO_WEBHOOK_SECRET` nas variáveis de ambiente em produção.
- Para testes locais, use ngrok: `ngrok http 3000` e registre `https://<token>.ngrok.io/api/mercado-pago/webhook`.
\`\`\`

## 🗄️ Estrutura do Banco de Dados

### Tabelas Necessárias

#### users
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- name (VARCHAR)
- role (ENUM: 'customer', 'admin')
- created_at (TIMESTAMP)

#### products
- id (UUID, PK)
- name (VARCHAR)
- description (TEXT)
- price (DECIMAL)
- category (VARCHAR)
- images (TEXT[])
- stock (INTEGER)
- featured (BOOLEAN)
- created_at (TIMESTAMP)

#### orders
- id (UUID, PK)
- user_id (UUID, FK)
- items (JSONB)
- total (DECIMAL)
- status (ENUM: 'pending', 'paid', 'shipped', 'delivered')
- shipping_address (JSONB)
- payment_method (VARCHAR)
- created_at (TIMESTAMP)

#### cart
- id (UUID, PK)
- user_id (UUID, FK)
- items (JSONB)
- created_at (TIMESTAMP)

## 🚀 Deploy Steps

1. **Push para GitHub**
   \`\`\`bash
   git add .
   git commit -m "Production ready"
   git push origin main
   \`\`\`

2. **Conectar no Vercel**
   - Acesse vercel.com
   - Import do repositório GitHub
   - Selecione o projeto

3. **Configurar Integrations**
   - Vá para Project Settings > Integrations
   - Conecte Supabase, Stripe, etc.
   - Variáveis de ambiente serão preenchidas automaticamente

4. **Executar Migrações do BD**
   - Scripts SQL estão em `/scripts`
   - Execute no console do seu provedor de BD

5. **Deploy**
   - Clique em "Deploy"
   - Vercel fará build automático

## ✅ Checklist Pré-Deploy

- [ ] Autenticação funcional (login/cadastro)
- [ ] Carrinho de compras persiste
- [ ] Checkout com cálculo de frete
- [ ] Pagamento integrado (Stripe/PIX)
- [ ] Painel admin funcional
- [ ] Emails de confirmação configurados
- [ ] 404 e error pages customizadas
- [ ] SEO básico (metadata, open graph)
- [ ] HTTPS habilitado
- [ ] Variáveis de ambiente produção configuradas

## 🔐 Segurança

- Never commit .env.local
- Use HTTPS em produção
- Valide dados no backend
- Implemente rate limiting
- Configure CORS corretamente

## 📞 Suporte

Para questões de deploy, visite: https://vercel.com/help
