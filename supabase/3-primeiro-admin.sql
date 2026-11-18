-- =====================================================================
-- STN Sneakers · Primeiro administrador
-- 1) A pessoa responsável cria a conta normalmente no site (Minha conta → Criar conta).
-- 2) Troque o e-mail abaixo pelo dela e rode este arquivo no SQL Editor.
-- Depois disso, novos administradores podem ser adicionados pelo próprio
-- painel (admin.html → Equipe), sem precisar voltar aqui.
-- =====================================================================
update public.perfis set papel = 'admin' where email = lower('COLOQUE-O-EMAIL-AQUI@exemplo.com');

-- Confere: deve aparecer a pessoa com papel = admin
select nome, email, papel from public.perfis where papel = 'admin';
