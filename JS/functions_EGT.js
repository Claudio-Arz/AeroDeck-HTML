/* 
  Sistema de Instrumentos para AeroDeck - Versión 4.00
  Autor: Claudio Arzamendia Systems
  Fecha: 2026-02-27 00:35:02

  Librería functions_EGT.js - Funciones para el instrumento de temperatura de gases de escape (EGT).
    Funciones principales:

    - updateEGT(egt, noice): Actualiza la aguja y los valores numéricos del instrumento 
    según el valor de temperatura de gases de escape recibido o el slider. 
    - initEGTControls(): Inicializa las referencias a los elementos del DOM y configura 
    los event listeners para los controles interactivos del EGT, como el slider y los 
    botones de valores predefinidos.

  El instrumento de temperatura de gases de escape muestra la temperatura en tiempo real. El valor se representa en grados Celsius (°C) y se 
  muestra en una escala que va de 0 a 25 °C. El instrumento tiene una aguja que se mueve 
  para indicar la temperatura actual, y un valor numérico que muestra la temperatura exacta. El control de temperatura se puede ajustar mediante 
  un slider o botones predefinidos para valores comunes de temperatura. Al cambiar el valor, 
  se anima la aguja del instrumento y se envía el nuevo valor al ESP32 para que lo refleje 
  en el instrumento físico y en todas las terminales conectadas.


*/

function initEGTControls() {
  // Event listener para el slider
  const slider = document.getElementById('egt-slider');
  if (slider) {
    slider.addEventListener('input', () => {
      updateEGT(parseFloat(slider.value), true); // true = desde el slider, enviar al ESP32
    });
  } else {
    console.warn('No se encontró el slider de EGT en el DOM.');
  }

  
  // Event listeners para los botones de valores predefinidos

  const btnMax = document.getElementById('egt-slider-max');
  const btnMid = document.getElementById('egt-slider-mid');
  const btnMin = document.getElementById('egt-slider-min');
  const btnPlus = document.getElementById('egt-btn-plus');
  const btnMinus = document.getElementById('egt-btn-minus');
  
  if (btnMax) {
    btnMax.addEventListener('click', () => {
      updateEGT(500, true); // Máximo: 500 °F
    });
  }
  if (btnMid) {
    btnMid.addEventListener('click', () => {
      updateEGT(250, true); // Medio: 250 °F
    });
  }
  if (btnMin) {
    btnMin.addEventListener('click', () => {
      updateEGT(0, true); // Mínimo: 0 °F
    });
  }
  if (btnPlus) {
    btnPlus.addEventListener('click', () => {
      const slider = document.getElementById('egt-slider');
      if (slider) {
        const newValue = Math.min(500, parseFloat(slider.value) + 10); // +10 °F
        updateEGT(newValue, true);
      }
    });
  }
  if (btnMinus) {
    btnMinus.addEventListener('click', () => {
      const slider = document.getElementById('egt-slider');
      if (slider) {
        const newValue = Math.max(0, parseFloat(slider.value) - 10); // -10 °F
        updateEGT(newValue, true);
      }
    });
  }
  
}

function updateEGT(egt, sendToESP = false) {
  const slider = document.getElementById('egt-slider');
  const valueLabel = document.getElementById('egt-value');
  const sliderLabel = document.getElementById('egt-slider-value-label');
  const needle = document.getElementById('egt_needle');
  if (!needle) {
    console.warn('No se encontró la aguja de EGT en el DOM.');
    return;
  }
  // Si se llama sin argumento, usar el valor del slider
  if (egt === undefined && slider) {
    egt = parseFloat(slider.value);
    sendToESP = true;
  }
  // Actualizar valor en el centro del instrumento
  if (valueLabel) {
    valueLabel.textContent = egt.toFixed(1);
  }
  // Sincronizar el slider SOLO si la actualización NO viene del usuario (sendToESP = false)
  if (!sendToESP && slider) {
    slider.value = egt.toFixed(1);
  }
  // Actualizar etiqueta del slider
  if (sliderLabel) {
    sliderLabel.textContent = egt.toFixed(1);
  }
  // Calcular el ángulo de la aguja utilizando la función egtToAngle
  const angle = egtToAngle(egt);
  needle.style.transform = `rotate(${angle}deg)`;
  // Enviar el valor de EGT al ESP32 solo si se indica
  if (sendToESP) {
    sendEGTToESP32(egt);
  }
}


function sendEGTToESP32(egt) {
  // Enviar el valor de EGT al ESP32 vía WebSocket
  if (window.ws && window.ws.readyState === WebSocket.OPEN) {
    const data = JSON.stringify({ egtValue: egt });
    window.ws.send(data);
    // console.log(`Enviando EGT al ESP32: ${egt} °F`);
  } else {
    // console.warn('WebSocket no está conectado.');
  }
}

// Mapea el valor de EGT (0-1450) al ángulo de la aguja (270-90 grados)
function egtToAngle(egt) {
  const minValue = 0;
  const maxValue = 1450;
  const minAngle = 270; // Ángulo mínimo para 0 °F
  const maxAngle = 90; // Ángulo máximo para 1450 °F
  if (egt < minValue) egt = minValue;
  if (egt > maxValue) egt = maxValue;
  return minAngle - ((egt - minValue) * (maxAngle - minAngle)) / (maxValue - minValue);
}


// Alterna la visibilidad del cristal roto en el instrumento EGT
function toggleEGTBrokenCrystal() {
  const crystal = document.getElementById('egt_broken_crystal16');
  if (crystal) {
    crystal.classList.toggle('visible');
  }
}

