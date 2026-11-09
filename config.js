// Configuración del cotizador de sofás. Se edita a mano.
window.APP_CONFIG = {
  tienda: 'Dilan Home',
  tiendaUrl: 'https://www.dilan.com.ar/',
  // WhatsApp que recibe las consultas: código de país + número, sin + ni espacios
  whatsapp: '5493751604665',

  // ---- Fórmula de precios del proveedor (hoja "FORMULA DE PRECIOS POR PROVEEDOR") ----
  // Precio efectivo = costo de lista (sin IVA) x IVA/IIBB x flete x rentabilidad
  ivaIIBB: 1.105,
  flete: 1.06,
  rentabilidad: 1.6,
  // Precio de lista (cuotas con tarjeta) = precio efectivo x este recargo
  recargoLista: 1.15,
  // Los precios al cliente se redondean a este múltiplo (pesos)
  redondeo: 1000,

  // Medida 2,20 m: la lista no tiene columna propia, se calcula con el adicional por fuera de medida (20 cm = 10%)
  extra220: 0.10,

  // Promos por cantidad ("6 x $3.600.000", "12 x ...", "18 x ..."): 'minimo' cotiza el precio más bajo
  // de todos los tramos (lo pedido); 'primero' cotiza el del primer tramo (el de la menor cantidad).
  promoTramo: 'minimo',

  // Dólar de referencia de la lista de precios y dólar de hoy (solo informativo).
  // Si el dólar varía más de 10% respecto de la lista, hay que pedir lista nueva y actualizar data/catalogo.js.
  dolarLista: 1500,
  dolarHoy: 1550
};
window.APP_CONFIG.multEfectivo = window.APP_CONFIG.ivaIIBB * window.APP_CONFIG.flete * window.APP_CONFIG.rentabilidad;
