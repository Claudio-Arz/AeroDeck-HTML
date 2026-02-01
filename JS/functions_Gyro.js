// Bandera para ignorar actualizaciones remotas mientras el usuario interactúa

// functions_Gyro.js - Lógica específica para el instrumento Gyro
// Autor: Claudio Arzamendia Systems
// Fecha: 2026-02-01 15:13:47

const Gyro = (function() {
    // Bandera para ignorar actualizaciones remotas mientras el usuario interactúa
    let isUserSliding = false;
 
  // Referencias a elementos
  let imgs = {};
  let sliders = {};

  function getEl(id) {
    return document.getElementById(id);
  }

  // Actualiza la aguja según el valor del slider (0-200) o un valor recibido
  function updateGyro(gyro) {
    if (imgs.aguja && sliders.valor ) {
      // El slider y el valor pueden ir de 0 a 200 (según tu HTML)
      const min = 40;
      const max = 200;
      const val = (typeof gyro === 'number') ? gyro : parseFloat(sliders.valor.value);
      // Limitar el valor al rango real
      const safeVal = Math.max(min, Math.min(val, max));
      // Mapea 0-200 nudos a 36° (mínimo) a 324° (máximo) (giro horario)
      let angle =  ((safeVal - min) * (324 - 36) ) / (max - min) + 36; // Ajuste afinado.
      imgs.aguja.style.transform = `rotate(${angle}deg)`;
      // Actualiza valor numérico en el instrumento principal
      const valueEl = getEl('gyr-value');
      if (valueEl) valueEl.textContent = Math.round(safeVal);
      // Actualiza valor numérico junto al slider de control
      const sliderLabel = getEl('gyr-slider-value-label');
      if (sliderLabel) sliderLabel.textContent = Math.round(safeVal);
      // Solo sincronizar el slider si el cambio viene de WebSocket (no de interacción del usuario)
      if (typeof gyro === 'number' && sliders.valor && document.activeElement !== sliders.valor) {
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

    // Botones de control para el slider
    const btnMin = getEl('gyr-slider-min');
    const btnMid = getEl('gyr-slider-mid');
    const btnMax = getEl('gyr-slider-max');
    if (btnMin && sliders.valor) {
      btnMin.addEventListener('click', () => {
        sliders.valor.value = sliders.valor.min;
        sliders.valor.dispatchEvent(new Event('input'));
      });
    }
    if (btnMid && sliders.valor) {
      btnMid.addEventListener('click', () => {
        const min = Number(sliders.valor.min);
        const max = Number(sliders.valor.max);
        sliders.valor.value = Math.round((min + max) / 2);
        sliders.valor.dispatchEvent(new Event('input'));
      });
    }
    if (btnMax && sliders.valor) {
      btnMax.addEventListener('click', () => {
        sliders.valor.value = sliders.valor.max;
        sliders.valor.dispatchEvent(new Event('input'));
      });
    }
    if (sliders.valor) {
      sliders.valor.addEventListener('input', function(e) {
        isUserSliding = true;
        updateGyro();
        // Transmitir en tiempo real mientras se mueve el slider
        if (typeof ws !== 'undefined' && ws && ws.readyState === 1) {
          ws.send(JSON.stringify({ gyro: parseFloat(e.target.value) }));
        }
      });
      sliders.valor.addEventListener('change', function(e) {
        isUserSliding = false;
        // (Opcional) También puedes transmitir aquí, pero ya se transmite en 'input'
      });
    }
    // Inicializar valores
    updateGyro();
  }

  // API pública
  // También exponer la función global para WebSocket
  window.updateGyro = function(gyro) {
    if (!isUserSliding) updateGyro(gyro);
  };
  return {
    init,
    update: updateGyro
  };
})();

// Inicialización ejemplo (ajusta los IDs según tu HTML)
// AirSpeed.init({
//   imgIds: { fondo: 'AirSpeed_fondo', aguja: 'AirSpeed_aguja' },
//   sliderIds: { valor: 'as-slider-value' }
// });
