/* 
  Sistema de Instrumentos para AeroDeck - Versión 0.03
  Autor: Claudio Arzamendia Systems
  Fecha: 2026-02-18 02:10:23

  Librería functions_OilPress.js - Funciones para el instrumento de presión de aceite (Oil Press).
    Funciones principales:

    - updateOilPress(oilPress, noice): Actualiza la aguja y los valores numéricos del instrumento según el valor de presión de aceite recibido o el slider. El parámetro "noice" indica si el modo "noice" está activo, lo que puede afectar la apariencia del instrumento.
    - initOilPressControls(): Inicializa las referencias a los elementos del DOM y configura los event listeners para los controles interactivos del Oil Press, como el slider y los botones de valores predefinidos.

  El instrumento de presión de aceite muestra la cantidad de presión que el motor 
  está generando en tiempo real. El valor se representa en libras por pulgada cuadrada (PSI) y se 
  muestra en una escala que va de 0 a 1000 PSI. El instrumento tiene una aguja que se mueve 
  para indicar la presión actual, y un valor numérico que muestra la cantidad exacta de 
  presión generada. El control de presión de aceite se puede ajustar mediante 
  un slider o botones predefinidos para valores comunes de presión. Al cambiar el valor, 
  se anima la aguja del instrumento y se envía el nuevo valor al ESP32 para que lo refleje 
  en el instrumento físico y en todas las terminales conectadas.


*/

function initOilPressControls() {
  // Event listener para el slider
  const slider = document.getElementById('op-slider');
  const simToggle = document.getElementById('op-sim-toggle');

  function isOilPressSimOn() {
    return window.oilPressSimModeState === true;
  }

  function updateOilPressSimUI(isOn) {
    window.oilPressSimModeState = isOn === true;
    const lock = window.oilPressSimModeState;

    if (simToggle) {
      if (lock) {
        simToggle.classList.add('active');
        simToggle.textContent = 'SIM ON';
      } else {
        simToggle.classList.remove('active');
        simToggle.textContent = 'SIM';
      }
    }

    const btnMax = document.getElementById('op-slider-max');
    const btnMid = document.getElementById('op-slider-mid');
    const btnMin = document.getElementById('op-slider-min');
    const btnPlus = document.getElementById('op-btn-plus');
    const btnMinus = document.getElementById('op-btn-minus');

    if (slider) slider.disabled = lock;
    if (btnMax) btnMax.disabled = lock;
    if (btnMid) btnMid.disabled = lock;
    if (btnMin) btnMin.disabled = lock;
    if (btnPlus) btnPlus.disabled = lock;
    if (btnMinus) btnMinus.disabled = lock;
  }

  if (slider) {
    slider.addEventListener('input', () => {
      if (isOilPressSimOn()) return;
      updateOilPress(parseFloat(slider.value), true); // true = desde el slider, enviar al ESP32
    });
  } else {
    console.warn('No se encontró el slider de Oil Press en el DOM.');
  }
  
  // Event listeners para los botones de valores predefinidos
  const btnMax = document.getElementById('op-slider-max');
  const btnMid = document.getElementById('op-slider-mid');
  const btnMin = document.getElementById('op-slider-min');
  const btnPlus = document.getElementById('op-btn-plus');
  const btnMinus = document.getElementById('op-btn-minus');
  
  if (btnMax) {
    btnMax.addEventListener('click', () => {
      if (isOilPressSimOn()) return;
      updateOilPress(120, true); // Máximo: 120 PSI
    });
  }
  if (btnMid) {
    btnMid.addEventListener('click', () => {
      if (isOilPressSimOn()) return;
      updateOilPress(60, true); // Medio: 60 PSI
    });
  }
  if (btnMin) {
    btnMin.addEventListener('click', () => {
      if (isOilPressSimOn()) return;
      updateOilPress(0, true); // Mínimo: 0 PSI
    });
  }
  if (btnPlus) {
    btnPlus.addEventListener('click', () => {
      if (isOilPressSimOn()) return;
      const slider = document.getElementById('op-slider');
      if (slider) {
        const newValue = Math.min(120, parseFloat(slider.value) + 1); // +1 PSI
        updateOilPress(newValue, true);
      }
    });
  }
  if (btnMinus) {
    btnMinus.addEventListener('click', () => {
      if (isOilPressSimOn()) return;
      const slider = document.getElementById('op-slider');
      if (slider) {
        const newValue = Math.max(0, parseFloat(slider.value) - 1); // -1 PSI
        updateOilPress(newValue, true);
      }
    });
  }

  if (simToggle) {
    simToggle.addEventListener('click', () => {
      const newState = !isOilPressSimOn();
      updateOilPressSimUI(newState);
      sendOilPressSimModeToESP32(newState);
    });
  }

  updateOilPressSimUI(window.oilPressSimModeState === true);
}

