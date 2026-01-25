/*
  Sistema AeroDeck
  Claudio Arzamendia Systems
  Tablero completo con intrumental aeronáutico
  para ajustar instrumentos analógicos.

  2026-01-24 19:50:18
  En el sistema vamos a usar librerías estándar de JS y CSS.
  El código JS se divide en módulos lógicos por instrumento.
  Cada módulo tiene funciones para actualizar la UI y
  configurar los controles. El WebSocket se maneja en mainHTML.html
  y los mensajes se distribuyen a los módulos según el contenido.

  functions_variometer.js: lógica simple y modular para Variometer.
  Cada función debe tener una buena documentación. Indicando en comienzo de la 
  función qué hace, y en los parámetros qué espera y qué devuelve,
  o que ejecuta.

*/


/*
  Actualiza la aguja del variometer y el valor numérico.
  Parámetros:
    variometer: número, valor de variometer entre -100 y 100.

    Comunicaciones:
      No envía ni recibe mensajes WebSocket.

    Issues:
      - La aguja no se mueve suavemente, sino en saltos.


*/
let isUserSlidingVariometer = false;
function updateVariometerAndValue(variometer) {
  // variometer: valor recibido del backend, rango esperado -100 a 100
  // Mapeo: -100 a 100 → -2000 a 2000 para visualización
  const value = Math.round(variometer * 20); // valor mostrado
  // Ángulo: -100 a 100 → -144° a 144°
  let angle = (variometer / 100) * 144;
  const agujaDiv = document.getElementById('aguja-variometer');
  if (agujaDiv) {
    const agujaImg = agujaDiv.querySelector('img');
    if (agujaImg) {
      agujaImg.style.setProperty('--needle-rotation', `${angle}deg`);
      agujaImg.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    }
  }
  // Mostrar el valor en el centro y al pie del slider
  const valueDiv = document.getElementById("variometer-value");
  if (valueDiv) valueDiv.textContent = value;
  const variometerSliderValue = document.getElementById("variometer-slider-value");
  if (variometerSliderValue) variometerSliderValue.textContent = value;
  const variometerSlider = document.getElementById("variometer-slider");
  // Solo actualizar el slider si el usuario NO está interactuando
  if (variometerSlider && !isUserSlidingVariometer) {
    if (Math.abs(variometerSlider.value - variometer) > 1) {
      variometerSlider.value = variometer;
      if (variometerSliderValue) variometerSliderValue.textContent = value;
    }
  }
}

/*
  Configura los controles del variometer: slider de variometer.
  Parámetros:
    ws: WebSocket abierto para enviar mensajes al backend.

  Comunicaciones:
    Envía mensajes JSON:
      { verticalSpeed: valor }

    Issues:
      - Ninguno conocido.
      - Hay que mejorar la suavidad del movimiento de la aguja.
*/
function setupVariometerControls(ws) {
  const variometerSlider = document.getElementById("variometer-slider");
  const variometerSliderValue = document.getElementById("variometer-slider-value");
  if (variometerSlider && variometerSliderValue) {
    variometerSlider.addEventListener("input", function(e) {
      isUserSlidingVariometer = true;
      const value = parseInt(e.target.value); // -100 a 100
      updateVariometerAndValue(value);
      if(ws.readyState === 1) {
        ws.send(JSON.stringify({ verticalSpeed: value }));
      }
    });
    // Detectar cuando el usuario deja de interactuar con el slider
    const stopSliding = function() { isUserSlidingVariometer = false; };
    variometerSlider.addEventListener("change", stopSliding);
    variometerSlider.addEventListener("mouseup", stopSliding);
    variometerSlider.addEventListener("touchend", stopSliding);
  }
}

// Interceptar mensajes del ESP32 solo si el usuario NO está moviendo el slider
if (typeof ws !== 'undefined') {
  ws.onmessage = (msg) => {
    if (!isUserSlidingVariometer) {
      let data = {};
      try {
        data = JSON.parse(msg.data);
      } catch (e) {
        console.warn('Mensaje WebSocket no es JSON:', msg.data);
        return;
      }
      if (data.verticalSpeed !== undefined) updateVariometerAndValue(data.verticalSpeed);
    }
  };
}

