#include <pgmspace.h>

const char MAIN_page[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Banco de Prueba y Calibración</title>
<style>
  body {
    background: #0a1a2f;
    color: #fff;
    font-family: 'Segoe UI', Arial, sans-serif;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
  #heading-value {
    position: absolute;
     left: 50%; 
     top: 50%;
     transform: translate(-50%, -50%);
     font-size: 24px;
    margin-top: 0;
    width: 80px;
    text-align: center;
    z-index: 20;
    background: rgba(8,32,50,0.7);
    border-radius: 6px;
    pointer-events: none;
  }

  .compass-outer {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #1d3958, #111820);
    box-shadow: 0 0 10px #000, 0 0 25px #000;
    border: 4px solid #ff0000;
  }

  .compass-scale {
    position: absolute;
    inset: 10px;
    border-radius: 50%;
    background:
      repeating-conic-gradient(#ffffff 0deg 2deg, transparent 2deg 36deg),
      repeating-conic-gradient(#cccccc 0deg 1deg, transparent 1deg 18deg);
    mask-image: radial-gradient(circle, transparent 60%, black 61%);
    -webkit-mask-image: radial-gradient(circle, transparent 60%, black 61%);
  }

  .compass-numbers {
    position: absolute;
    inset: 0;
    pointer-events: none;
    font-size: 20px;
    font-weight: bold;
    color: #ffffff;
    transform: rotate(-90deg);
  }

  .compass-numbers span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform:
      translate(-50%, -50%)
      rotate(calc(var(--angle) * 1deg))
      translate(80px)
      rotate(-90deg);
  }

  .grid-container {
    display: grid;
    grid-template-rows: repeat(4, 1fr);
    grid-template-columns: repeat(8, 1fr);
    gap: 10px;
    width: 98vw;
    height: 98vh;
    box-sizing: border-box;
    padding: 1vw 1vw 1vw 1vw;
  }

  .grid-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }
  .slider {
    width: 32px;
    height: 200px;
    writing-mode: bt-lr; /* vertical */
    -webkit-appearance: slider-vertical;
    margin: 0 8px;
  }
  .slider-value {
    text-align: center;
    color: #fff;
    font-size: 18px;
    margin-top: 4px;
  }
  .needle {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 90px solid #ffcc33;
    transform-origin: bottom center;
    transform: translate(-50%, -100%) rotate(0deg);
    filter: drop-shadow(0 0 4px #000);
  }
  .needle-center {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 24px;
    height: 24px;
    background: #fff;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 15;
    box-shadow: 0 0 8px #000;
  }
  /* Asegura que los instrumentos sean cuadrados y responsivos */
  .attitude-control > #container-attitude,
  .altimetro > #container,
  .rpm > #container-rpm,
  .fuelflow > #container-fuelflow,
  .velocidad-vertical > #container-vs {
    width: 90%;
    height: 90%;
    max-width: 240px;
    max-height: 240px;
    aspect-ratio: 1/1;
    position: relative;
  }
  /* ...otros estilos existentes... */
</style>
</head>

<body>



<div class="grid-container">
  <!-- Attitude Control: Row 1, Col 2 -->
  <div class="grid-item attitude-control" style="grid-row: 1; grid-column: 2;">
    <div id="container-attitude" style="display:inline-block;position:relative;width:100%;height:100%;box-shadow:0 0 20px 10px #000a;border-radius:50%;background:#1d3958;border:4px solid #ff0000;overflow:hidden;">
      <img src="https://1drv.ms/i/c/976676efea6bc5cc/IQQzU2M_E0YgToe7MtyzE1XuAfVElY2Cc_yBrfPNQKdCQfQ?width=240&height=240" style="width:100%;height:100%;position:absolute;top:0;left:0;z-index:1;pointer-events:none;" alt="Fondo Attitude">
      <img src="https://1drv.ms/i/c/976676efea6bc5cc/IQSgyOwWIMqJQKemnjMmcEmNAQY7GJN3VYbqvPIfZx1wbvc?width=150&height=87" style="width:62.5%;height:36.25%;position:absolute;top:31.67%;left:18.75%;z-index:2;pointer-events:none;" alt="Ball Attitude">
      <img src="https://1drv.ms/i/c/976676efea6bc5cc/IQQqUQ5DIeQCRaq0NI5g1piXAT6d3C_xOJLJAMefFIL87vU?width=240&height=240" style="width:100%;height:100%;position:absolute;top:0;left:0;z-index:3;pointer-events:none;" alt="Mask Attitude">
      <img src="https://1drv.ms/i/c/976676efea6bc5cc/IQR1Y4SeFxHyQo8VApLrNuWnAfQpBIK1VWCnNTHBT48S1Vw?width=186&height=188" style="width:77.5%;height:78.33%;position:absolute;top:10.83%;left:11.25%;z-index:5;pointer-events:none;" alt="Dial Attitude">
      <img src="https://1drv.ms/i/c/976676efea6bc5cc/IQQH7oW0zJI6QKSV7TUcJsN_Aae1JOcvChh7V8_yefKkiZo?width=150&height=168" style="width:62.5%;height:70%;position:absolute;top:18.33%;left:18.75%;z-index:5;pointer-events:none;" alt="Front Attitude">
    </div>
  </div>

  <!-- Altimeter: Row 1, Col 3 (copiado de AltVerSpe/mainHTML.cpp) -->
  <div class="grid-item altimetro" style="grid-row: 1; grid-column: 3;">
    <div id="container" style="display:inline-block;position:relative;width:300px;height:300px;">
      <div class="compass-outer"></div>
      <div class="compass-scale"></div>
      <div class="compass-numbers">
        <span style="--angle:0">0</span>
        <span style="--angle:36">1</span>
        <span style="--angle:72">2</span>
        <span style="--angle:108">3</span>
        <span style="--angle:144">4</span>
        <span style="--angle:180">5</span>
        <span style="--angle:216">6</span>
        <span style="--angle:252">7</span>
        <span style="--angle:288">8</span>
        <span style="--angle:324">9</span>
      </div>
      <div id="needle" class="needle"></div>
      <div class="needle-center"></div>
      <div id="heading-value">--</div>
    </div>
  </div>

  <!-- RPM: Row 1, Col 4 -->
  <div class="grid-item rpm" style="grid-row: 1; grid-column: 4;">
    <div id="container-rpm" style="width:100%;height:100%;box-shadow:0 0 20px 10px #000a;border-radius:50%;background:#1d3958;border:4px solid #ff0000;overflow:hidden;">
      <img src="https://1drv.ms/i/c/976676efea6bc5cc/IQSq7R2SSyVBTr7XIEyJNr9iAdnoYbqY_Gtz4MnhCUnEMxU?width=240&height=240" style="width:100%;height:100%;position:absolute;top:0;left:0;z-index:1;pointer-events:none;border-radius:50%;" alt="Tacómetro RPM">
      <div id="needle-rpm" class="needle" style="border-bottom: 50% solid #ffcc33; z-index:2;"></div>
      <div class="needle-center" style="z-index:3;"></div>
      <div id="rpm-value" style="position:absolute;left:50%;top:50%;transform:translate(-50%, -50%);font-size:24px;width:80px;text-align:center;z-index:20;background:rgba(8,32,50,0.85);border-radius:10px;pointer-events:none;color:#fff;box-shadow:0 0 8px #000;">--</div>
    </div>
  </div>

  <!-- Vertical Speed: Row 2, Col 3 (copiado de AltVerSpe/mainHTML.cpp) -->
  <div class="grid-item velocidad-vertical" style="grid-row: 2; grid-column: 3;">
    <div id="container-vs" style="display:inline-block;position:relative;width:300px;height:300px;">
      <div class="compass-outer"></div>
      <div class="compass-scale"></div>
      <div class="compass-numbers">
        <span style="--angle:198">-20</span>
        <span style="--angle:234">-10</span>
        <span style="--angle:270">0</span>
        <span style="--angle:306">+10</span>
        <span style="--angle:342">+20</span>
      </div>
      <div id="needle-vs" class="needle"></div>
      <div class="needle-center"></div>
      <div id="vs-center-value" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:24px;width:80px;text-align:center;z-index:20;background:rgba(8,32,50,0.7);border-radius:6px;pointer-events:none;">--</div>
    </div>
  </div>
  <!-- Fuel Flow: Row 2, Col 4 -->
  <div class="grid-item fuelflow" style="grid-row: 2; grid-column: 4;">
    <div id="container-fuelflow" style="width:100%;height:100%;box-shadow:0 0 20px 10px #000a;border-radius:50%;background:#1d3958;border:4px solid #ff0000;overflow:hidden;">
      <img src="https://1drv.ms/i/c/976676efea6bc5cc/IQRJKkU03634TpPjSMSBZiVLAclpaGjz-kg3_TrO4R3mrXo" style="width:100%;height:100%;position:absolute;top:0;left:0;z-index:1;pointer-events:none;border-radius:50%;" alt="Indicador FuelFlow">
      <div id="needle-fuelflow" class="needle" style="border-bottom: 50% solid #ffcc33; z-index:2;"></div>
      <div class="needle-center" style="z-index:3;"></div>
      <div id="fuelflow-value" style="position:absolute;left:50%;top:50%;transform:translate(-50%, -50%);font-size:24px;width:80px;text-align:center;z-index:20;background:rgba(8,32,50,0.85);border-radius:10px;pointer-events:none;color:#fff;box-shadow:0 0 8px #000;">--</div>
    </div>
  </div>
  <!-- Sliders: Row 2, Col 6 en adelante -->
  <div class="grid-item slider-vertical" style="grid-row: 2; grid-column: 6;">
    <div style="text-align:center;font-weight:bold;color:#fff;margin-bottom:4px;">VS</div>
    <input type="range" min="-127" max="127" value="0" class="slider" id="vs-slider" orient="vertical">
    <div class="slider-value" id="vs-slider-value">0</div>
  </div>
  <div class="grid-item slider-vertical" style="grid-row: 2; grid-column: 7;">
    <div style="text-align:center;font-weight:bold;color:#fff;margin-bottom:4px;">RPM</div>
    <input type="range" min="0" max="3000" value="0" class="slider" id="rpm-slider" orient="vertical">
    <div class="slider-value" id="rpm-slider-value">0</div>
    <button id="start-btn" style="height:48px;font-size:18px;padding:8px 12px;margin-top:12px;">Start</button>
    <button id="noice-btn" style="height:40px;font-size:16px;padding:6px 10px;margin-top:10px;background:#444;color:#fff;border-radius:8px;border:none;cursor:pointer;">Noice: OFF</button>
  </div>
  <div class="grid-item slider-vertical" style="grid-row: 2; grid-column: 8;">
    <div style="text-align:center;font-weight:bold;color:#fff;margin-bottom:4px;">FF</div>
    <input type="range" min="0" max="20" value="0" step="0.1" class="slider" id="fuelflow-slider" orient="vertical">
    <div class="slider-value" id="fuelflow-slider-value">0.0</div>
  </div>
  <div class="grid-item slider-vertical" style="grid-row: 2; grid-column: 9;">
    <div style="text-align:center;font-weight:bold;color:#fff;margin-bottom:4px;">Roll</div>
    <input type="range" min="-30" max="30" value="0" step="0.1" class="slider" id="roll-slider" orient="vertical">
    <div class="slider-value" id="roll-slider-value">0.0</div>
  </div>
  <div class="grid-item slider-vertical" style="grid-row: 2; grid-column: 10;">
    <div style="text-align:center;font-weight:bold;color:#fff;margin-bottom:4px;">Pitch</div>
    <input type="range" min="-40" max="40" value="0" step="1" class="slider" id="pitch-slider" orient="vertical">
    <div class="slider-value" id="pitch-slider-value">0</div>
  </div>
</div>
</div>

<script>
// Botón para encender/apagar el ruido de RPM
let noiceOn = false;
const noiceBtn = document.getElementById('noice-btn');
noiceBtn.addEventListener('click', function() {
  noiceOn = !noiceOn;
  noiceBtn.textContent = noiceOn ? 'Noice: ON' : 'Noice: OFF';
  // Enviar estado al ESP32 por WebSocket
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify({ setRPMNoice: noiceOn }));
  }
});
// Attitude Control Instrument logic
const rollSlider = document.getElementById("roll-slider");
const rollSliderValue = document.getElementById("roll-slider-value");
const pitchSlider = document.getElementById("pitch-slider");
const pitchSliderValue = document.getElementById("pitch-slider-value");

