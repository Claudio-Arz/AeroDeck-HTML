
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
    if (imgs.aguja && sliders.valor ) {
      // El slider y el valor pueden ir de 40 a 200 (según tu HTML)
      const min = 40;
      const max = 200;
      const val = (typeof airspeed === 'number') ? airspeed : parseFloat(sliders.valor.value);
      // Limitar el valor al rango real
      const safeVal = Math.max(min, Math.min(val, max));
      // Mapea 40-200 nudos a 225° a -45° (giro antihorario)
      let angle = 225 + ((safeVal - min) * 270) / (max - min);
      imgs.aguja.style.transform = `rotate(${angle}deg)`;
      // Actualiza valor numérico si existe
      const valueEl = getEl('as-value');
      if (valueEl) valueEl.textContent = Math.round(safeVal);
      // Solo sincronizar el slider si el cambio viene de WebSocket (no de interacción del usuario)
      if (typeof airspeed === 'number' && sliders.valor && document.activeElement !== sliders.valor) {
        sliders.valor.value = safeVal;
      }
    }
  }

  function init(config) {
    // Cargar referencias a imágenes
    imgs = {};
    imgs.aguja = getEl(config.imgIds.aguja);
    // Slider único
    sliders = {};
    sliders.valor = getEl(config.sliderIds.valor);
    if (sliders.valor) {
      sliders.valor.addEventListener('input', function(e) {
        updateAirspeed();
      });
      sliders.valor.addEventListener('change', function(e) {
        if (typeof ws !== 'undefined' && ws && ws.readyState === 1) {
          ws.send(JSON.stringify({ airspeed: parseFloat(e.target.value) }));
        }
      });
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
