# STN Sneakers

Loja virtual de tênis e chinelos femininos e masculinos, em HTML, CSS e JavaScript puro, sem dependências.

## Páginas
- `index.html`: página inicial com promoções e destaques
- `feminino.html` e `masculino.html`: catálogo com filtros (tênis, chinelos, promoções) e ordenação por preço
- `conta.html`: área do cliente (entrar / criar conta, Meus Pedidos, Loja, Minha Conta e Sair)

## Recursos
- Layout responsivo para computador, tablet e celular
- Carrinho lateral salvo no navegador
- Finalização com opção de continuar comprando ou ir para o pagamento (Pix, cartão ou boleto, simulado)
- Área do cliente: histórico de pedidos, informações pessoais, endereço de entrega, cartões salvos e troca de senha
- Para pagar, o cliente precisa estar logado e ter um endereço cadastrado

> **Atenção:** é uma versão de demonstração, sem servidor. As contas e os pedidos ficam salvos apenas no navegador
> (localStorage). A senha é guardada como hash e, dos cartões, só a bandeira e os 4 últimos dígitos.
> Para uma loja real, contas e pagamentos precisam de um back-end e de um serviço de pagamento.

## Como usar
Abra o `index.html` no navegador.

Para cadastrar ou alterar produtos, edite `js/produtos.js`:
- `precoAntigo` preenchido coloca o produto em **Promoções**
- `destaque: true` coloca o produto em **Destaques**

## Como adicionar fotos a um produto
1. Coloque as fotos em `img/produtos/` (de preferência JPG com até ~1000px de largura).
2. No produto em `js/produtos.js`, acrescente a lista `imagens`:
   ```js
   imagens: [
     { src: "img/produtos/meu-tenis-1.jpg", alt: "Descrição da foto", foco: "50% 60%" },
     { src: "img/produtos/meu-tenis-2.jpg", alt: "Outra posição" }
   ]
   ```
   - A 1ª foto aparece no cartão e a 2ª ao passar o mouse.
   - `foco` ajusta qual parte da foto aparece no recorte quadrado do cartão (horizontal vertical).
3. Use `lancamento: true` para o produto aparecer em **Lançamentos** com o selo.

## Pagamento via Pix (5% de desconto)
O Pix gera o QR Code e o "Pix copia e cola" no padrão BR Code do Banco Central, já com o valor do pedido com 5% de desconto.

**Para receber de verdade**, abra `js/pix.js` e preencha:
```js
const PIX_CONFIG = {
  chave: "sua-chave-pix",   // CPF, CNPJ, e-mail, telefone (+5561...) ou chave aleatória
  nome: "STN SNEAKERS",     // nome do recebedor (até 25 letras, sem acento)
  cidade: "BRASILIA",       // cidade do recebedor (até 15 letras, sem acento)
  desconto: 0.05
};
```
Enquanto a chave estiver vazia, o site mostra um aviso de **QR Code de demonstração**.
O site não confirma o pagamento sozinho: os pedidos Pix ficam como "Aguardando pagamento".
Para confirmação automática é preciso a API Pix de um banco ou de um intermediário (Mercado Pago, PagSeguro etc.).

## Numerações
- Feminino: 34 ao 39
- Masculino: 34 ao 43

O cliente escolhe o tamanho antes de colocar no carrinho. Para um produto ter numeração diferente, use `tamanhos: [38, 39, 40]` nele em `js/produtos.js`.

O QR Code usa a biblioteca [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (licença MIT), copiada em `js/vendor/qrcode.js`.

## Marca
- Logo em `img/logo-branca.png` (para fundo escuro) e `img/logo-preta.png` (para fundo claro); ícone da aba em `img/favicon.png`.
- Onde o nome aparece escrito, use `<span class="marca"><b>STN</b> <i>Sneakers</i></span>` para seguir o estilo da logo
  (fontes Archivo Black e Gochi Hand, do Google Fonts).

## Pagamento
- Cartão de crédito: até 3x sem juros (o cliente escolhe 1x, 2x ou 3x).
- Pix: o cliente tem 5 minutos para pagar (`validadeMin` em `js/pix.js`). Depois disso o pedido vira "Pix expirado"
  e pode ser excluído pela lixeira em Meus Pedidos. O prazo é controlado pelo site; com QR Code estático o banco
  ainda aceitaria o pagamento depois, então para expirar de verdade é preciso Pix dinâmico (API de banco/intermediário).
