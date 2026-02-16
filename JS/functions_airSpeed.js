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
  // Aquí podríamos agregar event listeners para controles interactivos
  const slider = document.getElementById('as-slider');
  if (slider) {
    slider.addEventListener('input', () => {
      updateAirspeed(parseFloat(slider.value), true); // true = desde el slider, enviar al ESP32
    });
  } else {
    console.warn('No se encontró el slider de Air Speed en el DOM.');
  }
}

function updateAirspeed(airspeed, fromSlider = false) {
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
    fromSlider = true;
  }
  valueLabel.textContent = airspeed.toFixed(0) + ' kts';
  // Sincronizar el slider si la actualización viene del ESP32
  if (!fromSlider && slider) {
    slider.value = airspeed;
  }
  // Actualizar etiqueta del slider
  if (sliderLabel) {
    sliderLabel.textContent = airspeed.toFixed(0);
  }
  // Calcular el ángulo de la aguja utilizando la función airspeedToAngle
  const angle = airspeedToAngle(airspeed);
  needle.style.transform = `rotate(${angle}deg)`;
  // Enviar el valor de velocidad aérea al ESP32 solo si viene del slider
  if (fromSlider) {
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
// Mapea el valor de AirSpeed (40-200) al ángulo de la aguja (30-319)
function airspeedToAngle(airspeed) {
  const minValue = 40;
  const maxValue = 200;
  const minAngle = 30;
  const maxAngle = 319;
  if (airspeed < minValue) airspeed = minValue;
  if (airspeed > maxValue) airspeed = maxValue;
  return minAngle + ((airspeed - minValue) * (maxAngle - minAngle)) / (maxValue - minValue);
}