/* 
  Sistema de Instrumentos para AeroDeck - Versión 3.00
  Autor: Claudio Arzamendia Systems
  Fecha: 2026-02-21 15:48:13

  Librería functions_VoltAmp.js - Funciones para el instrumento de voltaje y amperaje (Volt/Amp).
    Funciones principales:

    - updateVoltAmp(volt, amp, noice): Actualiza la aguja y los valores numéricos del instrumento 
    según el valor de voltaje y amperaje recibido o el slider. 
    - initVoltAmpControls(): Inicializa las referencias a los elementos del DOM y configura 
    los event listeners para los controles interactivos del Volt/Amp, como el slider y los 
    botones de valores predefinidos.

  El instrumento de Volt/Amp muestra la cantidad de voltaje y amperaje disponible en tiempo real. El valor se representa en voltios (V) y amperios (A) y se 
  muestra en una escala que va de 0 a 25 V y 0 a 25 A. El instrumento tiene una aguja que se mueve 
  para indicar la cantidad de voltaje y amperaje actual, y un valor numérico que muestra la cantidad exacta de 
  voltaje y amperaje disponible. El control de Volt/Amp se puede ajustar mediante 
  un slider o botones predefinidos para valores comunes de Volt/Amp. Al cambiar el valor, 
  se anima la aguja del instrumento y se envía el nuevo valor al ESP32 para que lo refleje 
  en el instrumento físico y en todas las terminales conectadas.


*/

function initVoltAmpControls() {
  // Event listener para el slider izquierdo
  const sliderL = document.getElementById('voltamp-slider-left');
  if (sliderL) {
    sliderL.addEventListener('input', () => {
      updateVoltAmpLeft(parseFloat(sliderL.value), true);
    });
  } else {
    console.warn('No se encontró el slider de Volt/Amp IZQ en el DOM.');
  }
  // Event listener para el slider derecho
  const sliderR = document.getElementById('voltamp-slider-right');
  if (sliderR) {
    sliderR.addEventListener('input', () => {
      updateVoltAmpRight(parseFloat(sliderR.value), true);
    });
  } else {
    console.warn('No se encontró el slider de Volt/Amp DER en el DOM.');
  }
  
  // Event listeners para los botones de valores predefinidos
  const btnMaxL = document.getElementById('voltamp-max-left');
  const btnMidL = document.getElementById('voltamp-mid-left');
  const btnMinL = document.getElementById('voltamp-min-left');
  const btnPlusL = document.getElementById('voltamp-btn-plus-left');
  const btnMinusL = document.getElementById('voltamp-btn-minus-left');
  
  const btnMaxR = document.getElementById('voltamp-max-right');
  const btnMidR = document.getElementById('voltamp-mid-right');
  const btnMinR = document.getElementById('voltamp-min-right');
  const btnPlusR = document.getElementById('voltamp-btn-plus-right');
  const btnMinusR = document.getElementById('voltamp-btn-minus-right');
  
  // Botones Left
  if (btnMaxL) {
    btnMaxL.addEventListener('click', () => {
      updateVoltAmpLeft(25, true); // Full: 25 V/A
    });
  }
  if (btnMidL) {
    btnMidL.addEventListener('click', () => {
      updateVoltAmpLeft(12.5, true); // Half: 12.5 V/A
    });
  }
  if (btnMinL) {
    btnMinL.addEventListener('click', () => {
      updateVoltAmpLeft(0, true); // Empty: 0 V/A
    });
  }
  if (btnPlusL) {
    btnPlusL.addEventListener('click', () => {
      const slider = document.getElementById('voltamp-slider-left');
      if (slider) {
        const newValue = Math.min(25, parseFloat(slider.value) + 1);
        updateVoltAmpLeft(newValue, true);
      }
    });
  }
  if (btnMinusL) {
    btnMinusL.addEventListener('click', () => {
      const slider = document.getElementById('voltamp-slider-left');
      if (slider) {
        const newValue = Math.max(0, parseFloat(slider.value) - 1);
        updateVoltAmpLeft(newValue, true);
      }
    });
  }
  // Botones Right
  if (btnMaxR) {
    btnMaxR.addEventListener('click', () => {
      updateVoltAmpRight(25, true); // Full: 25 V/A
    });
  }
  if (btnMidR) {
    btnMidR.addEventListener('click', () => {
      updateVoltAmpRight(12.5, true); // Half: 12.5 V/A
    });
  }
  if (btnMinR) {
    btnMinR.addEventListener('click', () => {
      updateVoltAmpRight(0, true); // Empty: 0 V/A
    });
  }
  if (btnPlusR) {
    btnPlusR.addEventListener('click', () => {
      const slider = document.getElementById('voltamp-slider-right');
      if (slider) {
        const newValue = Math.min(25, parseFloat(slider.value) + 1);
        updateVoltAmpRight(newValue, true);
      }
    });
  }
  if (btnMinusR) {
    btnMinusR.addEventListener('click', () => {
      const slider = document.getElementById('voltamp-slider-right');
      if (slider) {
        const newValue = Math.max(0, parseFloat(slider.value) - 1);
        updateVoltAmpRight(newValue, true);
      }
    });
  }
}

