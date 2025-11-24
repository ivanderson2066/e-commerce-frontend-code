# Teste local de webhooks Mercado Pago com ngrok (sandbox)

Este passo-a-passo assume que sua app roda em `http://localhost:3000` e que você tenha os arquivos e rotas implementadas (`/api/mercado-pago/webhook`, `/api/mercado-pago/create-preference`, `/api/mercado-pago/status`).

1) Preparar variáveis de ambiente
- Copie `.env.example` para `.env.local` e preencha:
  - `NEXT_PUBLIC_APP_URL=http://localhost:3000`
  - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (cliente)
  - `SUPABASE_SERVICE_ROLE_KEY` (server)
  - `MERCADO_PAGO_ACCESS_TOKEN` (server sandbox)
  - `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` (opcional)
  - `MERCADO_PAGO_WEBHOOK_SECRET` (escolha um segredo e use-o no painel Mercado Pago ao cadastrar webhook)

2) Instalar dependências e rodar a app
```powershell
# instalar node modules (caso ainda não tenha)
npm install
# caso haja conflito de peer-deps:
npm install --legacy-peer-deps

# limpar cache do next e rodar
Remove-Item -Recurse -Force .next
npm run dev
```

3) Iniciar ngrok e expor a URL
- Se não tem ngrok, baixe de https://ngrok.com/
```powershell
# iniciar ngrok apontando para sua porta (3000)
ngrok http 3000
```
- Copie a URL HTTPS fornecida por ngrok (ex.: `https://abcd-1234.ngrok.io`).

4) Configurar webhook no painel do Mercado Pago (sandbox)
- Acesse sua conta Mercado Pago (sandbox) → `Developers` → `Webhooks`.
- Adicione o webhook apontando para:
  `https://<SEU_NGROK>/api/mercado-pago/webhook`
- Configure o `MERCADO_PAGO_WEBHOOK_SECRET` nesse cadastro (o mesmo que você colocou em `.env.local`).

5) Criar uma preferência de teste
- Faça checkout na sua app local e complete o fluxo (o endpoint `/api/mercado-pago/create-preference` irá criar um pedido e retornar `preference.init_point`).
- Finalize o pagamento no ambiente sandbox (use os cartões/simuladores do Mercado Pago sandbox).

6) Verificar logs e Supabase
- Ao pagar, Mercado Pago deverá disparar o webhook para o ngrok URL. Você verá as requisições no terminal do ngrok e no console do Next (onde `npm run dev` roda).
- Verifique na tabela `orders` do Supabase se o pedido foi atualizado com `payment_id` e `status`.

7) Debug comum
- Se webhook não aparece no server local:
  - Confira se a URL configurada no Mercado Pago está correta e usa `https`.
  - Confira se `MERCADO_PAGO_WEBHOOK_SECRET` confere com o header de assinatura (o código atual espera HMAC SHA256 hex). Ajuste `lib/mercado-pago-config.ts` se Mercado Pago enviar base64.
  - Use o inspector do ngrok (http://127.0.0.1:4040) para ver detalhes da requisição.

8) Passos opcionais (recomendo)
- Habilitar logs detalhados temporariamente no `webhook/route.ts` para imprimir `request.headers` e `rawBody` quando debugar assinaturas.
- Criar uma pequena rota admin para reprocessar notificações manualmente para testes.

Se quiser, eu posso gerar um `scripts/test-webhook.ps1` que:
- Verifica se `npm install` foi executado,
- Roda `npm run dev` em background,
- Inicia `ngrok http 3000` (se você tiver ngrok na PATH),
- Imprime a URL para você copiar no painel do Mercado Pago.

Precisa que eu crie esse script? Se sim, confirmo e crio o `scripts/test-webhook.ps1` no repositório.
