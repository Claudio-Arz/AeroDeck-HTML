// Template para librerías JS de instrumentos
// Autor: Claudio Arzamendia Systems
// Fecha: [YYYY-MM-DD]
// Descripción: Estructura base para nuevas librerías de instrumentos análogos.

/**
 * Inicializa el instrumento y enlaza los controles.
 * @param {Object} config - Configuración de ids y opciones.
 * @example
 *   Instrumento.init({
 *     imgIds: { fondo: 'Instrumento_fondo', aguja: 'Instrumento_aguja' },
 *     sliderIds: { valor: 'slider-valor' }
 *   });
 */
const Instrumento = (function() {
  // Referencias a elementos
  let imgs = {};
  let sliders = {};

  function getEl(id) {
    return document.getElementById(id);
  }

  function updateInstrumento() {
    // Ejemplo: actualizar rotación de aguja
    if (imgs.aguja && sliders.valor) {
      const val = parseFloat(sliders.valor.value);
      imgs.aguja.style.transform = `rotate(${val}deg)`;
    }
    // Agrega aquí más lógica según el instrumento
  }

  function init(config) {
    // Cargar referencias a imágenes
    imgs = {};
    for (const key in config.imgIds) {
      imgs[key] = getEl(config.imgIds[key]);
    }
    // Cargar referencias a sliders
    sliders = {};
    for (const key in config.sliderIds) {
      sliders[key] = getEl(config.sliderIds[key]);
      if (sliders[key]) {
        sliders[key].addEventListener('input', updateInstrumento);
      }
    }
    // Inicializar valores
    updateInstrumento();
  }

  // API pública
  return {
    init
  };
})();

// Ejemplo de uso:
// Instrumento.init({
//   imgIds: { fondo: 'Instrumento_fondo', aguja: 'Instrumento_aguja' },
//   sliderIds: { valor: 'slider-valor' }
// });
