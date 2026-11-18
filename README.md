# STN Sneakers

Loja virtual de tênis e chinelos femininos e masculinos, em HTML, CSS e JavaScript puro, com banco de dados no Supabase e painel de administração.

## Páginas
- `index.html`: página inicial com anúncios, lançamentos, promoções e destaques
- `feminino.html` e `masculino.html`: catálogo com filtros (tênis, chinelos, lançamentos, promoções) e ordenação por preço
- `conta.html`: área do cliente (entrar / criar conta, esqueci minha senha, Meus Pedidos, dados e endereço)
- `admin.html`: painel do administrador (produtos e fotos, pedidos, clientes, fluxo do site, newsletter e equipe)

## Testar no computador
Abra o `index.html` no navegador. Sem o Supabase configurado em `js/config.js`, o site roda em **modo demonstração**: tudo fica salvo só no navegador e o `admin.html` abre sem login.

## Como colocar a loja no ar

O site já está pronto, com loja, contas de cliente, pedidos por Pix e um **painel de administração** (`admin.html`). Enquanto o banco de dados não estiver ligado, tudo roda em **modo demonstração**, e os dados ficam salvos só no navegador de quem está testando.

Para abrir as vendas, faça os 5 passos abaixo, nesta ordem. Leva cerca de 30 minutos.

---

## O que tem em cada pasta

| Arquivo | Para que serve |
|---|---|
| `index.html`, `feminino.html`, `masculino.html`, `conta.html` | A loja |
| `admin.html` | Painel do administrador: produtos e fotos, pedidos, clientes, fluxo do site, newsletter e equipe |
| `js/config.js` | **Único arquivo que você precisa editar** para ligar a loja |
| `js/pix.js` | Chave Pix da loja, desconto e prazo do Pix |
| `supabase/*.sql` | Arquivos para criar o banco de dados (rodar uma vez) |
| `img/` | Logo, ícone e fotos iniciais dos produtos |

---

## Passo 1: criar o banco de dados (Supabase, plano gratuito)

1. Crie uma conta em **supabase.com** e clique em **New project**.
   - Em **Region**, escolha **South America (São Paulo)**.
   - Guarde a senha do banco num lugar seguro.
2. No menu da esquerda, abra **SQL Editor**, clique em **New query** e faça o seguinte:
   - Cole todo o conteúdo de `supabase/1-estrutura.sql` e clique em **Run**.
   - Em outra query, cole `supabase/2-produtos-iniciais.sql` e clique em **Run**. Isso coloca no banco os 22 produtos que já estão no site.
3. Em **Project Settings → API** (ou **API Keys**), copie dois valores:
   - **Project URL**, algo como `https://abcd1234.supabase.co`.
   - A chave **anon / public** (em projetos novos ela se chama **publishable key**).
   - ⚠️ Nunca use a chave **service_role** / **secret** no site.

## Passo 2: ligar o site ao banco

Abra `js/config.js` e preencha os campos:

```js
supabaseUrl: "https://abcd1234.supabase.co",
supabaseChave: "cole-aqui-a-chave-anon-public",
emailSuporte: "contato@suaempresa.com.br",
```

Abra também `js/pix.js` e coloque a **chave Pix da loja** em `chave:`, além do nome e da cidade como estão no banco. Sem a chave, o QR Code continua sendo de demonstração.

> Dica: na loja real, o pagamento por Pix é conferido por uma pessoa no painel. Por isso vale aumentar o prazo `validadeMin` de 5 para 30 minutos.

## Passo 3: publicar o site (Netlify, plano gratuito)

1. Crie uma conta em **netlify.com**.
2. Em **Add new site → Deploy manually**, arraste a **pasta inteira** do site.
3. O Netlify gera um endereço como `stn-sneakers.netlify.app`. Em **Domain management** dá para usar um domínio próprio (ex.: `stnsneakers.com.br`).

Funciona do mesmo jeito em Vercel, Cloudflare Pages ou na hospedagem que você já tiver, porque são só arquivos.

**Depois de publicar, volte ao Supabase:** em **Authentication → URL Configuration**:

- **Site URL** = endereço do site (ex.: `https://stn-sneakers.netlify.app`)
- **Redirect URLs** = adicione `https://SEU-SITE/conta.html`

