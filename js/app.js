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
// Numerações: feminino 34 a 39, masculino 34 a 43 (um produto pode ter "tamanhos" próprios)
const faixa = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const tamanhos = p => p.tamanhos || (p.genero === "feminino" ? faixa(34, 39) : faixa(34, 43));
const textoTamanhos = p => { const t = tamanhos(p); return `Tam. ${t[0]} ao ${t[t.length - 1]}`; };
const precoPix = p => Pix.comDesconto(p.preco);
const temFoto = p => Array.isArray(p.imagens) && p.imagens.length > 0;
// Miniatura: foto do produto quando existir, senão o desenho
const miniatura = p => temFoto(p)
  ? `<img src="${escH(p.imagens[0].src)}" alt="${escH(p.imagens[0].alt || p.nome)}" loading="lazy" style="object-position:${escH(p.imagens[0].foco || "50% 50%")}">`
  : arte(p);
const real = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
// Protege textos vindos do banco (nomes, fotos) ao montar o HTML
const escH = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ---------- Cartões ----------
function cartao(p) {
  const desconto = p.precoAntigo ? Math.round((1 - p.preco / p.precoAntigo) * 100) : 0;
  const selo = desconto ? `<span class="selo">-${desconto}%</span>`
    : p.lancamento ? `<span class="selo lanc">Lançamento</span>`
    : (p.destaque ? `<span class="selo novo">Destaque</span>` : "");
  const imagem = temFoto(p)
    ? p.imagens.slice(0, 2).map((f, i) => `<img src="${escH(f.src)}" alt="${i ? "" : escH(f.alt || p.nome)}" loading="lazy" class="${i ? "foto-2" : "foto-1"}" style="object-position:${escH(f.foco || "50% 50%")}">`).join("")
      + (p.imagens.length > 1 ? `<span class="qtd-fotos">${p.imagens.length} fotos</span>` : "")
    : arte(p);
  return `<article class="card">
    <button class="card-img${temFoto(p) ? " com-foto" : ""}" data-ver="${p.id}" aria-label="Ver detalhes de ${escH(p.nome)}">${selo}${imagem}</button>
    <div class="card-corpo">
      <span class="card-tipo">${p.tipo === "tenis" ? "Tênis" : "Chinelo"} · ${p.genero === "feminino" ? "Feminino" : "Masculino"}</span>
      <h3 class="card-nome"><button class="link-nome" data-ver="${p.id}">${escH(p.nome)}</button></h3>
      <div class="precos">
        ${p.precoAntigo ? `<span class="preco-antigo">${real(p.precoAntigo)}</span>` : ""}
        <span class="preco">${real(p.preco)}</span>
      </div>
      <span class="preco-pix"><b>${real(precoPix(p))}</b> no Pix <span class="tag-pix">-5%</span></span>
      <span class="parcela">ou 3x de ${real(p.preco / 3)} sem juros</span>
      <span class="card-tams">${textoTamanhos(p)}</span>
      <button class="btn-add" data-ver="${p.id}">Escolher tamanho</button>
    </div>
  </article>`;
}

