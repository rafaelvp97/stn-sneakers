// ---------- Contas de cliente ----------
// Atalho para as funções de conta da Loja (js/loja.js).
// Com o Supabase ligado, as senhas ficam no Supabase Auth (nunca no site).
// No modo demonstração, ficam só no navegador (hash SHA-256). Cartões: só a
// bandeira e os 4 últimos dígitos, e apenas no modo demonstração.
const Auth = {
  atual: () => Loja.usuario(),
  entrar: (email, senha) => Loja.entrar(email, senha),
  cadastrar: dados => Loja.cadastrar(dados),
  sair: () => Loja.sair(),
  salvar: campos => Loja.salvarPerfil(campos),
  atualizar: fn => Loja.atualizarLocal(fn),
  trocarSenha: (atual, nova) => Loja.trocarSenha(atual, nova)
};