function updateVoltAmpLeft(voltAmp, sendToESP = false) {
  const slider = document.getElementById('voltamp-slider-left');
  const valueLabel = document.getElementById('voltamp-value-left');
  const sliderLabel = document.getElementById('voltamp-slider-value-label-left');
  const needle = document.getElementById('voltamp_Lneedle');
  if (!needle) {
    console.warn('No se encontró la aguja de Volt/Amp en el DOM.');
    return;
  }
  // Si se llama sin argumento, usar el valor del slider
  if (voltAmp === undefined && slider) {
    voltAmp = parseFloat(slider.value);
    sendToESP = true;
  }
  // Actualizar valor en el centro del instrumento
  if (valueLabel) {
    valueLabel.textContent = voltAmp.toFixed(1);
  }
  // Sincronizar el slider SOLO si la actualización NO viene del usuario (sendToESP = false)
  if (!sendToESP && slider) {
    slider.value = voltAmp;
  }
  // Actualizar etiqueta del slider
  if (sliderLabel) {
    sliderLabel.textContent = voltAmp.toFixed(1);
  }
  // Calcular el ángulo de la aguja utilizando la función voltAmpToAngleLeft
  const angle = voltAmpToAngleLeft(voltAmp);
  needle.style.transform = `rotate(${angle}deg)`;
  // Enviar el valor de Volt/Amp al ESP32 solo si se indica
  if (sendToESP) {
sendVoltAmpToESP32("voltAmpValueLeft", voltAmp);
  }
}

function updateVoltAmpRight(voltAmp, sendToESP = false) {
  const slider = document.getElementById('voltamp-slider-right');
  const valueLabel = document.getElementById('voltamp-value-right');
  const sliderLabel = document.getElementById('voltamp-slider-value-label-right');
  const needle = document.getElementById('voltamp_Rneedle');
  if (!needle) {
    console.warn('No se encontró la aguja de Volt/Amp en el DOM.');
    return;
  }
  // Si se llama sin argumento, usar el valor del slider
  if (voltAmp === undefined && slider) {
    voltAmp = parseFloat(slider.value);
    sendToESP = true;
  }
  // Actualizar valor en el centro del instrumento
  if (valueLabel) {
    valueLabel.textContent = voltAmp.toFixed(1);
  }
  // Sincronizar el slider SOLO si la actualización NO viene del usuario (sendToESP = false)
  if (!sendToESP && slider) {
    slider.value = voltAmp;
  }
  // Actualizar etiqueta del slider
  if (sliderLabel) {
    sliderLabel.textContent = voltAmp.toFixed(1);
  }
  // Calcular el ángulo de la aguja utilizando la función voltAmpToAngleRight
  const angle = voltAmpToAngleRight(voltAmp);
  needle.style.transform = `rotate(${angle}deg)`;
  // Enviar el valor de Volt/Amp al ESP32 solo si se indica
  if (sendToESP) {
sendVoltAmpToESP32("voltAmpValueRight", voltAmp);
  }
}

function sendVoltAmpToESP32(side, voltAmp) {
  // Enviar el valor de Volt/Amp al ESP32 vía WebSocket
  if (window.ws && window.ws.readyState === WebSocket.OPEN) {
    const data = JSON.stringify({ [side]: voltAmp });
    window.ws.send(data);
    console.log(`Enviando Volt/Amp al ESP32 (${side}): ${voltAmp} V/A`);
  } else {
    console.warn('WebSocket no está conectado.');
  }
}

// Mapea el valor de Volt/Amp (-60-60) al ángulo de la aguja (-25-70 grados)
function voltAmpToAngleRight(voltAmp) {
  const minValue = -60;
  const maxValue = +60;
  const minAngle = -25; // Ángulo mínimo para -60 V/A
  const maxAngle = 70; // Ángulo máximo para 60 V/A
  if (voltAmp < minValue) voltAmp = minValue;
  if (voltAmp > maxValue) voltAmp = maxValue;
  return minAngle - ((voltAmp - minValue) * (maxAngle - minAngle)) / (maxValue - minValue);
}
// Mapea el valor de Volt/Amp (3-7) al ángulo de la aguja (25-70 grados)
function voltAmpToAngleLeft(voltAmp) {
  const minValue = 3;
  const maxValue = 7;
  const minAngle = 25; // Ángulo mínimo para 3 V/A
  const maxAngle = 70; // Ángulo máximo para 7 V/A
  if (voltAmp < minValue) voltAmp = minValue;
  if (voltAmp > maxValue) voltAmp = maxValue;
  return minAngle + ((voltAmp - minValue) * (maxAngle - minAngle)) / (maxValue - minValue) ;
}


// Alterna la visibilidad del cristal roto en el instrumento FUEL
function toggleFuelBrokenCrystal() {
  const crystal = document.getElementById('fuel_broken_crystal15');
  if (crystal) {
    crystal.classList.toggle('visible');
  }
}