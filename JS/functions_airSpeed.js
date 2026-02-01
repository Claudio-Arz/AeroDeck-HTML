  // Bandera para ignorar actualizaciones remotas mientras el usuario interactúa

// AirSpeed.js - Lógica específica para el instrumento AirSpeed
// Autor: Claudio Arzamendia Systems
// Fecha: 2026-01-31

const AirSpeed = (function() {
    // Bandera para ignorar actualizaciones remotas mientras el usuario interactúa
    let isUserSliding = false;
 
  // Referencias a elementos
  let imgs = {};
  let sliders = {};

  function getEl(id) {
    return document.getElementById(id);
  }

  // Actualiza la aguja según el valor del slider (0-200) o un valor recibido
  function updateAirspeed(airspeed) {
    if (imgs.aguja && sliders.valor ) {
      // El slider y el valor pueden ir de 0 a 200 (según tu HTML)
      const min = 40;
      const max = 200;
      const val = (typeof airspeed === 'number') ? airspeed : parseFloat(sliders.valor.value);
      // Limitar el valor al rango real
      const safeVal = Math.max(min, Math.min(val, max));
      // Mapea 0-200 nudos a 36° (mínimo) a 324° (máximo) (giro horario)
      let angle =  ((safeVal - min) * (324 - 36) ) / (max - min) + 36; // Ajuste afinado.
      imgs.aguja.style.transform = `rotate(${angle}deg)`;
      // Actualiza valor numérico en el instrumento principal
      const valueEl = getEl('as-value');
      if (valueEl) valueEl.textContent = Math.round(safeVal);
      // Actualiza valor numérico junto al slider de control
      const sliderLabel = getEl('as-slider-value-label');
      if (sliderLabel) sliderLabel.textContent = Math.round(safeVal);
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
        isUserSliding = true;
        updateAirspeed();
        // Transmitir en tiempo real mientras se mueve el slider
        if (typeof ws !== 'undefined' && ws && ws.readyState === 1) {
          ws.send(JSON.stringify({ airspeed: parseFloat(e.target.value) }));
        }
      });
      sliders.valor.addEventListener('change', function(e) {
        isUserSliding = false;
        // (Opcional) También puedes transmitir aquí, pero ya se transmite en 'input'
      });
    }
    // Inicializar valores
    updateAirspeed();
  }

  // API pública
  // También exponer la función global para WebSocket
  window.updateAirspeed = function(airspeed) {
    if (!isUserSliding) updateAirspeed(airspeed);
  };
  return {
    init,
    update: updateAirspeed
  };
})();

// Inicialización ejemplo (ajusta los IDs según tu HTML)
// AirSpeed.init({
//   imgIds: { fondo: 'AirSpeed_fondo', aguja: 'AirSpeed_aguja' },
//   sliderIds: { valor: 'as-slider-value' }
// });
