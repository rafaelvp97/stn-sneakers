// Catálogo de produtos. Para adicionar itens, basta incluir novos objetos aqui.
// precoAntigo preenchido = produto em promoção | destaque: true = aparece em "Destaques"
const PRODUTOS = [
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
