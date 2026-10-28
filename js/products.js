/* =========================================================================
   MIHA COMPANY — CATÁLOGO
   -------------------------------------------------------------------------
   Este é o ÚNICO arquivo que você precisa editar para atualizar o site.

   • price      → valor à vista em reais (ex.: 12990). Deixe null para
                  mostrar "Sob consulta".
   • oldPrice   → valor "de" riscado (opcional, ex.: 14990).
   • installments → { times: 12, value: 1082.50 } (opcional).
   • images     → fotos em assets/img/. A 1ª é a capa. Cada foto vira um
                  "ângulo" no visualizador 360°.
   • model      → caminho de um arquivo .glb (ex.: "assets/models/falcon.glb").
                  Quando preenchido, o modal mostra o modelo 3D real que
                  gira em 360° e abre em Realidade Aumentada no celular.
   • fit        → "contain" para fotos com fundo preto (encaixa inteira),
                  "cover" para fotos de ambiente (preenche o card).
   • specs      → deixe null para mostrar "Em breve".
   ========================================================================= */

window.MIHA_CONFIG = {
  company: "Miha Company",
  whatsapp: "5547996321487",          // DDI + DDD + número, só dígitos
  whatsappDisplay: "(47) 99632-1487",
  instagram: null                     // ex.: "https://instagram.com/mihacompany"
};

window.MIHA_CATEGORIES = {
  offroad: "Off-Road",
  scooter: "Scooter",
  chopper: "Chopper",
  bike: "Bike Elétrica"
};

