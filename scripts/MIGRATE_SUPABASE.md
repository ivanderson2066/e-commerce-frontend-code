# Como aplicar a migração `supabase/migrations/001_create_orders.sql`

Este guia mostra três formas seguras de aplicar a migração `supabase/migrations/001_create_orders.sql` ao seu projeto Supabase:

Opção A — (GUI) SQL Editor (recomendada, simples)
1. Abra o painel do Supabase (https://app.supabase.com) e entre no seu projeto.
2. Vá em `SQL` -> `Editor` (SQL Editor).
3. Abra o arquivo `supabase/migrations/001_create_orders.sql` no seu editor local e copie o conteúdo.
4. Cole no SQL Editor do Supabase e clique em `RUN`.
5. Verifique a saída e confirme que a tabela `orders` foi criada.

Opção B — (CLI) usando `supabase` CLI
Prerequisitos:
- Node.js + npm
- Supabase CLI instalado globalmente: `npm install -g supabase` (ou siga as instruções oficiais)

Passos:
```powershell
# instalar supabase CLI (se não tiver)
npm install -g supabase

# login no Supabase (abre navegador)
supabase login

# vincular o projeto local (troque <PROJECT_REF> pelo ref do seu projeto)
supabase link --project-ref <PROJECT_REF>

# aplicar migrations locais para o banco remoto
supabase db push
```
Explicação: o comando `supabase db push` aplica as migrations existentes na pasta `supabase/migrations` ao banco remoto vinculado.

Opção C — (SQL via psql) usando `DATABASE_URL`
Se você tem a `DATABASE_URL` (Postgres) do Supabase e `psql` instalado:
```powershell
# Exemplo: execute o SQL diretamente usando psql
$env:DATABASE_URL = "postgres://user:pass@host:5432/dbname"
psql $env:DATABASE_URL -f supabase/migrations/001_create_orders.sql
```

Verificações após a migração
- No painel Supabase, vá em `Table Editor` e confira se a tabela `orders` existe e as colunas estão corretas.
- Faça um teste simples de inserção via SQL Editor ou via seu endpoint `/api/mercado-pago/create-preference`.

Nota sobre `preference_id` vs `payment_id`
- Recomendado: adicionar `preference_id` (varchar) para salvar o id da preferência MP, e deixar `payment_id` para o id do pagamento quando confirmado no webhook. Posso aplicar esse patch no projeto se quiser.

Se quiser que eu tente aplicar a migração automaticamente (usando supabase CLI) a partir deste ambiente, autorize explicitamente e me forneça o `PROJECT_REF` ou credenciais necessárias. Caso contrário, execute os passos acima localmente.
