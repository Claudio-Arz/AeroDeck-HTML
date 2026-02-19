/* 
  Sistema de Instrumentos para AeroDeck - Versión 0.03
  Autor: Claudio Arzamendia Systems
  Fecha: 2026-02-17 02:43:39

  Librería functions_FuelFlow.js - Funciones para el instrumento de flujo de combustible (Fuel Flow).
    Funciones principales:

    - updateFuelFlow(fuelFlow, noice): Actualiza la aguja y los valores numéricos del instrumento según el valor de flujo de combustible recibido o el slider. El parámetro "noice" indica si el modo "noice" está activo, lo que puede afectar la apariencia del instrumento.
    - initFuelFlowControls(): Inicializa las referencias a los elementos del DOM y configura los event listeners para los controles interactivos del Fuel Flow, como el slider y los botones de valores predefinidos.

  El instrumento de flujo de combustible muestra la cantidad de combustible que el motor 
  está consumiendo en tiempo real. El valor se representa en galones por hora (GPH) y se 
  muestra en una escala que va de 0 a 100 GPH. El instrumento tiene una aguja que se mueve 
  para indicar el flujo actual, y un valor numérico que muestra la cantidad exacta de 
  combustible consumido. El control del flujo de combustible se puede ajustar mediante 
  un slider o botones predefinidos para valores comunes de consumo. Al cambiar el valor, 
  se anima la aguja del instrumento y se envía el nuevo valor al ESP32 para que lo refleje 
  en el instrumento físico y en todas las terminales conectadas.


*/

function initFuelFlowControls() {
  // Event listener para el slider
  const slider = document.getElementById('ff-slider');
  if (slider) {
    slider.addEventListener('input', () => {
      updateFuelFlow(parseFloat(slider.value), true); // true = desde el slider, enviar al ESP32
    });
  } else {
    console.warn('No se encontró el slider de Fuel Flow en el DOM.');
  }
  
  // Event listeners para los botones de valores predefinidos
  const btnMax = document.getElementById('ff-slider-max');
  const btnMid = document.getElementById('ff-slider-mid');
  const btnMin = document.getElementById('ff-slider-min');
  const btnPlus = document.getElementById('ff-btn-plus');
  const btnMinus = document.getElementById('ff-btn-minus');
  
  if (btnMax) {
    btnMax.addEventListener('click', () => {
      updateFuelFlow(20, true); // Máximo: 20 GPH
    });
  }
  if (btnMid) {
    btnMid.addEventListener('click', () => {
      updateFuelFlow(10, true); // Medio: 10 GPH
    });
  }
  if (btnMin) {
    btnMin.addEventListener('click', () => {
      updateFuelFlow(0, true); // Mínimo: 0 GPH
    });
  }
  if (btnPlus) {
    btnPlus.addEventListener('click', () => {
      const slider = document.getElementById('ff-slider');
      if (slider) {
        const newValue = Math.min(20, parseFloat(slider.value) + 0.1); // +0.1 GPH
        updateFuelFlow(newValue, true);
      }
    });
  }
  if (btnMinus) {
    btnMinus.addEventListener('click', () => {
      const slider = document.getElementById('ff-slider');
      if (slider) {
        const newValue = Math.max(0, parseFloat(slider.value) - 0.1); // -0.1 GPH
        updateFuelFlow(newValue, true);
      }
    });
  }
}

function updateFuelFlow(fuelFlow, sendToESP = false) {
  const slider = document.getElementById('ff-slider');
  const valueLabel = document.getElementById('ff-value');
  const sliderLabel = document.getElementById('ff-slider-value-label');
  const needle = document.getElementById('ff_needle');
  
  // Si se llama sin argumento, usar el valor del slider
  if (fuelFlow === undefined && slider) {
    fuelFlow = parseFloat(slider.value);
    sendToESP = true;
  }
  // Actualizar valor en el centro del instrumento
  if (valueLabel) {
    valueLabel.textContent = fuelFlow.toFixed(1);
  }
  // Sincronizar el slider SOLO si la actualización NO viene del usuario (sendToESP = false)
  if (!sendToESP && slider) {
    slider.value = fuelFlow;
  }
  // Actualizar etiqueta del slider
  if (sliderLabel) {
    sliderLabel.textContent = fuelFlow.toFixed(1);
  }
  // Calcular el ángulo de la aguja utilizando la función fuelFlowToAngle
  const angle = fuelFlowToAngle(fuelFlow);
  if (needle) {
    needle.style.transform = `rotate(${angle}deg)`;
  }
  // Enviar el valor de Fuel Flow al ESP32 solo si se indica
  if (sendToESP) {
    sendFuelFlowToESP32(fuelFlow);
  }
}

function sendFuelFlowToESP32(fuelFlow) {
  // Enviar el valor de Fuel Flow al ESP32 vía WebSocket
  if (window.ws && window.ws.readyState === WebSocket.OPEN) {
    const data = JSON.stringify({ fuelFlow: fuelFlow });
    window.ws.send(data);
    console.log(`Enviando Fuel Flow al ESP32: ${fuelFlow} GPH`);
  } else {
    console.warn('WebSocket no está conectado.');
  }
}
// Mapea el valor de Fuel Flow (0-20) al ángulo de la aguja (270-90)
function fuelFlowToAngle(fuelFlow) {
  const minValue = 0;
  const maxValue = 20;
  const minAngle = 270; // Ángulo mínimo para 0 GPH
  const maxAngle = 90; // Ángulo máximo para 20 GPH
  if (fuelFlow < minValue) fuelFlow = minValue;
  if (fuelFlow > maxValue) fuelFlow = maxValue;
  return minAngle - ((fuelFlow - minValue) * (minAngle - maxAngle)) / (maxValue - minValue);
}