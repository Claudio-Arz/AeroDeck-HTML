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


// Inicialización segura de controles variometer
function initVariometerControls() {
  const variometerSlider = document.getElementById('variometer-slider');
  const variometerSliderValue = document.getElementById('variometer-slider-value');
  const maxButton = document.getElementById('variometer-slider-max');
  const midButton = document.getElementById('variometer-slider-mid');
  const minButton = document.getElementById('variometer-slider-min');

  if (!variometerSlider || !variometerSliderValue || !maxButton || !midButton || !minButton) {
    console.warn('No se encontraron los controles del variometer en el DOM.');
    return;
  }

  maxButton.addEventListener('click', () => {
    variometerSlider.value = 2000;
    variometerSliderValue.textContent = 2000;
    updateVariometerAndValue(2000);
    sendVerticalSpeedToESP32(2000);
  });
  midButton.addEventListener('click', () => {
    variometerSlider.value = 0;
    variometerSliderValue.textContent = 0;
    updateVariometerAndValue(0);
    sendVerticalSpeedToESP32(0);
  });
  minButton.addEventListener('click', () => {
    variometerSlider.value = -2000;
    variometerSliderValue.textContent = -2000;
    updateVariometerAndValue(-2000);
    sendVerticalSpeedToESP32(-2000);
  });
  variometerSlider.addEventListener('input', () => {
    const value = variometerSlider.value;
    variometerSliderValue.textContent = value;
    updateVariometerAndValue(value);
    sendVerticalSpeedToESP32(value);
  });
}
// función para enviar los datos al ESP32, para que calcule valores para el altímetro.
// a travez del ws abierto con el ESP32.
// Espera a que la variable global ws esté disponible
function getWebSocketInstance(callback) {
  if (typeof window.ws !== 'undefined' && window.ws && window.ws.readyState === 1) {
    callback(window.ws);
  } else {
    // Intenta de nuevo después de un pequeño retraso
    setTimeout(() => getWebSocketInstance(callback), 100);
  }
}
function sendVerticalSpeedToESP32(verticalSpeed) {
  getWebSocketInstance(function(ws) {
    console.log('Enviando velocidad vertical al ESP32:', verticalSpeed);
    ws.send(JSON.stringify({ verticalSpeed: verticalSpeed }));
  });
}


// JavaScript específico para el instrumento Variometro
// Función para actualizar la aguja del variometro y el valor mostrado
function updateVariometerAndValue(verticalSpeedValue) {
  // Mapear el valor de velocidad vertical a un ángulo de aguja
  const minValue = -2000; // Valor mínimo de velocidad vertical (p. ej., -2000 pies/min)
  const maxValue = 2000;  // Valor máximo de velocidad vertical (p. ej., 2000 pies/min)
  const minAngle = -90;   // Ángulo mínimo de la aguja (p. ej., -90 grados)
  const maxAngle = 90;    // Ángulo máximo de la aguja (p. ej., 90 grados)
  // Asegurarse de que el valor esté dentro del rango permitido
  const clampedValue = Math.max(minValue, Math.min(maxValue, verticalSpeedValue));
  // Calcular el ángulo correspondiente
  const angle = ((clampedValue - minValue) / (maxValue - minValue)) * (maxAngle - minAngle) + minAngle;
  // Actualizar la rotación de la aguja
  const agujaVariometer = document.querySelector('.aguja-variometer img');
  agujaVariometer.style.setProperty('--needle-rotation', `${angle}deg`);
  console.log('Actualizando aguja del variometro a ángulo:', angle);
  // Actualizar el valor mostrado en el centro del instrumento
  const variometerValueLabel = document.getElementById('variometer-value');
  variometerValueLabel.textContent = `${verticalSpeedValue}`;
} 








