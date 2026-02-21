/* 
  Sistema de Instrumentos para AeroDeck - Versión 3.00
  Autor: Claudio Arzamendia Systems
  Fecha: 2026-02-18 03:26:05

  Librería functions_OilTemp.js - Funciones para el instrumento de temperatura de aceite (Oil Temp).
    Funciones principales:

    - updateOilTemp(oilTemp, noice): Actualiza la aguja y los valores numéricos del instrumento 
    según el valor de temperatura de aceite recibido o el slider. El parámetro "noice" indica si 
    el modo "noice" está activo, lo que puede afectar la apariencia del instrumento.
    - initOilTempControls(): Inicializa las referencias a los elementos del DOM y configura 
    los event listeners para los controles interactivos del Oil Temp, como el slider y los 
    botones de valores predefinidos.

  El instrumento de temperatura de aceite muestra la cantidad de calor que el motor 
  está generando en tiempo real. El valor se representa en grados Celsius (°C) y se 
  muestra en una escala que va de 50 a 250 °C. El instrumento tiene una aguja que se mueve 
  para indicar la temperatura actual, y un valor numérico que muestra la cantidad exacta de 
  temperatura generada. El control de temperatura de aceite se puede ajustar mediante 
  un slider o botones predefinidos para valores comunes de temperatura. Al cambiar el valor, 
  se anima la aguja del instrumento y se envía el nuevo valor al ESP32 para que lo refleje 
  en el instrumento físico y en todas las terminales conectadas.


*/

function initOilTempControls() {
  // Event listener para el slider
  const slider = document.getElementById('ot-slider');
  if (slider) {
    slider.addEventListener('input', () => {
      updateOilTemp(parseFloat(slider.value), true); // true = desde el slider, enviar al ESP32
    });
  } else {
    console.warn('No se encontró el slider de Oil Temp en el DOM.');
  }
  
  // Event listeners para los botones de valores predefinidos
  const btnMax = document.getElementById('ot-slider-max');
  const btnMid = document.getElementById('ot-slider-mid');
  const btnMin = document.getElementById('ot-slider-min');
  const btnPlus = document.getElementById('ot-btn-plus');
  const btnMinus = document.getElementById('ot-btn-minus');
  
  if (btnMax) {
    btnMax.addEventListener('click', () => {
      updateOilTemp(250, true); // Máximo: 250 °C
    });
  }
  if (btnMid) {
    btnMid.addEventListener('click', () => {
      updateOilTemp(150, true); // Medio: 150 °C
    });
  }
  if (btnMin) {
    btnMin.addEventListener('click', () => {
      updateOilTemp(50, true); // Mínimo: 50 °C
    });
  }
  if (btnPlus) {
    btnPlus.addEventListener('click', () => {
      const slider = document.getElementById('ot-slider');
      if (slider) {
        const newValue = Math.min(250, parseFloat(slider.value) + 1); // +1 °C
        updateOilTemp(newValue, true);
      }
    });
  }
  if (btnMinus) {
    btnMinus.addEventListener('click', () => {
      const slider = document.getElementById('ot-slider');
      if (slider) {
        const newValue = Math.max(50, parseFloat(slider.value) - 1); // -1 °C
        updateOilTemp(newValue, true);
      }
    });
  }
}

function updateOilTemp(oilTemp, sendToESP = false) {
  const slider = document.getElementById('ot-slider');
  const valueLabel = document.getElementById('ot-value');
  const sliderLabel = document.getElementById('ot-slider-value-label');
  const needle = document.getElementById('ot_needle');
  if (!needle) {
    console.warn('No se encontró la aguja de Oil Temp en el DOM.');
    return;
  }
  // Si se llama sin argumento, usar el valor del slider
  if (oilTemp === undefined && slider) {
    oilTemp = parseFloat(slider.value);
    sendToESP = true;
  }
  // Actualizar valor en el centro del instrumento
  if (valueLabel) {
    valueLabel.textContent = oilTemp.toFixed(1);
  }
  // Sincronizar el slider SOLO si la actualización NO viene del usuario (sendToESP = false)
  if (!sendToESP && slider) {
    slider.value = oilTemp;
  }
  // Actualizar etiqueta del slider
  if (sliderLabel) {
    sliderLabel.textContent = oilTemp.toFixed(1);
  }
  // Calcular el ángulo de la aguja utilizando la función oilTempToAngle
  const angle = oilTempToAngle(oilTemp);
  needle.style.transform = `rotate(${angle}deg)`;
  // Enviar el valor de Oil Temp al ESP32 solo si se indica
  if (sendToESP) {
    sendOilTempToESP32(oilTemp);
  }
}

function sendOilTempToESP32(oilTemp) {
  // Enviar el valor de Oil Temp al ESP32 vía WebSocket
  if (window.ws && window.ws.readyState === WebSocket.OPEN) {
    const data = JSON.stringify({ oilTemp: oilTemp });
    window.ws.send(data);
    console.log(`Enviando Oil Temp al ESP32: ${oilTemp} °C`);
  } else {
    console.warn('WebSocket no está conectado.');
  }
}
// Mapea el valor de Oil Temp (50-250) al ángulo de la aguja (270-90)
function oilTempToAngle(oilTemp) {
  const minValue = 50;
  const maxValue = 250;
  const minAngle = 270; // Ángulo mínimo para 50 °C
  const maxAngle = 90; // Ángulo máximo para 250 °C
  if (oilTemp < minValue) oilTemp = minValue;
  if (oilTemp > maxValue) oilTemp = maxValue;
  return minAngle + ((oilTemp - minValue) * (minAngle - maxAngle)) / (maxValue - minValue);
}


        // Alterna la visibilidad del cristal roto en el instrumento Oil Temp
        function toggleOilTempBrokenCrystal() {
  const crystal = document.getElementById('ot_broken_crystal02');
  if (crystal) {
    crystal.classList.toggle('visible');
  }
}