// ---------- Visualização do produto (galeria de fotos) ----------
let produtoAberto = null, fotoAtual = 0, tamanhoEscolhido = null;
function criarVisualizacao() {
  document.body.insertAdjacentHTML("beforeend", `
  <div class="ver-produto" role="dialog" aria-modal="true" aria-labelledby="vp-nome">
    <div class="vp-caixa">
      <button class="vp-fechar" aria-label="Fechar">✕</button>
      <div class="vp-galeria">
        <div class="vp-principal"></div>
        <button class="vp-seta ant" aria-label="Foto anterior">‹</button>
        <button class="vp-seta prox" aria-label="Próxima foto">›</button>
        <div class="vp-miniaturas"></div>
      </div>
      <div class="vp-info">
        <span class="card-tipo vp-tipo"></span>
        <h2 id="vp-nome"></h2>
        <div class="precos vp-precos"></div>
        <span class="preco-pix vp-pix"></span>
        <span class="parcela vp-parcela"></span>
        <p class="vp-desc"></p>
        <div class="vp-tamanhos">
          <span class="vp-rotulo">Tamanho <small class="vp-tam-escolhido"></small></span>
          <div class="tams" role="radiogroup" aria-label="Escolha o tamanho"></div>
          <p class="vp-tam-erro" hidden>⚠ Escolha o tamanho antes de adicionar.</p>
        </div>
        <button class="btn btn-escuro vp-add">Adicionar ao carrinho</button>
      </div>
    </div>
  </div>`);
  const vp = document.querySelector(".ver-produto");
  const fechar = () => vp.classList.remove("aberto");
  vp.querySelector(".vp-fechar").addEventListener("click", fechar);
  vp.addEventListener("click", e => { if (e.target === vp) fechar(); });
  document.addEventListener("keydown", e => {
    if (!vp.classList.contains("aberto")) return;
    if (e.key === "Escape") fechar();
    if (e.key === "ArrowRight") mostrarFoto(fotoAtual + 1);
    if (e.key === "ArrowLeft") mostrarFoto(fotoAtual - 1);
  });
  vp.querySelector(".vp-seta.prox").addEventListener("click", () => mostrarFoto(fotoAtual + 1));
  vp.querySelector(".vp-seta.ant").addEventListener("click", () => mostrarFoto(fotoAtual - 1));
  vp.querySelector(".vp-miniaturas").addEventListener("click", e => { const b = e.target.closest("[data-foto]"); if (b) mostrarFoto(+b.dataset.foto); });
  vp.querySelector(".tams").addEventListener("click", e => {
    const b = e.target.closest("[data-tam]"); if (!b) return;
    tamanhoEscolhido = +b.dataset.tam;
    vp.querySelectorAll("[data-tam]").forEach(x => { const on = x === b; x.classList.toggle("ativo", on); x.setAttribute("aria-checked", on); });
    vp.querySelector(".vp-tam-escolhido").textContent = "· " + tamanhoEscolhido;
    vp.querySelector(".vp-tam-erro").hidden = true;
  });
  vp.querySelector(".vp-add").addEventListener("click", () => {
    if (!tamanhoEscolhido) {
      const erro = vp.querySelector(".vp-tam-erro"); erro.hidden = false;
      erro.classList.remove("tremer"); void erro.offsetWidth; erro.classList.add("tremer");
      return;
    }
    adicionar(produtoAberto.id, tamanhoEscolhido); fechar();
  });
  let x0 = null;
  const gal = vp.querySelector(".vp-principal");
  gal.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  gal.addEventListener("touchend", e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 40) mostrarFoto(fotoAtual + (dx < 0 ? 1 : -1)); });
}
function mostrarFoto(n) {
  const p = produtoAberto, vp = document.querySelector(".ver-produto");
  if (!temFoto(p)) { vp.querySelector(".vp-principal").innerHTML = arte(p); return; }
  fotoAtual = (n + p.imagens.length) % p.imagens.length;
  const f = p.imagens[fotoAtual];
  vp.querySelector(".vp-principal").innerHTML = `<img src="${escH(f.src)}" alt="${escH(f.alt || p.nome)}">`;
  vp.querySelectorAll("[data-foto]").forEach(b => b.classList.toggle("ativo", +b.dataset.foto === fotoAtual));
}
function abrirProduto(id) {
  const p = PRODUTOS.find(x => x.id === id); if (!p) return;
  if (!document.querySelector(".ver-produto")) criarVisualizacao();
  produtoAberto = p; fotoAtual = 0; tamanhoEscolhido = null;
  const vp = document.querySelector(".ver-produto"), varias = temFoto(p) && p.imagens.length > 1;
  vp.querySelector(".vp-tipo").textContent = `${p.tipo === "tenis" ? "Tênis" : "Chinelo"} · ${p.genero === "feminino" ? "Feminino" : "Masculino"}${p.lancamento ? " · Lançamento" : ""}`;
  vp.querySelector("#vp-nome").textContent = p.nome;
  vp.querySelector(".vp-precos").innerHTML = (p.precoAntigo ? `<span class="preco-antigo">${real(p.precoAntigo)}</span>` : "") + `<span class="preco">${real(p.preco)}</span>`;
  vp.querySelector(".vp-pix").innerHTML = `<b>${real(precoPix(p))}</b> no Pix <span class="tag-pix">-5%</span>`;
  vp.querySelector(".vp-parcela").textContent = `ou 3x de ${real(p.preco / 3)} sem juros`;
  vp.querySelector(".tams").innerHTML = tamanhos(p).map(t => `<button type="button" role="radio" aria-checked="false" data-tam="${t}">${t}</button>`).join("");
  vp.querySelector(".vp-tam-escolhido").textContent = "";
  vp.querySelector(".vp-tam-erro").hidden = true;
  vp.querySelector(".vp-desc").textContent = p.descricao || "";
  vp.querySelector(".vp-desc").hidden = !p.descricao;
  vp.querySelectorAll(".vp-seta").forEach(b => b.hidden = !varias);
  vp.querySelector(".vp-miniaturas").innerHTML = varias
    ? p.imagens.map((f, i) => `<button data-foto="${i}" aria-label="Foto ${i + 1}"><img src="${escH(f.src)}" alt="" style="object-position:${escH(f.foco || "50% 50%")}"></button>`).join("") : "";
  vp.querySelector(".vp-galeria").classList.toggle("com-foto", temFoto(p));
  mostrarFoto(0);
  vp.classList.add("aberto");
  vp.querySelector(".vp-fechar").focus();
  Loja.registrar("ver_produto", p.id);
}
function renderizar(el, lista) {
  el.innerHTML = lista.length ? lista.map(cartao).join("")
    : `<p class="vazio">${Loja.erroInicial ? "Não foi possível carregar os produtos agora. Atualize a página em instantes." : "Nenhum produto encontrado."}</p>`;
}

