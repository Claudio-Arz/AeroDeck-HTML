#include <pgmspace.h>

const char MAIN_page[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Calibración Attitude Control Instrument</title>
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
<h2>Calibración Attitude Control Instrument</h2>

<!-- 

Fondo
https://1drv.ms/i/c/976676efea6bc5cc/IQQzU2M_E0YgToe7MtyzE1XuAfVElY2Cc_yBrfPNQKdCQfQ?width=300&height=300

Ball
https://1drv.ms/i/c/976676efea6bc5cc/IQSgyOwWIMqJQKemnjMmcEmNAQY7GJN3VYbqvPIfZx1wbvc?width=300&height=175

Dial
https://1drv.ms/i/c/976676efea6bc5cc/IQR1Y4SeFxHyQo8VApLrNuWnAfQpBIK1VWCnNTHBT48S1Vw?width=372&height=377

Front
https://1drv.ms/i/c/976676efea6bc5cc/IQQH7oW0zJI6QKSV7TUcJsN_Aae1JOcvChh7V8_yefKkiZo?width=300&height=336

Mask
https://1drv.ms/i/c/976676efea6bc5cc/IQQqUQ5DIeQCRaq0NI5g1piXAT6d3C_xOJLJAMefFIL87vU?width=480&height=480



-->

<div style="display: flex; justify-content: center; align-items: flex-start; gap: 60px; margin-bottom: 32px;">
  <div id="container">
    <!-- Fondo (300x300 de 480x480) -->
    <img src="https://1drv.ms/i/c/976676efea6bc5cc/IQQzU2M_E0YgToe7MtyzE1XuAfVElY2Cc_yBrfPNQKdCQfQ?width=300&height=300"
      style="width:300px;height:300px;position:absolute;top:0;left:0;z-index:1;pointer-events:none;" 
      alt="Fondo Attitude">
    <!-- Ball (300x175 de 300x175 original, pero debe escalar de 300x175 a 187.5x109.375) -->
    <img src="https://1drv.ms/i/c/976676efea6bc5cc/IQSgyOwWIMqJQKemnjMmcEmNAQY7GJN3VYbqvPIfZx1wbvc?width=300&height=175"
      style="width:187.5px;height:109.375px;position:absolute;top:94px;left:56.25px;z-index:2;pointer-events:none;" 
      alt="Ball Attitude">
      <!-- Mask (480x480 original, escalar a 300x300) -->
      <img src="https://1drv.ms/i/c/976676efea6bc5cc/IQQqUQ5DIeQCRaq0NI5g1piXAT6d3C_xOJLJAMefFIL87vU?width=480&height=480"
        style="width:300px;height:300px;position:absolute;top:0;left:0;z-index:3;pointer-events:none;" 
        alt="Mask Attitude">
    <!-- Dial (372x377 original, escalar a 232.5x235.625) -->
    <img src="https://1drv.ms/i/c/976676efea6bc5cc/IQR1Y4SeFxHyQo8VApLrNuWnAfQpBIK1VWCnNTHBT48S1Vw?width=372&height=377"
      style="width:232.5px;height:235.625px;position:absolute;top:32.19px;left:33.75px;z-index:5;pointer-events:none;" 
      alt="Dial Attitude">
    <!-- Front (300x336 original, escalar a 187.5x210) -->
    <img src="https://1drv.ms/i/c/976676efea6bc5cc/IQQH7oW0zJI6QKSV7TUcJsN_Aae1JOcvChh7V8_yefKkiZo?width=300&height=336"
      style="width:187.5px;height:210px;position:absolute;top:55px;left:56.25px;z-index:5;pointer-events:none;" 
      alt="Front Attitude">
    
  </div>

</div>


<!-- Control deslizante para Roll -->
<div class="slider-container">
  <label for="roll-slider">Roll (°): </label>
  <input type="range" min="-30" max="30" value="0" step="0.1" class="slider" id="roll-slider">
  <div class="slider-value" id="roll-slider-value">0.0</div>
</div>

<!-- Control deslizante para Pitch -->
<div class="slider-container">
  <label for="pitch-slider">Pitch (px): </label>
  <input type="range" min="-50" max="50" value="0" step="1" class="slider" id="pitch-slider">
  <div class="slider-value" id="pitch-slider-value">0</div>
</div>



<script>
let ws = new WebSocket("ws://" + location.hostname + ":81");

// Referencias a los sliders y valores
const vsSlider = document.getElementById("vs-slider");
const varManifold = document.getElementById("vs-slider-value");
const rollSlider = document.getElementById("roll-slider");
const rollSliderValue = document.getElementById("roll-slider-value");
const pitchSlider = document.getElementById("pitch-slider");
const pitchSliderValue = document.getElementById("pitch-slider-value");

// Referencias a las imágenes
const fondoImg = document.querySelector('img[alt="Fondo Attitude"]');
const ballImg = document.querySelector('img[alt="Ball Attitude"]');
const dialImg = document.querySelector('img[alt="Dial Attitude"]');

// Roll
rollSlider.addEventListener("input", function() {
  rollSliderValue.textContent = parseFloat(this.value).toFixed(1);
  updateAttitudeInstrument();
});

// Pitch
pitchSlider.addEventListener("input", function() {
  pitchSliderValue.textContent = parseInt(this.value);
  updateAttitudeInstrument();
});

function updateAttitudeInstrument() {
  const roll = parseFloat(rollSlider.value);
  const pitch = parseInt(pitchSlider.value);
  // Aplica rotación y desplazamiento
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

// Inicializar valores
rollSliderValue.textContent = parseFloat(rollSlider.value).toFixed(1);
pitchSliderValue.textContent = parseInt(pitchSlider.value);
updateAttitudeInstrument();
</script>

</body>
)rawliteral";
