// functions_variometer.js: lógica simple y modular para Variometer

let isUserSlidingVariometer = false;
function updateVariometerAndValue(variometer) {
  // Rango: -2000 (mínimo) a 2000 (máximo)
  // 0 a 2000: 270° a 54° (horario)
  // 0 a -2000: 270° a 126° (antihorario)
  let angle = 0;
  if (variometer >= 0) {
    // 0 a 2000 → 216° a 144°
    angle =   (variometer / 100) * 144;
  } else {
    // 0 a -200 → 270° a 126°
    angle = -(Math.abs(variometer) / 100) * 144;
  }
  const agujaDiv = document.getElementById('aguja-variometer');
  if (agujaDiv) {
    agujaDiv.style.setProperty('--needle-rotation', `${angle}deg`);
  }
  document.getElementById("variometer-value").textContent = Math.round(variometer*20);
  const variometerSlider = document.getElementById("variometer-slider");
  const variometerSliderValue = document.getElementById("variometer-slider-value");
  // Solo actualizar el slider si el usuario NO está interactuando
  if (variometerSlider && !isUserSlidingVariometer) {
    if (Math.abs(variometerSlider.value - variometer) > 1) {
      variometerSlider.value = variometer;
      variometerSliderValue.textContent = Math.round(variometer*20);
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
      updateVariometerAndValue(value*20);
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
