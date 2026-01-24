// functions_variometer.js: lógica simple y modular para Variometer

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

function setupVariometerControls(ws) {
  const variometerSlider = document.getElementById("variometer-slider");
  const variometerSliderValue = document.getElementById("variometer-slider-value");
  if (variometerSlider && variometerSliderValue) {
    variometerSlider.addEventListener("input", function(e) {
      isUserSlidingVariometer = true;
      const value = parseInt(e.target.value); // -100 a 100
      updateVariometerAndValue(value);
      if(ws.readyState === 1) {
        ws.send(JSON.stringify({ setVariometerSpeed: value }));
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

