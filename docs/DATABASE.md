# Banco de dados — Empório Padox (Supabase)

Schema da Fase 2. Os arquivos SQL estão prontos para rodar; o app ainda **não**
lê do banco (as telas continuam no `lib/mock-data.ts` até a etapa de wiring).

## Arquivos

| Arquivo | Conteúdo |
| --- | --- |
| `supabase/migrations/20260829120000_init.sql` | extensões, enums, tabelas, índices, funções, triggers, RLS e o bucket de Storage |
| `supabase/seed.sql` | 12 vinhos + 6 pedidos de demonstração (portados do mock) |
| `types/database.ts` | tipos TypeScript do schema (feitos à mão; regeráveis com `npm run db:types`) |
| `lib/supabase/{client,server,admin}.ts` | clientes Supabase (browser / servidor com sessão / service role) |
| `.env.example` | modelo das variáveis; copie para `.env.local` |

## Modelo

```
products ──< product_images
products ──< order_items >── orders ──< order_events
auth.users ──1:1── admin_users
```

- **products** — catálogo. `is_active` controla a visibilidade na loja;
  `stock_qty` / `low_stock_threshold` para o alerta de estoque. Preço em centavos.
- **product_images** — 0..N fotos por produto, no bucket `product-photos`.
- **orders** — checkout como convidado: nome, e-mail, CPF e endereço são colunas
  no próprio pedido (sem tabela de clientes). `reference` (`EP-1001`, `EP-1002`…)
  é gerada por trigger a partir de uma sequência.
- **order_items** — linha desnormalizada (nome, produtor, safra e preço unitário
  ficam gravados no item, então o histórico não muda se o produto mudar).
- **order_events** — trilha de status. Um evento `recebido` é criado
  automaticamente ao inserir o pedido (trigger `trg_orders_after_insert`).
- **admin_users** — quem enxerga o painel. O primeiro registro entra à mão.

### Enums

- `wine_type`: `tinto | branco | rosé | espumante | laranja`
- `order_status`: `recebido | pago | separado | despachado | entregue`

### Funções

| Função | Quem chama | O que faz |
| --- | --- | --- |
| `is_admin()` | RLS | `true` se `auth.uid()` está em `admin_users` |
| `advance_order_status(p_order_id, p_note)` | painel admin (usuário logado) | valida `is_admin()`, avança um passo no fluxo e grava o evento |
| `mark_order_paid(p_order_id, p_payment_ref)` | webhook do Mercado Pago (**service role**) | idempotente: marca `pago`, grava evento e baixa o estoque dos itens |

## Como aplicar

Não há Docker nesta máquina, então o desenvolvimento local do Supabase
(`supabase start`) não roda — use um **projeto na nuvem** (`wine-ecommerce`).

### Opção A — SQL Editor (mais simples)

1. No painel do Supabase → **SQL Editor**.
2. Cole `supabase/migrations/20260829120000_init.sql` inteiro e **Run**.
3. Cole `supabase/seed.sql` e **Run** (opcional, só dados de exemplo).

### Opção B — Supabase CLI

```bash
npx supabase init            # cria supabase/config.toml (só na 1ª vez)
npx supabase login
npx supabase link --project-ref SEU_REF
npm run db:push              # aplica as migrations
npm run db:types             # regenera types/database.ts a partir do banco
```

O `seed.sql` roda automaticamente em `npx supabase db reset` (destrói e recria).

## Variáveis de ambiente

Painel → **Project Settings → API**. Copie para `.env.local`:

| Variável | Onde |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` `secret` — **só no servidor**, nunca com prefixo `NEXT_PUBLIC_` |

## Primeiro admin

Crie o usuário em **Authentication → Users** (ou por signup) e rode:

```sql
insert into public.admin_users (user_id, email)
select id, email from auth.users where email = 'voce@exemplo.com'
on conflict (user_id) do nothing;
```

## Segurança (RLS)

- **products / product_images**: leitura pública só dos registros ativos;
  qualquer escrita exige `is_admin()`.
- **orders / order_items / order_events**: **nenhum** acesso anônimo. Só admin
  via API. Nada de PII exposto.
- **Criação de pedido no checkout**: acontece no servidor com a
  `SUPABASE_SERVICE_ROLE_KEY` (`lib/supabase/admin.ts`), que ignora RLS. O
  cliente nunca insere pedido direto.
- **Storage** `product-photos`: leitura pública; upload/alteração/remoção só admin.

## Estado do wiring

Feito:

- `proxy.ts` (middleware do Next 16) protege `/admin/*`; login real via Supabase
  Auth (`app/admin/login`), gate por `admin_users` em `lib/auth.ts` → `requireAdmin`.
- Loja e painel leem do banco: `lib/data/{wines,orders,map}.ts` mapeiam
  `snake_case` → `types/index.ts`. `lib/mock-data.ts` foi removido.
- `POST /api/checkout` cria o pedido com a service role e devolve `orderId`.
- `advance_order_status` (painel) e `mark_order_paid` (webhook) plugados;
  `mark_order_paid` testado — baixa estoque e é idempotente.
- Upload de foto no `ProductForm` grava no bucket `product-photos` e em
  `product_images`.

Falta:

1. **Mercado Pago**: em `/api/checkout`, criar a *preference* e retornar
   `init_point`; o checkout passa a redirecionar pra lá em vez de ir direto pra
   `/pedido/[id]`.
2. `POST /api/webhooks/mercadopago` → valida a notificação e chama
   `mark_order_paid`.
3. E-mail transacional a cada mudança de status (Resend).

## Limpar o banco

`supabase/clean.sql` apaga todos os produtos e pedidos (mantém schema, funções,
RLS e `admin_users`), troca o prefixo da referência para `EP-` e reinicia a
numeração em `EP-1001`. Rode no SQL Editor — pode rodar de novo quando quiser.

> Se você já tinha rodado o `seed.sql` de demonstração, rode o `clean.sql` uma
> vez para zerar antes de cadastrar os produtos de verdade no painel.