// ---------- Carrinho (salvo no navegador) ----------
let carrinho = [];
try { carrinho = JSON.parse(localStorage.getItem("carrinho")) || []; } catch (e) {}
// (itens de produtos que saíram do catálogo são removidos depois que o catálogo carrega)
const salvar = () => { try { localStorage.setItem("carrinho", JSON.stringify(carrinho)); } catch (e) {} };

// Cada item do carrinho é produto + tamanho
const chaveItem = i => i.id + "-" + i.tamanho;
function adicionar(id, tamanho) {
  const item = carrinho.find(i => i.id === id && i.tamanho === tamanho);
  item ? item.qtd++ : carrinho.push({ id, tamanho, qtd: 1 });
  salvar(); atualizarCarrinho();
  aviso(`Adicionado ao carrinho (tamanho ${tamanho})`);
  Loja.registrar("add_carrinho", id);
}
function alterar(chave, delta) {
  const item = carrinho.find(i => chaveItem(i) === chave);
  if (!item) return;
  item.qtd += delta;
  if (item.qtd <= 0) carrinho = carrinho.filter(i => i !== item);
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
      <div class="item-img">${miniatura(p)}</div>
      <div><div class="item-nome">${escH(p.nome)}</div><div class="item-tam">Tamanho ${i.tamanho}</div><div>${real(p.preco)}</div>
        <div class="qtd"><button data-menos="${chaveItem(i)}" aria-label="Diminuir">−</button>${i.qtd}<button data-mais="${chaveItem(i)}" aria-label="Aumentar">+</button></div></div>
      <button class="remover" data-remover="${chaveItem(i)}">Remover</button>
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
  document.querySelectorAll(".conta-nome").forEach(el => { el.textContent = u ? "Olá, " + (u.nome.split(" ")[0] || "cliente") : "Entrar"; });
}


