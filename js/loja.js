// =====================================================================
// Loja: tudo que é salvo ou lido (produtos, contas, pedidos, fluxo do site).
// Com o Supabase configurado em js/config.js, os dados ficam no banco e são
// os mesmos para todos os visitantes. Sem ele, roda em MODO DEMONSTRAÇÃO,
// com tudo salvo só neste navegador.
// =====================================================================
const PRODUTOS_PADRAO = JSON.parse(JSON.stringify(PRODUTOS));   // catálogo de js/produtos.js

const Loja = (() => {
  // Com o Supabase configurado a loja NUNCA cai para o modo demonstração
  // (senão um cliente poderia "comprar" só no próprio navegador).
  const online = !!(CONFIG.supabaseUrl && CONFIG.supabaseChave);
  // Link de "esqueci minha senha": o Supabase volta para o site com type=recovery no endereço
  const voltouDaRecuperacao = /type=recovery/.test(location.hash);
  const sb = online && window.supabase && window.supabase.createClient ? window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseChave) : null;
  let usuario = null;                 // perfil de quem está logado
  let modoRecuperacao = voltouDaRecuperacao;
  if (sb) sb.auth.onAuthStateChange(ev => { if (ev === "PASSWORD_RECOVERY") { modoRecuperacao = true; document.dispatchEvent(new Event("stn-recuperar-senha")); } });

  // ---------- utilidades ----------
  const ler = (k, padrao) => { try { return JSON.parse(localStorage.getItem(k)) ?? padrao; } catch (e) { return padrao; } };
  const gravar = (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)); }
    catch (e) { throw new Error("O armazenamento do modo demonstração está cheio. Use fotos menores ou ligue o Supabase."); }
  };
  const falha = (error, padrao) => { if (error) throw new Error(traduzir(error.message) || padrao || "Algo deu errado. Tente de novo."); };
  function traduzir(msg = "") {
    if (/Invalid login credentials/i.test(msg)) return "Erro na senha ou login. Confira o e-mail e a senha e tente novamente.";
    if (/Email not confirmed/i.test(msg)) return "Confirme seu e-mail antes de entrar: abra o link que enviamos para você.";
    if (/already registered|already been registered/i.test(msg)) return "Já existe uma conta com este e-mail.";
    if (/Password should be at least/i.test(msg)) return "A senha precisa ter pelo menos 6 caracteres.";
    if (/rate limit|too many/i.test(msg)) return "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.";
    if (/Failed to fetch|NetworkError|Load failed/i.test(msg)) return "Sem conexão com o servidor. Verifique sua internet.";
    if (/row-level security|permission denied|Acesso negado/i.test(msg)) return "Acesso negado.";
    return msg;
  }
  const sessaoId = (() => {
    let id = ler("stn_visitante", null);
    if (!id) { id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36); try { localStorage.setItem("stn_visitante", JSON.stringify(id)); } catch (e) {} }
    return id;
  })();
  const pagina = () => (location.pathname.split("/").pop() || "index.html").replace(".html", "") || "index";

  // Reduz a foto antes de enviar (carrega mais rápido e ocupa menos espaço)
  async function reduzirImagem(arquivo, max, qualidade) {
    if (!/^image\//.test(arquivo.type)) throw new Error("Escolha um arquivo de imagem (JPG, PNG ou WEBP).");
    let img;
    try { img = await createImageBitmap(arquivo, { imageOrientation: "from-image" }); }
    catch (e) { img = await new Promise((ok, erro) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => erro(new Error("Não foi possível abrir esta imagem.")); i.src = URL.createObjectURL(arquivo); }); }
    const escala = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * escala); c.height = Math.round(img.height * escala);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    return new Promise(ok => c.toBlob(ok, "image/jpeg", qualidade));
  }
  const paraDataUrl = blob => new Promise(ok => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(blob); });

  // ---------- conversões banco ⇄ site ----------
  const produtoDoBanco = r => ({
    id: +r.id, nome: r.nome, genero: r.genero, tipo: r.tipo, preco: +r.preco,
    precoAntigo: r.preco_antigo == null ? null : +r.preco_antigo,
    destaque: !!r.destaque, lancamento: !!r.lancamento, ativo: r.ativo !== false,
    descricao: r.descricao || "", cor: r.cor, sola: r.sola, imagens: r.imagens || [],
    tamanhos: r.tamanhos && r.tamanhos.length ? r.tamanhos : undefined, ordem: r.ordem || 0
  });
  const produtoParaBanco = p => ({
    nome: p.nome, genero: p.genero, tipo: p.tipo, preco: p.preco, preco_antigo: p.precoAntigo || null,
    destaque: !!p.destaque, lancamento: !!p.lancamento, ativo: p.ativo !== false, descricao: p.descricao || "",
    cor: p.cor || "#111111", sola: p.sola || "#ffffff", imagens: p.imagens || [],
    tamanhos: p.tamanhos && p.tamanhos.length ? p.tamanhos : null, ordem: p.ordem || 0
  });
  const pedidoDoBanco = r => ({
    numero: r.numero, data: r.criado_em, itens: r.itens, subtotal: +r.subtotal, desconto: +r.desconto, total: +r.total,
    forma: r.forma, pagamento: r.pagamento, endereco: r.endereco, status: r.status, expiraEm: r.expira_em,
    pix: r.forma === "pix" ? Pix.codigo(+r.total, "STN" + r.numero) : undefined,
    cliente: { nome: r.cliente_nome, email: r.cliente_email }
  });
  const perfilDoBanco = (r, email) => ({
    id: r.id, nome: r.nome || "", email: r.email || email, cpf: r.cpf || "", telefone: r.telefone || "",
    nascimento: r.nascimento || "", endereco: r.endereco || {}, papel: r.papel, cartoes: [], criadoEm: r.criado_em
  });
  // "Pix expirado" é calculado na hora (o pedido continua salvo como aguardando)
  const statusVisivel = p => p.status === "Aguardando pagamento" && p.pix && pixExpirado(p) ? "Pix expirado" : p.status;
  const enderecoTexto = e => e && e.rua ? `${e.rua}, ${e.numero}${e.complemento ? " - " + e.complemento : ""} · ${e.bairro}, ${e.cidade}/${e.estado}` : "";

  // =================================================================
  // MODO DEMONSTRAÇÃO (localStorage)
  // =================================================================
  const demo = {
    produtos: () => ler("stn_produtos", null) || JSON.parse(JSON.stringify(PRODUTOS_PADRAO)),
    usuarios: () => ler("stn_usuarios", {}),
    salvarUsuario(u) { const us = demo.usuarios(); us[u.email] = u; gravar("stn_usuarios", us); },
    async hash(txt) {
      try {
        const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("stn-sneakers:" + txt));
        return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
      } catch (e) { let h = 0; for (const c of "stn-sneakers:" + txt) h = (h * 31 + c.charCodeAt(0)) | 0; return "f" + (h >>> 0).toString(16); }
    }
  };

  // =================================================================
  // API usada pelas páginas
  // =================================================================
  const api = {
    online,
    get modoRecuperacao() { return modoRecuperacao; },
    // Formas de pagamento disponíveis. Online, só Pix até ligar um intermediário
    // de pagamento (Mercado Pago, Pagar.me...) para cartão e boleto.
    formasPagamento: online ? ["pix"] : ["pix", "cartao", "boleto"],
    statusVisivel, enderecoTexto, reduzirImagem,

    // ---------- inicialização ----------
    async iniciar() {
      if (CONFIG.clarityId) carregarClarity(CONFIG.clarityId);
      if (online && !sb) throw new Error("Não foi possível conectar à loja. Verifique sua internet e atualize a página.");
      const tarefas = [api.carregarProdutos()];
      if (online) tarefas.push(sb.auth.getSession().then(({ data }) => data.session ? carregarPerfil(data.session.user) : null).catch(() => null));
      else { const e = ler("stn_sessao", null); usuario = e ? demo.usuarios()[e] || null : null; }
      await Promise.all(tarefas);
    },
    async carregarProdutos() {
      let lista;
      if (online) {
        const { data, error } = await sb.from("produtos").select("*").eq("ativo", true).order("ordem").order("id");
        falha(error, "Não foi possível carregar os produtos.");
        lista = data.map(produtoDoBanco);
      } else lista = demo.produtos().filter(p => p.ativo !== false).sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
      PRODUTOS.splice(0, PRODUTOS.length, ...lista);
      return PRODUTOS;
    },

    // ---------- conta do cliente ----------
    usuario: () => usuario,
    async entrar(email, senha) {
      email = email.trim().toLowerCase();
      if (online) {
        const { data, error } = await sb.auth.signInWithPassword({ email, password: senha });
        falha(error);
        return carregarPerfil(data.user);
      }
      const u = demo.usuarios()[email];
      if (!u || u.senha !== await demo.hash(senha)) throw new Error("Erro na senha ou login. Confira o e-mail e a senha e tente novamente.");
      gravar("stn_sessao", email); usuario = u; return u;
    },
    // Retorna o usuário, ou { confirmar: true } quando o Supabase pede confirmação por e-mail
    async cadastrar({ nome, email, senha }) {
      email = email.trim().toLowerCase(); nome = nome.trim();
      if (online) {
        const { data, error } = await sb.auth.signUp({ email, password: senha,
          options: { data: { nome }, emailRedirectTo: new URL("conta.html", location.href).href } });
        falha(error);
        if (!data.session) return { confirmar: true };
        return carregarPerfil(data.user);
      }
      if (demo.usuarios()[email]) throw new Error("Já existe uma conta com este e-mail.");
      const u = { nome, email, senha: await demo.hash(senha), cpf: "", telefone: "", nascimento: "",
                  endereco: {}, cartoes: [], pedidos: [], criadoEm: new Date().toISOString() };
      demo.salvarUsuario(u); gravar("stn_sessao", email); usuario = u; return u;
    },
    async sair() {
      usuario = null;
      if (online) await sb.auth.signOut().catch(() => {});
      else try { localStorage.removeItem("stn_sessao"); } catch (e) {}
    },
    // campos: nome, cpf, telefone, nascimento, endereco
    async salvarPerfil(campos) {
      if (!usuario) throw new Error("Entre na sua conta.");
      if (online) {
        const dados = { ...campos };
        if ("nascimento" in dados) dados.nascimento = dados.nascimento || null;
        const { data, error } = await sb.from("perfis").update(dados).eq("id", usuario.id).select().single();
        falha(error, "Não foi possível salvar.");
        usuario = perfilDoBanco(data); return usuario;
      }
      Object.assign(usuario, campos); demo.salvarUsuario(usuario); return usuario;
    },
    // Só no modo demonstração: cartões salvos (bandeira + final)
    atualizarLocal(fn) { if (!usuario || online) return usuario; fn(usuario); demo.salvarUsuario(usuario); return usuario; },
    async trocarSenha(atual, nova) {
      if (!usuario) throw new Error("Entre na sua conta.");
      if (online) {
        const { error } = await sb.auth.signInWithPassword({ email: usuario.email, password: atual });
        if (error) throw new Error("Erro na senha: a senha atual está incorreta.");
        const r = await sb.auth.updateUser({ password: nova }); falha(r.error);
        return;
      }
      if (usuario.senha !== await demo.hash(atual)) throw new Error("Erro na senha: a senha atual está incorreta.");
      usuario.senha = await demo.hash(nova); demo.salvarUsuario(usuario);
    },
    async recuperarSenha(email) {
      if (!online) throw new Error("No modo demonstração não há envio de e-mail.");
      const { error } = await sb.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: new URL("conta.html", location.href).href });
      falha(error);
    },
    async definirNovaSenha(nova) {
      const { data, error } = await sb.auth.updateUser({ password: nova }); falha(error);
      modoRecuperacao = false;
      history.replaceState(null, "", location.pathname);
      return carregarPerfil(data.user);
    },

    // ---------- pedidos do cliente ----------
    // itens: [{id, tamanho, qtd}] · forma: pix | cartao | boleto
    async criarPedido({ itens, forma, cartaoId, parcelas }) {
      if (!usuario) throw new Error("Entre na sua conta para comprar.");
      if (online) {
        const { data, error } = await sb.rpc("criar_pedido", { p_itens: itens.map(i => ({ id: i.id, tamanho: i.tamanho, qtd: i.qtd })), p_forma: forma, p_validade_min: PIX_CONFIG.validadeMin });
        falha(error, "Não foi possível criar o pedido.");
        return pedidoDoBanco(data);
      }
      if (!usuario.endereco || !usuario.endereco.rua) throw new Error("Cadastre um endereço de entrega.");
      const linhas = itens.map(i => { const p = PRODUTOS.find(x => x.id === i.id); if (!p) throw new Error("Um produto do carrinho não está mais disponível."); return { id: p.id, nome: p.nome, preco: p.preco, qtd: i.qtd, tamanho: i.tamanho }; });
      const subtotal = linhas.reduce((s, i) => s + i.preco * i.qtd, 0);
      let pagamento = { pix: "Pix", boleto: "Boleto" }[forma];
      if (forma === "cartao") {
        const c = usuario.cartoes.find(x => x.id === cartaoId);
        if (!c) throw new Error("Cadastre um cartão para pagar com crédito.");
        pagamento = `Cartão ${c.bandeira} •••• ${c.final} · ${parcelas}x de ${real(subtotal / parcelas)} sem juros`;
      }
      const pedido = {
        numero: String(Date.now()).slice(-6), data: new Date().toISOString(), itens: linhas,
        subtotal, total: forma === "pix" ? Pix.comDesconto(subtotal) : subtotal, forma,
        pagamento, endereco: enderecoTexto(usuario.endereco),
        status: forma === "cartao" ? "Pagamento aprovado" : "Aguardando pagamento"
      };
      if (forma === "cartao") pedido.parcelas = parcelas;
      if (forma === "pix") {
        pedido.desconto = pedido.subtotal - pedido.total;
        pedido.pix = Pix.codigo(pedido.total, "STN" + pedido.numero);
        pedido.expiraEm = new Date(Date.now() + PIX_CONFIG.validadeMin * 60000).toISOString();
      }
      usuario.pedidos.unshift(pedido); demo.salvarUsuario(usuario);
      return pedido;
    },
    async meusPedidos() {
      if (!usuario) return [];
      if (online) {
        const { data, error } = await sb.from("pedidos").select("*").eq("cliente", usuario.id)
          .neq("status", "Cancelado pelo cliente").order("criado_em", { ascending: false });
        falha(error, "Não foi possível carregar seus pedidos.");
        return data.map(pedidoDoBanco);
      }
      return (usuario.pedidos || []).filter(p => p.status !== "Cancelado pelo cliente");
    },
    // Cliente exclui um Pix vencido e não pago
    async excluirPedido(numero) {
      if (online) { const { error } = await sb.rpc("cancelar_pedido_expirado", { p_numero: numero }); falha(error); return; }
      usuario.pedidos.forEach(p => { if (p.numero === numero && statusVisivel(p) === "Pix expirado") p.status = "Cancelado pelo cliente"; });
      demo.salvarUsuario(usuario);
    },

    // ---------- fluxo do site ----------
    registrar(tipo, produtoId) {
      const ev = { sessao: sessaoId, tipo, pagina: pagina(), produto_id: produtoId || null };
      if (online) { if (sb) sb.from("eventos").insert(ev).then(() => {}, () => {}); return; }
      try {
        const lista = ler("stn_eventos", []); lista.push({ ...ev, criado_em: new Date().toISOString() });
        localStorage.setItem("stn_eventos", JSON.stringify(lista.slice(-3000)));
      } catch (e) {}
    },
    async newsletter(email) {
      email = email.trim().toLowerCase();
      if (online) {
        const { error } = await sb.from("newsletter").insert({ email });
        if (error && error.code !== "23505") falha(error);   // 23505 = já cadastrado
        return;
      }
      const l = ler("stn_newsletter", []); if (!l.some(x => x.email === email)) l.push({ email, criado_em: new Date().toISOString() });
      gravar("stn_newsletter", l);
    },

    // =================================================================
    // ADMINISTRAÇÃO (painel admin.html)
    // =================================================================
    // No modo demonstração o painel abre sem login, para você testar
    ehAdmin: () => !online || (!!usuario && usuario.papel === "admin"),
    async todosProdutos() {
      if (online) {
        const { data, error } = await sb.from("produtos").select("*").order("ordem").order("id");
        falha(error); return data.map(produtoDoBanco);
      }
      return demo.produtos().sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    },
    async salvarProduto(p) {
      if (online) {
        const q = p.id ? sb.from("produtos").update(produtoParaBanco(p)).eq("id", p.id) : sb.from("produtos").insert(produtoParaBanco(p));
        const { data, error } = await q.select().single();
        falha(error, "Não foi possível salvar o produto."); return produtoDoBanco(data);
      }
      const lista = demo.produtos();
      if (!p.id) p.id = Math.max(0, ...lista.map(x => x.id)) + 1;
      const i = lista.findIndex(x => x.id === p.id);
      i >= 0 ? lista[i] = { ...lista[i], ...p } : lista.push(p);
      gravar("stn_produtos", lista); return p;
    },
    async excluirProduto(id) {
      if (online) { const { error } = await sb.from("produtos").delete().eq("id", id); falha(error); return; }
      gravar("stn_produtos", demo.produtos().filter(p => p.id !== id));
    },
    // Envia uma foto e devolve o endereço dela
    async enviarFoto(arquivo) {
      if (online) {
        const blob = await reduzirImagem(arquivo, 1600, 0.85);
        const caminho = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const { error } = await sb.storage.from("produtos").upload(caminho, blob, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
        falha(error, "Não foi possível enviar a foto.");
        return sb.storage.from("produtos").getPublicUrl(caminho).data.publicUrl;
      }
      return paraDataUrl(await reduzirImagem(arquivo, 900, 0.78));
    },
    async todosPedidos() {
      if (online) {
        const { data, error } = await sb.from("pedidos").select("*").order("criado_em", { ascending: false }).limit(1000);
        falha(error); return data.map(pedidoDoBanco);
      }
      return Object.values(demo.usuarios()).flatMap(u => (u.pedidos || []).map(p => ({ ...p, cliente: { nome: u.nome, email: u.email } })))
        .sort((a, b) => b.data.localeCompare(a.data));
    },
    async mudarStatus(numero, status) {
      if (online) { const { error } = await sb.rpc("mudar_status_pedido", { p_numero: numero, p_status: status }); falha(error); return; }
      const us = demo.usuarios();
      Object.values(us).forEach(u => (u.pedidos || []).forEach(p => { if (p.numero === numero) p.status = status; }));
      gravar("stn_usuarios", us);
      if (usuario) usuario = us[usuario.email] || usuario;
    },
    async clientes() {
      if (online) {
        const { data, error } = await sb.from("perfis").select("*").order("criado_em", { ascending: false });
        falha(error); return data.map(r => perfilDoBanco(r));
      }
      return Object.values(demo.usuarios()).map(u => ({ ...u, senha: undefined })).sort((a, b) => (b.criadoEm || "").localeCompare(a.criadoEm || ""));
    },
    async definirAdmin(email, admin) {
      if (online) { const { error } = await sb.rpc("definir_admin", { p_email: email, p_admin: admin }); falha(error); return; }
      const us = demo.usuarios(), u = us[email.trim().toLowerCase()];
      if (!u) throw new Error("Nenhuma conta com este e-mail. A pessoa precisa se cadastrar no site primeiro.");
      if (!admin && u.papel === "admin" && Object.values(us).filter(x => x.papel === "admin").length <= 1) throw new Error("A loja precisa ter pelo menos um administrador.");
      u.papel = admin ? "admin" : "cliente"; gravar("stn_usuarios", us);
    },
    async listaNewsletter() {
      if (online) { const { data, error } = await sb.from("newsletter").select("*").order("criado_em", { ascending: false }); falha(error); return data; }
      return ler("stn_newsletter", []).slice().reverse();
    },
    // Visitas, funil de compra e produtos mais vistos
    async resumo(dias) {
      if (online) { const { data, error } = await sb.rpc("resumo_fluxo", { p_dias: dias }); falha(error); return data; }
      return resumoLocal(dias, ler("stn_eventos", []), await api.todosPedidos(), await api.clientes(), demo.produtos());
    }
  };

  async function carregarPerfil(user) {
    const { data, error } = await sb.from("perfis").select("*").eq("id", user.id).maybeSingle();
    if (error) throw new Error(traduzir(error.message));
    usuario = data ? perfilDoBanco(data, user.email)
      : { id: user.id, nome: user.user_metadata?.nome || "", email: user.email, cpf: "", telefone: "", nascimento: "", endereco: {}, papel: "cliente", cartoes: [] };
    return usuario;
  }

  // Mesmo cálculo da função resumo_fluxo do banco, para o modo demonstração
  function resumoLocal(dias, eventos, pedidos, clientes, produtos) {
    const diaDe = d => new Date(d).toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
    const hoje = new Date(), lista = [];
    for (let i = dias - 1; i >= 0; i--) lista.push(diaDe(hoje.getTime() - i * 864e5));
    const desde = lista[0];
    const ev = eventos.filter(e => diaDe(e.criado_em) >= desde), ped = pedidos.filter(p => diaDe(p.data) >= desde);
    const sessoes = f => new Set(ev.filter(f).map(e => e.sessao)).size;
    const pago = p => ["Pagamento aprovado", "Enviado", "Entregue"].includes(p.status);
    const porProduto = {};
    ev.filter(e => e.produto_id).forEach(e => {
      const x = porProduto[e.produto_id] ||= { id: e.produto_id, nome: (produtos.find(p => p.id === e.produto_id) || {}).nome || "Produto removido", vistas: 0, adicoes: 0 };
      if (e.tipo === "ver_produto") x.vistas++; if (e.tipo === "add_carrinho") x.adicoes++;
    });
    const paginas = {};
    ev.filter(e => e.tipo === "visita").forEach(e => { paginas[e.pagina] = (paginas[e.pagina] || 0) + 1; });
    return {
      por_dia: lista.map(dia => ({ dia, visitas: ev.filter(e => e.tipo === "visita" && diaDe(e.criado_em) === dia).length,
        visitantes: new Set(ev.filter(e => diaDe(e.criado_em) === dia).map(e => e.sessao)).size,
        pedidos: ped.filter(p => diaDe(p.data) === dia).length })),
      funil: { visitantes: sessoes(() => true), viram_produto: sessoes(e => e.tipo === "ver_produto"), add_carrinho: sessoes(e => e.tipo === "add_carrinho"),
               checkout: sessoes(e => e.tipo === "checkout"), pedido: sessoes(e => e.tipo === "pedido") },
      produtos: Object.values(porProduto).sort((a, b) => b.vistas - a.vistas || b.adicoes - a.adicoes).slice(0, 10),
      paginas: Object.entries(paginas).map(([pagina, visitas]) => ({ pagina, visitas })).sort((a, b) => b.visitas - a.visitas).slice(0, 10),
      pedidos: { total: ped.filter(p => !p.status.startsWith("Cancelado")).length,
                 aguardando: pedidos.filter(p => statusVisivel(p) === "Aguardando pagamento").length,
                 pagos: ped.filter(pago).length, faturamento: ped.filter(pago).reduce((s, p) => s + p.total, 0),
                 para_enviar: pedidos.filter(p => p.status === "Pagamento aprovado").length },
      clientes_novos: clientes.filter(c => c.criadoEm && diaDe(c.criadoEm) >= desde).length
    };
  }

  function carregarClarity(id) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", id);
  }

  api.pronto = api.iniciar().catch(e => {
    console.error(e); api.erroInicial = e;
    if (online) PRODUTOS.length = 0;   // não mostra catálogo antigo se o banco não respondeu
  });
  return api;
})();
