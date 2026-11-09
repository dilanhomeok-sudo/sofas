# Sofás y sillones a medida · Dilan Home

Cotizador online para clientes finales: eligen el modelo, la medida (o los módulos) y la tela, y ven al instante el precio estimado en efectivo y de lista (cuotas con tarjeta). El pedido llega por WhatsApp.

- Sitio estático (HTML + CSS + JS), sin servidor. Misma estética que el cotizador de cortinas.
- En la web **no se nombra al proveedor ni su marca**.

## Cómo se calcula el precio

`efectivo = costo de lista (sin IVA) × 1,105 (IVA/IIBB) × 1,06 (flete) × 1,6 (rentabilidad)` → redondeado a $1.000
`lista (cuotas) = efectivo × 1,15` → redondeado a $1.000

Son los valores de la hoja «FORMULA DE PRECIOS POR PROVEEDOR». Están en `config.js`.

- La **tela no cambia el precio**.
- Si un modelo tiene **promo**, se cotiza el precio **más bajo**. En promos por cantidad (6 / 12 / 18 unidades) se usa el tramo más barato; `promoTramo: 'primero'` en `config.js` cotiza el primer tramo.
- La medida **2,20 m** no tiene columna en la lista: se calcula como la de 2,00 m + 10% (adicional por fuera de medida).
- Los módulos (Suncity, Oslo, Estocolmo) suman módulo por módulo; si la combinación coincide con una combinación promo, se usa el precio promo.

## Archivos

| Archivo | Qué es |
| --- | --- |
| `index.html`, `style.css`, `app.js` | La web |
| `config.js` | Fórmula, recargo de lista, redondeo, WhatsApp, dólar de referencia |
| `data/catalogo.js` | Modelos, medidas y **costos de la lista del proveedor** (abril 2026, USD 1 = $1.500) |
| `data/telas.js` | Telas disponibles (12 líneas, 148 colores) |
| `img/m/` | Fotos de los modelos |
| `img/t/` | Muestras de telas |

## Cuándo actualizar

La lista está hecha con dólar a $1.500. Hoy ronda $1.550 (+3%). **Si el dólar varía más de 10%**, el proveedor manda una lista nueva: reemplazar los costos en `data/catalogo.js` y `dolarLista` en `config.js`.

## Probar en la PC

```bash
python -m http.server 8000
```

y abrir http://localhost:8000
