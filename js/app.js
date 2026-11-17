// ---------- Ilustrações (SVG) dos produtos ----------
function svgTenis(cor, sola) {
  return `<svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="100" cy="102" rx="85" ry="5" fill="rgba(0,0,0,.12)"/>
    <path d="M18 78 C18 55 40 52 55 40 C68 30 78 22 92 26 L104 44 C120 50 150 52 172 62 C186 68 188 80 186 86 L20 88 Z" fill="${cor}" stroke="rgba(0,0,0,.25)" stroke-width="1.5"/>
    <path d="M14 86 L188 86 C190 94 186 98 178 98 L22 98 C14 98 12 92 14 86 Z" fill="${sola}" stroke="rgba(0,0,0,.25)" stroke-width="1.5"/>
    <path d="M60 46 L96 58 M66 40 L100 52 M72 34 L102 46" stroke="${sola}" stroke-width="3" stroke-linecap="round"/>
    <path d="M110 70 C130 64 150 70 170 74" stroke="${sola}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>
    <path d="M22 74 L50 74" stroke="rgba(0,0,0,.18)" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}
function svgChinelo(cor, sola) {
  return `<svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="100" cy="100" rx="85" ry="5" fill="rgba(0,0,0,.12)"/>
    <path d="M20 84 C20 74 40 70 70 70 L160 70 C182 70 190 78 188 86 C186 94 176 96 160 96 L40 96 C26 96 20 92 20 84 Z" fill="${sola}" stroke="rgba(0,0,0,.25)" stroke-width="1.5"/>
    <path d="M20 84 C20 92 26 96 40 96 L160 96 C176 96 186 94 188 86 L188 92 C186 100 176 102 160 102 L40 102 C26 102 20 98 20 92 Z" fill="rgba(0,0,0,.15)"/>
    <path d="M90 74 C96 40 140 36 156 72" fill="none" stroke="${cor}" stroke-width="16" stroke-linecap="round"/>
    <path d="M90 74 C96 40 140 36 156 72" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}
const arte = p => p.tipo === "chinelo" ? svgChinelo(p.cor, p.sola) : svgTenis(p.cor, p.sola);
const real = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ---------- Cartões ----------
function cartao(p) {
  const desconto = p.precoAntigo ? Math.round((1 - p.preco / p.precoAntigo) * 100) : 0;
  const selo = desconto ? `<span class="selo">-${desconto}%</span>` : (p.destaque ? `<span class="selo novo">Destaque</span>` : "");
  return `<article class="card">
    <div class="card-img">${selo}${arte(p)}</div>
    <div class="card-corpo">
      <span class="card-tipo">${p.tipo === "tenis" ? "Tênis" : "Chinelo"} · ${p.genero === "feminino" ? "Feminino" : "Masculino"}</span>
      <h3 class="card-nome">${p.nome}</h3>
      <div class="precos">
        ${p.precoAntigo ? `<span class="preco-antigo">${real(p.precoAntigo)}</span>` : ""}
        <span class="preco">${real(p.preco)}</span>
      </div>
      <span class="parcela">ou 3x de ${real(p.preco / 3)} sem juros</span>
      <button class="btn-add" data-id="${p.id}">Adicionar<span class="longo"> ao carrinho</span></button>
    </div>
  </article>`;
}
function renderizar(el, lista) {
  el.innerHTML = lista.length ? lista.map(cartao).join("") : `<p class="vazio">Nenhum produto encontrado.</p>`;
}

// ---------- Carrinho (salvo no navegador) ----------
let carrinho = [];
try { carrinho = JSON.parse(localStorage.getItem("carrinho")) || []; } catch (e) {}
const salvar = () => { try { localStorage.setItem("carrinho", JSON.stringify(carrinho)); } catch (e) {} };

function adicionar(id) {
  const item = carrinho.find(i => i.id === id);
  item ? item.qtd++ : carrinho.push({ id, qtd: 1 });
  salvar(); atualizarCarrinho();
  aviso("Produto adicionado ao carrinho!");
}
function alterar(id, delta) {
  const item = carrinho.find(i => i.id === id);
  if (!item) return;
  item.qtd += delta;
  if (item.qtd <= 0) carrinho = carrinho.filter(i => i.id !== id);
  salvar(); atualizarCarrinho();
}
function atualizarCarrinho() {
  const qtdTotal = carrinho.reduce((s, i) => s + i.qtd, 0);
  document.querySelectorAll(".contador").forEach(c => { c.textContent = qtdTotal; c.style.display = qtdTotal ? "grid" : "none"; });
  const lista = document.querySelector(".carrinho-itens");
  let total = 0;
  lista.innerHTML = carrinho.length ? carrinho.map(i => {
    const p = PRODUTOS.find(x => x.id === i.id);
    total += p.preco * i.qtd;
    return `<div class="item">
      <div class="item-img">${arte(p)}</div>
      <div><div class="item-nome">${p.nome}</div><div>${real(p.preco)}</div>
        <div class="qtd"><button data-menos="${p.id}" aria-label="Diminuir">−</button>${i.qtd}<button data-mais="${p.id}" aria-label="Aumentar">+</button></div></div>
      <button class="remover" data-remover="${p.id}">Remover</button>
    </div>`;
  }).join("") : `<p class="vazio">Seu carrinho está vazio.</p>`;
  document.querySelector(".total-valor").textContent = real(total);
}
function abrirCarrinho(abrir) {
  document.querySelector(".carrinho").classList.toggle("aberto", abrir);
  document.querySelector(".sombra").classList.toggle("aberto", abrir);
}
let tempoAviso;
function aviso(txt) {
  const t = document.querySelector(".toast");
  t.textContent = txt; t.classList.add("mostrar");
  clearTimeout(tempoAviso); tempoAviso = setTimeout(() => t.classList.remove("mostrar"), 2200);
}

