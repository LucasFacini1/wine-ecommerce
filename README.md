# Empório Padox — e-commerce de vinhos

Loja de vinhos de produtor + painel administrativo. Loja e painel leem/gravam no
**Supabase**; o painel exige login; pagamento via **Mercado Pago** (Checkout Pro).

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
| `app/api/checkout/route.ts` | Cria o pedido + a *preference* do Mercado Pago |
| `app/api/webhooks/mercadopago/route.ts` | Confirma o pagamento, chama `mark_order_paid` |
| `lib/mercadopago.ts` | Cliente do SDK oficial (`Preference`, `Payment`) |
| `proxy.ts` | Middleware do Next 16 — barra `/admin/*` de quem não está logado; reescreve o subdomínio `admin.*` pra dentro de `/admin` |
| `lib/store.tsx` | `StoreProvider` — só o carrinho (localStorage + snapshot do vinho) |
| `lib/data/` | Consultas ao Supabase + mapeadores `snake_case` → `types/index.ts` |
| `lib/supabase/` | Clientes Supabase: `client` (browser), `server` (sessão), `admin` (service role) |
| `lib/auth.ts` | `getUser` / `isAdmin` / `requireAdmin` |
| `types/index.ts` · `types/database.ts` | domínio (camelCase) · schema do banco |
| `supabase/` | Migration + seed — ver [docs/DATABASE.md](docs/DATABASE.md) |

### Como o pedido flui

Checkout → `POST /api/checkout` (valida, lê preço/estoque do banco, insere
`orders` + `order_items` com a service role, cria a *preference* no Mercado
Pago) → cliente é levado pro `init_point` (página da MP) → paga → MP chama
`POST /api/webhooks/mercadopago`, que relê o pagamento na API da MP (nunca
confia no corpo do webhook) e, se aprovado, chama `mark_order_paid` — marca o
pedido como `pago` e baixa o estoque. `/pedido/[id]` é lido pela service role
(o anônimo não enxerga `orders` por RLS). No painel, o status avança pela
função `advance_order_status`.

### Domínio dedicado do admin

Além de `/admin` no domínio principal, um subdomínio `admin.<seu-domínio>`
aponta pro **mesmo projeto** na Vercel e cai direto no painel — o `proxy.ts`
detecta o host e reescreve por baixo dos panos (`admin.site.com/pedidos` vira
`/admin/pedidos`, sem aparecer na URL). Configuração:

1. Vercel → Domains → adiciona `admin.<seu-domínio>` no **mesmo projeto**.
2. No registrador, um `CNAME` de `admin` pra `cname.vercel-dns.com`.
3. Nada de código muda — é só o registro de DNS.

## Falta

1. E-mail transacional a cada etapa (Resend).