// ---------- Carrossel de anúncios ----------
function iniciarCarrossel(raiz) {
  const slides = [...raiz.querySelectorAll(".slide")], pontos = [...raiz.querySelectorAll(".ponto")];
  const TEMPO = 5000;
  let atual = 0, timer = null, pausado = false;
  function ir(n) {
    atual = (n + slides.length) % slides.length;
    slides.forEach((s, i) => {
      const ativo = i === atual;
      s.classList.toggle("ativo", ativo);
      s.setAttribute("aria-hidden", ativo ? "false" : "true");
      s.querySelectorAll("a, button").forEach(el => ativo ? el.removeAttribute("tabindex") : el.setAttribute("tabindex", "-1"));
    });
    pontos.forEach((p, i) => { p.classList.toggle("ativo", i === atual); p.setAttribute("aria-selected", i === atual); });
    raiz.classList.toggle("no-escuro", slides[atual].classList.contains("escuro"));
  }
  const parar = () => { clearInterval(timer); timer = null; };
  const tocar = () => { parar(); if (!pausado && !document.hidden) timer = setInterval(() => ir(atual + 1), TEMPO); };
  const manual = n => { ir(n); tocar(); };   // ao clicar, reinicia a contagem
  raiz.querySelector(".prox").addEventListener("click", () => manual(atual + 1));
  raiz.querySelector(".ant").addEventListener("click", () => manual(atual - 1));
  pontos.forEach((p, i) => p.addEventListener("click", () => manual(i)));
  // pausa enquanto o mouse está em cima ou algo dentro está em foco
  raiz.addEventListener("mouseenter", () => { pausado = true; parar(); });
  raiz.addEventListener("mouseleave", () => { pausado = false; tocar(); });
  raiz.addEventListener("focusin", () => { pausado = true; parar(); });
  raiz.addEventListener("focusout", () => { pausado = false; tocar(); });
  document.addEventListener("visibilitychange", tocar);
  // deslizar com o dedo no celular
  let x0 = null;
  raiz.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  raiz.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) manual(atual + (dx < 0 ? 1 : -1));
  });
  ir(0); tocar();
}

