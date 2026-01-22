#include <pgmspace.h>

const char MAIN_page[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Banco de Prueba y Calibración</title>

<link rel="stylesheet" href="https://claudio-arz.github.io/AeroDeck-HTML/CSS/mainHTML.css">

</head>

<body>
<h1 style="text-align:center; margin-top: 24px;">Banco de Prueba y Calibración</h1>


<div id="main-grid" class="grid-container">
  <!-- AirSpeed: Row 1, Col 1 -->
  <!-- <div id="AirSpeed-container" style="grid-row: 1; grid-column: 1;"></div>  -->

  <!-- Attitude Control: Row 1, Col 2 -->
  <!-- <div id="Attitude-container" style="grid-row: 1; grid-column: 2;"></div> -->

  <!-- Altimeter: Row 1, Col 3 (copiado de AltVerSpe/mainHTML.cpp) -->
  <!-- <div id="Altimeter-container" style="grid-row: 1; grid-column: 3;"></div> -->

  <!-- <div id="rpm-container" style="grid-row: 1; grid-column: 4;"></div>

  <!-- Vertical Speed: Row 2, Col 3 (copiado de AltVerSpe/mainHTML.cpp) -->
  <!-- <div id="VerticalSpeed-container" style="grid-row: 2; grid-column: 3;"></div> -->
  <!-- Fuel Flow: Row 2, Col 4 -->
  <!-- <div id="FuelFlow-container" style="grid-row: 2; grid-column: 4;"></div> -->
  
  <!-- Sliders: Row 2, Col 6 en adelante -->



  
</div>


<script>


// Inicialización del WebSocket para comunicación con el ESP32
const ws = new WebSocket('ws://' + location.hostname + ':81/');

// === Funciones de actualización de instrumentos ===




// Handler WebSocket: actualiza todos los instrumentos
ws.onmessage = (msg) => {
  let data = {};
  try {
    data = JSON.parse(msg.data);
  } catch (e) {
    console.warn('Mensaje WebSocket no es JSON:', msg.data);
    return;
  }
  // if (data.airspeed !== undefined) updateAirspeedInstrument(data.airspeed);
  if (data.rpm !== undefined) updateNeedleAndValue(data.rpm);
  // if (data.fuelFlow !== undefined) updateFuelFlowInstrument(data.fuelFlow);
  // if (data.vsSliderValue !== undefined) updateVSInstrument(data.vsSliderValue);
  // if (data.roll !== undefined) {
  //   rollSlider.value = data.roll;
  //   rollSliderValue.textContent = parseFloat(data.roll).toFixed(1);
  // }
  // if (data.pitch !== undefined) {
  //   pitchSlider.value = data.pitch;
  //   pitchSliderValue.textContent = parseInt(data.pitch);
  // }
  // updateAttitudeInstrument();
};

// Cargar el HTML del instrumento RPM de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/RPM.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("main-grid").innerHTML = html;
      // Cargar el JS específico del instrumento RPM
      const script = document.createElement('script');
      script.src = 'https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_rpm.js';
      script.onload = () => {
        if (typeof setupRPMControls === 'function') {
          setupRPMControls(ws);
        }
      };
      document.body.appendChild(script);
    });
});

// Cargar el HTML del instrumento Variometer de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/variometer.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("main-grid").innerHTML = html;
      // Cargar el JS específico del instrumento Variometer
      const script = document.createElement('script');
      script.src = 'https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_variometer.js';
      script.onload = () => {
        if (typeof setupVariometerControls === 'function') {
          setupVariometerControls(ws);
        }
      };
      document.body.appendChild(script);
    });
});

</script>

</body>

</html>
)rawliteral";
