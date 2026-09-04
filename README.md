# Empório Padox — e-commerce de vinhos

Loja de vinhos de produtor + painel administrativo. Loja e painel leem/gravam no
**Supabase**; o painel exige login. Falta a integração de pagamento (Mercado
Pago) — ver o fim deste arquivo.

**Setup**: copie `.env.example` para `.env.local` e preencha as chaves do
Supabase; aplique `supabase/` conforme [docs/DATABASE.md](docs/DATABASE.md).

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** (tokens em `app/globals.css`)
- **Radix UI** primitives (sem shadcn) · **lucide-react** · **motion**
- Estética "clean / claro": fundo branco levemente quente, texto quase preto,
  detalhes em vinho (`--color-oxblood`). Tipografia com voz: Fraunces (display) ·
  Newsreader (texto) · Mona Sans (UI). Fios de 1px no lugar de sombras.
- Ilustração de garrafa em SVG (`components/BottlePlate.tsx`) como fallback quando
  o produto não tem foto; o admin sobe fotos para o bucket `product-photos`.
- Tokens de cor em `app/globals.css` (`@theme`). Os nomes são legado: família
  `ink` = superfícies (claras), `bone` = texto (escuro), `oxblood`/`brass` = vinho.

### UX

- **Drawer de carrinho** (`components/loja/CartDrawer.tsx`) abre ao adicionar um
  item, com barra de progresso até o frete grátis.
- Catálogo: filtros colapsáveis no mobile + chips de filtro ativo removíveis
  (`ActiveFilters`), estado todo na URL.
- Ficha de produto: barra de compra fixa no rodapé no mobile (`BuyBar`).
- Link "pular para o conteúdo", foco visível em vinho, página 404 própria.

## Rodar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de produção
```

## Estrutura

| Caminho | O que é |
| --- | --- |
| `app/(loja)/` | Vitrine: home, catálogo, ficha, carrinho, checkout, confirmação, institucional |
| `app/admin/login/` | Login (Supabase Auth) |
| `app/admin/(panel)/` | Painel: dashboard, pedidos, produtos — protegido por `requireAdmin` |
| `app/admin/actions.ts` | Server Actions do painel (avançar status, salvar produto) |
| `app/api/checkout/route.ts` | Cria o pedido no banco (service role) |
| `proxy.ts` | Middleware do Next 16 — barra `/admin/*` de quem não está logado |
| `lib/store.tsx` | `StoreProvider` — só o carrinho (localStorage + snapshot do vinho) |
| `lib/data/` | Consultas ao Supabase + mapeadores `snake_case` → `types/index.ts` |
| `lib/supabase/` | Clientes Supabase: `client` (browser), `server` (sessão), `admin` (service role) |
| `lib/auth.ts` | `getUser` / `isAdmin` / `requireAdmin` |
| `types/index.ts` · `types/database.ts` | domínio (camelCase) · schema do banco |
| `supabase/` | Migration + seed — ver [docs/DATABASE.md](docs/DATABASE.md) |

### Como o pedido flui

Checkout → `POST /api/checkout` (valida, lê preço/estoque do banco, insere
`orders` + `order_items` com a service role) → `/pedido/[id]` (lido pela service
role; o anônimo não enxerga `orders` por RLS). O painel avança o status via a
função `advance_order_status`. O webhook do Mercado Pago (ainda não implementado)
vai chamar `mark_order_paid`, que baixa o estoque.

## Falta (Fase 2)

1. **Mercado Pago**: criar a *preference* em `/api/checkout` e redirecionar para
   o `init_point`; `POST /api/webhooks/mercadopago` → `mark_order_paid`.
   Credenciais em `.env.local` (`MERCADOPAGO_*`).
2. E-mail transacional a cada etapa (Resend).
