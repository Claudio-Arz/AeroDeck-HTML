/*
  HTML/mainHTML2.cpp
  Claudio Arzamendia Systems
  Versión con carga de instrumento y controles desde un solo archivo HTML por instrumento.
  2026-02-05
*/

#include <pgmspace.h>

const char MAIN_page[] PROGMEM = R"rawliteral(
<!DOCTYPE html >
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Banco de Prueba y Calibración</title>
<link rel="stylesheet" href="https://claudio-arz.github.io/AeroDeck-HTML/CSS/mainHTML.css">
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_rpm.js"></script>
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_variometer.js"></script>
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_altimeter.js"></script>
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_Attitude.js"></script>
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_airSpeed.js"></script>
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_Gyro2.js"></script>
</head>
<body>
<h1 style="text-align:center; margin-top: 24px;">Banco de Prueba y Calibración</h1>
<div id="main-grid" class="grid-container">
  <div class="grid-item" id="inst01" style="grid-row: 1; grid-column: 1;"></div>
  <div class="grid-item" id="inst02" style="grid-row: 1; grid-column: 2;"></div>
  <div class="grid-item" id="inst03" style="grid-row: 1; grid-column: 3;"></div>
  <div class="grid-item" id="inst04" style="grid-row: 1; grid-column: 4;"></div>
  <div class="grid-item" id="inst05" style="grid-row: 1; grid-column: 5;"></div>
  <div class="grid-item" id="inst06" style="grid-row: 1; grid-column: 6;"></div>
  <div class="grid-item" id="inst07" style="grid-row: 1; grid-column: 7;"></div>
  <div class="grid-item" id="inst08" style="grid-row: 1; grid-column: 8;"></div>
  <div class="grid-item" id="inst09" style="grid-row: 2; grid-column: 1;"></div>
  <div class="grid-item" id="inst10" style="grid-row: 2; grid-column: 2;"></div>
  <div class="grid-item" id="inst11" style="grid-row: 2; grid-column: 3;"></div>
  <div class="grid-item" id="inst12" style="grid-row: 2; grid-column: 4;"></div>
  <div class="grid-item" id="inst13" style="grid-row: 2; grid-column: 5;"></div>
  <div class="grid-item" id="inst14" style="grid-row: 2; grid-column: 6;"></div>
  <div class="grid-item" id="inst15" style="grid-row: 2; grid-column: 7;"></div>
  <div class="grid-item" id="inst16" style="grid-row: 2; grid-column: 8;"></div>
</div>
<script>
const ws = new WebSocket('ws://' + location.hostname + ':81/');
// Ejemplo para Gyro: cargar un solo archivo y distribuir los divs
window.addEventListener('DOMContentLoaded', () => {
  fetch("gyro_full.html")
    .then(r => r.text())
    .then(html => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      // Instrumento en row 2 col 2
      const dialDiv = tempDiv.querySelector('#gyro-instrument');
      if (dialDiv) document.getElementById('inst10').appendChild(dialDiv);
      // Controles (slider+botones) en row 1 col 7
      const controlsDiv = tempDiv.querySelector('#gyro-controls');
      if (controlsDiv) document.getElementById('inst07').appendChild(controlsDiv);
      if (typeof setupGyroControls === 'function') setupGyroControls(ws);
    });
});
// Repite el mismo patrón para otros instrumentos
</script>
</body>
</html>
)rawliteral";

// Fin de mainHTML2.cpp
