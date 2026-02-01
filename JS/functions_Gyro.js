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
      // El slider y el valor pueden ir de 0 a 360 
      const min = 0;
      const max = 360;
      const val = (typeof gyro === 'number') ? gyro : parseFloat(sliders.valor.value);
      // Limitar el valor al rango real
      const safeVal = Math.max(min, Math.min(val, max));
      // Mapea 0-360 grados a 0° (mínimo) a 360° (máximo) (giro horario)
      let angle =  safeVal; // Ajuste afinado.
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
    sliders = {};
    sliders.valor = getEl(config.sliderIds.valor);

    // Botones de control para ángulos fijos
    const btn0 = getEl('gyr-btn-0');
    const btn90 = getEl('gyr-btn-90');
    const btn180 = getEl('gyr-btn-180');
    const btn270 = getEl('gyr-btn-270');
    if (btn0 && sliders.valor) {
      btn0.addEventListener('click', () => {
        sliders.valor.value = 0;
        sliders.valor.dispatchEvent(new Event('input'));
      });
    }
    if (btn90 && sliders.valor) {
      btn90.addEventListener('click', () => {
        sliders.valor.value = 90;
        sliders.valor.dispatchEvent(new Event('input'));
      });
    }
    if (btn180 && sliders.valor) {
      btn180.addEventListener('click', () => {
        sliders.valor.value = 180;
        sliders.valor.dispatchEvent(new Event('input'));
      });
    }
    if (btn270 && sliders.valor) {
      btn270.addEventListener('click', () => {
        sliders.valor.value = 270;
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


// Inicialización para Gyro
window.addEventListener('DOMContentLoaded', function() {
  Gyro.init({
    imgIds: { aguja: 'gyr-dial' },
    sliderIds: { valor: 'gyr-slider' }
  });
});