// ---------- Inicialização ----------
document.addEventListener("DOMContentLoaded", async () => {
  await Loja.pronto;   // espera produtos e conta carregarem
  carrinho = carrinho.filter(i => i && i.tamanho && PRODUTOS.some(p => p.id === i.id)); salvar();
  Loja.registrar("visita");
  // E-mail de suporte vindo da configuração
  document.querySelectorAll(".contato-email").forEach(a => {
    a.href = `mailto:${CONFIG.emailSuporte}?subject=Suporte%20STN%20Sneakers`;
    const t = a.querySelector("span"); if (t) t.innerHTML = `<small>Suporte</small>${escH(CONFIG.emailSuporte)}`;
  });
  // Formas de pagamento disponíveis (online: só Pix até ligar cartão/boleto)
  document.querySelectorAll(".pagamentos input[name=pag]").forEach(r => { if (!Loja.formasPagamento.includes(r.value)) r.closest(".pag").remove(); });
  // Página inicial
  const promo = document.getElementById("promocoes");
  if (promo) renderizar(promo, PRODUTOS.filter(p => p.precoAntigo).slice(0, 8));
  // Lançamentos separados por gênero (cada grupo some se estiver vazio)
  const secLanc = document.getElementById("lancamentos-sec");
  if (secLanc) {
    let algum = false;
    secLanc.querySelectorAll(".bloco-genero").forEach(bloco => {
      const lista = PRODUTOS.filter(p => p.lancamento && p.genero === bloco.dataset.genero);
      bloco.hidden = !lista.length; algum = algum || lista.length > 0;
      renderizar(bloco.querySelector(".grade"), lista);
    });
    secLanc.hidden = !algum;
  }
  const dest = document.getElementById("destaques");
  if (dest) renderizar(dest, PRODUTOS.filter(p => p.destaque));
  // Textos dos anúncios calculados a partir do catálogo (sempre corretos)
  document.querySelectorAll("[data-menor-preco]").forEach(el => {
    const precos = PRODUTOS.filter(p => p.tipo === el.dataset.menorPreco).map(p => p.preco);
    if (precos.length) el.textContent = real(Math.min(...precos));
  });
  document.querySelectorAll("[data-maior-desconto]").forEach(el => {
    const d = PRODUTOS.filter(p => p.tipo === el.dataset.maiorDesconto && p.precoAntigo).map(p => Math.round((1 - p.preco / p.precoAntigo) * 100));
    if (d.length) el.textContent = Math.max(...d) + "% OFF";
  });
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
      let lista = PRODUTOS.filter(p => p.genero === genero && (tipo === "todos" ||
        (tipo === "promo" ? p.precoAntigo : tipo === "lancamento" ? p.lancamento : p.tipo === tipo)));
      if (ordem === "menor") lista.sort((a, b) => a.preco - b.preco);
      if (ordem === "maior") lista.sort((a, b) => b.preco - a.preco);
      renderizar(cat, lista);
    };
    // esconde o filtro "Lançamentos" quando não há lançamentos nesta página
    const fl = document.querySelector('.filtro[data-tipo="lancamento"]');
    if (fl) fl.hidden = !PRODUTOS.some(p => p.genero === genero && p.lancamento);
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
    if (t.dataset.ver) abrirProduto(+t.dataset.ver);
    if (t.dataset.mais) alterar(t.dataset.mais, 1);
    if (t.dataset.menos) alterar(t.dataset.menos, -1);
    if (t.dataset.remover) alterar(t.dataset.remover, -Infinity);
  });
  document.querySelector(".btn-carrinho").addEventListener("click", () => abrirCarrinho(true));
  document.querySelector(".fechar-carrinho").addEventListener("click", () => abrirCarrinho(false));
  document.querySelector(".sombra").addEventListener("click", () => abrirCarrinho(false));
  // Finalizar compra: pergunta se quer continuar comprando ou ir para o pagamento
  const modal = document.querySelector(".modal");
  const totalCarrinho = () => carrinho.reduce((s, i) => s + PRODUTOS.find(p => p.id === i.id).preco * i.qtd, 0);
  const etapa = nome => {
    const ep = modal.querySelector(".etapa-pix"); if (ep) ep.hidden = true;
    modal.querySelector(".etapa-escolha").hidden = nome !== "escolha";
    modal.querySelector(".etapa-pagamento").hidden = nome !== "pagamento";
    if (nome === "pagamento") { renderCheckoutExtra(); Loja.registrar("checkout"); }
  };
  const fecharModal = () => modal.classList.remove("aberto");
  // Etapa final do Pix: QR Code e copia e cola (criada aqui para valer em todas as páginas)
  function mostrarEtapaPix(pedido) {
    let el = modal.querySelector(".etapa-pix");
    if (!el) { el = document.createElement("div"); el.className = "etapa etapa-pix"; modal.querySelector(".modal-caixa").appendChild(el); }
    modal.querySelector(".etapa-escolha").hidden = true;
    modal.querySelector(".etapa-pagamento").hidden = true;
    el.hidden = false;
    el.innerHTML = `<h2>Pague com Pix</h2>
      <p>Pedido <strong>#${pedido.numero}</strong> criado. Você economizou <strong>${real(pedido.desconto)}</strong> com o Pix.</p>
      <p class="pix-prazo">Pague em até ${PIX_CONFIG.validadeMin} minutos: ${contadorPix(pedido)}</p>
      <div class="pix-conteudo">${blocoPix(pedido.pix, pedido.total)}</div>
      <a href="conta.html?sec=pedidos" class="btn btn-claro pix-ver-pedidos">Ver meus pedidos</a>`;
    modal.querySelector(".modal-caixa").scrollTop = 0;
  }
  // Quando o tempo do Pix acaba com a janela aberta, troca o QR Code por um aviso
  document.addEventListener("pix-expirou", e => {
    const el = modal.querySelector(".etapa-pix");
    if (!el || el.hidden || !el.querySelector(`.pix-timer[data-pedido="${e.detail}"]`)) return;
    el.querySelector(".pix-conteudo").innerHTML = `<div class="pix-expirado-aviso">
      <strong>O tempo para pagar acabou.</strong>
      <p>Este QR Code não deve mais ser usado. Você pode excluir o pedido em Meus Pedidos e fazer uma nova compra.</p></div>`;
    el.querySelector(".pix-prazo").innerHTML = `<span class="status expirado">Pix expirado</span>`;
  });
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
        ? `<select class="sel-cartao" aria-label="Escolha o cartão">${u.cartoes.map(c => `<option value="${c.id}">${escHtml(c.bandeira)} •••• ${escHtml(c.final)}</option>`).join("")}</select>
           <span class="extra-rotulo rotulo-parcelas">Parcelas</span>
           <select class="sel-parcelas" aria-label="Número de parcelas">${[1, 2, 3].map(n =>
             `<option value="${n}"${n === parcelas ? " selected" : ""}>${n}x de ${real(totalCarrinho() / n)} sem juros${n === 1 ? " (à vista)" : ""}</option>`).join("")}</select>`
        : `<p class="extra-alerta">Nenhum cartão cadastrado.</p>`) +
        `<a href="conta.html?sec=cartoes&voltar=pagamento">${u.cartoes.length ? "Adicionar outro" : "Cadastrar cartão"}</a></div>`;
    }
    const sub = totalCarrinho(), pix = formaPag() === "pix";
    html = `<div class="extra-bloco resumo">
      <div class="linha"><span>Subtotal</span><span>${real(sub)}</span></div>
      ${pix ? `<div class="linha desconto"><span>Desconto Pix (5%)</span><span>− ${real(sub - Pix.comDesconto(sub))}</span></div>` : ""}
      <div class="linha total-final"><span>Total${pix ? " no Pix" : ""}</span><span>${real(pix ? Pix.comDesconto(sub) : sub)}</span></div>
    </div>` + html;
    el.innerHTML = html;
  }
  modal.querySelectorAll("input[name=pag]").forEach(r => r.addEventListener("change", renderCheckoutExtra));
  let parcelas = 1;   // até 3x sem juros
  modal.addEventListener("change", e => { if (e.target.matches(".sel-parcelas")) parcelas = +e.target.value; });

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
  modal.querySelector(".confirmar").addEventListener("click", async e => {
    const u = Auth.atual(), botao = e.currentTarget;
    if (!u) { location.href = "conta.html?voltar=pagamento"; return; }
    if (!u.endereco || !u.endereco.rua) return aviso("Cadastre um endereço de entrega.");
    const forma = formaPag();
    if (forma === "cartao" && !modal.querySelector(".sel-cartao")) return aviso("Cadastre um cartão para pagar com crédito.");
    botao.disabled = true; const texto = botao.textContent; botao.textContent = "Criando pedido...";
    let pedido;
    try {
      pedido = await Loja.criarPedido({ itens: carrinho, forma,
        cartaoId: modal.querySelector(".sel-cartao")?.value, parcelas: +(modal.querySelector(".sel-parcelas")?.value || 1) });
    } catch (x) { aviso(x.message); return; }
    finally { botao.disabled = false; botao.textContent = texto; }
    Loja.registrar("pedido");
    carrinho = []; salvar(); atualizarCarrinho();
    if (forma === "pix") { mostrarEtapaPix(pedido); return; }
    fecharModal(); abrirCarrinho(false);
    aviso(`Pedido #${pedido.numero} confirmado! Veja em Meus Pedidos 🎉`);
  });
  // Voltando do login/cadastro direto para o pagamento
  if (location.hash === "#pagamento") {
    history.replaceState(null, "", location.pathname + location.search);
    if (carrinho.length && Auth.atual()) { abrirCarrinho(true); abrirFinalizacao("pagamento"); }
  }
  const news = document.querySelector(".news form");
  if (news) news.addEventListener("submit", async e => {
    e.preventDefault();
    try { await Loja.newsletter(news.querySelector("input").value); news.reset(); aviso("Cadastro realizado! Fique de olho no seu e-mail."); }
    catch (x) { aviso(x.message); }
  });

  const carrossel = document.querySelector(".carrossel");
  if (carrossel) iniciarCarrossel(carrossel);

  // E-mail de suporte: além de abrir o programa de e-mail, copia o endereço
  document.querySelectorAll(".contato-email").forEach(a => a.addEventListener("click", () => {
    const email = CONFIG.emailSuporte;
    const copiado = () => aviso("E-mail de suporte copiado: " + email);
    try { navigator.clipboard.writeText(email).then(copiado, () => {}); } catch (e) {}
  }));

  atualizarCabecalho();
  atualizarCarrinho();
});