window.MIHA_PRODUCTS = [
  {
    id: "riding-times",
    name: "Riding Times X",
    category: "offroad",
    tagline: "Trilha elétrica com quadro tubular e alma de motocross.",
    badge: "Destaque",
    price: null,
    oldPrice: null,
    installments: null,
    images: ["assets/img/riding-side.jpg", "assets/img/riding-front.jpg"],
    fit: "contain",
    model: null,
    colors: ["Preto & Bronze"],
    highlights: [
      "Quadro tubular reforçado",
      "Suspensão dianteira invertida",
      "Pneus cravudos para trilha",
      "Freio a disco dianteiro e traseiro"
    ],
    specs: { "Motor": null, "Bateria": null, "Autonomia": null, "Velocidade máx.": null, "Recarga": null }
  },
  {
    id: "falcon-gt",
    name: "79Bike Falcon GT",
    category: "offroad",
    tagline: "Iluminação full LED e postura agressiva para qualquer terreno.",
    badge: "Lançamento",
    price: null,
    oldPrice: null,
    installments: null,
    images: ["assets/img/falcon-gt.jpg"],
    fit: "cover",
    model: null,
    colors: ["Preto"],
    highlights: [
      "Farol e lanterna em LED",
      "Garfo invertido de longo curso",
      "Transmissão por corrente",
      "Rodas raiadas com pneus off-road"
    ],
    specs: { "Motor": null, "Bateria": null, "Autonomia": null, "Velocidade máx.": null, "Recarga": null }
  },
  {
    id: "eze-lumina",
    name: "EZE Lumina",
    category: "scooter",
    tagline: "Design retrô, acabamento premium e muito charme na cidade.",
    badge: null,
    price: null,
    oldPrice: null,
    installments: null,
    images: ["assets/img/eze-lumina.jpg"],
    fit: "contain",
    model: null,
    colors: ["Rosé & Caramelo"],
    highlights: [
      "Banco em couro sintético caramelo",
      "Para-brisa frontal",
      "Painel digital",
      "Iluminação em LED"
    ],
    specs: { "Motor": null, "Bateria": null, "Autonomia": null, "Velocidade máx.": null, "Recarga": null }
  },
  {
    id: "pontaine",
    name: "Pontaine",
    category: "scooter",
    tagline: "Prática para o dia a dia, com encosto para garupa e farol LED.",
    badge: null,
    price: null,
    oldPrice: null,
    installments: null,
    images: ["assets/img/pontaine.jpg"],
    fit: "cover",
    model: null,
    colors: ["Preto & Amarelo"],
    highlights: [
      "Farol LED com luz diurna (DRL)",
      "Banco com encosto para garupa",
      "Pedais auxiliares",
      "Assoalho amplo e plano"
    ],
    specs: { "Motor": null, "Bateria": null, "Autonomia": null, "Velocidade máx.": null, "Recarga": null }
  },
  {
    id: "evee-sport",
    name: "Évee Sport",
    category: "scooter",
    tagline: "Linhas esportivas e proteção tubular para rodar com estilo.",
    badge: null,
    price: null,
    oldPrice: null,
    installments: null,
    images: ["assets/img/evee-sport.jpg"],
    fit: "cover",
    model: null,
    colors: ["Grafite"],
    highlights: [
      "Carenagem esportiva",
      "Protetor lateral tubular",
      "Rodas de liga leve",
      "Pneus de uso misto"
    ],
    specs: { "Motor": null, "Bateria": null, "Autonomia": null, "Velocidade máx.": null, "Recarga": null }
  },
  {
    id: "evee-cargo",
    name: "Évee Cargo",
    category: "scooter",
    tagline: "Baú traseiro incluso: ideal para trabalho e entregas.",
    badge: null,
    price: null,
    oldPrice: null,
    installments: null,
    images: ["assets/img/evee-cargo.jpg"],
    fit: "cover",
    model: null,
    colors: ["Verde Militar"],
    highlights: [
      "Baú traseiro incluso",
      "Painel digital",
      "Suspensão traseira regulável",
      "Freio a disco"
    ],
    specs: { "Motor": null, "Bateria": null, "Autonomia": null, "Velocidade máx.": null, "Recarga": null }
  },
  {
    id: "evee-fat",
    name: "Évee Fat",
    category: "bike",
    tagline: "Bike elétrica com pneus fat e visual café racer.",
    badge: "Mais procurada",
    price: null,
    oldPrice: null,
    installments: null,
    images: ["assets/img/evee-fat-1.jpg", "assets/img/evee-fat-2.jpg"],
    fit: "cover",
    model: null,
    colors: ["Branco", "Preto"],
    highlights: [
      "Pneus fat para qualquer piso",
      "Farol circular em LED",
      "Bateria integrada ao quadro",
      "Freio a disco dianteiro e traseiro"
    ],
    specs: { "Motor": null, "Bateria": null, "Autonomia": null, "Velocidade máx.": null, "Recarga": null }
  },
  {
    id: "veltron-chopper",
    name: "Veltron Chopper",
    category: "chopper",
    tagline: "O estilo chopper com pneus largos que chama atenção por onde passa.",
    badge: null,
    price: null,
    oldPrice: null,
    installments: null,
    images: ["assets/img/veltron-1.jpg", "assets/img/veltron-2.jpg"],
    fit: "cover",
    model: null,
    colors: ["Vermelho"],
    highlights: [
      "Pneus largos de alta estabilidade",
      "Farol LED com faróis auxiliares",
      "Banco duplo com encosto",
      "Amortecedores traseiros"
    ],
    specs: { "Motor": null, "Bateria": null, "Autonomia": null, "Velocidade máx.": null, "Recarga": null }
  },
  {
    id: "urban-gold",
    name: "Urban Black Gold",
    category: "scooter",
    tagline: "Quadro aparente e detalhes dourados para quem quer ser notado.",
    badge: null,
    price: null,
    oldPrice: null,
    installments: null,
    images: ["assets/img/urban-gold.jpg"],
    fit: "cover",
    model: null,
    colors: ["Preto & Dourado"],
    highlights: [
      "Farol em LED",
      "Freio a disco dianteiro",
      "Quadro aparente",
      "Acabamento preto e dourado"
    ],
    specs: { "Motor": null, "Bateria": null, "Autonomia": null, "Velocidade máx.": null, "Recarga": null }
  }
];
