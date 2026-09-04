-- ============================================================================
--  Empório Padox — seed de demonstração (12 vinhos + 6 pedidos)
--  Portado de lib/mock-data.ts. Idempotente por slug/reference.
--
--  Rode DEPOIS de 20260829120000_init.sql.
--  Supabase CLI aplica supabase/seed.sql automaticamente em `db reset`.
-- ============================================================================

-- ------------------------------------------------------------------ produtos
insert into public.products
  (slug, name, producer, type, vintage, grapes, region, country, pairings,
   abv, price_cents, description, tasting_notes, serving_temp,
   stock_qty, low_stock_threshold, featured, created_at)
values
  ('cordilheira-de-sal-malbec-2021', 'Cordilheira de Sal', 'Finca La Higuera',
   'tinto', 2021, array['Malbec'], 'Valle de Uco, Mendoza', 'Argentina',
   array['Carnes grelhadas','Cordeiro','Queijos curados'],
   14.0, 12900,
   'Malbec de altitude, com fruta negra e uma espinha mineral que vem do solo calcário.',
   'Ameixa preta, violeta e um toque de grafite. Boca encorpada mas de taninos redondos, com final salino que puxa a próxima taça. Passou dez meses em barricas usadas, sem maquiagem de madeira nova.',
   '16–18 °C', 24, 6, true, '2026-03-12T10:00:00Z'),

  ('pedra-lascada-douro-2019', 'Pedra Lascada', 'Quinta do Vale Escuro',
   'tinto', 2019, array['Touriga Nacional','Tinta Roriz','Touriga Franca'],
   'Douro', 'Portugal', array['Cozidos','Javali','Queijo da Serra'],
   14.5, 16800,
   'Campo misto de vinhas velhas em socalcos de xisto, vinificado em lagar.',
   'Fruta compacta — amora, cereja em calda — sobre um fundo de esteva e pimenta preta. Estrutura séria, tanino de xisto, e um amargor nobre no fim que pede comida. Ainda jovem; ganha com uma hora de decanter.',
   '17–19 °C', 15, 6, false, '2026-02-02T10:00:00Z'),

  ('vento-minuano-tannat-2020', 'Vento Minuano', 'Cabanha do Sul',
   'tinto', 2020, array['Tannat'], 'Campanha Gaúcha', 'Brasil',
   array['Churrasco','Feijoada','Linguiça'],
   13.5, 9400,
   'O tinto de mesa gaúcho levado a sério: fruta madura, taninos de lixa fina.',
   'Geleia de amora, alcaçuz e um fumo de brasa. Tannat sem susto — o produtor colheu tarde e usou só concreto, então o tanino aparece mas não arranha. Tinto de sexta-feira à noite.',
   '16–18 °C', 40, 8, false, '2026-01-20T10:00:00Z'),

  ('serra-do-sudeste-pinot-noir-2022', 'Serra do Sudeste', 'Vinhedo Neblina',
   'tinto', 2022, array['Pinot Noir'], 'Serra do Sudeste, RS', 'Brasil',
   array['Aves','Risoto de cogumelos','Salmão'],
   12.5, 14900,
   'Pinot de clima frio brasileiro — leve, transparente, de tomar levemente gelado.',
   'Framboesa, casca de romã e um chão de terra molhada. Corpo leve, acidez viva, tanino que mais acaricia do que segura. Deixe 15 minutos na geladeira antes de abrir.',
   '14–16 °C', 18, 6, false, '2026-04-08T10:00:00Z'),

  ('lava-e-cinza-etna-rosso-2020', 'Lava e Cinza', 'Contrada Nord',
   'tinto', 2020, array['Nerello Mascalese','Nerello Cappuccio'],
   'Etna, Sicília', 'Itália', array['Massa ao ragu','Berinjela','Atum selado'],
   13.5, 21400,
   'Vinha em pé-franco a 750 m no vulcão. Poucas garrafas por ano chegam aqui.',
   'Cereja ácida, casca de laranja, alcatrão e uma fumaça vulcânica inconfundível. Parece um Nebbiolo que foi morar no mar. Tanino fino e firme, final interminável de sal e pedra.',
   '16–18 °C', 3, 6, true, '2026-05-19T10:00:00Z'),

  ('casa-de-pedra-chardonnay-2022', 'Casa de Pedra', 'Domínio das Encostas',
   'branco', 2022, array['Chardonnay'], 'Vale dos Vinhedos', 'Brasil',
   array['Peixe assado','Frango ao limão','Queijos moles'],
   13.0, 11200,
   'Chardonnay de barrica, mas com a mão leve — sem manteiga em excesso.',
   'Pêssego branco, avelã e um fundo cremoso de fermento. Metade passou por barrica usada, o resto ficou em inox para manter o nervo. Acidez cítrica que corta a gordura.',
   '10–12 °C', 22, 6, false, '2026-03-30T10:00:00Z'),

  ('mare-de-sal-alvarinho-2023', 'Maré de Sal', 'Adega do Estuário',
   'branco', 2023, array['Alvarinho'], 'Vinho Verde, Monção', 'Portugal',
   array['Ostras','Ceviche','Bacalhau'],
   12.5, 9800,
   'Alvarinho de vinha à beira-rio: cítrico, salgado e feito para marisco.',
   'Limão-siciliano, flor de laranjeira e maresia. Boca tensa, quase elétrica, com aquele final de casca de fruta amarga. Servir bem gelado, de preferência com o pé na areia.',
   '8–10 °C', 30, 8, false, '2026-06-11T10:00:00Z'),

  ('jardim-de-inverno-riesling-2023', 'Jardim de Inverno', 'Vinhedo Neblina',
   'branco', 2023, array['Riesling'], 'Serra Gaúcha', 'Brasil',
   array['Comida tailandesa','Torta de maçã','Truta'],
   11.0, 8700,
   'Riesling brasileiro meio-seco, com aquela tensão entre açúcar e acidez.',
   'Lima, maçã verde e um toque de querosene bom (quem conhece, conhece). Tem um resíduo de açúcar mínimo que a acidez engole na hora. Ótimo para quem jura que não gosta de branco doce.',
   '8–10 °C', 26, 6, false, '2026-06-25T10:00:00Z'),

  ('hora-rosa-2023', 'Hora Rosa', 'Cabanha do Sul',
   'rosé', 2023, array['Syrah','Grenache'], 'Campanha Gaúcha', 'Brasil',
   array['Entradas','Salada de grãos','Comida do mar'],
   12.0, 7900,
   'Rosé seco, cor de casca de cebola, feito por prensagem direta.',
   'Morango branco, melancia e uma pitada de ervas secas. Seco de verdade, com corpo médio e final mineral. O rosé que fica na mesa do almoço até o fim da tarde.',
   '8–10 °C', 34, 8, false, '2026-07-02T10:00:00Z'),

  ('metodo-antigo-espumante-brut', 'Método Antigo', 'Domínio das Encostas',
   'espumante', null, array['Chardonnay','Pinot Noir'], 'Vale dos Vinhedos', 'Brasil',
   array['Aperitivo','Fritura','Comida japonesa'],
   12.0, 13900,
   'Método tradicional, 24 meses sur lie. Assemblage de várias safras.',
   'Maçã assada, brioche e casca de amêndoa. Perlage fina e insistente, boca cremosa mas com corte cítrico. Espumante de brinde, mas bom demais para guardar só para datas.',
   '6–8 °C', 20, 6, true, '2026-02-18T10:00:00Z'),

  ('pet-teimoso-2023', 'Pét Teimoso', 'Contrada Nord',
   'espumante', 2023, array['Glera','Moscato'], 'Serra Gaúcha', 'Brasil',
   array['Petiscos','Pizza','Frutas'],
   11.5, 8900,
   'Pét-nat turvo, sem dó: uma fermentação só, tampinha de cerveja, zero filtragem.',
   'Pêra, maçã verde e um miolo de pão. Levemente turvo, bolha rústica, final seco e citrino. Chacoalhe ou não — vai de gosto. Para beber jovem e sem cerimônia.',
   '6–8 °C', 28, 8, false, '2026-07-20T10:00:00Z'),

  ('ambar-de-outubro-2022', 'Âmbar de Outubro', 'Adega do Estuário',
   'laranja', 2022, array['Gewürztraminer'], 'Encruzilhada do Sul, RS', 'Brasil',
   array['Curry','Queijos fortes','Cozinha etíope'],
   12.5, 12200,
   'Vinho de contato com as cascas por 20 dias. Cor de chá, textura de tinto.',
   'Casca de laranja seca, damasco, chá preto e um toque de mel de flor. Tem tanino — sim, num branco — e um amargor de casca que combina com comida temperada. Estranho no melhor sentido.',
   '12–14 °C', 12, 6, false, '2026-05-04T10:00:00Z')
