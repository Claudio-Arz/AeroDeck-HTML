/* 
  Sistema de Instrumentos para AeroDeck - Versión 3.00
  Autor: Claudio Arzamendia Systems
  Fecha: 2026-02-18 05:58:19

  Librería functions_CHT.js - Funciones para el instrumento de temperatura de cilindro (CHT).
    Funciones principales:

    - updateCHT(cht, noice): Actualiza la aguja y los valores numéricos del instrumento 
    según el valor de temperatura de cilindro recibido o el slider. El parámetro "noice" indica si 
    el modo "noice" está activo, lo que puede afectar la apariencia del instrumento.
    - initCHTControls(): Inicializa las referencias a los elementos del DOM y configura 
    los event listeners para los controles interactivos del CHT, como el slider y los 
    botones de valores predefinidos.

  El instrumento de temperatura de cilindro muestra la cantidad de calor que el motor 
  está generando en tiempo real. El valor se representa en grados Celsius (°C) y se 
  muestra en una escala que va de 100 a 500 °C. El instrumento tiene una aguja que se mueve 
  para indicar la temperatura actual, y un valor numérico que muestra la cantidad exacta de 
  temperatura generada. El control de temperatura de cilindro se puede ajustar mediante 
  un slider o botones predefinidos para valores comunes de temperatura. Al cambiar el valor, 
  se anima la aguja del instrumento y se envía el nuevo valor al ESP32 para que lo refleje 
  en el instrumento físico y en todas las terminales conectadas.


*/

function initCHTControls() {
  // Event listener para el slider
  const slider = document.getElementById('cht-slider');
  if (slider) {
    slider.addEventListener('input', () => {
      updateCHT(parseFloat(slider.value), true); // true = desde el slider, enviar al ESP32
    });
  } else {
    console.warn('No se encontró el slider de CHT en el DOM.');
  }
  
  // Event listeners para los botones de valores predefinidos
  const btnMax = document.getElementById('cht-slider-max');
  const btnMid = document.getElementById('cht-slider-mid');
  const btnMin = document.getElementById('cht-slider-min');
  const btnPlus = document.getElementById('cht-btn-plus');
  const btnMinus = document.getElementById('cht-btn-minus');
  
  if (btnMax) {
    btnMax.addEventListener('click', () => {
      updateCHT(500, true); // Máximo: 500 °C
    });
  }
  if (btnMid) {
    btnMid.addEventListener('click', () => {
      updateCHT(300, true); // Medio: 300 °C
    });
  }
  if (btnMin) {
    btnMin.addEventListener('click', () => {
      updateCHT(100, true); // Mínimo: 100 °C
    });
  }
  if (btnPlus) {
    btnPlus.addEventListener('click', () => {
      const slider = document.getElementById('cht-slider');
      if (slider) {
        const newValue = Math.min(500, parseFloat(slider.value) + 1); // +1 °F
        updateCHT(newValue, true);
      }
    });
  }
  if (btnMinus) {
    btnMinus.addEventListener('click', () => {
      const slider = document.getElementById('cht-slider');
      if (slider) {
        const newValue = Math.max(100, parseFloat(slider.value) - 1); // -1 °F
        updateCHT(newValue, true);
      }
    });
  }
}

function updateCHT(cht, sendToESP = false) {
  const slider = document.getElementById('cht-slider');
  const valueLabel = document.getElementById('cht-value');
  const sliderLabel = document.getElementById('cht-slider-value-label');
  const needle = document.getElementById('cht_needle');
  if (!needle) {
    console.warn('No se encontró la aguja de CHT en el DOM.');
    return;
  }
  // Si se llama sin argumento, usar el valor del slider
  if (cht === undefined && slider) {
    cht = parseFloat(slider.value);
    sendToESP = true;
  }
  // Actualizar valor en el centro del instrumento
  if (valueLabel) {
    valueLabel.textContent = cht.toFixed(1);
  }
  // Sincronizar el slider SOLO si la actualización NO viene del usuario (sendToESP = false)
  if (!sendToESP && slider) {
    slider.value = cht;
  }
  // Actualizar etiqueta del slider
  if (sliderLabel) {
    sliderLabel.textContent = cht.toFixed(1);
  }
  // Calcular el ángulo de la aguja utilizando la función chtToAngle
  const angle = chtToAngle(cht);
  needle.style.transform = `rotate(${angle}deg)`;
  // Enviar el valor de CHT al ESP32 solo si se indica
  if (sendToESP) {
    sendCHTToESP32(cht);
  }
}

function sendCHTToESP32(cht) {
  // Enviar el valor de CHT al ESP32 vía WebSocket
  if (window.ws && window.ws.readyState === WebSocket.OPEN) {
    const data = JSON.stringify({ cht: cht });
    window.ws.send(data);
    console.log(`Enviando CHT al ESP32: ${cht} °F`);
  } else {
    console.warn('WebSocket no está conectado.');
  }
}
// Mapea el valor de CHT (50-250) al ángulo de la aguja (270-90)
function chtToAngle(cht) {
  const minValue = 50;
  const maxValue = 250;
  const minAngle = 270; // Ángulo mínimo para 50 °F
  const maxAngle = 90; // Ángulo máximo para 250 °F
  if (cht < minValue) cht = minValue;
  if (cht > maxValue) cht = maxValue;
  return minAngle + ((cht - minValue) * (minAngle - maxAngle)) / (maxValue - minValue);
}