function updateOilPress(oilPress, sendToESP = false) {
  const slider = document.getElementById('op-slider');
  const valueLabel = document.getElementById('op-value');
  const sliderLabel = document.getElementById('op-slider-value-label');
  const needle = document.getElementById('op_needle');
  if (!needle) {
    console.warn('No se encontró la aguja de Oil Press en el DOM.');
    return;
  }
  // Si se llama sin argumento, usar el valor del slider
  if (oilPress === undefined && slider) {
    oilPress = parseFloat(slider.value);
    sendToESP = true;
  }
  // Actualizar valor en el centro del instrumento
  if (valueLabel) {
    valueLabel.textContent = oilPress.toFixed(1);
  }
  // Sincronizar el slider SOLO si la actualización NO viene del usuario (sendToESP = false)
  if (!sendToESP && slider) {
    slider.value = oilPress;
  }
  // Actualizar etiqueta del slider
  if (sliderLabel) {
    sliderLabel.textContent = oilPress.toFixed(1);
  }
  // Calcular el ángulo de la aguja utilizando la función oilPressToAngle
  const angle = oilPressToAngle(oilPress);
  needle.style.transform = `rotate(${angle}deg)`;
  // Enviar el valor de Oil Press al ESP32 solo si se indica
  if (sendToESP) {
    sendOilPressToESP32(oilPress);
  }
}

function sendOilPressToESP32(oilPress) {
  // Enviar el valor de Oil Press al ESP32 vía WebSocket
  if (window.ws && window.ws.readyState === WebSocket.OPEN) {
    const data = JSON.stringify({ oilPress: oilPress });
    window.ws.send(data);
    console.log(`Enviando Oil Press al ESP32: ${oilPress} PSI`);
  } else {
    console.warn('WebSocket no está conectado.');
  }
}

function sendOilPressSimModeToESP32(simulated) {
  if (window.ws && window.ws.readyState === WebSocket.OPEN) {
    const data = JSON.stringify({ useSimulatedOilPress: simulated });
    window.ws.send(data);
  }
}

function updateOilPressSimModeState(simulated, sendToESP = false) {
  const simToggle = document.getElementById('op-sim-toggle');
  const slider = document.getElementById('op-slider');
  const btnMax = document.getElementById('op-slider-max');
  const btnMid = document.getElementById('op-slider-mid');
  const btnMin = document.getElementById('op-slider-min');
  const btnPlus = document.getElementById('op-btn-plus');
  const btnMinus = document.getElementById('op-btn-minus');
  if (!simToggle) {
    return;
  }

  const isSimulated = !!simulated;
  window.oilPressSimModeState = isSimulated;
  simToggle.classList.toggle('active', isSimulated);
  simToggle.textContent = isSimulated ? 'SIM ON' : 'SIM';
  simToggle.title = isSimulated ? 'Oil Press Simulado activo' : 'Oil Press Manual activo';

  if (slider) slider.disabled = isSimulated;
  if (btnMax) btnMax.disabled = isSimulated;
  if (btnMid) btnMid.disabled = isSimulated;
  if (btnMin) btnMin.disabled = isSimulated;
  if (btnPlus) btnPlus.disabled = isSimulated;
  if (btnMinus) btnMinus.disabled = isSimulated;

  if (sendToESP) {
    sendOilPressSimModeToESP32(isSimulated);
  }
}
// Mapea el valor de Oil Press (0-120) al ángulo de la aguja (270-90)
function oilPressToAngle(oilPress) {
  const minValue = 0;
  const maxValue = 120;
  const minAngle = 270; // Ángulo mínimo para 0 PSI
  const maxAngle = 90; // Ángulo máximo para 120 PSI
  if (oilPress < minValue) oilPress = minValue;
  if (oilPress > maxValue) oilPress = maxValue;
  return minAngle + ((oilPress - minValue) * (minAngle - maxAngle)) / (maxValue - minValue);
}

// Alterna la visibilidad del cristal roto en el instrumento Oil Press
function toggleOilPressBrokenCrystal() {
  const crystal = document.getElementById('op_broken_crystal03');
  if (crystal) {
    crystal.classList.toggle('visible');
  }
}   