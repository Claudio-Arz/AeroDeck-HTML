// functions_variometer.js: lógica simple y modular para Variometer

let isUserSlidingVariometer = false;
function updateVariometerAndValue(variometer) {
  // Rango: -20 (mínimo) a 20 (máximo)
  // Ángulo base: 270° (cero), ±135°
  // Mapeo: -20 → 135°, 0 → 270°, 20 → 405°
  let angle = 270 + (variometer / 20) * 135;
  const needle = document.querySelector('.needle-variometer');
  if (needle) {
    needle.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
  }
  document.getElementById("variometer-value").textContent = Math.round(variometer);
  const variometerSlider = document.getElementById("variometer-slider");
  const variometerSliderValue = document.getElementById("variometer-slider-value");
  // Solo actualizar el slider si el usuario NO está interactuando
  if (variometerSlider && !isUserSlidingVariometer) {
    if (Math.abs(variometerSlider.value - variometer) > 1) {
      variometerSlider.value = variometer;
      variometerSliderValue.textContent = Math.round(variometer);
    }
  }
}

function setupVariometerControls(ws) {


  const variometerSlider = document.getElementById("variometer-slider");
  const variometerSliderValue = document.getElementById("variometer-slider-value");
  
  if (variometerSlider && variometerSliderValue) {
    variometerSlider.addEventListener("input", function(e) {
      isUserSlidingVariometer = true;
      const value = parseInt(e.target.value);
      variometerSliderValue.textContent = value;
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
      if (data.variometer !== undefined) updateVariometerAndValue(data.variometer);
    }
  };
}
