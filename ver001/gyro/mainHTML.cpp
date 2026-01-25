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
    width: 480px;
    height: 480px;
  }


  /* El dial y el avión se posicionan en el contenedor */
  #gyro-dial {
    width: 480px;
    height: 480px;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    pointer-events: none;
    transition: transform 0.2s linear;
  }
  #gyro-plane {
    width: 360px;
    height: 360px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
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
<h2>Calibración Gyro Direccional</h2>


<div style="display: flex; justify-content: center; align-items: flex-start; gap: 60px; margin-bottom: 32px;">

<div id="container">
  <img id="gyro-dial" src="https://1drv.ms/i/c/976676efea6bc5cc/IQS6IV_iVMDrQofzbJgP4qC8Ac8SC87Vi3K2-GLMMz5h75Y" alt="Dial Compass">
  <img id="gyro-plane" src="https://1drv.ms/i/c/976676efea6bc5cc/IQS51yrGDcoISY6P8tBppggaAf8jaDSvFw8DBgSEzFKYVaM?width=360&height=360" alt="Avion">
</div>

</div>






<!-- Control deslizante para Gyro Direccional     -->
<div class="slider-container">
  <input type="range" min="0" max="360" value="0" step="0.1" class="slider" id="vs-slider">
  <div class="slider-value" id="vs-slider-value">0.0</div>
</div>


<script>
let ws = new WebSocket("ws://" + location.hostname + ":81");


// Al cargar la página, mostrar el dial del gyro en 0.
window.addEventListener('DOMContentLoaded', function() {
  updateGyroDial(0);
});

// Mapea el valor de Gyro Direccional (0-360)
function manifoldToAngle(manifold) {
  if (manifold < 0) manifold = 0;
  if (manifold > 360) manifold = 360;
  return manifold;
}

function updateGyroDial(manifold) {
  let angle = manifoldToAngle(manifold);
  const dial = document.getElementById("gyro-dial");
  if (dial) {
    dial.style.transform = `rotate(${-angle}deg)`;
  }
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
  // Siempre actualizar el dial y el slider con el valor recibido para sincronizar todas las páginas
  if (vsSlider && manifold >= 0 && manifold <= 360) {
    updateGyroDial(manifold);
    vsSlider.value = manifold;
    document.getElementById("vs-slider-value").textContent = parseFloat(manifold).toFixed(1);
  }
};



// Control deslizante para Gyro Direccional
const vsSlider = document.getElementById("vs-slider");
const varManifold = document.getElementById("vs-slider-value");

vsSlider.addEventListener("mousedown", function() { userIsSliding = true; });
vsSlider.addEventListener("touchstart", function() { userIsSliding = true; });
vsSlider.addEventListener("mouseup", function() { userIsSliding = false; });
vsSlider.addEventListener("touchend", function() { userIsSliding = false; });


vsSlider.addEventListener("input", function() {
  varManifold.textContent = parseFloat(this.value).toFixed(1);
  updateGyroDial(Number(this.value)); // Actualiza el dial localmente
  // Enviar valor al ESP32 por WebSocket
  if(ws.readyState === 1) {
    ws.send(JSON.stringify({ setManifold: Number(this.value) }));
  }
});
</script>

</body>
)rawliteral";
