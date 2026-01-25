#include <pgmspace.h>

const char MAIN_page[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Calibración RPM</title>
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
<h2>Calibración RPM</h2>


<div style="display: flex; justify-content: center; align-items: flex-start; gap: 60px; margin-bottom: 32px;">
  <div id="container">
    <img src="https://1drv.ms/i/c/976676efea6bc5cc/IQSq7R2SSyVBTr7XIEyJNr9iAdnoYbqY_Gtz4MnhCUnEMxU?width=480&height=480" style="width:300px;height:300px;position:absolute;top:0;left:0;z-index:1;pointer-events:none;" alt="Tacómetro RPM">
    <div id="needle" class="needle"></div>
    <div class="needle-center"></div>
    <div id="rpm-value" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:32px;width:100px;text-align:center;z-index:20;background:rgba(8,32,50,0.85);border-radius:10px;pointer-events:none;color:#fff;box-shadow:0 0 8px #000;">--</div>
  </div>
  <button id="start-btn" style="height:48px;font-size:18px;padding:8px 32px;align-self:center;">Start</button>
</div>






<!-- Control deslizante para motor -->
<div class="slider-container">
  <input type="range" min="0" max="3000" value="0" class="slider" id="vs-slider">
  <div class="slider-value" id="vs-slider-value">0</div>
</div>

<script>
let ws = new WebSocket("ws://" + location.hostname + ":81");


function updateNeedleAndValue(rpm) {
  // 0 rpm = 225°, 3000 rpm = 495° (225° + 270°), recorre 270° antihorario
  let angle = 225 + (Math.max(0, Math.min(rpm, 3000)) * 270) / 3000;
  document.getElementById("needle").style.transform =
    `translate(-50%, -100%) rotate(${angle}deg)`;
  document.getElementById("rpm-value").textContent = Math.round(rpm);
  // Actualizar el valor del slider y su display si cambia por rutina automática
  const vsSlider = document.getElementById("vs-slider");
  const vsSliderValue = document.getElementById("vs-slider-value");
  if (vsSlider && Math.abs(vsSlider.value - rpm) > 1) {
    vsSlider.value = rpm;
    vsSliderValue.textContent = Math.round(rpm);
  }
}

ws.onmessage = (msg) => {
  let data = JSON.parse(msg.data);
  let rpm = data.rpm;
  window.currentRPM = rpm;
  updateNeedleAndValue(rpm);
};

// Al presionar el botón Start, enviar mensaje al ESP32 para que ejecute la rutina
document.getElementById("start-btn").addEventListener("click", function() {
  if(ws.readyState === 1) {
    ws.send(JSON.stringify({ startMotorRoutine: true }));
  }
});
</script>

<script>
// Control deslizante para motor
const vsSlider = document.getElementById("vs-slider");
const varRPM = document.getElementById("vs-slider-value");
vsSlider.addEventListener("input", function() {
  varRPM.textContent = this.value;
  // Enviar valor al ESP32 por WebSocket
  if(ws.readyState === 1) {
    ws.send(JSON.stringify({ setRPMSpeed: Number(this.value) }));
  }
});
</script>

</body>
</html>
)rawliteral";
