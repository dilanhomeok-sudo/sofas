/* Cotizador de sofás y sillones · Dilan Home */
(function () {
  'use strict';
  var CFG = window.APP_CONFIG, CATS = window.CATS, MODELOS = window.MODELOS, LINEAS = window.LINEAS_TELA, TELAS = window.TELAS;
  var $ = function (id) { return document.getElementById(id); };
  var el = function (tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  var money = function (n) { return '$ ' + Math.round(n).toLocaleString('es-AR'); };
  var redondeo = function (n) { return Math.round(n / CFG.redondeo) * CFG.redondeo; };
  var norm = function (s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
  };
  var KEY = 'dh_sofas_v1';

  var byId = {}; MODELOS.forEach(function (m) { byId[m.id] = m; });
  var catHint = {}; CATS.forEach(function (c) { catHint[c.id] = c.d; });

  // ---------- Color de cada tela ----------
  function hexToRgb(h) { return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function hsl(rgb) {
    var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, s = 0, h = 0, d = mx - mn;
    if (d) { s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
    return { h: h, s: s, l: l };
  }
  var FAM = [
    { id: 'claro', n: 'Blancos y marfil', c: '#F4F0E6' },
    { id: 'beige', n: 'Beige y arena', c: '#D9C7A6' },
    { id: 'gris', n: 'Grises', c: '#A5A5A2' },
    { id: 'marron', n: 'Marrones', c: '#7B5A44' },
    { id: 'oscuro', n: 'Negros', c: '#2D2B2A' },
    { id: 'color', n: 'Colores', c: '#C9695A' }
  ];
  function familia(t) {
    var x = hsl(t.rgb);
    if (x.l < .2) return 'oscuro';
    if (x.l > .78 && x.s < .45) return 'claro';
    if (x.s > .38 && x.l > .22 && !(x.h > 20 && x.h < 60 && x.s < .6)) return 'color';
    if (x.s < .12) return x.l < .32 ? 'oscuro' : 'gris';
    if (x.h >= 15 && x.h <= 55) return x.l < .38 ? 'marron' : 'beige';
    return x.s < .2 ? 'gris' : 'beige';
  }
  TELAS.forEach(function (t) {
    t.rgb = hexToRgb(t.rgb);
    t.fam = familia(t);
    t.hay = norm(t.n + ' ' + LINEAS[t.l].n);
  });
  var telaById = {}; TELAS.forEach(function (t) { telaById[t.id] = t; });
  var telaImg = function (t) { return 'img/t/' + t.id + '.jpg'; };
  var modImg = function (k) { return 'img/m/' + k + '.webp'; };

  // ---------- Estado ----------
  var S = { cat: 'sofas', model: null, vk: null, qty: {}, base: 'no', linea: '', fam: '', q: '', tela: null, nombre: '', n: 1 };
  var LIST = store.get(KEY) || [];

  // ---------- Precios ----------
  var costoV = function (v) { var a = [v.c, v.p].filter(function (x) { return x != null; }); return a.length ? Math.min.apply(null, a) : null; };
  var promoV = function (v) { return v.p != null && (v.c == null || v.p < v.c); };
  function sameQ(a, b) {
    var ks = {}; Object.keys(a).concat(Object.keys(b)).forEach(function (k) { ks[k] = 1; });
    return Object.keys(ks).every(function (k) { return (a[k] || 0) === (b[k] || 0); });
  }
  function totalMods(q) { return Object.keys(q).reduce(function (s, k) { return s + (q[k] || 0); }, 0); }
  // costo (sin IVA) de la selección; devuelve null si no está completa
  function calc(m, sel) {
    if (!m) return null;
    if (m.tipo === 'ancho') {
      var v = m.v.filter(function (x) { return x.k === sel.vk; })[0];
      if (!v) return null;
      var c = costoV(v); return c == null ? null : { cost: c, promo: promoV(v) };
    }
    var n = totalMods(sel.qty || {}); if (!n) return null;
    var suma = m.mods.reduce(function (s, x) { return s + (sel.qty[x.k] || 0) * x.c; }, 0), promo = false, combo = null;
    (m.combos || []).forEach(function (cb) { if (sameQ(cb.q, sel.qty)) combo = cb; });
    if (combo && combo.p != null && combo.p < suma) { suma = combo.p; promo = true; }
    if (sel.base === 'si' && m.base) suma += combo && combo.base != null ? combo.base : n * m.base.porMod;
    return { cost: suma, promo: promo, combo: combo };
  }
  function precios(cost) {
    if (cost == null) return null;
    var ef = redondeo(cost * CFG.multEfectivo);
    return { ef: ef, lista: redondeo(ef * CFG.recargoLista) };
  }
  function desde(m) {
    var min = null;
    if (m.tipo === 'ancho') m.v.forEach(function (v) { var c = costoV(v); if (c != null && (min == null || c < min)) min = c; });
    else {
      (m.combos || []).forEach(function (cb) { if (cb.p != null && (min == null || cb.p < min)) min = cb.p; });
      if (min == null) m.mods.forEach(function (x) { if (min == null || x.c < min) min = x.c; });
    }
    var p = precios(min); return p ? p.ef : null;
  }
  function tienePromo(m) {
    if (m.tipo === 'ancho') return m.v.some(promoV);
    return (m.combos || []).some(function (cb) { return cb.p != null; });
  }
  function curSel() { return { vk: S.vk, qty: S.qty, base: S.base }; }
  function descripcion(m, sel) {
    if (m.tipo === 'ancho') { var v = m.v.filter(function (x) { return x.k === sel.vk; })[0]; return v ? v.n : ''; }
    var partes = [];
    m.mods.forEach(function (x) { var q = sel.qty[x.k] || 0; if (q) partes.push(q + ' × ' + x.n.toLowerCase() + ' (' + x.d + ')'); });
    var t = partes.join(' + ');
    if (sel.base === 'si') t += ' · con base de madera';
    return t;
  }

  // ---------- Vista previa ----------
  function renderStage() {
    var m = S.model ? byId[S.model] : null, img = $('photo');
    var calcR = m ? calc(m, curSel()) : null;
    var key = m ? (calcR && calcR.combo && calcR.combo.img) || m.img : null;
    if (key) { img.src = modImg(key); img.alt = m.n; img.hidden = false; } else { img.removeAttribute('src'); img.alt = ''; img.hidden = true; }
    $('stageName').textContent = m ? m.n : 'Elegí un modelo';
    $('stageSub').textContent = m ? descripcion(m, curSel()) : '';
    var t = S.tela ? telaById[S.tela] : null, chip = $('telaChip');
    chip.hidden = !t;
    if (t) { $('telaSw').style.backgroundImage = 'url(' + telaImg(t) + ')'; $('telaTxt').textContent = LINEAS[t.l].n + ' · ' + t.n; }
  }

  // ---------- Paso 1: modelo ----------
  function renderCats() {
    var box = $('cats'); box.textContent = '';
    CATS.forEach(function (c) {
      var b = el('button', '', c.n); b.type = 'button'; b.setAttribute('role', 'tab');
      b.setAttribute('aria-pressed', S.cat === c.id ? 'true' : 'false');
      b.onclick = function () { S.cat = c.id; renderCats(); renderModels(); };
      box.appendChild(b);
    });
    $('catHint').textContent = catHint[S.cat] || '';
  }
  function renderModels() {
    var box = $('models'); box.textContent = '';
    MODELOS.filter(function (m) { return m.cat === S.cat; }).forEach(function (m) {
      var b = el('button', 'mdl'); b.type = 'button'; b.dataset.id = m.id;
      var im = el('div', 'im'), i = el('img'); i.loading = 'lazy'; i.alt = ''; i.src = modImg(m.img); im.appendChild(i); b.appendChild(im);
      b.appendChild(el('b', '', m.n));
      var d = desde(m), pr = el('span', 'pr');
      if (d != null) { pr.appendChild(document.createTextNode('desde ')); pr.appendChild(el('strong', '', money(d))); }
      b.appendChild(pr);
      if (tienePromo(m)) b.appendChild(el('span', 'tag promo', 'Precio promo'));
      b.setAttribute('aria-pressed', S.model === m.id ? 'true' : 'false');
      b.onclick = function () { elegirModelo(m.id); };
      box.appendChild(b);
    });
  }
  function elegirModelo(id) {
    var m = byId[id]; S.model = id; S.base = 'no'; S.vk = null; S.qty = {};
    if (m.tipo === 'ancho') {
      var pref = m.v.filter(function (v) { return v.k === '1.80'; })[0] || m.v.filter(function (v) { return v.k !== '1C' && costoV(v) != null; })[0] || m.v[0];
      S.vk = pref.k;
    } else {
      var q = m.def || (m.combos && m.combos[0] && m.combos[0].q) || {};
      Object.keys(q).forEach(function (k) { S.qty[k] = q[k]; });
    }
    document.querySelectorAll('.mdl').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.id === id ? 'true' : 'false'); });
    renderMedida(); renderStage(); renderBar(); renderDetalles();
    if (window.matchMedia('(max-width:860px)').matches) $('s2').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ---------- Paso 2: medida / módulos ----------
  function renderMedida() {
    var m = S.model ? byId[S.model] : null, body = $('s2body'); body.textContent = '';
    if (!m) { $('s2t').textContent = 'Elegí la medida'; $('s2hint').textContent = 'Primero elegí un modelo en el paso 1.'; return; }
    if (m.tipo === 'ancho') {
      $('s2t').textContent = m.v.length > 1 ? m.unidad || 'Elegí la medida' : 'Medida';
      $('s2hint').textContent = m.nota || (m.v.length > 1 ? 'El ancho es el largo total del frente.' : '');
      var grid = el('div', 'vars');
      m.v.forEach(function (v) {
        var b = el('button', 'var'); b.type = 'button'; b.dataset.k = v.k;
        var p = precios(costoV(v));
        b.appendChild(el('b', '', v.n));
        b.appendChild(el('span', '', p ? money(p.ef) : 'Consultar'));
        if (p == null) b.disabled = true;
        b.setAttribute('aria-pressed', S.vk === v.k ? 'true' : 'false');
        b.onclick = function () { S.vk = v.k; renderMedida(); renderStage(); renderBar(); };
        grid.appendChild(b);
      });
      body.appendChild(grid);
      var sel = m.v.filter(function (v) { return v.k === S.vk; })[0];
      if (sel && m.v.length === 1) { $('s2hint').textContent = m.nota || ''; }
    } else {
      $('s2t').textContent = 'Armá tu combinación';
      $('s2hint').textContent = m.nota || '';
      if (m.combos && m.combos.length > 1 || (m.combos && m.combos.length && m.id !== 'estocolmo')) {
        body.appendChild(el('div', 'preset-t', 'Combinaciones sugeridas'));
        var pr = el('div', 'presets');
        m.combos.forEach(function (cb) {
          var b = el('button'); b.type = 'button'; b.appendChild(document.createTextNode(cb.n)); b.appendChild(el('small', '', cb.d));
          b.setAttribute('aria-pressed', sameQ(cb.q, S.qty) ? 'true' : 'false');
          b.onclick = function () { S.qty = {}; Object.keys(cb.q).forEach(function (k) { S.qty[k] = cb.q[k]; }); renderMedida(); renderStage(); renderBar(); renderDetalles(); };
          pr.appendChild(b);
        });
        body.appendChild(pr);
        body.appendChild(el('div', 'preset-t', 'O armalo a tu gusto'));
      }
      m.mods.forEach(function (x) {
        var row = el('div', 'mod'), nm = el('div', 'nm');
        nm.appendChild(el('b', '', x.n)); nm.appendChild(el('span', '', x.d + ' cm · ' + money(precios(x.c).ef)));
        var q = el('div', 'qty'), mi = el('button', '', '−'), pl = el('button', '', '+'), val = el('b', '', String(S.qty[x.k] || 0));
        mi.type = pl.type = 'button'; mi.setAttribute('aria-label', 'Quitar ' + x.n); pl.setAttribute('aria-label', 'Agregar ' + x.n);
        mi.disabled = !(S.qty[x.k] > 0); pl.disabled = (S.qty[x.k] || 0) >= 8;
        mi.onclick = function () { S.qty[x.k] = Math.max(0, (S.qty[x.k] || 0) - 1); renderMedida(); renderStage(); renderBar(); renderDetalles(); };
        pl.onclick = function () { S.qty[x.k] = (S.qty[x.k] || 0) + 1; renderMedida(); renderStage(); renderBar(); renderDetalles(); };
        q.appendChild(mi); q.appendChild(val); q.appendChild(pl); row.appendChild(nm); row.appendChild(q); body.appendChild(row);
      });
      var n = totalMods(S.qty);
      if (n) body.appendChild(el('p', 'sumlist', 'Tu armado: ' + descripcion(m, { qty: S.qty, base: 'no' })));
      else body.appendChild(el('p', 'nota', 'Sumá al menos un módulo.'));
    }
  }

  // ---------- Paso 3: telas ----------
  function renderLineChips() {
    var box = $('lineChips'); box.textContent = '';
    var all = el('button', '', 'Todas las telas'); all.type = 'button'; all.setAttribute('aria-pressed', S.linea === '' ? 'true' : 'false');
    all.onclick = function () { S.linea = ''; renderLineChips(); renderTelas(); }; box.appendChild(all);
    LINEAS.forEach(function (l, i) {
      var b = el('button', '', l.n); b.type = 'button'; b.setAttribute('aria-pressed', S.linea === String(i) ? 'true' : 'false');
      b.onclick = function () { S.linea = S.linea === String(i) ? '' : String(i); renderLineChips(); renderTelas(); };
      box.appendChild(b);
    });
  }
  function renderChips() {
    var box = $('colorChips'); box.textContent = '';
    var have = {}; TELAS.forEach(function (t) { if (S.linea === '' || String(t.l) === S.linea) have[t.fam] = 1; });
    var all = el('button', '', 'Todos los colores'); all.type = 'button'; all.setAttribute('aria-pressed', S.fam === '' ? 'true' : 'false');
    all.onclick = function () { S.fam = ''; renderChips(); renderTelas(); }; box.appendChild(all);
    FAM.forEach(function (f) {
      if (!have[f.id]) return;
      var b = el('button'); b.type = 'button'; var i = el('i'); i.style.background = f.c; b.appendChild(i); b.appendChild(document.createTextNode(f.n));
      b.setAttribute('aria-pressed', S.fam === f.id ? 'true' : 'false');
      b.onclick = function () { S.fam = S.fam === f.id ? '' : f.id; renderChips(); renderTelas(); };
      box.appendChild(b);
    });
  }
  function renderTelas() {
    var box = $('telas'); box.textContent = '';
    var q = norm(S.q).trim(), any = false;
    LINEAS.forEach(function (l, li) {
      if (S.linea !== '' && String(li) !== S.linea) return;
      var items = TELAS.filter(function (t) { return t.l === li && (!S.fam || t.fam === S.fam) && (!q || t.hay.indexOf(q) >= 0); });
      if (!items.length) return;
      any = true;
      var g = el('div', 'grp'), hd = el('div', 'grp-h'), tt = el('div');
      tt.appendChild(el('h3', '', l.n)); hd.appendChild(tt); hd.appendChild(el('span', '', items.length + (items.length === 1 ? ' color' : ' colores')));
      g.appendChild(hd);
      var grid = el('div', 'sw-grid');
      items.forEach(function (t) {
        var b = el('button', 'sw'); b.type = 'button'; b.dataset.id = t.id;
        var im = el('div', 'im'), i = el('img'); i.loading = 'lazy'; i.alt = ''; i.width = 96; i.height = 96; i.src = telaImg(t); im.appendChild(i); b.appendChild(im);
        b.appendChild(el('span', 'nm', t.n));
        b.setAttribute('aria-pressed', S.tela === t.id ? 'true' : 'false');
        b.onclick = function () { elegirTela(t.id); };
        grid.appendChild(b);
      });
      g.appendChild(grid); box.appendChild(g);
    });
    if (!any) box.appendChild(el('div', 'empty', 'No encontramos telas con ese filtro. Probá con otro color o borrá la búsqueda.'));
  }
  function elegirTela(id) {
    S.tela = id;
    document.querySelectorAll('.sw').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.id === id ? 'true' : 'false'); });
    renderStage(); renderBar();
  }

  // ---------- Paso 4: detalles ----------
  function renderDetalles() {
    var m = S.model ? byId[S.model] : null;
    $('optBase').hidden = !(m && m.base);
    if (m && m.base) {
      var r = calc(m, { qty: S.qty, base: 'si' }), r0 = calc(m, { qty: S.qty, base: 'no' });
      $('plusBase').textContent = r && r0 ? '+ ' + money(redondeo(r.cost * CFG.multEfectivo) - redondeo(r0.cost * CFG.multEfectivo)) : '';
      document.querySelectorAll('.seg[data-opt="base"] button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === S.base ? 'true' : 'false'); });
    }
    $('qVal').textContent = S.n; $('qMinus').disabled = S.n <= 1; $('qPlus').disabled = S.n >= 20;
  }

  // ---------- Barra de precio ----------
  function renderBar() {
    var m = S.model ? byId[S.model] : null, box = $('pbPrices'); box.textContent = '';
    var t = S.tela ? telaById[S.tela] : null;
    var r = m ? calc(m, curSel()) : null, p = r ? precios(r.cost) : null;
    var desc = m ? m.n + (descripcion(m, curSel()) ? ' · ' + descripcion(m, curSel()) : '') : 'Elegí un modelo';
    $('pbTela').textContent = desc;
    if (!p) { box.appendChild(el('span', 'na', m ? 'Elegí la medida' : 'Elegí un modelo para ver el precio')); $('addBtn').disabled = true; return; }
    var a = el('div', 'ef'); a.appendChild(el('small', '', 'Efectivo (estimado)' + (S.n > 1 ? ' × ' + S.n : ''))); a.appendChild(el('b', '', money(p.ef * S.n)));
    var b = el('div'); b.appendChild(el('small', '', 'Lista (cuotas, estimado)' + (S.n > 1 ? ' × ' + S.n : ''))); b.appendChild(el('b', '', money(p.lista * S.n)));
    box.appendChild(a); box.appendChild(b);
    $('addBtn').disabled = !t;
    $('addBtn').title = t ? '' : 'Elegí una tela para agregar';
    if (!t) $('pbTela').textContent = desc + ' · falta elegir la tela';
  }

  // ---------- Presupuesto ----------
  function guardarLista() { store.set(KEY, LIST); $('listCount').textContent = LIST.length; }
  function agregar() {
    var m = S.model ? byId[S.model] : null, t = S.tela ? telaById[S.tela] : null; if (!m || !t) return;
    var r = calc(m, curSel()), p = r ? precios(r.cost) : null; if (!p) return;
    LIST.push({ model: m.id, vk: S.vk, qty: JSON.parse(JSON.stringify(S.qty)), base: S.base, tela: t.id, nombre: S.nombre.trim(), n: S.n, ef: p.ef, lista: p.lista });
    guardarLista(); abrirPanel();
  }
  function recalc(it) {
    var m = byId[it.model]; if (!m) return false;
    var r = calc(m, { vk: it.vk, qty: it.qty, base: it.base }), p = r ? precios(r.cost) : null;
    if (!p) return false; it.ef = p.ef; it.lista = p.lista; return true;
  }
  function renderPanel() {
    var box = $('items'); box.textContent = ''; var tEf = 0, tLi = 0;
    LIST = LIST.filter(function (it) { return byId[it.model] && telaById[it.tela] && recalc(it); });
    if (!LIST.length) box.appendChild(el('p', 'hint', 'Todavía no agregaste nada. Armá tu primer mueble y sumalo acá; podés presupuestar todo lo que necesites.'));
    LIST.forEach(function (it, i) {
      var m = byId[it.model], t = telaById[it.tela], n = it.n || 1;
      tEf += it.ef * n; tLi += it.lista * n;
      var d = el('div', 'it'), im = el('div', 'im'), g = el('img'); g.alt = ''; g.src = modImg(m.img); g.style.objectFit = 'contain'; im.appendChild(g);
      var mm = el('div'); mm.appendChild(el('h4', '', (n > 1 ? n + ' × ' : '') + m.n + (it.nombre ? ' · ' + it.nombre : '')));
      mm.appendChild(el('p', '', descripcion(m, it)));
      mm.appendChild(el('p', '', 'Tela: ' + LINEAS[t.l].n + ' · ' + t.n));
      var rm = el('button', 'rm', 'Quitar'); rm.type = 'button'; rm.onclick = function () { LIST.splice(i, 1); guardarLista(); renderPanel(); }; mm.appendChild(rm);
      var pr = el('div', 'pr'); pr.appendChild(el('b', '', money(it.ef * n))); pr.appendChild(document.createTextNode('efectivo')); pr.appendChild(el('div', '', money(it.lista * n) + ' lista'));
      d.appendChild(im); d.appendChild(mm); d.appendChild(pr); box.appendChild(d);
    });
    var tot = $('totals'); tot.textContent = ''; tot.hidden = !LIST.length;
    var r1 = el('div', 'ef'); r1.appendChild(el('small', '', 'Total efectivo / transferencia')); r1.appendChild(el('b', '', money(tEf)));
    var r2 = el('div'); r2.appendChild(el('small', '', 'Total precio de lista (cuotas)')); r2.appendChild(el('b', '', money(tLi)));
    tot.appendChild(r1); tot.appendChild(r2);
    $('waBtn').disabled = !LIST.length; $('clearBtn').hidden = !LIST.length;
    guardarLista();
  }
  function abrirPanel() { renderPanel(); $('panel').hidden = false; document.body.style.overflow = 'hidden'; $('closePanel').focus(); }
  function cerrarPanel() { $('panel').hidden = true; document.body.style.overflow = ''; }
  function mensaje() {
    var t = '¡Hola Dilan Home! Quiero consultar por estos muebles:\n', tEf = 0, tLi = 0;
    LIST.forEach(function (it, i) {
      var m = byId[it.model], tela = telaById[it.tela], n = it.n || 1; if (!m || !tela) return; tEf += it.ef * n; tLi += it.lista * n;
      t += '\n' + (i + 1) + ') ' + (n > 1 ? n + ' × ' : '') + m.n + (it.nombre ? ' — ' + it.nombre : '') + '\n   ' + descripcion(m, it) + '\n   Tela: ' + LINEAS[tela.l].n + ' · ' + tela.n +
        '\n   Efectivo: ' + money(it.ef * n) + ' · Lista: ' + money(it.lista * n) + '\n';
    });
    t += '\nTotal efectivo/transferencia: ' + money(tEf) + '\nTotal precio de lista (cuotas): ' + money(tLi);
    var nm = $('cliente').value.trim(); if (nm) t += '\n\nMi nombre: ' + nm;
    t += '\n\n(Precios estimativos/aproximados armados en el cotizador online; el presupuesto definitivo puede diferir.)';
    return t;
  }

  // ---------- Eventos ----------
  function init() {
    $('listCount').textContent = LIST.length;
    renderCats(); renderModels(); renderMedida(); renderLineChips(); renderChips(); renderTelas(); renderStage(); renderBar(); renderDetalles();
    var tq; $('q').addEventListener('input', function () { clearTimeout(tq); tq = setTimeout(function () { S.q = $('q').value; renderTelas(); }, 150); });
    $('nombre').addEventListener('input', function () { S.nombre = this.value; });
    document.querySelectorAll('.seg[data-opt="base"] button').forEach(function (b) {
      b.onclick = function () { S.base = b.dataset.v; renderDetalles(); renderStage(); renderBar(); };
    });
    $('qMinus').onclick = function () { S.n = Math.max(1, S.n - 1); renderDetalles(); renderBar(); };
    $('qPlus').onclick = function () { S.n = Math.min(20, S.n + 1); renderDetalles(); renderBar(); };
    $('addBtn').onclick = agregar;
    $('openList').onclick = abrirPanel; $('closePanel').onclick = cerrarPanel;
    $('panel').addEventListener('click', function (e) { if (e.target === $('panel')) cerrarPanel(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('panel').hidden) cerrarPanel(); });
    $('clearBtn').onclick = function () { LIST = []; renderPanel(); };
    $('waBtn').onclick = function () { window.open('https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(mensaje()), '_blank', 'noopener'); };
  }
  init();
})();