on conflict (slug) do nothing;

-- ------------------------------------------------------------------- pedidos
-- Desliga o evento automático para inserir a trilha completa manualmente.
alter table public.orders disable trigger trg_orders_after_insert;

insert into public.orders
  (reference, customer_name, customer_email, customer_cpf,
   shipping_cep, shipping_street, shipping_number, shipping_complement,
   shipping_district, shipping_city, shipping_state,
   subtotal_cents, shipping_cents, total_cents, status, created_at)
values
  ('EP-2048', 'Marina Alcântara', 'marina.alcantara@example.com', '391.442.870-11',
   '01310-100', 'Av. Paulista', '1578', 'ap. 92', 'Bela Vista', 'São Paulo', 'SP',
   42800, 0, 42800, 'recebido', '2026-08-29T12:40:00Z'),
  ('EP-2047', 'Rafael Nogueira', 'rafa.nogueira@example.com', '225.908.114-70',
   '22071-060', 'Rua Barão da Torre', '340', null, 'Ipanema', 'Rio de Janeiro', 'RJ',
   35300, 0, 35300, 'pago', '2026-08-28T18:05:00Z'),
  ('EP-2046', 'Beatriz Salles', 'bia.salles@example.com', '108.774.552-39',
   '30140-071', 'Rua da Bahia', '1200', 'sala 4', 'Centro', 'Belo Horizonte', 'MG',
   53900, 0, 53900, 'pago', '2026-08-27T09:15:00Z'),
  ('EP-2045', 'Otávio Prado', 'otavio.prado@example.com', '774.310.226-05',
   '80420-090', 'Al. Dr. Carlos de Carvalho', '655', null, 'Centro', 'Curitiba', 'PR',
   83400, 0, 83400, 'separado', '2026-08-25T14:30:00Z'),
  ('EP-2044', 'Carla Bittencourt', 'carla.b@example.com', '560.221.983-44',
   '90035-002', 'Rua Sarmento Leite', '245', null, 'Farroupilha', 'Porto Alegre', 'RS',
   45800, 0, 45800, 'despachado', '2026-08-22T11:00:00Z'),
  ('EP-2043', 'Henrique Vasconcelos', 'h.vasconcelos@example.com', '331.005.678-90',
   '40170-110', 'Rua da Paciência', '88', null, 'Rio Vermelho', 'Salvador', 'BA',
   56600, 0, 56600, 'entregue', '2026-08-14T16:20:00Z')