const fondoImg = document.querySelector('img[alt="Fondo Attitude"]');
const ballImg = document.querySelector('img[alt="Ball Attitude"]');
const dialImg = document.querySelector('img[alt="Dial Attitude"]');

function updateAttitudeInstrument() {
  const roll = parseFloat(rollSlider.value);
  const pitch = parseInt(pitchSlider.value);
  if (fondoImg) {
    fondoImg.style.transform = `rotate(${roll}deg)`;
  }
  if (ballImg) {
    ballImg.style.transform = `rotate(${roll}deg) translateY(${pitch}px)`;
  }
  if (dialImg) {
    dialImg.style.transform = `rotate(${roll}deg)`;
  }
}

rollSlider.addEventListener("input", function() {
  rollSliderValue.textContent = parseFloat(this.value).toFixed(1);
  updateAttitudeInstrument();
  if(ws.readyState === 1) {
    ws.send(JSON.stringify({ setRoll: Number(this.value) }));
  }
});
pitchSlider.addEventListener("input", function() {
  pitchSliderValue.textContent = parseInt(this.value);
  updateAttitudeInstrument();
  if(ws.readyState === 1) {
    ws.send(JSON.stringify({ setPitch: Number(this.value) }));
  }
});
rollSliderValue.textContent = parseFloat(rollSlider.value).toFixed(1);
pitchSliderValue.textContent = parseInt(pitchSlider.value);
updateAttitudeInstrument();
let ws = new WebSocket("ws://" + location.hostname + ":81");

