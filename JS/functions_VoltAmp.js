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

  El instrumento de Volt/Amp tiene dos agujas:
  - Aguja izquierda (Voltímetro): escala de 3V a 7V
  - Aguja derecha (Amperímetro): escala de -60A a +60A
  
  El control permite ajustar ambas agujas mediante sliders y botones predefinidos. 
  Al cambiar el valor, se anima la aguja del instrumento y se envía el nuevo valor 
  al ESP32 para que lo refleje en el instrumento físico y en todas las terminales conectadas.


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
  
  // Botones Left (Voltímetro: 3-7V)
  if (btnMaxL) {
    btnMaxL.addEventListener('click', () => {
      updateVoltAmpLeft(7, true); // Max: 7V
    });
  }
  if (btnMidL) {
    btnMidL.addEventListener('click', () => {
      updateVoltAmpLeft(5, true); // Mid: 5V
    });
  }
  if (btnMinL) {
    btnMinL.addEventListener('click', () => {
      updateVoltAmpLeft(3, true); // Min: 3V
    });
  }
  if (btnPlusL) {
    btnPlusL.addEventListener('click', () => {
      const slider = document.getElementById('voltamp-slider-left');
      if (slider) {
        const newValue = Math.min(7, parseFloat(slider.value) + 0.5);
        updateVoltAmpLeft(newValue, true);
      }
    });
  }
  if (btnMinusL) {
    btnMinusL.addEventListener('click', () => {
      const slider = document.getElementById('voltamp-slider-left');
      if (slider) {
        const newValue = Math.max(3, parseFloat(slider.value) - 0.5);
        updateVoltAmpLeft(newValue, true);
      }
    });
  }
  // Botones Right (Amperímetro: -60 a 60A)
  if (btnMaxR) {
    btnMaxR.addEventListener('click', () => {
      updateVoltAmpRight(60, true); // Max: 60A
    });
  }
  if (btnMidR) {
    btnMidR.addEventListener('click', () => {
      updateVoltAmpRight(0, true); // Mid: 0A (centro)
    });
  }
  if (btnMinR) {
    btnMinR.addEventListener('click', () => {
      updateVoltAmpRight(-60, true); // Min: -60A
    });
  }
  if (btnPlusR) {
    btnPlusR.addEventListener('click', () => {
      const slider = document.getElementById('voltamp-slider-right');
      if (slider) {
        const newValue = Math.min(60, parseFloat(slider.value) + 5);
        updateVoltAmpRight(newValue, true);
      }
    });
  }
  if (btnMinusR) {
    btnMinusR.addEventListener('click', () => {
      const slider = document.getElementById('voltamp-slider-right');
      if (slider) {
        const newValue = Math.max(-60, parseFloat(slider.value) - 5);
        updateVoltAmpRight(newValue, true);
      }
    });
  }
}

function updateVoltAmpLeft(voltAmp, sendToESP = false) {
  const slider = document.getElementById('voltamp-slider-left');
  const valueLabel = document.getElementById('voltamp-value-left');
  const sliderLabel = document.getElementById('voltamp-slider-value-label-left');
  const needle = document.getElementById('voltAmp_Lneedle');
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
  const needle = document.getElementById('voltAmp_Rneedle');
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
  const minAngle = -45; // Ángulo mínimo para -60 V/A
  const maxAngle = +45; // Ángulo máximo para 60 V/A
  if (voltAmp < minValue) voltAmp = minValue;
  if (voltAmp > maxValue) voltAmp = maxValue;
  return minAngle - ((voltAmp - minValue) * (maxAngle - minAngle)) / (maxValue - minValue);
}
// Mapea el valor de Volt/Amp (3-7) al ángulo de la aguja (0 / -90 grados)
function voltAmpToAngleLeft(voltAmp) {
  const minValue = 3;
  const maxValue = 7;
  const minAngle = 0; // Ángulo mínimo para 3 V/A
  const maxAngle = -90; // Ángulo máximo para 7 V/A
  if (voltAmp < minValue) voltAmp = minValue;
  if (voltAmp > maxValue) voltAmp = maxValue;
  return minAngle + ((voltAmp - minValue) * (maxAngle - minAngle)) / (maxValue - minValue) + 45;
}


// Alterna la visibilidad del cristal roto en el instrumento VOLT/Amp
function toggleVoltAmpBrokenCrystal() {
  const crystal = document.getElementById('voltAmp_broken_crystal16');
  if (crystal) {
    crystal.classList.toggle('visible');
  }
}