// Catálogo de modelos y COSTOS del proveedor (lista abril 2026, USD 1 = $1.500, precios SIN IVA).
// Para actualizar: cuando llegue una lista nueva, reemplazar los números de este archivo (ver README).
//
// Cada variante: c = costo de lista, p = costo promocional (si hay promo; se cotiza el MÁS BAJO de los dos).
// Los promos que dependen de la cantidad ("6 x $3.600.000") figuran con el tramo más barato (ver PROMO_TRAMO en config.js).
(function () {
  'use strict';
  var CFG = window.APP_CONFIG;

  var CATS = [
    { id: 'sofas',    n: 'Sofás y sillones', d: 'De 1 cuerpo a 3 cuerpos y más.' },
    { id: 'esq',      n: 'Esquineros y modulares', d: 'Esquineros, chaise y módulos a medida.' },
    { id: 'cama',     n: 'Sofás cama', d: 'Con cama escondida o carrito.' },
    { id: 'butacas',  n: 'Butacas y pufs', d: 'Sillones individuales, pufs y chaise.' },
    { id: 'sillas',   n: 'Sillas', d: 'Tapizadas, con o sin apoyabrazos.' },
    { id: 'respaldos', n: 'Respaldos de cama', d: 'Tapizados a la medida de tu cama.' }
  ];

  // ---- medidas de ancho (columnas de la lista) ----
  var COLS = ['1C', '1.40', '1.60', '1.80', '2.00'];
  var LBL = { '1C': 'Sillón 1 cuerpo', '1.00': '1,00 m', '1.40': '1,40 m', '1.50': '1,50 m', '1.60': '1,60 m', '1.80': '1,80 m', '2.00': '2,00 m', '2.20': '2,20 m' };
  function fx(n) { return Math.round(n); }
  function T(primero, minimo) { return CFG.promoTramo === 'primero' ? primero : minimo; }   // tramo de promo por cantidad

  // prices: [1C, 1.40, 1.60, 1.80, 2.00]  ·  avail: medidas que se fabrican  ·  promo: {m:[medidas], c:costo}
  // La medida 2,20 m no tiene columna propia en la lista: se calcula como la de 2,00 m + 10% ("adicional fuera de medida" de 20 cm).
  function lineal(id, n, cat, prices, avail, promo, extra) {
    var vs = [];
    var all = COLS.concat(['2.20']);
    all.forEach(function (k) {
      if (avail.indexOf(k) < 0) return;
      var c = k === '2.20' ? fx(prices[4] * (1 + CFG.extra220)) : prices[COLS.indexOf(k)];
      var p = promo && promo.m.indexOf(k) >= 0 ? promo.c : null;
      vs.push({ k: k, n: LBL[k], c: c || null, p: p });
    });
    var o = { id: id, n: n, cat: cat, tipo: 'ancho', img: id, v: vs, unidad: 'Elegí el ancho' };
    if (extra) for (var x in extra) o[x] = extra[x];
    return o;
  }
  var FULL = ['1C', '1.40', '1.60', '1.80', '2.00', '2.20'];
  var DESDE160 = ['1.60', '1.80', '2.00', '2.20'];
  var EST = ['1C', '1.60', '1.80', '2.00', '2.20'];
  var P160_200 = ['1.60', '1.80', '2.00'];

  var A = [300000, 490000, 510000, 530000, 550000];
  var B = [420000, 600000, 630000, 660000, 700000];
  var Cc = [440000, 650000, 690000, 710000, 750000];
  var D = [440000, 640000, 670000, 690000, 740000];
  var E = [500000, 700000, 720000, 750000, 800000];
  var G = [550000, 740000, 760000, 780000, 800000];

  // Promo "sillones": 6 x $3.600.000 ($600.000) · 12 x $6.900.000 ($575.000) · 18 x $9.900.000 ($550.000)
  var PROMO_B = { m: P160_200, c: T(600000, 550000) };

  var M = [];
  // ---------- Sofás y sillones ----------
  M.push(lineal('waser', 'Waser', 'sofas', B, FULL, PROMO_B));
  M.push(lineal('bahia', 'Bahía', 'sofas', B, FULL, PROMO_B));
  M.push(lineal('forum', 'Forum', 'sofas', B, FULL, PROMO_B));
  M.push(lineal('malasia', 'Malasia', 'sofas', B, FULL, PROMO_B));
  M.push(lineal('roma', 'Roma', 'sofas', A, FULL, { m: P160_200, c: 440000 }));
  M.push(lineal('lisboa', 'Lisboa', 'sofas', A, FULL, null));
  M.push(lineal('patagonia', 'Patagonia', 'sofas', A, FULL, { m: P160_200, c: 440000 }));
  M.push(lineal('suncity-sillon', 'Suncity', 'sofas', Cc, FULL, null));
  M.push(lineal('hamburgo', 'Hamburgo', 'sofas', Cc, FULL, null));
  M.push(lineal('oslo-recto', 'Oslo recto', 'sofas', D, FULL, null));
  M.push(lineal('maui', 'Maui', 'sofas', D, DESDE160, null));
  M.push(lineal('athenas', 'Athenas', 'sofas', E, DESDE160, null));
  M.push(lineal('santorini', 'Santorini', 'sofas', E, DESDE160, null));
  M.push(lineal('praga', 'Praga', 'sofas', E, DESDE160, null));
  M.push(lineal('berlin', 'Berlín', 'sofas', E, DESDE160, null));
  M.push(lineal('ibiza', 'Ibiza', 'sofas', E, DESDE160, null));
  M.push(lineal('luxemburgo', 'Luxemburgo', 'sofas', E, DESDE160, null));
  M.push(lineal('paris', 'París', 'sofas', E, EST, null));
  M.push(lineal('nazareth', 'Nazareth', 'sofas', G, EST, null));
  var PROMO_FUNDAS = { m: P160_200, c: 700000 };            // 3 x $2.100.000
  M.push(lineal('detroit', 'Detroit', 'sofas', G, FULL, PROMO_FUNDAS));
  M.push(lineal('mykonos', 'Mykonos', 'sofas', G, FULL, PROMO_FUNDAS));
  M.push(lineal('milos', 'Milos', 'sofas', G, FULL, PROMO_FUNDAS));
  M.push(lineal('capri', 'Capri', 'sofas', G, DESDE160, null));
  M.push(lineal('saona', 'Saona', 'sofas', E, DESDE160, null));
  M.push(lineal('cozumel', 'Cozumel', 'sofas', E, DESDE160, null));
  // Estilo: en la lista la columna 1,60 está vacía (solo figura el precio promo) y 1,40 no se fabrica.
  var ESTILO = [490000, null, null, 720000, 800000];
  var PROMO_ESTILO = { m: P160_200, c: 650000 };            // 3 x $1.950.000
  M.push(lineal('architector', 'Architector', 'sofas', ESTILO, EST, PROMO_ESTILO));
  M.push(lineal('restoration', 'Restoration', 'sofas', ESTILO, EST, PROMO_ESTILO));
  M.push(lineal('chesterfield', 'Chesterfield', 'sofas', ESTILO, EST, PROMO_ESTILO));
  M.push({ id: 'moscu', n: 'Moscú', cat: 'sofas', tipo: 'ancho', img: 'moscu', unidad: 'Elegí el ancho',
    v: ['1.40', '1.50', '1.60'].map(function (k) { return { k: k, n: LBL[k], c: 350000, p: 333333 }; }) });          // promo x3: $1.000.000
  M.push({ id: 'moscu-funda', n: 'Moscú con funda', cat: 'sofas', tipo: 'ancho', img: 'moscu-funda', unidad: 'Elegí el ancho',
    v: ['1.40', '1.50', '1.60'].map(function (k) { return { k: k, n: LBL[k], c: 400000, p: 375000 }; }) });          // promo x4 con funda: $1.500.000

  // ---------- Esquineros y modulares ----------
  M.push({ id: 'suncity-mod', n: 'Suncity modular', cat: 'esq', tipo: 'mod', img: 'suncity4',
    nota: 'Armalo con los módulos que necesites. Cada módulo mide 100 × 100 cm.',
    mods: [{ k: 'lat', n: 'Módulo lateral', d: '100 × 100', c: 380000 }, { k: 'cen', n: 'Módulo central', d: '100 × 100', c: 345000 }, { k: 'puf', n: 'Puf', d: '100 × 100', c: 240000 }],
    combos: [
      { n: 'Esquinero 4 módulos', d: '2 laterales + 2 centrales', q: { lat: 2, cen: 2 }, p: 1100000, base: 350000, img: 'suncity4' },
      { n: 'Esquinero 5 módulos', d: '2 laterales + 2 centrales + puf', q: { lat: 2, cen: 2, puf: 1 }, p: 1390000, base: 450000, img: 'suncity5' }
    ],
    base: { n: 'Base de madera', porMod: 90000 } });
  M.push({ id: 'oslo', n: 'Oslo modular', cat: 'esq', tipo: 'mod', img: 'oslo4',
    nota: 'Combiná los módulos como quieras: laterales de 110 × 90 cm, centrales y pufs de 90 × 90 cm, chaise de 90 × 140 cm.',
    mods: [{ k: 'lat', n: 'Módulo lateral', d: '110 × 90', c: 360000 }, { k: 'cen', n: 'Módulo central', d: '90 × 90', c: 290000 }, { k: 'puf', n: 'Puf', d: '90 × 90', c: 230000 }, { k: 'cha', n: 'Chaise', d: '90 × 140', c: 370000 }],
    combos: [
      { n: '2 módulos', d: '2 laterales', q: { lat: 2 }, p: 650000, img: 'oslo2' },
      { n: '3 módulos', d: '2 laterales + 1 central', q: { lat: 2, cen: 1 }, p: 900000, img: 'oslo3' },
      { n: '3 módulos con puf', d: '2 laterales + 1 puf', q: { lat: 2, puf: 1 }, p: 900000, img: 'oslo3' },
      { n: '4 módulos', d: '2 laterales + 1 central + 1 puf', q: { lat: 2, cen: 1, puf: 1 }, p: 1100000, img: 'oslo4' }
    ] });
  M.push({ id: 'estocolmo', n: 'Estocolmo modular', cat: 'esq', tipo: 'mod', img: 'estocolmo',
    nota: 'Chaise de 120 × 180 cm y módulos centrales de 120 × 120 cm.',
    mods: [{ k: 'cha', n: 'Chaise', d: '120 × 180', c: 800000 }, { k: 'cen', n: 'Módulo central', d: '120 × 120', c: 500000 }],
    combos: [{ n: 'Chaise + 2 módulos', d: '1 chaise + 2 centrales', q: { cha: 1, cen: 2 }, p: null, img: 'estocolmo' }],
    def: { cha: 1, cen: 2 } });
  M.push({ id: 'hamburgo-esq', n: 'Esquinero Hamburgo', cat: 'esq', tipo: 'ancho', img: 'hamburgo-esq', unidad: 'Elegí la medida',
    v: [{ k: '240x180', n: '240 × 180 cm', c: 990000, p: null }, { k: '300x200', n: '300 × 200 cm', c: 1100000, p: null }] });
  M.push({ id: 'hamburgo-rinc', n: 'Rinconero Hamburgo', cat: 'esq', tipo: 'ancho', img: 'hamburgo-rinc', unidad: 'Medida',
    v: [{ k: '320x320', n: '320 × 320 cm', c: 1750000, p: null }] });
  M.push({ id: 'malasia-small', n: 'Malasia small', cat: 'esq', tipo: 'ancho', img: 'malasia-small', unidad: 'Medida',
    v: [{ k: '220x170', n: '220 × 170 cm', c: 890000, p: T(825000, 780000) }] });           // promo 6 x $4.680.000 (780.000 c/u)
  M.push({ id: 'mini-esq', n: 'Mini esquinero', cat: 'esq', tipo: 'ancho', img: 'mini-esq', unidad: 'Medida',
    v: [{ k: '200x150', n: '200 × 150 cm', c: 830000, p: T(740000, 680000) }] });             // promo 6 x $4.080.000 (680.000 c/u)
  M.push({ id: 'esq-u', n: 'Esquinero en U', cat: 'esq', tipo: 'ancho', img: 'esq-u', unidad: 'Medida',
    v: [{ k: '400x200x200', n: '400 × 200 × 200 cm', c: 1650000, p: null }] });
  M.push({ id: 'creta', n: 'Esquinero Creta', cat: 'esq', tipo: 'ancho', img: 'creta', unidad: 'Medida',
    v: [{ k: '440x220x200', n: '440 × 220 × 200 cm', c: 2200000, p: null }] });

  // ---------- Sofás cama ----------
  M.push({ id: 'sofa-cama', n: 'Sofá cama', cat: 'cama', tipo: 'ancho', img: 'sofa-cama', unidad: 'Medida',
    v: [{ k: '1.80-2.20', n: '1,80 a 2,20 m', c: 990000, p: null }] });
  M.push({ id: 'carrito', n: 'Sofá cama con carrito', cat: 'cama', tipo: 'ancho', img: 'carrito', unidad: 'Medida',
    v: [{ k: '2.20', n: '2,20 m', c: 950000, p: null }] });
  M.push({ id: 'but-carrito', n: 'Sillón cama con carrito', cat: 'cama', tipo: 'ancho', img: 'but-carrito', unidad: 'Medida',
    v: [{ k: '2.00', n: '2,00 m', c: 890000, p: null }] });

  // ---------- Butacas y pufs ----------
  function unico(id, n, cat, medida, c) { return { id: id, n: n, cat: cat, tipo: 'ancho', img: id, unidad: 'Medida', v: [{ k: 'u', n: medida, c: c, p: null }] }; }
  M.push(unico('dallas', 'Butaca Dallas', 'butacas', 'Individual', 220000));
  M.push(unico('herradura', 'Butaca Herradura', 'butacas', 'Individual', 220000));
  M.push(unico('gervasoni', 'Butaca con base de madera', 'butacas', 'Individual', 320000));
  M.push(unico('quebeq', 'Butaca giratoria Quebec', 'butacas', 'Medidas de 80 a 200 cm', 320000));
  M.push(unico('rodas', 'Butaca Rodas', 'butacas', 'Medidas de 80 a 200 cm', 320000));
  M.push(unico('siros', 'Chaise Siros', 'butacas', '120 × 180 cm', 690000));
  M.push(unico('puff', 'Puff', 'butacas', '60 × 60 cm', 180000));
  M.push(unico('puff-brazo', 'Puff con brazo', 'butacas', '75 × 75 cm', 220000));

  // ---------- Sillas ----------
  M.push(unico('silla', 'Silla tapizada', 'sillas', 'Estándar', 130000));
  M.push(unico('silla-brazo', 'Silla con apoyabrazos', 'sillas', 'Estándar', 165000));

  // ---------- Respaldos de cama ----------
  function resp(id, n, nota, p) {
    var ks = ['1.00', '1.40', '1.60', '1.80', '2.00', '2.20'];
    return { id: id, n: n, cat: 'respaldos', tipo: 'ancho', img: id, unidad: 'Ancho del respaldo', nota: nota,
      v: ks.map(function (k, i) { return { k: k, n: LBL[k], c: i < 5 ? p[i] : fx(p[4] * (1 + CFG.extra220)), p: null }; }) };
  }
  var RN = 'Elegí el ancho según tu cama: 1,00 m (1 plaza) · 1,40 m (2 plazas) · 1,60 m (queen) · 1,80 y 2,00 m (king).';
  M.push(resp('resp-tachas', 'Respaldo liso o con tachas', RN, [100000, 120000, 125000, 130000, 140000]));
  M.push(resp('resp-tiraje', 'Respaldo con tiraje', RN, [110000, 130000, 135000, 140000, 150000]));
  M.push(resp('resp-funda', 'Respaldo con funda', RN, [110000, 130000, 135000, 140000, 150000]));
  M.push(resp('resp-capitone', 'Respaldo capitoné', RN, [150000, 180000, 185000, 190000, 200000]));
  M.push(resp('resp-canelon', 'Respaldo canelón', RN, [150000, 180000, 185000, 190000, 200000]));

  window.CATS = CATS;
  window.MODELOS = M;
})();
