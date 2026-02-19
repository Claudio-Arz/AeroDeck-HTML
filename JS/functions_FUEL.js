/* 
  Sistema de Instrumentos para AeroDeck - Versión 3.00
  Autor: Claudio Arzamendia Systems
  Fecha: 2026-02-18 20:51:54

  Librería functions_FUEL.js - Funciones para el instrumento de combustible (FUEL).
    Funciones principales:

    - updateFUEL(fuel, noice): Actualiza la aguja y los valores numéricos del instrumento 
    según el valor de combustible recibido o el slider. 
    - initFUELControls(): Inicializa las referencias a los elementos del DOM y configura 
    los event listeners para los controles interactivos del FUEL, como el slider y los 
    botones de valores predefinidos.

  El instrumento de combustible muestra la cantidad de combustible disponible en tiempo real. El valor se representa en litros (L) y se 
  muestra en una escala que va de 0 a 100 L. El instrumento tiene una aguja que se mueve 
  para indicar la cantidad de combustible actual, y un valor numérico que muestra la cantidad exacta de 
  combustible disponible. El control de combustible se puede ajustar mediante 
  un slider o botones predefinidos para valores comunes de combustible. Al cambiar el valor, 
  se anima la aguja del instrumento y se envía el nuevo valor al ESP32 para que lo refleje 
  en el instrumento físico y en todas las terminales conectadas.


*/

function initFUELControls() {
  // Event listener para el slider izquierdo
  const sliderL = document.getElementById('fuel-slider-left');
  if (sliderL) {
    sliderL.addEventListener('input', () => {
      updateFUELLeft(parseFloat(sliderL.value), true);
    });
  } else {
    console.warn('No se encontró el slider de FUEL IZQ en el DOM.');
  }
  // Event listener para el slider derecho
  const sliderR = document.getElementById('fuel-slider-right');
  if (sliderR) {
    sliderR.addEventListener('input', () => {
      updateFUELRight(parseFloat(sliderR.value), true);
    });
  } else {
    console.warn('No se encontró el slider de FUEL DER en el DOM.');
  }
  
  // Event listeners para los botones de valores predefinidos
  const btnMaxL = document.getElementById('fuel-max-left');
  const btnMidL = document.getElementById('fuel-mid-left');
  const btnMinL = document.getElementById('fuel-min-left');
  const btnPlusL = document.getElementById('fuel-btn-plus-left');
  const btnMinusL = document.getElementById('fuel-btn-minus-left');
  
  const btnMaxR = document.getElementById('fuel-max-right');
  const btnMidR = document.getElementById('fuel-mid-right');
  const btnMinR = document.getElementById('fuel-min-right');
  const btnPlusR = document.getElementById('fuel-btn-plus-right');
  const btnMinusR = document.getElementById('fuel-btn-minus-right');
  
  // Botones Left
  if (btnMaxL) {
    btnMaxL.addEventListener('click', () => {
      updateFUELLeft(25, true); // Full: 25 gal
    });
  }
  if (btnMidL) {
    btnMidL.addEventListener('click', () => {
      updateFUELLeft(12.5, true); // Half: 12.5 gal
    });
  }
  if (btnMinL) {
    btnMinL.addEventListener('click', () => {
      updateFUELLeft(0, true); // Empty: 0
    });
  }
  if (btnPlusL) {
    btnPlusL.addEventListener('click', () => {
      const slider = document.getElementById('fuel-slider-left');
      if (slider) {
        const newValue = Math.min(25, parseFloat(slider.value) + 1);
        updateFUELLeft(newValue, true);
      }
    });
  }
  if (btnMinusL) {
    btnMinusL.addEventListener('click', () => {
      const slider = document.getElementById('fuel-slider-left');
      if (slider) {
        const newValue = Math.max(0, parseFloat(slider.value) - 1);
        updateFUELLeft(newValue, true);
      }
    });
  }
  // Botones Right
  if (btnMaxR) {
    btnMaxR.addEventListener('click', () => {
      updateFUELRight(25, true); // Full: 25 gal
    });
  }
  if (btnMidR) {
    btnMidR.addEventListener('click', () => {
      updateFUELRight(12.5, true); // Half: 12.5 gal
    });
  }
  if (btnMinR) {
    btnMinR.addEventListener('click', () => {
      updateFUELRight(0, true); // Empty: 0
    });
  }
  if (btnPlusR) {
    btnPlusR.addEventListener('click', () => {
      const slider = document.getElementById('fuel-slider-right');
      if (slider) {
        const newValue = Math.min(25, parseFloat(slider.value) + 1);
        updateFUELRight(newValue, true);
      }
    });
  }
  if (btnMinusR) {
    btnMinusR.addEventListener('click', () => {
      const slider = document.getElementById('fuel-slider-right');
      if (slider) {
        const newValue = Math.max(0, parseFloat(slider.value) - 1);
        updateFUELRight(newValue, true);
      }
    });
  }
}

