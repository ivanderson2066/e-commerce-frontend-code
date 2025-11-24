# Guia de Boas Práticas de Código — Projeto Caiçara (PT-BR)

Este documento reúne convenções e práticas recomendadas para manter o código claro, testável e fácil de manter.

1) Idioma e comentários
- Código e identificadores: manter em inglês quando for API/terceiros; usar PT-BR para comentários e README do projeto (já padronizado aqui).
- Mensagens apresentadas ao usuário, documentação e commit messages primários: PT-BR.

2) Estrutura de pastas
- `app/` (Next.js App Router) — páginas e layouts.
- `components/` — UI reutilizável; preferir componentes pequenos e compostos.
- `lib/` — lógica de negócio, hooks e helpers.
- `scripts/` — utilitários e scripts de dev (migrations, check-env, etc.).

3) Tipagem e segurança
- TypeScript obrigatório para todo código novo.
- Evitar `any`; definir interfaces claras para `Product`, `Order`, `CartItem`, `ShippingAddress`.

4) Formatação e lint
- Usar Prettier para formatação e ESLint (com rules do TypeScript e React) para qualidade.
- Scripts sugeridos: `npm run lint`, `npm run format`.

5) Commits e PRs
- Commits pequenos e focados; usar mensagens descritivas em PT-BR.
- Abrir PRs com descrição do que foi alterado e como testar.

6) Segurança
- Nunca comitar `.env.local` ou chaves sensíveis.
- Validar entradas no servidor (não confiar no cliente).

7) Testes e CI
- Adicionar testes unitários para utilitários críticos e endpoints (opcional).
- CI mínimo: rodar `npx tsc --noEmit`, `npm run lint`, `npm run check:env`.

8) Exemplo de tipos úteis (em `lib/types.ts` recomendado)
- `Product`, `CartItem`, `Order`, `ShippingAddress`.

Seguindo essas regras, o projeto se mantém coeso e fácil de manter por diferentes colaboradores.
