#include <pgmspace.h>

const char MAIN_page[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Calibración Manifold</title>
<style>
  body {
    background: #082032;
    color: #eee;
    font-family: Arial, sans-serif;
    text-align: center;
    padding-top: 30px;
  }

  #container {
    display: inline-block;
    position: relative;
    width: 300px;
    height: 300px;
  }


  .needle {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 120px solid #ffcc33;
    transform-origin: bottom center;
    transform: translate(-50%, -100%) rotate(0deg);
    filter: drop-shadow(0 0 4px #000);
      z-index: 2;
  }

  .needle-center {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #e92084, #a20202);
    transform: translate(-50%, -50%);
    box-shadow: 0 0 4px #000;
    border: 2px solid #222;
  }

  #rpm-value {
    position: absolute;
     left: 50%; 
     top: 50%;
     transform: translate(-50%, -50%);
     font-size: 24px;
    margin-top: 0;
    width: 80px;
    text-align: center;
    z-index: 10;
    background: rgba(8,32,50,0.7);
    border-radius: 6px;
    pointer-events: none;
  }

  /* Estilos para el control deslizante */
  .slider-container {
    margin-top: 20px;
    color: #ffffff;
  }

  .slider {
    -webkit-appearance: none;
    width: 75%;
    height: 20px;
    border-radius: 5px;
    background: #444;
    outline: none;
    opacity: 0.7;
    transition: opacity .2s;
  }

  .slider:hover {
    opacity: 1;
  }

  .slider-value {
    font-size: 18px;
    margin-top: 10px;
  }
</style>
</head>

<body>
<h2>Calibración Manifold</h2>


<div style="display: flex; justify-content: center; align-items: flex-start; gap: 60px; margin-bottom: 32px;">
  <div id="container">
    <img src="https://1drv.ms/i/c/976676efea6bc5cc/IQRLPXSugbvLTZCzsLApIyEkAUcbCRI7xN_9FUa2S3_r7CU?width=360&height=360" 
      style="width:300px;height:300px;position:absolute;top:0;left:0;z-index:1;pointer-events:none;" 
      alt="Indicador Manifold">
    <div id="needle" class="needle"></div>
    <div class="needle-center"></div>
    <div id="airspeed-value" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:32px;width:100px;text-align:center;z-index:20;background:rgba(8,32,50,0.85);border-radius:10px;pointer-events:none;color:#fff;box-shadow:0 0 8px #000;">--</div>
    
  </div>

</div>






<!-- Control deslizante para Manifold -->
<div class="slider-container">
  <input type="range" min="10" max="50" value="10" step="0.1" class="slider" id="vs-slider">
  <div class="slider-value" id="vs-slider-value">10.0</div>
</div>


<script>
let ws = new WebSocket("ws://" + location.hostname + ":81");

// Al cargar la página, mostrar la aguja en 10 (mínimo de Manifold)
window.addEventListener('DOMContentLoaded', function() {
  updateNeedleAndValue(10);
});

// Mapea el valor de Manifold (10-50) al ángulo de la aguja (200° a 160°) en sentido horario, recorriendo 320°
function manifoldToAngle(manifold) {
  const minValue = 10;
  const maxValue = 50;
  const minAngle = 200;
  const maxAngle = 160;
  if (manifold < minValue) manifold = minValue;
  if (manifold > maxValue) manifold = maxValue;
  // Recorrido horario de 320°: de 200° a 160° pasando por 360°/0°
  // Si el ángulo final es menor que el inicial, sumamos 360 para el recorrido
  let angleSpan = (maxAngle + 360 - minAngle) % 360; // 160 + 360 - 200 = 320
  let angle = (minAngle + ((manifold - minValue) * angleSpan) / (maxValue - minValue)) % 360;
  return angle;
}

function updateNeedleAndValue(manifold) {
  let angle = manifoldToAngle(manifold);
  document.getElementById("needle").style.transform =
    `translate(-50%, -100%) rotate(${angle}deg)`;
  document.getElementById("airspeed-value").textContent = parseFloat(manifold).toFixed(1);
  // Actualizar el valor del slider y su display si cambia por rutina automática
  const vsSlider = document.getElementById("vs-slider");
  const vsSliderValue = document.getElementById("vs-slider-value");
  if (vsSlider && Math.abs(vsSlider.value - manifold) > 0.05) {
    vsSlider.value = manifold;
    vsSliderValue.textContent = parseFloat(manifold).toFixed(1);
  }
}


// Solo actualiza la aguja desde WebSocket si el valor recibido es diferente al del slider

// Bandera para saber si el usuario está moviendo el slider
let userIsSliding = false;

ws.onmessage = (msg) => {
  let data = JSON.parse(msg.data);
  let manifold = data.manifold !== undefined ? data.manifold : data.airspeed;
  const vsSlider = document.getElementById("vs-slider");
  // Si el usuario NO está moviendo el slider y el valor recibido es válido, actualiza la aguja
  if (!userIsSliding && vsSlider && manifold >= 10 && manifold <= 50) {
    updateNeedleAndValue(manifold);
    vsSlider.value = manifold;
    document.getElementById("vs-slider-value").textContent = Math.round(manifold);
  }
};



// Control deslizante para Manifold
const vsSlider = document.getElementById("vs-slider");
const varManifold = document.getElementById("vs-slider-value");

vsSlider.addEventListener("mousedown", function() { userIsSliding = true; });
vsSlider.addEventListener("touchstart", function() { userIsSliding = true; });
vsSlider.addEventListener("mouseup", function() { userIsSliding = false; });
vsSlider.addEventListener("touchend", function() { userIsSliding = false; });

vsSlider.addEventListener("input", function() {
  varManifold.textContent = parseFloat(this.value).toFixed(1);
  updateNeedleAndValue(Number(this.value)); // Actualiza la aguja localmente
  // Enviar valor al ESP32 por WebSocket
  if(ws.readyState === 1) {
    ws.send(JSON.stringify({ setManifold: Number(this.value) }));
  }
});
</script>

</body>
)rawliteral";
