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
  // Event listener para el slider
  const sliderL = document.getElementById('fuel-slider-left');
  if (sliderL) {
    sliderL.addEventListener('input', () => {
      updateFUEL(parseFloat(sliderL.value), true); // true = desde el slider, enviar al ESP32
    });
  } else {
    console.warn('No se encontró el slider de FUEL IZQ en el DOM.');
  }
  const sliderR = document.getElementById('fuel-slider-right');
  if (sliderR) {
    sliderR.addEventListener('input', () => {
      updateFUEL(parseFloat(sliderR.value), true); // true = desde el slider, enviar al ESP32
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
  
  if (btnMaxL) {
    btnMaxL.addEventListener('click', () => {
      updateCHT(25, true); // Máximo: 25 °C
    });
  }
  if (btnMidL) {
    btnMidL.addEventListener('click', () => {
      updateCHT(15, true); // Medio: 15 °C
    });
  }
  if (btnMinL) {
    btnMinL.addEventListener('click', () => {
      updateCHT(0, true); // Mínimo: 0 °C
    });
  }
  if (btnPlusL) {
    btnPlusL.addEventListener('click', () => {
      const slider = document.getElementById('cht-slider');
      if (slider) {
        const newValue = Math.min(25, parseFloat(slider.value) + 1); // +1 °C
        updateCHT(newValue, true);
      }
    });
  }
  if (btnMinusL) {
    btnMinusL.addEventListener('click', () => {
      const slider = document.getElementById('cht-slider');
      if (slider) {
        const newValue = Math.max(0, parseFloat(slider.value) - 1); // -1 °C
        updateCHT(newValue, true);
      }
    });
  }
  if (btnMaxR) {
    btnMaxR.addEventListener('click', () => {
      updateCHT(25, true); // Máximo: 25 °C
    });
  }
  if (btnMidR) {
    btnMidR.addEventListener('click', () => {
      updateCHT(15, true); // Medio: 15 °C
    });
  }
  if (btnMinR) {
    btnMinR.addEventListener('click', () => {
      updateCHT(0, true); // Mínimo: 0 °C
    });
  }
  if (btnPlusR) {
    btnPlusR.addEventListener('click', () => {
      const slider = document.getElementById('cht-slider');
      if (slider) {
        const newValue = Math.min(25, parseFloat(slider.value) + 1); // +1 °C
        updateCHT(newValue, true);
      }
    });
  }
  if (btnMinusR) {
    btnMinusR.addEventListener('click', () => {
      const slider = document.getElementById('cht-slider');
      if (slider) {
        const newValue = Math.max(0, parseFloat(slider.value) - 1); // -1 °C
        updateCHT(newValue, true);
      }
    });
  }
}

function updateFUELLeft(fuel, sendToESP = false) {
  const slider = document.getElementById('fuel-slider-left');
  const valueLabel = document.getElementById('fuel-value-left');
  const sliderLabel = document.getElementById('fuel-slider-value-label-left');
  const needle = document.getElementById('fuel_needle_left');
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
sendFUELToESP32("leftFuel", fuel);
  }
}

function updateFUELRight(fuel, sendToESP = false) {
  const slider = document.getElementById('fuel-slider-right');
  const valueLabel = document.getElementById('fuel-value-right');
  const sliderLabel = document.getElementById('fuel-slider-value-label-right');
  const needle = document.getElementById('fuel_needle_right');
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
sendFUELToESP32("rightFuel", fuel);
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
function fuelToAngleLeft(fuel) {
  const minValue = 0;
  const maxValue = 25;
  const minAngle = 225; // Ángulo mínimo para 0 Gls
  const maxAngle = 315; // Ángulo máximo para 25 Gls
  if (fuel < minValue) fuel = minValue;
  if (fuel > maxValue) fuel = maxValue;
  return minAngle + ((fuel - minValue) * (maxAngle - minAngle)) / (maxValue - minValue);
}
// Mapea el valor de FUEL (0-25) al ángulo de la aguja (135-90 grados)
function fuelToAngleRight(fuel) {
  const minValue = 0;
  const maxValue = 25;
  const minAngle = 135; // Ángulo mínimo para 0 Gls
  const maxAngle = 90; // Ángulo máximo para 25 Gls
  if (fuel < minValue) fuel = minValue;
  if (fuel > maxValue) fuel = maxValue;
  return minAngle + ((fuel - minValue) * (maxAngle - minAngle)) / (maxValue - minValue);
}