on conflict (reference) do nothing;

-- itens (nome/produtor/preço desnormalizados a partir do produto)
insert into public.order_items
  (order_id, product_id, name, producer, vintage, unit_price_cents, qty, image_url)
select o.id, p.id, p.name, p.producer, p.vintage, p.price_cents, v.qty, ''
from (values
  ('EP-2048', 'lava-e-cinza-etna-rosso-2020', 2),
  ('EP-2047', 'cordilheira-de-sal-malbec-2021', 1),
  ('EP-2047', 'casa-de-pedra-chardonnay-2022', 2),
  ('EP-2046', 'vento-minuano-tannat-2020', 3),
  ('EP-2046', 'hora-rosa-2023', 1),
  ('EP-2046', 'pet-teimoso-2023', 2),
  ('EP-2045', 'metodo-antigo-espumante-brut', 6),
  ('EP-2044', 'pedra-lascada-douro-2019', 2),
  ('EP-2044', 'ambar-de-outubro-2022', 1),
  ('EP-2043', 'mare-de-sal-alvarinho-2023', 4),
  ('EP-2043', 'jardim-de-inverno-riesling-2023', 2)
) as v(reference, slug, qty)
join public.orders   o on o.reference = v.reference
join public.products p on p.slug = v.slug
where not exists (
  select 1 from public.order_items oi where oi.order_id = o.id and oi.product_id = p.id
);

-- trilha de status (step = múltiplos de 20h a partir do created_at)
insert into public.order_events (order_id, status, note, created_at)
select o.id, v.status::public.order_status, null,
       o.created_at + (v.step * interval '20 hours')
from (values
  ('EP-2048', 'recebido',  0),
  ('EP-2047', 'recebido',  0), ('EP-2047', 'pago', 1),
  ('EP-2046', 'recebido',  0), ('EP-2046', 'pago', 1),
  ('EP-2045', 'recebido',  0), ('EP-2045', 'pago', 1), ('EP-2045', 'separado', 2),
  ('EP-2044', 'recebido',  0), ('EP-2044', 'pago', 1), ('EP-2044', 'separado', 2), ('EP-2044', 'despachado', 3),
  ('EP-2043', 'recebido',  0), ('EP-2043', 'pago', 1), ('EP-2043', 'separado', 2), ('EP-2043', 'despachado', 3), ('EP-2043', 'entregue', 4)
) as v(reference, status, step)
join public.orders o on o.reference = v.reference
where not exists (
  select 1 from public.order_events oe
  where oe.order_id = o.id and oe.status = v.status::public.order_status
);

alter table public.orders enable trigger trg_orders_after_insert;

-- próxima referência automática = EP-2049
select setval('public.order_reference_seq', 2049, false);
