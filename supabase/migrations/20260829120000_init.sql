-- ============================================================================
--  Vinária — schema inicial (Fase 2)
--  Mapeia 1:1 com types/index.ts. Valores monetários em centavos (integer).
--
--  Como aplicar:
--   • Supabase SQL Editor: cole este arquivo inteiro e rode.
--   • CLI:  npx supabase db push   (após `supabase link`)
-- ============================================================================

create extension if not exists pgcrypto;      -- gen_random_uuid()

-- ----------------------------------------------------------------------------
--  Enums
-- ----------------------------------------------------------------------------
do $$ begin
  create type public.wine_type as enum
    ('tinto', 'branco', 'rosé', 'espumante', 'laranja');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum
    ('recebido', 'pago', 'separado', 'despachado', 'entregue');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
--  Sequência da referência humana do pedido  (EP-1001, EP-1002, ...)
-- ----------------------------------------------------------------------------
create sequence if not exists public.order_reference_seq start with 1001;

-- ----------------------------------------------------------------------------
--  products
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text not null unique,
  name                 text not null,
  producer             text not null,
  type                 public.wine_type not null,
  vintage              int,                         -- null = sem safra
  grapes               text[] not null default '{}',
  region               text not null,
  country              text not null,
  pairings             text[] not null default '{}',
  abv                  numeric(4,1) not null default 0,   -- ex.: 13.5
  price_cents          int not null check (price_cents >= 0),
  description          text not null default '',
  tasting_notes        text not null default '',
  serving_temp         text not null default '',
  stock_qty            int not null default 0 check (stock_qty >= 0),
  low_stock_threshold  int not null default 6 check (low_stock_threshold >= 0),
  featured             boolean not null default false,
  is_active            boolean not null default true,     -- visível na loja
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

comment on table public.products is 'Catálogo de vinhos. is_active controla a visibilidade na loja.';
comment on column public.products.price_cents is 'Preço em centavos de BRL.';

create index if not exists products_type_idx        on public.products (type);
create index if not exists products_active_idx       on public.products (is_active);
create index if not exists products_featured_idx     on public.products (featured) where featured;
create index if not exists products_region_idx       on public.products (region);
create index if not exists products_low_stock_idx    on public.products (stock_qty)
  where stock_qty <= low_stock_threshold;

-- ----------------------------------------------------------------------------
--  product_images
-- ----------------------------------------------------------------------------
create table if not exists public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  url         text not null,             -- URL pública no bucket product-photos
  alt         text not null default '',
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists product_images_product_idx
  on public.product_images (product_id, position);

-- ----------------------------------------------------------------------------
--  orders  (checkout como convidado — sem conta de cliente)
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id                   uuid primary key default gen_random_uuid(),
  reference            text not null unique,       -- preenchida por trigger se nula
  customer_name        text not null,
  customer_email       text not null,
  customer_cpf         text not null,
  shipping_cep         text not null,
  shipping_street      text not null,
  shipping_number      text not null,
  shipping_complement  text,
  shipping_district    text not null,
  shipping_city        text not null,
  shipping_state       text not null check (char_length(shipping_state) = 2),
  subtotal_cents       int not null check (subtotal_cents >= 0),
  shipping_cents       int not null default 0 check (shipping_cents >= 0),
  total_cents          int not null check (total_cents >= 0),
  status               public.order_status not null default 'recebido',
  payment_provider     text not null default 'mercadopago',
  payment_ref          text,                       -- id da preference/pagamento no MP
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

comment on table public.orders is
  'Pedidos. Criados no servidor (service role) durante o checkout; nenhum acesso anônimo por RLS.';

create index if not exists orders_status_idx     on public.orders (status);
create index if not exists orders_created_idx     on public.orders (created_at desc);
create index if not exists orders_email_idx       on public.orders (customer_email);

-- ----------------------------------------------------------------------------
--  order_items  (linha desnormalizada — histórico não muda se o produto mudar)
-- ----------------------------------------------------------------------------
create table if not exists public.order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references public.orders (id) on delete cascade,
  product_id        uuid references public.products (id) on delete set null,
  name              text not null,
  producer          text not null,
  vintage           int,
  unit_price_cents  int not null check (unit_price_cents >= 0),
  qty               int not null check (qty > 0),
  image_url         text not null default ''
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- ----------------------------------------------------------------------------
--  order_events  (trilha de status)
-- ----------------------------------------------------------------------------
create table if not exists public.order_events (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders (id) on delete cascade,
  status      public.order_status not null,
  note        text,
  created_at  timestamptz not null default now()
);

create index if not exists order_events_order_idx
  on public.order_events (order_id, created_at);

-- ----------------------------------------------------------------------------
--  admin_users  (quem pode acessar o painel)
--  O primeiro admin é inserido manualmente — ver docs/DATABASE.md.
-- ----------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  email       text,
  created_at  timestamptz not null default now()
);

-- ============================================================================
--  Funções e triggers
-- ============================================================================

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