Sem isso, os links de "confirmar e-mail" e "esqueci minha senha" não voltam para o site.

## Passo 4: colocar o responsável pela administração

1. A pessoa responsável entra no site publicado e clica em **Minha conta → Criar conta**. Se o Supabase pedir, ela confirma o e-mail.
2. No Supabase, abra o **SQL Editor**, cole `supabase/3-primeiro-admin.sql`, troque o e-mail pelo dela e clique em **Run**.
3. Pronto. Ela acessa **`SEU-SITE/admin.html`** (ou Minha conta → **Painel da loja**) com o mesmo e-mail e senha.

Para incluir **mais pessoas** depois, não precisa voltar ao Supabase: no painel, vá em **Equipe** e digite o e-mail de quem já criou conta no site.

## Passo 5: testar antes de divulgar

- [ ] Fazer uma compra de teste com Pix e ver o pedido chegar em **Painel → Pedidos**
- [ ] Trocar uma foto em **Painel → Produtos e fotos** e conferir na loja
- [ ] Testar "Esqueci minha senha"
- [ ] Abrir o site pelo celular

---

## O que o administrador faz no painel

| Aba | O que dá para fazer |
|---|---|
| **Resumo** | Visitantes, pedidos, faturamento, conversão, gráfico de visitantes por dia, **funil de compra** (visitou → viu produto → carrinho → pagamento → pedido), produtos mais vistos e páginas mais visitadas. Períodos de 7, 30 ou 90 dias |
| **Produtos e fotos** | Enviar fotos (arrastando ou clicando), escolher a capa, mudar a ordem, ajustar o enquadramento, editar nome, preço, promoção, descrição e tamanhos à venda (desmarcar os esgotados), marcar lançamento ou destaque, esconder da loja e criar ou excluir produtos |
| **Pedidos** | Ver os pedidos que precisam de ação, conferir o Pix e mudar o status: Aguardando pagamento → Pagamento aprovado → Enviado → Entregue (ou Cancelado). O cliente vê o novo status em "Meus pedidos" |
| **Clientes** | Nome, e-mail, telefone, cidade, quantidade de pedidos e total pago |
| **Newsletter** | E-mails do "Ganhe 10% OFF", com botões para copiar ou baixar a planilha |
| **Equipe** | Adicionar ou remover administradores |

**Para ver como as pessoas navegam** (gravações de tela e mapas de calor), crie um projeto grátis em **clarity.microsoft.com** e cole o ID em `clarityId` no `js/config.js`.

---

## Segurança (o que já está protegido)

- As senhas ficam no Supabase Auth. O site e a loja nunca veem nenhuma senha.
- Cada cliente só vê os próprios dados e pedidos. Só administradores veem clientes, pedidos de todos e o fluxo do site.
- **O preço do pedido é calculado no banco**: mesmo que alguém altere o site no navegador, não consegue pagar menos.
- Só administradores enviam fotos e editam produtos. Um cliente não consegue se tornar administrador.

## O que ainda falta para uma loja completa

1. **Cartão e boleto.** Com o banco ligado, a loja aceita **só Pix**, e o pagamento é conferido manualmente no painel. Para cartão e boleto com aprovação automática, o próximo passo é integrar um intermediário de pagamento, como **Mercado Pago**, **PagSeguro** ou **Pagar.me**. As opções de cartão e boleto da versão de demonstração simulavam a aprovação e foram desligadas na versão real.
2. **Frete.** O site anuncia "frete grátis acima de R$ 199", mas ainda não calcula frete abaixo desse valor. Uma opção é integrar o **Melhor Envio**.
3. **Página de Política de Privacidade e Termos de Troca.** A LGPD exige informar quais dados você guarda (nome, CPF, endereço, e-mail) e para quê. Os links "Trocas e devoluções", "Prazo de entrega" e "Guia de tamanhos" do rodapé ainda não levam a lugar nenhum.
4. **CNPJ / MEI e nota fiscal** para vender regularmente.
5. **Produtos de marca.** Fotos que mostram logos de outras marcas (Nike, Adidas, On etc.) só devem ser usadas se os produtos forem originais. Vender réplicas com a marca é proibido no Brasil e pode fazer o site, o domínio ou a conta de pagamento serem bloqueados.
