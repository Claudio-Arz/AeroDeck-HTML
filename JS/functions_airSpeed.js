
// AirSpeed.js - Lógica específica para el instrumento AirSpeed
// Autor: Claudio Arzamendia Systems
// Fecha: 2026-01-31

const AirSpeed = (function() {
  // Referencias a elementos
  let imgs = {};
  let sliders = {};

  function getEl(id) {
    return document.getElementById(id);
  }

  // Actualiza la aguja según el valor del slider (0-200) o un valor recibido
  function updateAirspeed(airspeed) {
    if (imgs.aguja && (sliders.valor || typeof airspeed === 'number')) {
      const val = (typeof airspeed === 'number') ? airspeed : parseFloat(sliders.valor.value);
      // Mapea 0-200 nudos a 225° a -45° (giro antihorario)
      let angle = 225 - (Math.max(0, Math.min(val, 200)) * 270) / 200;
      imgs.aguja.style.transform = `rotate(${angle}deg)`;
      // Actualiza valor numérico si existe
      const valueEl = getEl('as-value');
      if (valueEl) valueEl.textContent = Math.round(val);
      // Si hay slider y el valor viene de parámetro, sincroniza el slider
      if (typeof airspeed === 'number' && sliders.valor) {
        sliders.valor.value = val;
      }
    }
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
        sliders[key].addEventListener('input', updateAirspeed);
      }
    }
    // Inicializar valores
    updateAirspeed();
  }

  // API pública
  // También exponer la función global para WebSocket
  window.updateAirspeed = updateAirspeed;
  return {
    init,
    update: updateAirspeed
  };
})();

// Inicialización ejemplo (ajusta los IDs según tu HTML)
// AirSpeed.init({
//   imgIds: { fondo: 'AirSpeed_fondo', aguja: 'AirSpeed_aguja' },
//   sliderIds: { valor: 'airspeed-slider' }
// });
