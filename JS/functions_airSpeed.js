/* 
  Sistema de Instrumentos para AeroDeck - Versión 0.03
  Autor: Claudio Arzamendia Systems
  Fecha: 2026-02-15 19:53:12

  Este módulo functions_airSpeed.js contiene la lógica para el instrumento de velocidad aérea (Air Speed).
  Funciones principales:
  - updateAirspeed(airspeed): Actualiza la aguja y los valores numéricos del instrumento según el valor de velocidad aérea recibido o el slider.
  - init(config): Inicializa las referencias a los elementos del DOM y configura los event listeners para los controles.



*/

function initAirSpeedControls() {
  // Event listener para el slider
  const slider = document.getElementById('as-slider');
  if (slider) {
    slider.addEventListener('input', () => {
      updateAirspeed(parseFloat(slider.value), true); // true = desde el slider, enviar al ESP32
    });
  } else {
    console.warn('No se encontró el slider de Air Speed en el DOM.');
  }
  
  // Event listeners para los botones de valores predefinidos
  const btnMax = document.getElementById('as-slider-max');
  const btnMid = document.getElementById('as-slider-mid');
  const btnMin = document.getElementById('as-slider-min');
  const btnPlus = document.getElementById('as-btn-plus');
  const btnMinus = document.getElementById('as-btn-minus');
  
  if (btnMax) {
    btnMax.addEventListener('click', () => {
      updateAirspeed(200, true); // Máximo: 200 kts
    });
  }
  if (btnMid) {
    btnMid.addEventListener('click', () => {
      updateAirspeed(120, true); // Medio: 120 kts
    });
  }
  if (btnMin) {
    btnMin.addEventListener('click', () => {
      updateAirspeed(40, true); // Mínimo: 40 kts
    });
  }
  if (btnPlus) {
    btnPlus.addEventListener('click', () => {
      const slider = document.getElementById('as-slider');
      if (slider) {
        const newValue = Math.min(200, parseFloat(slider.value) + 1); // +1 nudo
        updateAirspeed(newValue, true);
      }
    });
  }
  if (btnMinus) {
    btnMinus.addEventListener('click', () => {
      const slider = document.getElementById('as-slider');
      if (slider) {
        const newValue = Math.max(40, parseFloat(slider.value) - 1); // -1 nudo
        updateAirspeed(newValue, true);
      }
    });
  }
}

function updateAirspeed(airspeed, sendToESP = false) {
  const slider = document.getElementById('as-slider');
  const valueLabel = document.getElementById('as-value');
  const sliderLabel = document.getElementById('as-slider-value-label');
  const needle = document.getElementById('as-needle');
  if (!valueLabel || !needle) {
    console.warn('No se encontraron los elementos de Air Speed en el DOM.');
    return;
  }
  // Si se llama sin argumento, usar el valor del slider
  if (airspeed === undefined && slider) {
    airspeed = parseFloat(slider.value);
    sendToESP = true;
  }
  valueLabel.textContent = airspeed.toFixed(0); // Mostrar solo enteros
  // Sincronizar el slider siempre
  if (slider) {
    slider.value = airspeed;
  }
  // Actualizar etiqueta del slider
  if (sliderLabel) {
    sliderLabel.textContent = airspeed.toFixed(0);
  }
  // Calcular el ángulo de la aguja utilizando la función airspeedToAngle
  const angle = airspeedToAngle(airspeed);
  needle.style.transform = `rotate(${angle}deg)`;
  // Enviar el valor de velocidad aérea al ESP32 solo si se indica
  if (sendToESP) {
    sendAirspeedToESP32(airspeed);
  }
}

function sendAirspeedToESP32(airspeed) {
  // Enviar el valor de velocidad aérea al ESP32 vía WebSocket
  if (window.ws && window.ws.readyState === WebSocket.OPEN) {
    const data = JSON.stringify({ airspeedValue: airspeed });
    window.ws.send(data);
    console.log(`Enviando velocidad aérea al ESP32: ${airspeed} kts`);
  } else {
    console.warn('WebSocket no está conectado.');
  }
}
// Mapea el valor de AirSpeed (40-200) al ángulo de la aguja (36-324)
function airspeedToAngle(airspeed) {
  const minValue = 40;
  const maxValue = 200;
  const minAngle = 36; // Ángulo mínimo para 40 kts
  const maxAngle = 323; // Ángulo máximo para 200 kts
  if (airspeed < minValue) airspeed = minValue;
  if (airspeed > maxValue) airspeed = maxValue;
  return minAngle + ((airspeed - minValue) * (maxAngle - minAngle)) / (maxValue - minValue);
}