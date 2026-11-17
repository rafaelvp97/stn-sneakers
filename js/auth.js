// ---------- Contas de cliente ----------
// ATENÇÃO: versão de demonstração. Sem um servidor, as contas ficam salvas apenas
// no navegador (localStorage). A senha é guardada como hash SHA-256 e, dos cartões,
// só ficam a bandeira e os 4 últimos dígitos (nunca o número completo nem o CVV).
const Auth = (() => {
  const ler = (k, padrao) => { try { return JSON.parse(localStorage.getItem(k)) ?? padrao; } catch (e) { return padrao; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  async function hash(txt) {
    try {
      const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("stn-sneakers:" + txt));
      return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
    } catch (e) {
      let h = 0; for (const c of "stn-sneakers:" + txt) h = (h * 31 + c.charCodeAt(0)) | 0;
      return "f" + (h >>> 0).toString(16);
    }
  }
  const usuarios = () => ler("stn_usuarios", {});
  const atual = () => { const e = ler("stn_sessao", null); return e ? usuarios()[e] || null : null; };
  const salvarUsuario = u => { const us = usuarios(); us[u.email] = u; gravar("stn_usuarios", us); };

  async function cadastrar({ nome, email, senha }) {
    email = email.trim().toLowerCase();
    if (usuarios()[email]) throw new Error("Já existe uma conta com este e-mail.");
    const u = { nome: nome.trim(), email, senha: await hash(senha), cpf: "", telefone: "", nascimento: "",
                endereco: {}, cartoes: [], pedidos: [], criadoEm: new Date().toISOString() };
    salvarUsuario(u); gravar("stn_sessao", email); return u;
  }
  async function entrar(email, senha) {
    email = email.trim().toLowerCase();
    const u = usuarios()[email];
    if (!u || u.senha !== await hash(senha)) throw new Error("Erro na senha ou login. Confira o e-mail e a senha e tente novamente.");
    gravar("stn_sessao", email); return u;
  }
  function sair() { try { localStorage.removeItem("stn_sessao"); } catch (e) {} }
  function atualizar(fn) { const u = atual(); if (!u) return null; fn(u); salvarUsuario(u); return u; }
  async function trocarSenha(senhaAtual, nova) {
    const u = atual();
    if (!u || u.senha !== await hash(senhaAtual)) throw new Error("Erro na senha: a senha atual está incorreta.");
    const h = await hash(nova); atualizar(x => { x.senha = h; });
  }
  return { atual, cadastrar, entrar, sair, atualizar, trocarSenha };
})();
