// =====================================================================
// Painel administrativo: produtos e fotos, pedidos, clientes e fluxo do site
// =====================================================================
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const real = v => (+v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const numero = n => (+n || 0).toLocaleString("pt-BR");
const dataHora = d => new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
const diaMes = d => { const [, m, dd] = String(d).slice(0, 10).split("-"); return `${dd}/${m}`; };
const faixa = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const tamanhosPadrao = genero => genero === "feminino" ? faixa(34, 39) : faixa(34, 43);
const TODOS_TAMANHOS = faixa(33, 46);
const STATUS = ["Aguardando pagamento", "Pagamento aprovado", "Enviado", "Entregue", "Cancelado"];
const STATUS_CLASSE = { "Pagamento aprovado": "ok", "Entregue": "ok", "Enviado": "enviado", "Aguardando pagamento": "espera", "Pix expirado": "expirado", "Cancelado": "cancelado", "Cancelado pelo cliente": "cancelado" };
const NOME_PAGINA = { index: "Início", feminino: "Feminino", masculino: "Masculino", conta: "Minha conta" };

let tempoAviso;
function aviso(txt) {
  const t = $(".toast"); t.textContent = txt; t.classList.add("mostrar");
  clearTimeout(tempoAviso); tempoAviso = setTimeout(() => t.classList.remove("mostrar"), 2600);
}
function erro(el, msg) { const p = $(".erro", el) || el; p.textContent = msg || ""; p.hidden = !msg; }
const carregando = (el, txt = "Carregando...") => { el.innerHTML = `<p class="adm-nota">${txt}</p>`; };

// ---------- Entrada ----------
document.addEventListener("DOMContentLoaded", async () => {
  await Loja.pronto;
  $(".adm-demo").hidden = Loja.online;
  $(".adm-sair").addEventListener("click", async () => { await Loja.sair(); location.reload(); });
  $("#adm-login form").addEventListener("submit", async e => {
    e.preventDefault(); const f = e.target;
    try {
      await Loja.entrar(f.email.value, f.senha.value);
      if (!Loja.ehAdmin()) { await Loja.sair(); return erro(f, "Esta conta não tem acesso ao painel. Peça a um administrador para incluir seu e-mail em Equipe."); }
      decidir();
    } catch (x) { erro(f, x.message); }
  });
  decidir();
});

function decidir() {
  const u = Loja.usuario();
  $(".adm-quem").textContent = u ? u.nome || u.email : "";
  $(".adm-sair").hidden = !(Loja.online && u);
  if (!Loja.ehAdmin()) {
    $("#adm-login").hidden = false; $("#adm-app").hidden = true;
    if (u) erro($("#adm-login form"), "Esta conta não tem acesso ao painel. Peça a um administrador para incluir seu e-mail em Equipe.");
    return;
  }
  $("#adm-login").hidden = true; $("#adm-app").hidden = false;
  iniciarPainel();
}

// ---------- Abas ----------
const carregar = { resumo: carregarResumo, produtos: carregarProdutos, pedidos: carregarPedidos, clientes: carregarClientes, newsletter: carregarNewsletter, equipe: carregarEquipe };
function abrirAba(nome) {
  $$(".adm-abas button").forEach(b => b.classList.toggle("ativo", b.dataset.aba === nome));
  $$("[data-painel]").forEach(p => p.hidden = p.dataset.painel !== nome);
  history.replaceState(null, "", "#" + nome);
  carregar[nome]();
}
let iniciado = false;
function iniciarPainel() {
  if (iniciado) return; iniciado = true;
  $$(".adm-abas button").forEach(b => b.addEventListener("click", () => abrirAba(b.dataset.aba)));
  $(".sel-periodo").addEventListener("change", carregarResumo);
  iniciarProdutos(); iniciarPedidos(); iniciarEditor(); iniciarNewsletter(); iniciarEquipe();
  $(".busca-cliente").addEventListener("input", desenharClientes);
  const inicial = location.hash.slice(1);
  abrirAba(carregar[inicial] ? inicial : "resumo");
  atualizarBadge();
}
async function atualizarBadge() {
  try {
    const peds = await Loja.todosPedidos();
    const n = peds.filter(p => ["Aguardando pagamento", "Pagamento aprovado"].includes(Loja.statusVisivel(p))).length;
    const b = $('[data-badge="pedidos"]'); b.hidden = !n; b.textContent = n;
  } catch (e) {}
}

// =====================================================================
// RESUMO: números, visitantes por dia, funil, produtos e páginas
// =====================================================================
async function carregarResumo() {
  const dias = +$(".sel-periodo").value;
  carregando($(".kpis"));
  let r;
  try { r = await Loja.resumo(dias); } catch (x) { $(".kpis").innerHTML = `<p class="erro">${esc(x.message)}</p>`; return; }
  const f = r.funil, p = r.pedidos;
  const conv = f.visitantes ? (f.pedido / f.visitantes * 100) : 0;
  const kpi = (rotulo, valor, nota = "", alerta = false) => `<div class="kpi${alerta ? " alerta" : ""}"><span>${rotulo}</span><strong>${valor}</strong>${nota ? `<small>${nota}</small>` : ""}</div>`;
  $(".kpis").innerHTML =
    kpi("Visitantes", numero(f.visitantes), `nos últimos ${dias} dias`) +
    kpi("Pedidos", numero(p.total), `${numero(p.pagos)} pagos`) +
    kpi("Faturamento", real(p.faturamento), "pedidos pagos") +
    kpi("Conversão", conv.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%", "visitantes que pediram") +
    kpi("Aguardando Pix", numero(p.aguardando), p.aguardando ? "confira no banco" : "nada pendente", p.aguardando > 0) +
    kpi("Para enviar", numero(p.para_enviar), p.para_enviar ? "pagos, ainda não enviados" : "tudo enviado", p.para_enviar > 0) +
    kpi("Clientes novos", numero(r.clientes_novos), "contas criadas");
  desenharDias(r.por_dia);
  desenharFunil(f);
  $(".tab-top-produtos tbody").innerHTML = r.produtos.length
    ? r.produtos.map(x => `<tr><td>${esc(x.nome)}</td><td class="num">${numero(x.vistas)}</td><td class="num">${numero(x.adicoes)}</td></tr>`).join("")
    : `<tr><td colspan="3" class="vazio-linha">Ainda sem visualizações no período.</td></tr>`;
  $(".tab-paginas tbody").innerHTML = r.paginas.length
    ? r.paginas.map(x => `<tr><td>${esc(NOME_PAGINA[x.pagina] || x.pagina)}</td><td class="num">${numero(x.visitas)}</td></tr>`).join("")
    : `<tr><td colspan="2" class="vazio-linha">Ainda sem visitas no período.</td></tr>`;
}

function escalaBonita(max) {
  if (max <= 4) return 4;
  const pot = 10 ** Math.floor(Math.log10(max)), n = max / pot;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pot;
}
function desenharDias(dias) {
  const max = escalaBonita(Math.max(0, ...dias.map(d => d.visitantes)));
  const meio = Math.floor(dias.length / 2);
  $(".grafico-dias").innerHTML = `
    <div class="gd-eixo"><span>${numero(max)}</span><span>${numero(max / 2)}</span><span>0</span></div>
    <div class="gd-area">
      <div class="gd-barras" role="img" aria-label="Visitantes por dia">${dias.map(d => `
        <div class="gd-col" tabindex="0" data-dica="<b>${diaMes(d.dia)}</b> · ${numero(d.visitantes)} visitantes · ${numero(d.visitas)} visitas · ${numero(d.pedidos)} pedidos">
          <div class="gd-barra" style="height:${d.visitantes / max * 100}%"></div></div>`).join("")}</div>
      <div class="gd-rotulos"><span>${diaMes(dias[0].dia)}</span><span>${diaMes(dias[meio].dia)}</span><span>${diaMes(dias[dias.length - 1].dia)}</span></div>
    </div>`;
}
// Dica ao passar o mouse (ou focar com o teclado) nas barras
const dica = () => $(".adm-dica");
function mostrarDica(alvo, x, y) {
  const d = dica(); d.innerHTML = alvo.dataset.dica; d.hidden = false;
  const r = d.getBoundingClientRect();
  d.style.left = Math.min(window.innerWidth - r.width - 8, Math.max(8, x - r.width / 2)) + "px";
  d.style.top = Math.max(8, y - r.height - 12) + "px";
}
document.addEventListener("mousemove", e => { const c = e.target.closest("[data-dica]"); c ? mostrarDica(c, e.clientX, e.clientY) : (dica().hidden = true); });
document.addEventListener("focusin", e => { const c = e.target.closest("[data-dica]"); if (!c) return; const r = c.getBoundingClientRect(); mostrarDica(c, r.left + r.width / 2, r.top); });
document.addEventListener("focusout", () => { dica().hidden = true; });

function desenharFunil(f) {
  const etapas = [["Visitaram a loja", f.visitantes], ["Viram um produto", f.viram_produto], ["Puseram no carrinho", f.add_carrinho], ["Foram ao pagamento", f.checkout], ["Fizeram pedido", f.pedido]];
  const base = f.visitantes || 1;
  $(".funil").innerHTML = etapas.map(([rot, n]) => `
    <div class="funil-linha"><span>${rot}</span>
      <div class="funil-trilho"><div class="funil-barra" style="width:${n / base * 100}%"></div></div>
      <span class="funil-num"><b>${numero(n)}</b><small>${f.visitantes ? Math.round(n / base * 100) + "%" : "–"}</small></span></div>`).join("");
}

// =====================================================================
// PRODUTOS
// =====================================================================
let produtos = [];
async function carregarProdutos() {
  carregando($(".lista-produtos"));
  try { produtos = await Loja.todosProdutos(); } catch (x) { $(".lista-produtos").innerHTML = `<p class="erro">${esc(x.message)}</p>`; return; }
  desenharProdutos();
}
function miniaturaAdm(p) {
  const f = p.imagens && p.imagens[0];
  return f ? `<img src="${esc(f.src)}" alt="" style="object-position:${esc(f.foco || "50% 50%")}" loading="lazy">`
    : `<span class="sem-foto" style="background:${esc(p.cor)};border-color:${esc(p.sola)}" title="Sem foto: a loja mostra o desenho"></span>`;
}
function desenharProdutos() {
  const busca = $(".busca-produto").value.trim().toLowerCase(), gen = $(".filtro-genero").value, vis = $(".filtro-visivel").value;
  const lista = produtos.filter(p => (!busca || p.nome.toLowerCase().includes(busca)) && (!gen || p.genero === gen)
    && (!vis || (vis === "sim") === (p.ativo !== false)));
  $(".lista-produtos").innerHTML = lista.length ? lista.map(p => `
    <article class="prod-linha${p.ativo === false ? " oculto" : ""}">
      <div class="prod-thumb">${miniaturaAdm(p)}</div>
      <div class="prod-info"><strong>${esc(p.nome)}</strong>
        <small>${p.tipo === "tenis" ? "Tênis" : "Chinelo"} · ${p.genero === "feminino" ? "Feminino" : "Masculino"} · ${(p.imagens || []).length} foto(s)</small>
        <div class="prod-tags">${p.lancamento ? `<span class="tag lanc">Lançamento</span>` : ""}${p.destaque ? `<span class="tag dest">Destaque</span>` : ""}${p.precoAntigo ? `<span class="tag promo">Promoção</span>` : ""}${p.ativo === false ? `<span class="tag oc">Oculto</span>` : ""}</div></div>
      <div class="prod-preco">${p.precoAntigo ? `<small>${real(p.precoAntigo)}</small>` : ""}${real(p.preco)}</div>
      <label class="interruptor" title="Mostrar ou esconder da loja"><input type="checkbox" data-ativo="${p.id}" ${p.ativo !== false ? "checked" : ""}> Na loja</label>
      <button class="btn-pequeno" data-editar="${p.id}">Editar</button>
    </article>`).join("") : `<p class="adm-nota">Nenhum produto encontrado.</p>`;
}
function iniciarProdutos() {
  [".busca-produto", ".filtro-genero", ".filtro-visivel"].forEach(s => $(s).addEventListener("input", desenharProdutos));
  $(".btn-novo-produto").addEventListener("click", () => abrirEditor(null));
  $(".lista-produtos").addEventListener("click", e => { const b = e.target.closest("[data-editar]"); if (b) abrirEditor(produtos.find(p => p.id === +b.dataset.editar)); });
  $(".lista-produtos").addEventListener("change", async e => {
    const c = e.target.closest("[data-ativo]"); if (!c) return;
    const p = produtos.find(x => x.id === +c.dataset.ativo);
    try { Object.assign(p, await Loja.salvarProduto({ ...p, ativo: c.checked })); aviso(c.checked ? `"${p.nome}" voltou para a loja.` : `"${p.nome}" foi escondido da loja.`); }
    catch (x) { c.checked = !c.checked; aviso(x.message); }
    desenharProdutos();
  });
}

// ---------- Editor de produto ----------
let ed = null;   // produto sendo editado
const fEd = () => $(".editor");
function lerPreco(v) {
  v = String(v || "").trim().replace(/[R$\s]/g, "");
  if (!v) return null;
  if (v.includes(",")) v = v.replace(/\./g, "").replace(",", ".");
  const n = Math.round(parseFloat(v) * 100) / 100;
  return isFinite(n) ? n : NaN;
}
const precoTexto = n => n == null ? "" : n.toFixed(2).replace(".", ",");
const focoY = foco => { const m = /(\d+(?:\.\d+)?)%\s*$/.exec(foco || ""); return m ? Math.round(+m[1]) : 50; };

function abrirEditor(p) {
  ed = p ? JSON.parse(JSON.stringify(p)) : { nome: "", genero: "feminino", tipo: "tenis", preco: null, precoAntigo: null, descricao: "",
    destaque: false, lancamento: true, ativo: true, cor: "#111111", sola: "#ffffff", imagens: [], ordem: 0 };
  const f = fEd();
  $("#ed-titulo").textContent = p ? "Editar produto" : "Novo produto";
  f.nome.value = ed.nome; f.genero.value = ed.genero; f.tipo.value = ed.tipo;
  f.preco.value = precoTexto(ed.preco); f.precoAntigo.value = precoTexto(ed.precoAntigo);
  f.descricao.value = ed.descricao || ""; f.ordem.value = ed.ordem || 0;
  f.ativo.checked = ed.ativo !== false; f.lancamento.checked = !!ed.lancamento; f.destaque.checked = !!ed.destaque;
  f.cor.value = ed.cor || "#111111"; f.sola.value = ed.sola || "#ffffff";
  desenharTamanhos(ed.tamanhos || tamanhosPadrao(ed.genero));
  $(".ed-excluir").hidden = !p; $(".ed-excluir").textContent = "Excluir produto"; delete $(".ed-excluir").dataset.confirmar;
  erro(f); desenharFotos();
  $(".adm-modal").hidden = false; f.nome.focus();
}
function fecharEditor() { $(".adm-modal").hidden = true; ed = null; }
function desenharTamanhos(marcados) {
  $(".tams-check").innerHTML = TODOS_TAMANHOS.map(t => `<label><input type="checkbox" value="${t}" ${marcados.includes(t) ? "checked" : ""}><span>${t}</span></label>`).join("");
}
const tamanhosMarcados = () => $$(".tams-check input:checked").map(i => +i.value);

function desenharFotos() {
  const n = ed.imagens.length;
  $(".fotos-lista").innerHTML = ed.imagens.map((f, i) => `
    <div class="foto-item${i === 0 ? " capa" : ""}" data-i="${i}">
      <div class="foto-quadro"><img src="${esc(f.src)}" alt="" style="object-position:${esc(f.foco || "50% 50%")}"><span class="foto-num">${i === 0 ? "1 · Capa" : i === 1 ? "2 · Ao passar" : i + 1}</span></div>
      <div class="foto-acoes">
        <button type="button" data-mover="-1" ${i === 0 ? "disabled" : ""} aria-label="Mover para a esquerda" title="Mover para a esquerda">◀</button>
        <button type="button" data-capa ${i === 0 ? "disabled" : ""} title="Usar como capa">★</button>
        <button type="button" data-mover="1" ${i === n - 1 ? "disabled" : ""} aria-label="Mover para a direita" title="Mover para a direita">▶</button>
        <button type="button" class="rem" data-remover aria-label="Remover foto" title="Remover foto">✕</button>
      </div>
      <label>Enquadramento (cima ↔ baixo)<input type="range" min="0" max="100" value="${focoY(f.foco)}" data-foco></label>
      <label>Descrição da foto<input type="text" value="${esc(f.alt || "")}" data-alt maxlength="120" placeholder="Ex.: tênis visto de lado"></label>
    </div>`).join("");
}
async function enviarArquivos(arquivos) {
  for (const arq of arquivos) {
    const ph = document.createElement("div"); ph.className = "foto-enviando"; ph.textContent = "Enviando...";
    $(".fotos-lista").appendChild(ph);
    try {
      const src = await Loja.enviarFoto(arq);
      if (!ed) return;
      ed.imagens.push({ src, alt: fEd().nome.value.trim(), foco: "50% 50%" });
    } catch (x) { aviso(x.message); }
    desenharFotos();
  }
}
function iniciarEditor() {
  const f = fEd(), modal = $(".adm-modal"), lista = $(".fotos-lista"), zona = $(".fotos-enviar");
  $(".ed-fechar").addEventListener("click", fecharEditor);
  $(".ed-cancelar").addEventListener("click", fecharEditor);
  modal.addEventListener("mousedown", e => { if (e.target === modal) fecharEditor(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) fecharEditor(); });
  // Ao trocar o gênero, ajusta os tamanhos se ainda estavam no padrão
  let generoAnterior;
  f.genero.addEventListener("focus", () => { generoAnterior = f.genero.value; });
  f.genero.addEventListener("change", () => {
    if (String(tamanhosMarcados()) === String(tamanhosPadrao(generoAnterior || (f.genero.value === "feminino" ? "masculino" : "feminino")))) desenharTamanhos(tamanhosPadrao(f.genero.value));
    generoAnterior = f.genero.value;
  });
  // Fotos: enviar, arrastar, mover, remover, enquadrar
  $("input[type=file]", zona).addEventListener("change", e => { enviarArquivos([...e.target.files]); e.target.value = ""; });
  ["dragenter", "dragover"].forEach(t => zona.addEventListener(t, e => { e.preventDefault(); zona.classList.add("arrastando"); }));
  ["dragleave", "drop"].forEach(t => zona.addEventListener(t, () => zona.classList.remove("arrastando")));
  zona.addEventListener("drop", e => { e.preventDefault(); enviarArquivos([...e.dataTransfer.files]); });
  lista.addEventListener("click", e => {
    const item = e.target.closest(".foto-item"); if (!item) return;
    const i = +item.dataset.i, b = e.target.closest("button"); if (!b) return;
    if (b.dataset.mover) { const j = i + +b.dataset.mover; [ed.imagens[i], ed.imagens[j]] = [ed.imagens[j], ed.imagens[i]]; }
    if ("capa" in b.dataset) ed.imagens.unshift(ed.imagens.splice(i, 1)[0]);
    if ("remover" in b.dataset) ed.imagens.splice(i, 1);
    desenharFotos();
  });
  lista.addEventListener("input", e => {
    const item = e.target.closest(".foto-item"); if (!item) return;
    const foto = ed.imagens[+item.dataset.i];
    if ("foco" in e.target.dataset) { foto.foco = `50% ${e.target.value}%`; $("img", item).style.objectPosition = foto.foco; }
    if ("alt" in e.target.dataset) foto.alt = e.target.value;
  });
  // Excluir: pede um segundo clique para confirmar
  $(".ed-excluir").addEventListener("click", async e => {
    const b = e.currentTarget;
    if (!b.dataset.confirmar) { b.dataset.confirmar = "1"; b.textContent = "Clique de novo para excluir"; return; }
    try { await Loja.excluirProduto(ed.id); aviso(`"${ed.nome}" excluído.`); fecharEditor(); carregarProdutos(); }
    catch (x) { erro(f, x.message); }
  });
  f.addEventListener("submit", async e => {
    e.preventDefault();
    const preco = lerPreco(f.preco.value), antigo = lerPreco(f.precoAntigo.value), tams = tamanhosMarcados();
    if (!f.nome.value.trim()) return erro(f, "Dê um nome ao produto.");
    if (!preco || preco <= 0) return erro(f, "Informe um preço válido, por exemplo 299,90.");
    if (antigo !== null && (isNaN(antigo) || antigo <= preco)) return erro(f, "O preço \"de\" precisa ser maior que o preço atual (ou deixe vazio).");
    if (!tams.length) return erro(f, "Marque pelo menos um tamanho à venda.");
    if ($(".foto-enviando")) return erro(f, "Espere as fotos terminarem de enviar.");
    const padrao = String(tams) === String(tamanhosPadrao(f.genero.value));
    const dados = { ...ed, nome: f.nome.value.trim(), genero: f.genero.value, tipo: f.tipo.value, preco, precoAntigo: antigo,
      descricao: f.descricao.value.trim(), ordem: +f.ordem.value || 0, ativo: f.ativo.checked, lancamento: f.lancamento.checked,
      destaque: f.destaque.checked, cor: f.cor.value, sola: f.sola.value, tamanhos: padrao ? undefined : tams,
      imagens: ed.imagens.map(i => ({ ...i, alt: i.alt || f.nome.value.trim() })) };
    const botao = $(".ed-salvar"); botao.disabled = true; botao.textContent = "Salvando...";
    try { await Loja.salvarProduto(dados); aviso("Produto salvo! Já aparece assim na loja."); fecharEditor(); carregarProdutos(); }
    catch (x) { erro(f, x.message); }
    finally { botao.disabled = false; botao.textContent = "Salvar"; }
  });
}

// =====================================================================
// PEDIDOS
// =====================================================================
let pedidos = [], filtroStatus = "acao";
const FILTROS = [["acao", "Precisam de ação"], ["todos", "Todos"], ["Aguardando pagamento", "Aguardando Pix"], ["Pagamento aprovado", "Pagos (a enviar)"],
  ["Enviado", "Enviados"], ["Entregue", "Entregues"], ["Pix expirado", "Pix expirado"], ["cancelados", "Cancelados"]];
async function carregarPedidos() {
  carregando($(".lista-pedidos-adm"));
  try { pedidos = (await Loja.todosPedidos()).map(p => ({ ...p, visivel: Loja.statusVisivel(p) })); }
  catch (x) { $(".lista-pedidos-adm").innerHTML = `<p class="erro">${esc(x.message)}</p>`; return; }
  desenharPedidos(); atualizarBadge();
}
function desenharPedidos() {
  const passa = p => filtroStatus === "todos" || (filtroStatus === "acao" ? ["Aguardando pagamento", "Pagamento aprovado"].includes(p.visivel)
    : filtroStatus === "cancelados" ? p.visivel.startsWith("Cancelado") : p.visivel === filtroStatus);
  $(".filtro-status").innerHTML = FILTROS.map(([v, r]) => `<button data-filtro="${esc(v)}" class="${v === filtroStatus ? "ativo" : ""}">${r} (${pedidos.filter(p => { const a = filtroStatus; filtroStatus = v; const ok = passa(p); filtroStatus = a; return ok; }).length})</button>`).join("");
  const lista = pedidos.filter(passa);
  $(".lista-pedidos-adm").innerHTML = lista.length ? lista.map(p => `
    <article class="ped-adm">
      <div class="ped-adm-topo">
        <span class="ped-num">#${esc(p.numero)}</span><span class="ped-data">${dataHora(p.data)}</span>
        <span>${esc(p.cliente?.nome || "")} <small class="adm-nota">${esc(p.cliente?.email || "")}</small></span>
        <span class="status ${STATUS_CLASSE[p.visivel] || ""}">${esc(p.visivel)}</span>
        <span class="ped-total">${real(p.total)}</span>
        <select data-status="${esc(p.numero)}" aria-label="Mudar status do pedido ${esc(p.numero)}">
          ${STATUS.concat(p.status === "Cancelado pelo cliente" ? [p.status] : []).map(s => `<option ${s === p.status ? "selected" : ""}>${s}</option>`).join("")}
        </select>
      </div>
      <div class="ped-adm-detalhe">
        <ul>${p.itens.map(i => `<li>${i.qtd}× ${esc(i.nome)} · Tam. ${esc(i.tamanho)} · ${real(i.preco * i.qtd)}</li>`).join("")}</ul>
        <span><span class="rot">Pagamento:</span> ${esc(p.pagamento)}${p.desconto ? ` (desconto ${real(p.desconto)})` : ""}</span>
        <span><span class="rot">Entrega:</span> ${esc(p.endereco || "—")}</span>
        ${p.pix && p.visivel !== "Pagamento aprovado" && !p.visivel.startsWith("Cancelado") && p.status === "Aguardando pagamento"
          ? `<span class="rot">Confira no app do banco se entrou um Pix de <b>${real(p.total)}</b> (identificador <b>STN${esc(p.numero)}</b>) e mude para "Pagamento aprovado".</span>` : ""}
      </div>
    </article>`).join("") : `<p class="adm-nota">Nenhum pedido aqui.</p>`;
}
function iniciarPedidos() {
  $(".filtro-status").addEventListener("click", e => { const b = e.target.closest("[data-filtro]"); if (b) { filtroStatus = b.dataset.filtro; desenharPedidos(); } });
  $(".btn-atualizar-pedidos").addEventListener("click", carregarPedidos);
  $(".lista-pedidos-adm").addEventListener("change", async e => {
    const s = e.target.closest("[data-status]"); if (!s) return;
    try { await Loja.mudarStatus(s.dataset.status, s.value); aviso(`Pedido #${s.dataset.status}: ${s.value}`); }
    catch (x) { aviso(x.message); }
    carregarPedidos();
  });
}

// =====================================================================
// CLIENTES
// =====================================================================
let clientes = [], pedidosClientes = [];
async function carregarClientes() {
  $(".tab-clientes tbody").innerHTML = `<tr><td colspan="7" class="vazio-linha">Carregando...</td></tr>`;
  try { [clientes, pedidosClientes] = await Promise.all([Loja.clientes(), Loja.todosPedidos()]); }
  catch (x) { $(".tab-clientes tbody").innerHTML = `<tr><td colspan="7" class="vazio-linha">${esc(x.message)}</td></tr>`; return; }
  desenharClientes();
}
function desenharClientes() {
  const busca = $(".busca-cliente").value.trim().toLowerCase();
  const pago = p => ["Pagamento aprovado", "Enviado", "Entregue"].includes(p.status);
  const lista = clientes.filter(c => !busca || (c.nome + " " + c.email).toLowerCase().includes(busca));
  $(".tab-clientes tbody").innerHTML = lista.length ? lista.map(c => {
    const seus = pedidosClientes.filter(p => p.cliente?.email === c.email && !p.status.startsWith("Cancelado"));
    return `<tr><td>${esc(c.nome)}${c.papel === "admin" ? ` <span class="tag">admin</span>` : ""}</td><td>${esc(c.email)}</td><td>${esc(c.telefone || "—")}</td>
      <td>${esc(c.endereco?.cidade ? `${c.endereco.cidade}/${c.endereco.estado}` : "—")}</td>
      <td>${c.criadoEm ? new Date(c.criadoEm).toLocaleDateString("pt-BR") : "—"}</td>
      <td class="num">${seus.length}</td><td class="num">${real(seus.filter(pago).reduce((s, p) => s + p.total, 0))}</td></tr>`;
  }).join("") : `<tr><td colspan="7" class="vazio-linha">Nenhum cliente ainda.</td></tr>`;
}

// =====================================================================
// NEWSLETTER
// =====================================================================
let emails = [];
async function carregarNewsletter() {
  try { emails = await Loja.listaNewsletter(); } catch (x) { aviso(x.message); return; }
  $(".tab-news tbody").innerHTML = emails.length
    ? emails.map(n => `<tr><td>${esc(n.email)}</td><td>${new Date(n.criado_em).toLocaleDateString("pt-BR")}</td></tr>`).join("")
    : `<tr><td colspan="2" class="vazio-linha">Ninguém se cadastrou ainda.</td></tr>`;
}
function iniciarNewsletter() {
  $(".btn-copiar-emails").addEventListener("click", () => {
    const txt = emails.map(n => n.email).join(", ");
    if (!txt) return aviso("Nenhum e-mail para copiar.");
    navigator.clipboard.writeText(txt).then(() => aviso(`${emails.length} e-mail(s) copiados.`), () => aviso("Não foi possível copiar."));
  });
  $(".btn-csv").addEventListener("click", () => {
    const csv = "﻿email;data\n" + emails.map(n => `${n.email};${new Date(n.criado_em).toLocaleDateString("pt-BR")}`).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "newsletter-stn.csv"; a.click();
  });
}

// =====================================================================
// EQUIPE (administradores)
// =====================================================================
async function carregarEquipe() {
  const corpo = $(".tab-equipe tbody");
  if (!Loja.online) { corpo.innerHTML = `<tr><td colspan="3" class="vazio-linha">No modo demonstração o painel abre sem login. Com o Supabase ligado, só quem estiver nesta lista entra aqui.</td></tr>`; return; }
  let lista;
  try { lista = (await Loja.clientes()).filter(c => c.papel === "admin"); } catch (x) { corpo.innerHTML = `<tr><td colspan="3">${esc(x.message)}</td></tr>`; return; }
  const eu = Loja.usuario()?.email;
  corpo.innerHTML = lista.map(c => `<tr><td>${esc(c.nome)}${c.email === eu ? " <small class=\"adm-nota\">(você)</small>" : ""}</td><td>${esc(c.email)}</td>
    <td class="num"><button class="btn-pequeno" data-remover-admin="${esc(c.email)}">Remover acesso</button></td></tr>`).join("");
}
function iniciarEquipe() {
  const f = $(".form-equipe");
  f.addEventListener("submit", async e => {
    e.preventDefault();
    if (!f.email.value.trim() || !f.email.checkValidity()) return erro(f, "Digite um e-mail válido.");
    try { await Loja.definirAdmin(f.email.value, true); erro(f); aviso(`${f.email.value} agora é administrador.`); f.reset(); carregarEquipe(); }
    catch (x) { erro(f, x.message); }
  });
  $(".tab-equipe").addEventListener("click", async e => {
    const b = e.target.closest("[data-remover-admin]"); if (!b) return;
    if (!b.dataset.confirmar) { b.dataset.confirmar = "1"; b.textContent = "Confirmar remoção"; return; }
    const email = b.dataset.removerAdmin;
    try {
      await Loja.definirAdmin(email, false); aviso(`${email} não é mais administrador.`);
      if (email === Loja.usuario()?.email) { location.reload(); return; }
      carregarEquipe();
    } catch (x) { aviso(x.message); carregarEquipe(); }
  });
}
