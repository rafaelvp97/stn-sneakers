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