-- referência do pedido + evento inicial
create or replace function public.orders_before_insert()
returns trigger language plpgsql as $$
begin
  if new.reference is null or new.reference = '' then
    new.reference := 'EP-' || nextval('public.order_reference_seq');
  end if;
  return new;
end $$;

drop trigger if exists trg_orders_before_insert on public.orders;
create trigger trg_orders_before_insert before insert on public.orders
  for each row execute function public.orders_before_insert();

create or replace function public.orders_after_insert()
returns trigger language plpgsql as $$
begin
  insert into public.order_events (order_id, status, note, created_at)
  values (new.id, new.status, null, new.created_at);
  return new;
end $$;

drop trigger if exists trg_orders_after_insert on public.orders;
create trigger trg_orders_after_insert after insert on public.orders
  for each row execute function public.orders_after_insert();

-- is_admin(): usada nas policies de RLS
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- avançar status do pedido (painel admin) — atômico e checado
create or replace function public.advance_order_status(p_order_id uuid, p_note text default null)
returns public.orders
language plpgsql security definer set search_path = ''
as $$
declare
  v_order public.orders;
  v_next  public.order_status;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'order not found'; end if;

  v_next := case v_order.status
    when 'recebido'  then 'pago'
    when 'pago'      then 'separado'
    when 'separado'  then 'despachado'
    when 'despachado' then 'entregue'
    else null
  end;
  if v_next is null then
    raise exception 'order already at final status';
  end if;

  update public.orders
     set status = v_next
   where id = p_order_id
  returning * into v_order;

  insert into public.order_events (order_id, status, note)
  values (p_order_id, v_next, nullif(p_note, ''));

  return v_order;
end $$;

revoke execute on function public.advance_order_status(uuid, text) from public, anon;
grant  execute on function public.advance_order_status(uuid, text) to authenticated;

-- marcar como pago + baixar estoque (chamado pelo webhook do Mercado Pago
-- com a service role). Idempotente: só age se o pedido ainda está "recebido".
create or replace function public.mark_order_paid(p_order_id uuid, p_payment_ref text default null)
returns public.orders
language plpgsql security definer set search_path = ''
as $$
declare
  v_order public.orders;
  v_item  record;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'order not found'; end if;

  if v_order.status <> 'recebido' then
    return v_order;                       -- já processado
  end if;

  update public.orders
     set status = 'pago',
         payment_ref = coalesce(p_payment_ref, payment_ref)
   where id = p_order_id
  returning * into v_order;

  insert into public.order_events (order_id, status, note)
  values (p_order_id, 'pago', 'Pagamento confirmado pelo Mercado Pago');

  for v_item in
    select product_id, qty from public.order_items
    where order_id = p_order_id and product_id is not null
  loop
    update public.products
       set stock_qty = greatest(0, stock_qty - v_item.qty)
     where id = v_item.product_id;
  end loop;

  return v_order;
end $$;

revoke execute on function public.mark_order_paid(uuid, text) from public, anon, authenticated;
grant  execute on function public.mark_order_paid(uuid, text) to service_role;

-- ============================================================================
--  Row Level Security
-- ============================================================================
alter table public.products       enable row level security;
alter table public.product_images enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.order_events   enable row level security;
alter table public.admin_users    enable row level security;

-- products: leitura pública dos ativos; admin lê e escreve tudo
drop policy if exists products_read       on public.products;
drop policy if exists products_admin_write on public.products;
create policy products_read on public.products
  for select to anon, authenticated
  using (is_active or public.is_admin());
create policy products_admin_write on public.products
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- product_images: segue a visibilidade do produto
drop policy if exists product_images_read        on public.product_images;
drop policy if exists product_images_admin_write on public.product_images;
create policy product_images_read on public.product_images
  for select to anon, authenticated
  using (
    public.is_admin() or exists (
      select 1 from public.products p
      where p.id = product_id and p.is_active
    )
  );
create policy product_images_admin_write on public.product_images
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- orders / order_items / order_events: SOMENTE admin via API.
-- A criação no checkout usa a service role (ignora RLS).
drop policy if exists orders_admin        on public.orders;
drop policy if exists order_items_admin    on public.order_items;
drop policy if exists order_events_admin   on public.order_events;
create policy orders_admin on public.orders
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy order_items_admin on public.order_items
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy order_events_admin on public.order_events
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- admin_users: cada um vê a própria linha; admin vê todas. Gestão só via SQL.
drop policy if exists admin_users_read on public.admin_users;
create policy admin_users_read on public.admin_users
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ============================================================================
--  Storage — bucket das fotos de produto
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('product-photos', 'product-photos', true)
on conflict (id) do nothing;

drop policy if exists "product photos public read"  on storage.objects;
drop policy if exists "product photos admin write"  on storage.objects;
drop policy if exists "product photos admin update" on storage.objects;
drop policy if exists "product photos admin delete" on storage.objects;

create policy "product photos public read" on storage.objects
  for select using (bucket_id = 'product-photos');
create policy "product photos admin write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-photos' and public.is_admin());
create policy "product photos admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-photos' and public.is_admin());
create policy "product photos admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-photos' and public.is_admin());
