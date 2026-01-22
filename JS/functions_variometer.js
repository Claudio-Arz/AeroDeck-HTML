// functions_variometer.js: lógica simple y modular para Variometer

let isUserSlidingVariometer = false;
function updateVariometerAndValue(variometer) {
  // Rango: -20 (mínimo) a 20 (máximo)
  // Ángulo base: 270° (abajo), 0° (arriba), 0 en el centro (90°)
  // Mapeo: -20 → 270°, 0 → 90°, 20 → -90°
  let angle = 90 - ((variometer / 20) * 180); // -20 a 20 mapea 270° a -90°
  document.getElementById("needle").style.transform =
    `translate(-50%, -100%) rotate(${angle}deg)`;
  document.getElementById("variometer-value").textContent = Math.round(variometer);
  const variometerSlider = document.getElementById("variometer-slider");
  const variometerSliderValue = document.getElementById("variometer-slider-value");
  if (variometerSlider && Math.abs(variometerSlider.value - variometer) > 1) {
    variometerSlider.value = variometer;
    variometerSliderValue.textContent = Math.round(variometer);
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
    variometerSlider.addEventListener("change", function(e) {
      isUserSlidingVariometer = false;
    });
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