ws.onmessage = (msg) => {
  let data = JSON.parse(msg.data);

  // Altímetro
  if (data.heading !== undefined) {
    let heading = data.heading;
    let angle = (heading % 1000) * 360 / 1000;
    document.getElementById("needle").style.transform =
      `translate(-50%, -100%) rotate(${angle}deg)`;
    document.getElementById("heading-value").textContent =
      Math.round(heading);
  }

  // Attitude Control (sincronización multi-página)
  if (data.roll !== undefined && data.pitch !== undefined) {
    // Actualiza sliders si es necesario
    const rollSlider = document.getElementById("roll-slider");
    const rollSliderValue = document.getElementById("roll-slider-value");
    const pitchSlider = document.getElementById("pitch-slider");
    const pitchSliderValue = document.getElementById("pitch-slider-value");
    if (rollSlider && Math.abs(rollSlider.value - data.roll) > 0.05) {
      rollSlider.value = data.roll;
      rollSliderValue.textContent = parseFloat(data.roll).toFixed(1);
    }
    if (pitchSlider && Math.abs(pitchSlider.value - data.pitch) > 0.5) {
      pitchSlider.value = data.pitch;
      pitchSliderValue.textContent = parseInt(data.pitch);
    }
    // Actualiza el instrumento visual
    const fondoImg = document.querySelector('img[alt="Fondo Attitude"]');
    const ballImg = document.querySelector('img[alt="Ball Attitude"]');
    const dialImg = document.querySelector('img[alt="Dial Attitude"]');
    if (fondoImg) {
      fondoImg.style.transform = `rotate(${data.roll}deg)`;
    }
    if (ballImg) {
      ballImg.style.transform = `rotate(${data.roll}deg) translateY(${data.pitch}px)`;
    }
    if (dialImg) {
      dialImg.style.transform = `rotate(${data.roll}deg)`;
    }
  }

  // Velocidad vertical
  if (data.verticalSpeed !== undefined) {
    let verticalSpeed = data.verticalSpeed ?? 0;
    let vsAngle = 270 + verticalSpeed * 36;
    document.getElementById("needle-vs").style.transform =
      `translate(-50%, -100%) rotate(${vsAngle}deg)`;
    document.getElementById("vs-center-value").textContent =
      Math.round(verticalSpeed * 1000);
  }

  // RPM
  if (data.rpm !== undefined) {
    let rpm = data.rpm;
    let angle = 225 + (Math.max(0, Math.min(rpm, 3000)) * 270) / 3000;
    document.getElementById("needle-rpm").style.transform =
      `translate(-50%, -100%) rotate(${angle}deg)`;
    document.getElementById("rpm-value").textContent = Math.round(rpm);
    const rpmSlider = document.getElementById("rpm-slider");
    const rpmSliderValue = document.getElementById("rpm-slider-value");
    if (rpmSlider && Math.abs(rpmSlider.value - rpm) > 1) {
      rpmSlider.value = rpm;
      rpmSliderValue.textContent = Math.round(rpm);
    }
  }

  // FuelFlow
  if (data.fuelFlow !== undefined) {
    let fuelFlow = data.fuelFlow;
    // Mapea 0-20 a 270°-90° (recorrido horario de 180°)
    let minValue = 0, maxValue = 20, minAngle = 270, maxAngle = 90;
    let angleSpan = (maxAngle + 360 - minAngle) % 360;
    let angle = (minAngle + ((fuelFlow - minValue) * angleSpan) / (maxValue - minValue)) % 360;
    document.getElementById("needle-fuelflow").style.transform =
      `translate(-50%, -100%) rotate(${angle}deg)`;
    document.getElementById("fuelflow-value").textContent = parseFloat(fuelFlow).toFixed(1);
    const fuelFlowSlider = document.getElementById("fuelflow-slider");
    const fuelFlowSliderValue = document.getElementById("fuelflow-slider-value");
    if (fuelFlowSlider && Math.abs(fuelFlowSlider.value - fuelFlow) > 0.05) {
      fuelFlowSlider.value = fuelFlow;
      fuelFlowSliderValue.textContent = parseFloat(fuelFlow).toFixed(1);
    }
  }
};


