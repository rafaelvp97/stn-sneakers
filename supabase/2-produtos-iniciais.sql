-- =====================================================================
-- STN Sneakers · Produtos iniciais
-- Rode DEPOIS do 1-estrutura.sql, uma única vez. Coloca no banco os 22
-- produtos que já estavam no site. Depois disso, tudo é editado pelo painel admin.
-- As fotos apontam para a pasta img/produtos do site publicado.
-- =====================================================================
insert into public.produtos (id, nome, genero, tipo, preco, preco_antigo, destaque, lancamento, descricao, cor, sola, imagens, ordem) values
  (18, 'Tênis Runner Black Rosé', 'feminino', 'tenis', 299.90, null, false, true, 'Tênis feminino para corrida e treino, preto com detalhes em rosa e solado alto off-white.', '#111111', '#f5efe6', '[{"src":"img/produtos/running-rose-1.jpg","alt":"Tênis Runner Black Rosé na mão, vista lateral","foco":"50% 48%"},{"src":"img/produtos/running-rose-2.jpg","alt":"Tênis Runner Black Rosé calçado, visto de cima","foco":"50% 43%"},{"src":"img/produtos/running-rose-3.jpg","alt":"Par do Tênis Runner Black Rosé ao lado da caixa","foco":"50% 77%"}]'::jsonb, 10),
  (19, 'Tênis Retrô Bordô', 'feminino', 'tenis', 299.90, null, false, true, 'Tênis retrô feminino bordô com listras rosa e solado caramelo.', '#7b1e3a', '#c8a06a', '[{"src":"img/produtos/retro-bordo-2.jpg","alt":"Par do Tênis Retrô Bordô na mão","foco":"50% 74%"},{"src":"img/produtos/retro-bordo-1.jpg","alt":"Tênis Retrô Bordô calçado","foco":"50% 87%"}]'::jsonb, 20),
  (17, 'Tênis Plataforma Panda', 'feminino', 'tenis', 299.90, null, true, true, 'Tênis plataforma feminino em preto e branco, com solado alto e cadarço largo. Lançamento da temporada.', '#111111', '#ffffff', '[{"src":"img/produtos/plataforma-panda-1.jpg","alt":"Tênis Plataforma Panda calçado, vista lateral","foco":"50% 62%"},{"src":"img/produtos/plataforma-panda-2.jpg","alt":"Tênis Plataforma Panda na mão, vista lateral","foco":"50% 70%"},{"src":"img/produtos/plataforma-panda-3.jpg","alt":"Par do Tênis Plataforma Panda visto de cima","foco":"50% 55%"}]'::jsonb, 30),
  (20, 'Tênis Impulse White Gold', 'masculino', 'tenis', 299.90, null, false, true, 'Tênis masculino de corrida branco com detalhes dourados e solado alto com amortecimento ondulado.', '#f4f1ea', '#d4a72c', '[{"src":"img/produtos/white-gold-1.jpg","alt":"Tênis Impulse White Gold na mão, vista lateral","foco":"50% 74%"},{"src":"img/produtos/white-gold-2.jpg","alt":"Tênis Impulse White Gold visto de cima","foco":"50% 34%"},{"src":"img/produtos/white-gold-3.jpg","alt":"Par do Tênis Impulse White Gold ao lado da caixa","foco":"50% 61%"}]'::jsonb, 40),
  (21, 'Tênis Knit Black', 'masculino', 'tenis', 299.90, null, false, true, 'Tênis masculino todo preto, com cabedal em tecido e solado vazado com amortecimento.', '#111111', '#2b2b2b', '[{"src":"img/produtos/knit-black-1.jpg","alt":"Tênis Knit Black na mão, vista lateral","foco":"50% 56%"},{"src":"img/produtos/knit-black-2.jpg","alt":"Calcanhar do Tênis Knit Black","foco":"50% 48%"},{"src":"img/produtos/knit-black-3.jpg","alt":"Tênis Knit Black visto de cima","foco":"50% 54%"}]'::jsonb, 50),
  (22, 'Tênis Cushion White', 'masculino', 'tenis', 299.90, null, false, true, 'Tênis masculino branco com detalhe preto na lateral e amortecimento a ar visível no calcanhar.', '#ffffff', '#c9c9c9', '[{"src":"img/produtos/cushion-white-1.jpg","alt":"Tênis Cushion White na mão, vista lateral","foco":"50% 45%"},{"src":"img/produtos/cushion-white-3.jpg","alt":"Tênis Cushion White na mão, outra vista lateral","foco":"50% 20%"},{"src":"img/produtos/cushion-white-2.jpg","alt":"Pares do Tênis Cushion White vistos de cima","foco":"50% 50%"}]'::jsonb, 60),
  (1, 'Tênis Runner Pro', 'masculino', 'tenis', 299.90, 399.90, true, false, '', '#1d3557', '#f1faee', '[]'::jsonb, 70),
  (2, 'Tênis Street Classic', 'masculino', 'tenis', 249.90, null, true, false, '', '#111111', '#ffffff', '[]'::jsonb, 80),
  (3, 'Tênis Urban Flex', 'masculino', 'tenis', 189.90, 259.90, false, false, '', '#6c757d', '#212529', '[]'::jsonb, 90),
  (4, 'Tênis Trail Max', 'masculino', 'tenis', 349.90, null, false, false, '', '#386641', '#f2e8cf', '[]'::jsonb, 100),
  (5, 'Chinelo Slide Comfort', 'masculino', 'chinelo', 79.90, 109.90, true, false, '', '#222222', '#444444', '[]'::jsonb, 110),
  (6, 'Chinelo Praia Tradicional', 'masculino', 'chinelo', 39.90, null, false, false, '', '#0077b6', '#ffffff', '[]'::jsonb, 120),
  (7, 'Chinelo Sport Slide', 'masculino', 'chinelo', 69.90, 89.90, false, false, '', '#d62828', '#111111', '[]'::jsonb, 130),
  (8, 'Tênis Casual Couro', 'masculino', 'tenis', 279.90, null, false, false, '', '#7f5539', '#ede0d4', '[]'::jsonb, 140),
  (9, 'Tênis Cloud Rosé', 'feminino', 'tenis', 279.90, 359.90, true, false, '', '#e5989b', '#ffffff', '[]'::jsonb, 150),
  (10, 'Tênis Fit Training', 'feminino', 'tenis', 229.90, null, true, false, '', '#7209b7', '#f8f9fa', '[]'::jsonb, 160),
  (11, 'Tênis Plataforma White', 'feminino', 'tenis', 199.90, 269.90, false, false, '', '#f8f9fa', '#dee2e6', '[]'::jsonb, 170),
  (12, 'Tênis Walk Light', 'feminino', 'tenis', 179.90, null, false, false, '', '#2a9d8f', '#ffffff', '[]'::jsonb, 180),
  (13, 'Chinelo Glam Dourado', 'feminino', 'chinelo', 59.90, 84.90, true, false, '', '#d4a373', '#fefae0', '[]'::jsonb, 190),
  (14, 'Chinelo Floral', 'feminino', 'chinelo', 44.90, null, false, false, '', '#ff70a6', '#ffffff', '[]'::jsonb, 200),
  (15, 'Chinelo Slide Nuvem', 'feminino', 'chinelo', 89.90, 119.90, false, false, '', '#a2d2ff', '#ffffff', '[]'::jsonb, 210),
  (16, 'Tênis Retrô Lilás', 'feminino', 'tenis', 239.90, null, false, false, '', '#b8b8ff', '#ffffff', '[]'::jsonb, 220)
on conflict (id) do nothing;

-- Faz os próximos produtos novos continuarem a numeração
select setval(pg_get_serial_sequence('public.produtos', 'id'), (select max(id) from public.produtos));
