// Catálogo de produtos. Para adicionar itens, basta incluir novos objetos aqui.
// precoAntigo preenchido = produto em promoção | destaque: true = aparece em "Destaques"
// lancamento: true = aparece em "Lançamentos" com selo | imagens: lista de fotos (opcional; sem fotos usa o desenho)
const PRODUTOS = [
  // Lançamento com fotos reais. "imagens": a 1ª aparece no cartão e a 2ª ao passar o mouse.
  { id: 18, nome: "Tênis Runner Black Rosé", genero: "feminino", tipo: "tenis", preco: 299.90, precoAntigo: null, destaque: false, lancamento: true,
    cor: "#111111", sola: "#f5efe6",
    descricao: "Tênis feminino para corrida e treino, preto com detalhes em rosa e solado alto off-white.",
    imagens: [
      { src: "img/produtos/running-rose-1.jpg", alt: "Tênis Runner Black Rosé na mão, vista lateral", foco: "50% 48%" },
      { src: "img/produtos/running-rose-2.jpg", alt: "Tênis Runner Black Rosé calçado, visto de cima", foco: "50% 43%" },
      { src: "img/produtos/running-rose-3.jpg", alt: "Par do Tênis Runner Black Rosé ao lado da caixa", foco: "50% 77%" }
    ] },
  { id: 19, nome: "Tênis Retrô Bordô", genero: "feminino", tipo: "tenis", preco: 299.90, precoAntigo: null, destaque: false, lancamento: true,
    cor: "#7b1e3a", sola: "#c8a06a",
    descricao: "Tênis retrô feminino bordô com listras rosa e solado caramelo.",
    imagens: [
      { src: "img/produtos/retro-bordo-2.jpg", alt: "Par do Tênis Retrô Bordô na mão", foco: "50% 74%" },
      { src: "img/produtos/retro-bordo-1.jpg", alt: "Tênis Retrô Bordô calçado", foco: "50% 87%" }
    ] },
  { id: 17, nome: "Tênis Plataforma Panda",  genero: "feminino",  tipo: "tenis",   preco: 299.90, precoAntigo: null,   destaque: true,  lancamento: true,
    cor: "#111111", sola: "#ffffff",
    descricao: "Tênis plataforma feminino em preto e branco, com solado alto e cadarço largo. Lançamento da temporada.",
    imagens: [
      { src: "img/produtos/plataforma-panda-1.jpg", alt: "Tênis Plataforma Panda calçado, vista lateral", foco: "50% 62%" },
      { src: "img/produtos/plataforma-panda-2.jpg", alt: "Tênis Plataforma Panda na mão, vista lateral", foco: "50% 70%" },
      { src: "img/produtos/plataforma-panda-3.jpg", alt: "Par do Tênis Plataforma Panda visto de cima", foco: "50% 55%" }
    ] },

  { id: 20, nome: "Tênis Impulse White Gold", genero: "masculino", tipo: "tenis", preco: 299.90, precoAntigo: null, destaque: false, lancamento: true,
    cor: "#f4f1ea", sola: "#d4a72c",
    descricao: "Tênis masculino de corrida branco com detalhes dourados e solado alto com amortecimento ondulado.",
    imagens: [
      { src: "img/produtos/white-gold-1.jpg", alt: "Tênis Impulse White Gold na mão, vista lateral", foco: "50% 74%" },
      { src: "img/produtos/white-gold-2.jpg", alt: "Tênis Impulse White Gold visto de cima", foco: "50% 34%" },
      { src: "img/produtos/white-gold-3.jpg", alt: "Par do Tênis Impulse White Gold ao lado da caixa", foco: "50% 61%" }
    ] },
  { id: 21, nome: "Tênis Knit Black", genero: "masculino", tipo: "tenis", preco: 299.90, precoAntigo: null, destaque: false, lancamento: true,
    cor: "#111111", sola: "#2b2b2b",
    descricao: "Tênis masculino todo preto, com cabedal em tecido e solado vazado com amortecimento.",
    imagens: [
      { src: "img/produtos/knit-black-1.jpg", alt: "Tênis Knit Black na mão, vista lateral", foco: "50% 56%" },
      { src: "img/produtos/knit-black-2.jpg", alt: "Calcanhar do Tênis Knit Black", foco: "50% 48%" }
    ] },

  { id: 1,  nome: "Tênis Runner Pro",        genero: "masculino", tipo: "tenis",   preco: 299.90, precoAntigo: 399.90, destaque: true,  cor: "#1d3557", sola: "#f1faee" },
  { id: 2,  nome: "Tênis Street Classic",    genero: "masculino", tipo: "tenis",   preco: 249.90, precoAntigo: null,   destaque: true,  cor: "#111111", sola: "#ffffff" },
  { id: 3,  nome: "Tênis Urban Flex",        genero: "masculino", tipo: "tenis",   preco: 189.90, precoAntigo: 259.90, destaque: false, cor: "#6c757d", sola: "#212529" },
  { id: 4,  nome: "Tênis Trail Max",         genero: "masculino", tipo: "tenis",   preco: 349.90, precoAntigo: null,   destaque: false, cor: "#386641", sola: "#f2e8cf" },
  { id: 5,  nome: "Chinelo Slide Comfort",   genero: "masculino", tipo: "chinelo", preco: 79.90,  precoAntigo: 109.90, destaque: true,  cor: "#222222", sola: "#444444" },
  { id: 6,  nome: "Chinelo Praia Tradicional", genero: "masculino", tipo: "chinelo", preco: 39.90, precoAntigo: null,  destaque: false, cor: "#0077b6", sola: "#ffffff" },
  { id: 7,  nome: "Chinelo Sport Slide",     genero: "masculino", tipo: "chinelo", preco: 69.90,  precoAntigo: 89.90,  destaque: false, cor: "#d62828", sola: "#111111" },
  { id: 8,  nome: "Tênis Casual Couro",      genero: "masculino", tipo: "tenis",   preco: 279.90, precoAntigo: null,   destaque: false, cor: "#7f5539", sola: "#ede0d4" },

  { id: 9,  nome: "Tênis Cloud Rosé",        genero: "feminino",  tipo: "tenis",   preco: 279.90, precoAntigo: 359.90, destaque: true,  cor: "#e5989b", sola: "#ffffff" },
  { id: 10, nome: "Tênis Fit Training",      genero: "feminino",  tipo: "tenis",   preco: 229.90, precoAntigo: null,   destaque: true,  cor: "#7209b7", sola: "#f8f9fa" },
  { id: 11, nome: "Tênis Plataforma White",  genero: "feminino",  tipo: "tenis",   preco: 199.90, precoAntigo: 269.90, destaque: false, cor: "#f8f9fa", sola: "#dee2e6" },
  { id: 12, nome: "Tênis Walk Light",        genero: "feminino",  tipo: "tenis",   preco: 179.90, precoAntigo: null,   destaque: false, cor: "#2a9d8f", sola: "#ffffff" },
  { id: 13, nome: "Chinelo Glam Dourado",    genero: "feminino",  tipo: "chinelo", preco: 59.90,  precoAntigo: 84.90,  destaque: true,  cor: "#d4a373", sola: "#fefae0" },
  { id: 14, nome: "Chinelo Floral",          genero: "feminino",  tipo: "chinelo", preco: 44.90,  precoAntigo: null,   destaque: false, cor: "#ff70a6", sola: "#ffffff" },
  { id: 15, nome: "Chinelo Slide Nuvem",     genero: "feminino",  tipo: "chinelo", preco: 89.90,  precoAntigo: 119.90, destaque: false, cor: "#a2d2ff", sola: "#ffffff" },
  { id: 16, nome: "Tênis Retrô Lilás",       genero: "feminino",  tipo: "tenis",   preco: 239.90, precoAntigo: null,   destaque: false, cor: "#b8b8ff", sola: "#ffffff" }
];