function updateFUELLeft(fuel, sendToESP = false) {
  const slider = document.getElementById('fuel-slider-left');
  const valueLabel = document.getElementById('fuel-value-left');
  const sliderLabel = document.getElementById('fuel-slider-value-label-left');
  const needle = document.getElementById('fuel_Lneedle');
  if (!needle) {
    console.warn('No se encontró la aguja de FUEL en el DOM.');
    return;
  }
  // Si se llama sin argumento, usar el valor del slider
  if (fuel === undefined && slider) {
    fuel = parseFloat(slider.value);
    sendToESP = true;
  }
  // Actualizar valor en el centro del instrumento
  if (valueLabel) {
    valueLabel.textContent = fuel.toFixed(1);
  }
  // Sincronizar el slider SOLO si la actualización NO viene del usuario (sendToESP = false)
  if (!sendToESP && slider) {
    slider.value = fuel;
  }
  // Actualizar etiqueta del slider
  if (sliderLabel) {
    sliderLabel.textContent = fuel.toFixed(1);
  }
  // Calcular el ángulo de la aguja utilizando la función fuelToAngleLeft
  const angle = fuelToAngleLeft(fuel);
  needle.style.transform = `rotate(${angle}deg)`;
  // Enviar el valor de FUEL al ESP32 solo si se indica
  if (sendToESP) {
sendFUELToESP32("fuelValueLeft", fuel);
  }
}

function updateFUELRight(fuel, sendToESP = false) {
  const slider = document.getElementById('fuel-slider-right');
  const valueLabel = document.getElementById('fuel-value-right');
  const sliderLabel = document.getElementById('fuel-slider-value-label-right');
  const needle = document.getElementById('fuel_Rneedle');
  if (!needle) {
    console.warn('No se encontró la aguja de FUEL en el DOM.');
    return;
  }
  // Si se llama sin argumento, usar el valor del slider
  if (fuel === undefined && slider) {
    fuel = parseFloat(slider.value);
    sendToESP = true;
  }
  // Actualizar valor en el centro del instrumento
  if (valueLabel) {
    valueLabel.textContent = fuel.toFixed(1);
  }
  // Sincronizar el slider SOLO si la actualización NO viene del usuario (sendToESP = false)
  if (!sendToESP && slider) {
    slider.value = fuel;
  }
  // Actualizar etiqueta del slider
  if (sliderLabel) {
    sliderLabel.textContent = fuel.toFixed(1);
  }
  // Calcular el ángulo de la aguja utilizando la función fuelToAngleRight
  const angle = fuelToAngleRight(fuel);
  needle.style.transform = `rotate(${angle}deg)`;
  // Enviar el valor de FUEL al ESP32 solo si se indica
  if (sendToESP) {
sendFUELToESP32("fuelValueRight", fuel);
  }
}

function sendFUELToESP32(side, fuel) {
  // Enviar el valor de FUEL al ESP32 vía WebSocket
  if (window.ws && window.ws.readyState === WebSocket.OPEN) {
    const data = JSON.stringify({ [side]: fuel });
    window.ws.send(data);
    console.log(`Enviando FUEL al ESP32 (${side}): ${fuel} °F`);
  } else {
    console.warn('WebSocket no está conectado.');
  }
}

// Mapea el valor de FUEL (0-25) al ángulo de la aguja (225-315 grados)
function fuelToAngleRight(fuel) {
  const minValue = 0;
  const maxValue = 25;
  const minAngle = 225; // Ángulo mínimo para 0 Gls
  const maxAngle = 315; // Ángulo máximo para 25 Gls
  if (fuel < minValue) fuel = minValue;
  if (fuel > maxValue) fuel = maxValue;
  return minAngle - ((fuel - minValue) * (maxAngle - minAngle)) / (maxValue - minValue) - 180;
}
// Mapea el valor de FUEL (0-25) al ángulo de la aguja (135-90 grados)
function fuelToAngleLeft(fuel) {
  const minValue = 0;
  const maxValue = 25;
  const minAngle = 135; // Ángulo mínimo para 0 Gls
  const maxAngle = 45; // Ángulo máximo para 25 Gls
  if (fuel < minValue) fuel = minValue;
  if (fuel > maxValue) fuel = maxValue;
  return minAngle - ((fuel - minValue) * (maxAngle - minAngle)) / (maxValue - minValue) + 180;
}