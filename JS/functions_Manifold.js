/* 
  Sistema de Instrumentos para AeroDeck - Versión 0.03
  Autor: Claudio Arzamendia Systems
  Fecha: 2026-02-17 14:51:29

  Librería functions_Manifold.js - Funciones para el instrumento de manifold.
    Funciones principales:

    - updateManifold(manifold, noice): Actualiza la aguja y los valores numéricos 
    del instrumento según el valor de manifold recibido o el slider. El parámetro "noice" indica si el modo "noice" está activo, lo que puede afectar la apariencia del instrumento.
    - initManifoldControls(): Inicializa las referencias a los elementos del DOM y configura los event listeners para los controles interactivos del manifold, como el slider y los botones de valores predefinidos.

  El instrumento de manifold muestra la presión del colector de admisión del motor en tiempo real. El valor se representa en pulgadas de mercurio (IN Hg ALg) y se muestra en una escala que va de 10 a 50 IN Hg ALg. El instrumento tiene una aguja que se mueve para indicar la presión actual, y un valor numérico que muestra la cantidad exacta de presión. El control del manifold se puede ajustar mediante un slider o botones predefinidos para valores comunes de presión. Al cambiar el valor, se anima la aguja del instrumento y se envía el nuevo valor al ESP32 para que lo refleje en el instrumento físico y en todas las terminales conectadas.


*/

function initManifoldControls() {
  // Event listener para el slider
  const slider = document.getElementById('mf-slider');
  if (slider) {
    slider.addEventListener('input', () => {
      updateManifold(parseFloat(slider.value), true); // true = desde el slider, enviar al ESP32
    });
  } else {
    console.warn('No se encontró el slider de Manifold en el DOM.');
  }
  
  // Event listeners para los botones de valores predefinidos
  const btnMax = document.getElementById('mf-slider-max');
  const btnMid = document.getElementById('mf-slider-mid');
  const btnMin = document.getElementById('mf-slider-min');
  const btnPlus = document.getElementById('mf-btn-plus');
  const btnMinus = document.getElementById('mf-btn-minus');
  
  if (btnMax) {
    btnMax.addEventListener('click', () => {
      updateManifold(50, true); // Máximo: 50 IN Hg ALg
    });
  }
  if (btnMid) {
    btnMid.addEventListener('click', () => {
      updateManifold(30, true); // Medio: 30 IN Hg ALg
    });
  }
  if (btnMin) {
    btnMin.addEventListener('click', () => {
      updateManifold(10, true); // Mínimo: 10 IN Hg ALg
    });
  }
  if (btnPlus) {
    btnPlus.addEventListener('click', () => {
      const slider = document.getElementById('mf-slider');
      if (slider) {
        const newValue = Math.min(50, parseFloat(slider.value) + 0.1); // +0.1 IN Hg ALg
        updateManifold(newValue, true);
      }
    });
  }
  if (btnMinus) {
    btnMinus.addEventListener('click', () => {
      const slider = document.getElementById('mf-slider');
      if (slider) {
        const newValue = Math.max(10, parseFloat(slider.value) - 0.1); // -0.1 IN Hg ALg
        updateManifold(newValue, true);
      }
    });
  }
}

function updateManifold(manifold, sendToESP = false) {
  const slider = document.getElementById('mf-slider');
  const valueLabel = document.getElementById('mf-value');
  const sliderLabel = document.getElementById('mf-slider-value-label');
  const needle = document.getElementById('mf_needle');
  if (!needle) {
    console.warn('No se encontró la aguja de Manifold en el DOM.');
    return;
  }
  // Si se llama sin argumento, usar el valor del slider
  if (manifold === undefined && slider) {
    manifold = parseFloat(slider.value);
    sendToESP = true;
  }
  // Actualizar valor en el centro del instrumento
  if (valueLabel) {
    valueLabel.textContent = manifold.toFixed(1);
  }
  // Sincronizar el slider SOLO si la actualización NO viene del usuario (sendToESP = false)
  if (!sendToESP && slider) {
    slider.value = manifold;
  }
  // Actualizar etiqueta del slider
  if (sliderLabel) {
    sliderLabel.textContent = manifold.toFixed(1);
  }
  // Calcular el ángulo de la aguja utilizando la función manifoldToAngle
  const angle = manifoldToAngle(manifold);
  needle.style.transform = `rotate(${angle}deg)`;
  // Enviar el valor de Manifold al ESP32 solo si se indica
  if (sendToESP) {
    sendManifoldToESP32(manifold);
  }
}

function sendManifoldToESP32(manifold) {
  // Enviar el valor de Manifold al ESP32 vía WebSocket
  if (window.ws && window.ws.readyState === WebSocket.OPEN) {
    const data = JSON.stringify({ manifold: manifold });
    window.ws.send(data);
    console.log(`Enviando Manifold al ESP32: ${manifold} IN Hg ALg`);
  } else {
    console.warn('WebSocket no está conectado.');
  }
}
// Mapea el valor de Manifold (10-50) al ángulo de la aguja (200-160 grados)
function manifoldToAngle(manifold) {
  const minValue = 10;
  const maxValue = 50;
  const minAngle = 200; // Ángulo mínimo para 10 IN Hg ALg
  const maxAngle = 160; // Ángulo máximo para 50 IN Hg ALg
  if (manifold < minValue) manifold = minValue;
  if (manifold > maxValue) manifold = maxValue;
  return minAngle + (((manifold - minValue) * (minAngle - maxAngle)) / (maxValue - minValue)*10);
}