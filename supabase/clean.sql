-- ============================================================================
--  Empório Padox — LIMPAR O BANCO
--
--  Mantém:  schema, funções, triggers, RLS, admin_users.
--  Remove:  products, product_images, orders, order_items, order_events.
--  Ajusta:  prefixo da referência de pedido para "EP-" e reinicia a numeração
--           (próximo pedido = EP-1001).
--
--  Rode no SQL Editor do Supabase. Pode rodar quantas vezes quiser.
--
--  As FOTOS no bucket product-photos NÃO saem por aqui (o Supabase bloqueia
--  DELETE direto em storage.objects). Elas ficam como arquivos órfãos, sem
--  nenhum produto apontando pra elas — inofensivo. Para apagar de fato:
--  Storage → product-photos → selecionar tudo → Delete. Ou rode o snippet
--  no fim deste arquivo.
-- ============================================================================

begin;

-- 1. apaga todos os dados
truncate table
  public.order_events,
  public.order_items,
  public.orders,
  public.product_images,
  public.products
restart identity cascade;

-- 2. numeração dos pedidos volta ao começo
alter sequence public.order_reference_seq restart with 1001;

-- 3. prefixo da referência: VN- -> EP-
create or replace function public.orders_before_insert()
returns trigger language plpgsql as $$
begin
  if new.reference is null or new.reference = '' then
    new.reference := 'EP-' || nextval('public.order_reference_seq');
  end if;
  return new;
end $$;

commit;

-- Confere:
--   select
--     (select count(*) from public.products) as produtos,
--     (select count(*) from public.orders)   as pedidos;

-- ---------------------------------------------------------------------------
--  (opcional) esvaziar o bucket product-photos pela Storage API.
--  Salve como limpar-fotos.mjs na raiz do projeto e rode:
--    node --env-file=.env.local limpar-fotos.mjs
-- ---------------------------------------------------------------------------
--  import { createClient } from "@supabase/supabase-js";
--  const s = createClient(
--    process.env.NEXT_PUBLIC_SUPABASE_URL,
--    process.env.SUPABASE_SERVICE_ROLE_KEY,
--    { auth: { persistSession: false } },
--  );
--  async function wipe(prefix = "") {
--    const { data } = await s.storage.from("product-photos").list(prefix, { limit: 1000 });
--    for (const item of data ?? []) {
--      const path = prefix ? `${prefix}/${item.name}` : item.name;
--      if (item.id === null) await wipe(path);            // é pasta
--      else await s.storage.from("product-photos").remove([path]);
--    }
--  }
--  await wipe();
--  console.log("bucket product-photos esvaziado");