// ---------- Cabeçalho: nome do cliente logado ----------
function atualizarCabecalho() {
  const u = typeof Auth !== "undefined" && Auth.atual();
  document.querySelectorAll(".conta-nome").forEach(el => { el.textContent = u ? "Olá, " + u.nome.split(" ")[0] : "Entrar"; });
}

// ---------- Inicialização ----------
document.addEventListener("DOMContentLoaded", () => {
  // Página inicial
  const promo = document.getElementById("promocoes");
  if (promo) renderizar(promo, PRODUTOS.filter(p => p.precoAntigo).slice(0, 8));
  const dest = document.getElementById("destaques");
  if (dest) renderizar(dest, PRODUTOS.filter(p => p.destaque));
  document.querySelectorAll("[data-arte]").forEach(el => {
    const [tipo, cor, sola] = el.dataset.arte.split(",");
    el.innerHTML = tipo === "chinelo" ? svgChinelo(cor, sola) : svgTenis(cor, sola);
  });

  // Páginas Feminino / Masculino
  const cat = document.getElementById("catalogo");
  if (cat) {
    const genero = cat.dataset.genero;
    let tipo = "todos", ordem = "relevancia";
    const atualizar = () => {
      let lista = PRODUTOS.filter(p => p.genero === genero && (tipo === "todos" || (tipo === "promo" ? p.precoAntigo : p.tipo === tipo)));
      if (ordem === "menor") lista.sort((a, b) => a.preco - b.preco);
      if (ordem === "maior") lista.sort((a, b) => b.preco - a.preco);
      renderizar(cat, lista);
    };
    document.querySelectorAll(".filtro").forEach(b => b.addEventListener("click", () => {
      document.querySelectorAll(".filtro").forEach(x => x.classList.remove("ativo"));
      b.classList.add("ativo"); tipo = b.dataset.tipo; atualizar();
    }));
    document.querySelector(".ordenar").addEventListener("change", e => { ordem = e.target.value; atualizar(); });
    const inicial = new URLSearchParams(location.search).get("tipo");
    if (inicial) document.querySelector(`.filtro[data-tipo="${inicial}"]`)?.click(); else atualizar();
  }

  // Menu celular
  document.querySelector(".btn-menu").addEventListener("click", () => document.querySelector(".menu").classList.toggle("aberto"));

  // Eventos de clique gerais
  document.addEventListener("click", e => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.id) adicionar(+t.dataset.id);
    if (t.dataset.mais) alterar(+t.dataset.mais, 1);
    if (t.dataset.menos) alterar(+t.dataset.menos, -1);
    if (t.dataset.remover) alterar(+t.dataset.remover, -Infinity);
  });
  document.querySelector(".btn-carrinho").addEventListener("click", () => abrirCarrinho(true));
  document.querySelector(".fechar-carrinho").addEventListener("click", () => abrirCarrinho(false));
  document.querySelector(".sombra").addEventListener("click", () => abrirCarrinho(false));
  // Finalizar compra: pergunta se quer continuar comprando ou ir para o pagamento
  const modal = document.querySelector(".modal");
  const totalCarrinho = () => carrinho.reduce((s, i) => s + PRODUTOS.find(p => p.id === i.id).preco * i.qtd, 0);
  const etapa = nome => {
    modal.querySelector(".etapa-escolha").hidden = nome !== "escolha";
    modal.querySelector(".etapa-pagamento").hidden = nome !== "pagamento";
    if (nome === "pagamento") renderCheckoutExtra();
  };
  const fecharModal = () => modal.classList.remove("aberto");
  function abrirFinalizacao(nomeEtapa) {
    const qtd = carrinho.reduce((s, i) => s + i.qtd, 0);
    modal.querySelector(".modal-qtd").textContent = qtd + (qtd === 1 ? " item" : " itens");
    modal.querySelectorAll(".modal-total").forEach(el => el.textContent = real(totalCarrinho()));
    etapa(nomeEtapa); modal.classList.add("aberto");
  }
  const formaPag = () => modal.querySelector("input[name=pag]:checked").value;
  const enderecoTexto = e => e && e.rua ? `${e.rua}, ${e.numero}${e.complemento ? " - " + e.complemento : ""} · ${e.bairro}, ${e.cidade}/${e.estado}` : "";
  const escHtml = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Endereço de entrega e cartão salvo dentro da etapa de pagamento
  function renderCheckoutExtra() {
    const u = Auth.atual(), el = modal.querySelector(".checkout-extra");
    if (!u) { el.innerHTML = ""; return; }
    const end = enderecoTexto(u.endereco);
    let html = `<div class="extra-bloco"><span class="extra-rotulo">Entregar em</span>` + (end
      ? `<p>${escHtml(end)}</p><a href="conta.html?sec=endereco&voltar=pagamento">Alterar</a>`
      : `<p class="extra-alerta">Nenhum endereço cadastrado.</p><a href="conta.html?sec=endereco&voltar=pagamento">Cadastrar endereço</a>`) + `</div>`;
    if (formaPag() === "cartao") {
      html += `<div class="extra-bloco"><span class="extra-rotulo">Cartão</span>` + (u.cartoes.length
        ? `<select class="sel-cartao" aria-label="Escolha o cartão">${u.cartoes.map(c => `<option value="${c.id}">${escHtml(c.bandeira)} •••• ${escHtml(c.final)}</option>`).join("")}</select>`
        : `<p class="extra-alerta">Nenhum cartão cadastrado.</p>`) +
        `<a href="conta.html?sec=cartoes&voltar=pagamento">${u.cartoes.length ? "Adicionar outro" : "Cadastrar cartão"}</a></div>`;
    }
    el.innerHTML = html;
  }
  modal.querySelectorAll("input[name=pag]").forEach(r => r.addEventListener("change", renderCheckoutExtra));

  document.querySelector(".finalizar").addEventListener("click", () => {
    if (!carrinho.length) return aviso("Adicione produtos ao carrinho.");
    abrirFinalizacao("escolha");
  });
  modal.querySelector(".continuar").addEventListener("click", () => { fecharModal(); abrirCarrinho(false); });
  modal.querySelector(".ir-pagamento").addEventListener("click", () => {
    if (!Auth.atual()) { location.href = "conta.html?voltar=pagamento"; return; }
    etapa("pagamento");
  });
  modal.querySelector(".voltar").addEventListener("click", () => etapa("escolha"));
  modal.querySelector(".modal-fechar").addEventListener("click", fecharModal);
  modal.addEventListener("click", e => { if (e.target === modal) fecharModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") fecharModal(); });
  modal.querySelector(".confirmar").addEventListener("click", () => {
    const u = Auth.atual();
    if (!u) { location.href = "conta.html?voltar=pagamento"; return; }
    if (!u.endereco || !u.endereco.rua) return aviso("Cadastre um endereço de entrega.");
    const forma = formaPag();
    let pagamento = { pix: "Pix", boleto: "Boleto" }[forma];
    if (forma === "cartao") {
      const c = u.cartoes.find(x => x.id === modal.querySelector(".sel-cartao")?.value);
      if (!c) return aviso("Cadastre um cartão para pagar com crédito.");
      pagamento = `Cartão ${c.bandeira} •••• ${c.final}`;
    }
    const pedido = {
      numero: String(Date.now()).slice(-6), data: new Date().toISOString(),
      itens: carrinho.map(i => { const p = PRODUTOS.find(x => x.id === i.id); return { id: p.id, nome: p.nome, preco: p.preco, qtd: i.qtd }; }),
      total: totalCarrinho(), pagamento, endereco: enderecoTexto(u.endereco),
      status: forma === "boleto" ? "Aguardando pagamento" : "Pagamento aprovado"
    };
    Auth.atualizar(x => { x.pedidos.unshift(pedido); });
    carrinho = []; salvar(); atualizarCarrinho(); fecharModal(); abrirCarrinho(false);
    aviso(`Pedido #${pedido.numero} confirmado! Veja em Meus Pedidos 🎉`);
  });
  // Voltando do login/cadastro direto para o pagamento
  if (location.hash === "#pagamento") {
    history.replaceState(null, "", location.pathname + location.search);
    if (carrinho.length && Auth.atual()) { abrirCarrinho(true); abrirFinalizacao("pagamento"); }
  }
  const news = document.querySelector(".news form");
  if (news) news.addEventListener("submit", e => { e.preventDefault(); news.reset(); aviso("Cadastro realizado! Fique de olho no seu e-mail."); });

  atualizarCabecalho();
  atualizarCarrinho();
});