// Control deslizante para velocidad vertical
const vsSlider = document.getElementById("vs-slider");
const vsSliderValue = document.getElementById("vs-slider-value");
vsSlider.addEventListener("input", function() {
  vsSliderValue.textContent = this.value;
  if(ws.readyState === 1) {
    ws.send(JSON.stringify({ setVerticalSpeed: Number(this.value) }));
  }
});

// Control deslizante para motor RPM
const rpmSlider = document.getElementById("rpm-slider");
const rpmSliderValue = document.getElementById("rpm-slider-value");
rpmSlider.addEventListener("input", function() {
  rpmSliderValue.textContent = this.value;
  if(ws.readyState === 1) {
    ws.send(JSON.stringify({ setRPMSpeed: Number(this.value) }));
  }
});

// Control deslizante para FuelFlow
const fuelFlowSlider = document.getElementById("fuelflow-slider");
const fuelFlowSliderValue = document.getElementById("fuelflow-slider-value");
fuelFlowSlider.addEventListener("input", function() {
  fuelFlowSliderValue.textContent = parseFloat(this.value).toFixed(1);
  if(ws.readyState === 1) {
    ws.send(JSON.stringify({ setFuelFlow: Number(this.value) }));
  }
});

// Botón Start para rutina de motor
document.getElementById("start-btn").addEventListener("click", function() {
  if(ws.readyState === 1) {
    ws.send(JSON.stringify({ startMotorRoutine: true }));
  }
});
</script>

</body>
</html>
)rawliteral";
