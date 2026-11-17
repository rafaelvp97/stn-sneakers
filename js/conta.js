// ---------- Página "Minha Conta" ----------
const ESTADOS = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");
const STATUS_COR = { "Pagamento aprovado": "ok", "Aguardando pagamento": "espera" };

// Máscaras simples de digitação
const MASCARAS = {
  cpf: v => v.replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2"),
  telefone: v => { const d = v.replace(/\D/g, "").slice(0, 11);
    return d.length > 10 ? d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3") : d.replace(/(\d{2})(\d{0,4})(\d{0,4})/, (m, a, b, c) => `(${a}) ${b}${c ? "-" + c : ""}`).replace(/\D+$/, ""); },
  cep: v => v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2"),
  cartao: v => v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "),
  validade: v => v.replace(/\D/g, "").slice(0, 4).replace(/(\d{2})(\d)/, "$1/$2")
};
function bandeira(num) {
  if (/^4/.test(num)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(num)) return "Mastercard";
  if (/^3[47]/.test(num)) return "American Express";
  if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(num)) return "Elo";
  if (/^(606282|3841)/.test(num)) return "Hipercard";
  return "Cartão";
}
function luhn(num) {
  let soma = 0, dobra = false;
  for (let i = num.length - 1; i >= 0; i--) { let d = +num[i]; if (dobra) { d *= 2; if (d > 9) d -= 9; } soma += d; dobra = !dobra; }
  return soma % 10 === 0;
}
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const dados = form => Object.fromEntries(new FormData(form));
function erro(form, msg) { const p = form.querySelector(".erro"); p.textContent = msg || ""; p.hidden = !msg; }

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const voltarPagamento = params.get("voltar") === "pagamento";
  const areaLogin = document.getElementById("area-login");
  const areaCliente = document.getElementById("area-cliente");

  document.querySelectorAll("[data-mascara]").forEach(i =>
    i.addEventListener("input", () => { i.value = MASCARAS[i.dataset.mascara](i.value); }));
  document.querySelector("#form-endereco select").insertAdjacentHTML("beforeend", ESTADOS.map(e => `<option>${e}</option>`).join(""));

  // ----- Entrar / Criar conta -----
  document.querySelectorAll(".aba").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll(".aba").forEach(x => x.classList.toggle("ativo", x === b));
    document.getElementById("form-entrar").hidden = b.dataset.aba !== "entrar";
    document.getElementById("form-cadastrar").hidden = b.dataset.aba !== "cadastrar";
  }));
  const depoisDeEntrar = () => {
    if (voltarPagamento) { location.href = "index.html#pagamento"; return; }
    mostrar();
  };
  document.getElementById("form-entrar").addEventListener("submit", async e => {
    e.preventDefault(); const f = e.target, d = dados(f);
    if (!d.email || !d.senha) return erro(f, "Preencha e-mail e senha.");
    try { await Auth.entrar(d.email, d.senha); f.reset(); erro(f); depoisDeEntrar(); }
    catch (x) { erro(f, x.message); }
  });
  document.getElementById("form-cadastrar").addEventListener("submit", async e => {
    e.preventDefault(); const f = e.target, d = dados(f);
    if (!d.nome.trim() || !d.email || !d.senha) return erro(f, "Preencha todos os campos.");
    if (!f.email.checkValidity()) return erro(f, "Digite um e-mail válido.");
    if (d.senha.length < 6) return erro(f, "A senha precisa ter pelo menos 6 caracteres.");
    if (d.senha !== d.confirmar) return erro(f, "As senhas não conferem.");
    try { await Auth.cadastrar(d); f.reset(); erro(f); aviso("Conta criada! Bem-vindo(a) 🎉"); depoisDeEntrar(); }
    catch (x) { erro(f, x.message); }
  });

  // ----- Painel do cliente -----
  function secao(nome) {
    document.querySelectorAll("[data-painel]").forEach(p => p.hidden = p.dataset.painel !== nome);
    document.querySelectorAll(".pm[data-sec]").forEach(b => b.classList.toggle("ativo", b.dataset.sec === nome));
    if (nome === "pedidos") renderPedidos();
  }
  function subsecao(nome) {
    document.querySelectorAll(".sub").forEach(b => b.classList.toggle("ativo", b.dataset.sub === nome));
    document.querySelectorAll("[data-subpainel]").forEach(p => p.hidden = p.dataset.subpainel !== nome);
  }
  document.querySelectorAll(".pm[data-sec]").forEach(b => b.addEventListener("click", () => secao(b.dataset.sec)));
  document.querySelectorAll(".sub").forEach(b => b.addEventListener("click", () => subsecao(b.dataset.sub)));
  document.querySelector(".pm.sair").addEventListener("click", () => {
    Auth.sair(); atualizarCabecalho(); mostrar(); aviso("Você saiu da sua conta.");
  });

  function renderPedidos() {
    const u = Auth.atual(), el = document.querySelector(".lista-pedidos");
    if (!u.pedidos.length) {
      el.innerHTML = `<div class="sem-itens"><p>Você ainda não fez nenhum pedido.</p><a href="index.html" class="btn btn-escuro">Ir para a loja</a></div>`;
      return;
    }
    el.innerHTML = u.pedidos.map(p => `
      <article class="pedido">
        <header class="pedido-topo">
          <div><strong>Pedido #${esc(p.numero)}</strong><small>${new Date(p.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</small></div>
          <span class="status ${STATUS_COR[p.status] || ""}">${esc(p.status)}</span>
        </header>
        <ul class="pedido-itens">${p.itens.map(i => {
          const prod = PRODUTOS.find(x => x.id === i.id);
          return `<li>${prod ? `<span class="mini">${arte(prod)}</span>` : ""}<span>${i.qtd}× ${esc(i.nome)}</span><span>${real(i.preco * i.qtd)}</span></li>`;
        }).join("")}</ul>
        <footer class="pedido-base">
          <span>${esc(p.pagamento)}${p.endereco ? ` · Entrega: ${esc(p.endereco)}` : ""}</span>
          <strong>Total ${real(p.total)}</strong>
        </footer>
      </article>`).join("");
  }

  function renderCartoes() {
    const u = Auth.atual(), el = document.querySelector(".lista-cartoes");
    el.innerHTML = u.cartoes.length ? u.cartoes.map(c => `
      <div class="cartao-item">
        <div class="cartao-ic">${esc(c.bandeira).slice(0, 4).toUpperCase()}</div>
        <div><strong>${esc(c.bandeira)} •••• ${esc(c.final)}</strong><small>${esc(c.nome)} · validade ${esc(c.validade)}</small></div>
        <button class="remover" data-remover-cartao="${c.id}">Remover</button>
      </div>`).join("") : `<p class="sem-itens">Nenhum cartão cadastrado.</p>`;
  }
  document.querySelector(".lista-cartoes").addEventListener("click", e => {
    const id = e.target.dataset.removerCartao; if (!id) return;
    Auth.atualizar(u => { u.cartoes = u.cartoes.filter(c => c.id !== id); });
    renderCartoes(); aviso("Cartão removido.");
  });

  function preencher() {
    const u = Auth.atual();
    const fd = document.getElementById("form-dados");
    fd.nome.value = u.nome; fd.email.value = u.email; fd.cpf.value = u.cpf; fd.telefone.value = u.telefone; fd.nascimento.value = u.nascimento;
    const fe = document.getElementById("form-endereco");
    ["cep", "rua", "numero", "complemento", "bairro", "cidade", "estado"].forEach(k => { fe[k].value = u.endereco[k] || ""; });
    renderCartoes();
  }

  document.getElementById("form-dados").addEventListener("submit", e => {
    e.preventDefault(); const f = e.target, d = dados(f);
    if (!d.nome.trim()) return erro(f, "Informe seu nome.");
    if (d.cpf && d.cpf.replace(/\D/g, "").length !== 11) return erro(f, "CPF incompleto.");
    if (d.telefone && d.telefone.replace(/\D/g, "").length < 10) return erro(f, "Telefone incompleto.");
    Auth.atualizar(u => { u.nome = d.nome.trim(); u.cpf = d.cpf; u.telefone = d.telefone; u.nascimento = d.nascimento; });
    erro(f); mostrar(); aviso("Informações salvas!");
  });
  document.getElementById("form-endereco").addEventListener("submit", e => {
    e.preventDefault(); const f = e.target, d = dados(f);
    if (d.cep.replace(/\D/g, "").length !== 8) return erro(f, "Digite um CEP válido.");
    if (!d.rua.trim() || !d.numero.trim() || !d.bairro.trim() || !d.cidade.trim() || !d.estado) return erro(f, "Preencha todos os campos obrigatórios.");
    Auth.atualizar(u => { u.endereco = d; });
    erro(f); aviso("Endereço salvo!");
    if (voltarPagamento) location.href = "index.html#pagamento";
  });
  document.getElementById("form-cartao").addEventListener("submit", e => {
    e.preventDefault(); const f = e.target, d = dados(f), num = d.numero.replace(/\D/g, "");
    if (num.length < 13 || !luhn(num)) return erro(f, "Número de cartão inválido.");
    if (!d.nome.trim()) return erro(f, "Informe o nome impresso no cartão.");
    const [mm, aa] = d.validade.split("/").map(Number), hoje = new Date();
    if (!mm || mm > 12 || !aa || new Date(2000 + aa, mm) <= hoje) return erro(f, "Validade inválida ou vencida.");
    if (!/^\d{3,4}$/.test(d.cvv)) return erro(f, "CVV inválido.");
    Auth.atualizar(u => { u.cartoes.push({ id: Date.now().toString(36), bandeira: bandeira(num), final: num.slice(-4), nome: d.nome.trim().toUpperCase(), validade: d.validade }); });
    f.reset(); erro(f); renderCartoes(); aviso("Cartão adicionado!");
    if (voltarPagamento) location.href = "index.html#pagamento";
  });
  document.getElementById("form-senha").addEventListener("submit", async e => {
    e.preventDefault(); const f = e.target, d = dados(f);
    if (!d.atual || !d.nova) return erro(f, "Preencha os campos de senha.");
    if (d.nova.length < 6) return erro(f, "A nova senha precisa ter pelo menos 6 caracteres.");
    if (d.nova !== d.confirmar) return erro(f, "As senhas novas não conferem.");
    try { await Auth.trocarSenha(d.atual, d.nova); f.reset(); erro(f); aviso("Senha alterada com sucesso!"); }
    catch (x) { erro(f, x.message); }
  });

  // ----- Mostra a área certa -----
  function mostrar() {
    const u = Auth.atual();
    areaLogin.hidden = !!u; areaCliente.hidden = !u;
    atualizarCabecalho();
    if (!u) {
      document.querySelector(".conta-titulo").textContent = "Entrar";
      document.querySelector(".conta-sub").textContent = "Acesse sua conta para acompanhar seus pedidos";
      const av = document.querySelector(".auth-aviso");
      av.hidden = !voltarPagamento; av.textContent = "Entre ou crie sua conta para finalizar a compra. Seu carrinho está guardado.";
      return;
    }
    document.querySelector(".conta-titulo").textContent = "Olá, " + u.nome.split(" ")[0] + "!";
    document.querySelector(".conta-sub").textContent = "Gerencie seus pedidos e seus dados";
    document.querySelector(".avatar").textContent = u.nome.trim()[0].toUpperCase();
    document.querySelector(".ola-nome").textContent = u.nome;
    document.querySelector(".ola-email").textContent = u.email;
    preencher();
    const sec = params.get("sec");
    if (sec && sec !== "pedidos") { secao("conta"); subsecao(["dados", "endereco", "cartoes", "senha"].includes(sec) ? sec : "dados"); }
    else secao("pedidos");
  }
  mostrar();
});
