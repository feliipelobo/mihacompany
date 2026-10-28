# Miha Company — Catálogo de motos elétricas

Site estático (HTML + CSS + JS puro, sem build) com catálogo, visualizador 360°,
suporte a modelos 3D reais (.glb) e contato direto pelo WhatsApp.

## Estrutura

```
index.html          página
css/style.css       estilos (responsivo, mobile-first)
js/products.js      ← CATÁLOGO: preços, nomes, fotos, especificações, WhatsApp
js/viewer.js        visualizador 360° / 3D
js/app.js           lógica da página
assets/img/         fotos e logo
assets/models/      modelos 3D .glb (opcional)
```

## Atualizar preços e informações

Edite apenas `js/products.js`:

```js
price: 12990,                                 // null = "Sob consulta"
oldPrice: 14990,                              // opcional, aparece riscado
installments: { times: 12, value: 1082.50 },  // opcional
specs: { "Motor": "2000W", "Bateria": "60V 30Ah", ... }
```

Para adicionar um modelo, copie um bloco `{ ... }` da lista, troque o `id`
(sem espaços) e coloque as fotos em `assets/img/`.

## Modelos 3D reais

Cada foto da moto vira um ângulo no visualizador 360° (quanto mais fotos de
ângulos diferentes, melhor a rotação). Para uma rotação 3D completa, com
Realidade Aumentada no celular, coloque um arquivo `.glb` em `assets/models/`
e preencha, por exemplo, `model: "assets/models/falcon-gt.glb"`.
O site passa a mostrar a aba **3D** automaticamente.

Formas de obter o `.glb`:
- pedir ao fabricante/fornecedor (muitos têm o arquivo do projeto);
- escanear a moto com um app de fotogrametria (ex.: Polycam, Luma AI, KIRI Engine) e exportar em GLB;
- encomendar a um modelador 3D.

Mantenha cada arquivo abaixo de ~10 MB para carregar bem no celular.

## Ver localmente

Abra `index.html` no navegador. Para testar como no servidor, rode um servidor
simples na pasta, por exemplo `npx serve .`.

## Publicar no GitHub Pages (grátis)

1. Crie um repositório no GitHub (ex.: `miha-company`) e envie todos os arquivos desta pasta.
2. No repositório: **Settings → Pages → Source: Deploy from a branch → main / (root)**.
3. Em 1–2 minutos o site estará em `https://SEU-USUARIO.github.io/miha-company/`.

### Domínio próprio (depois)

Depois de comprar o domínio (ex.: `mihacompany.com.br` no Registro.br), em
**Settings → Pages → Custom domain**, informe o domínio e configure o DNS
conforme a instrução do GitHub (registro `CNAME` para `SEU-USUARIO.github.io`).
Também funciona sem alterações na Netlify, Vercel ou Cloudflare Pages.
