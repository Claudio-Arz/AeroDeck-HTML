/*
HTML/mainHTML.cpp
Claudio Arzamendia Systems
Tablero completo con intrumental aeronáutico
para ajustar instrumentos analógicos.

2026-02-07 18:26:08
Versión 003
Los instrumentos solo muestran datos recibidos vía WebSocket
del ESP32. No hay lógica de simulación en el cliente.

Los controles (sliders, botones, joysticks) envían datos vía WebSocket
al ESP32 para actualizar los valores de los instrumentos.

*/



#include <pgmspace.h>

const char MAIN_page[] PROGMEM = R"rawliteral(
<!DOCTYPE html >
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Banco de Prueba y Calibración</title>


<link rel="stylesheet" href="https://claudio-arz.github.io/AeroDeck-HTML/CSS/mainHTML.css">


</head>

<body>

<h1 style="text-align:center; margin-top: 24px;">Banco de Prueba y Calibración</h1>


<div id="main-grid" class="grid-container">
  
  <div class="grid-item" id="inst01" style="grid-row: 1; grid-column: 1;">Air Speed</div>  
  <div class="grid-item" id="inst02" style="grid-row: 1; grid-column: 2;">Attitude Control</div>  
  <div class="grid-item" id="inst03" style="grid-row: 1; grid-column: 3;">Altimeter</div>  
  <div class="grid-item" id="inst04" style="grid-row: 1; grid-column: 4;">RPM</div>  
  <div class="grid-item" id="inst05" style="grid-row: 1; grid-column: 5;">Controles Pitch & Roll</div>  
  <div class="grid-item" id="inst06" style="grid-row: 1; grid-column: 6;">Controles RPM</div>  
  <div class="grid-item" id="inst07" style="grid-row: 1; grid-column: 7;">Controles Gyro</div>  
  <div class="grid-item" id="inst08" style="grid-row: 1; grid-column: 8;">Controles Air Speed</div>  
  <div class="grid-item" id="inst09" style="grid-row: 2; grid-column: 1;"></div>  
  <div class="grid-item" id="inst10" style="grid-row: 2; grid-column: 2;">Gyro</div>  
  <div class="grid-item" id="inst11" style="grid-row: 2; grid-column: 3;">Vertical Speed</div>  
  <div class="grid-item" id="inst12" style="grid-row: 2; grid-column: 4;"></div>  
  <div class="grid-item" id="inst13" style="grid-row: 2; grid-column: 5;"></div>  
  <div class="grid-item" id="inst14" style="grid-row: 2; grid-column: 6;">Controles Vertical Speed</div>  
  <div class="grid-item" id="inst15" style="grid-row: 2; grid-column: 7;"></div>  
  <div class="grid-item" id="inst16" style="grid-row: 2; grid-column: 8;"></div>

</div>

<!-- El contenido HTML principal se cargará aquí dinámicamente -->

</body>

<script>
// Inicialización del WebSocket para comunicación con el ESP32
const ws = new WebSocket('ws://' + location.hostname + ':81/');


// === Funciones de actualización de instrumentos ===




// Handler WebSocket: actualiza todos los instrumentos y botones según los datos recibidos
ws.onmessage = (msg) => {
  let data = {};
  try {
    data = JSON.parse(msg.data);
  } catch (e) {
    console.warn('Mensaje WebSocket no es JSON:', msg.data);
    return;
  }
  // --- Actualizar instrumentos ---
  if (data.verticalSpeed !== undefined) updateVariometerAndValue(data.verticalSpeedValue);
  if (data.altitudValue !== undefined) updateAltimeterAndValue(data.altitudValue);
};

// Cargar el HTML del instrumento Variometer de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/variometro_Instrumento.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst11").innerHTML = html;
    });
});

// Cargar el HTML del slider del  instrumento Variometer de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/variometro_Control.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst14").innerHTML = html;
    )};
});      

// Cargar el HTML del instrumento Altimeter de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/altimetro_Instrumento.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst03").innerHTML = html;
    });
});      
<<<<<<< HEAD
// Inicializar todos los instrumentos y controles solo cuando la página y scripts hayan terminado de cargar
window.onload = function() {
  // Cargar todos los instrumentos y controles dinámicamente
  const loads = [
    fetch("https://claudio-arz.github.io/AeroDeck-HTML/AttitudeControl.html").then(r => r.text()).then(html => { document.getElementById("inst02").innerHTML = html; }),
    fetch("https://claudio-arz.github.io/AeroDeck-HTML/AttitudeControl_Control.html").then(r => r.text()).then(html => { document.getElementById("inst05").innerHTML = html; }),
    fetch("https://claudio-arz.github.io/AeroDeck-HTML/RPM.html").then(r => r.text()).then(html => { document.getElementById("inst04").innerHTML = html; }),
    fetch("https://claudio-arz.github.io/AeroDeck-HTML/RPM_Control.html").then(r => r.text()).then(html => { document.getElementById("inst06").innerHTML = html; }),
    fetch("https://claudio-arz.github.io/AeroDeck-HTML/variometer.html").then(r => r.text()).then(html => { document.getElementById("inst11").innerHTML = html; }),
    fetch("https://claudio-arz.github.io/AeroDeck-HTML/variometer_Control.html").then(r => r.text()).then(html => { document.getElementById("inst14").innerHTML = html; }),
    fetch("https://claudio-arz.github.io/AeroDeck-HTML/altimeter.html").then(r => r.text()).then(html => { document.getElementById("inst03").innerHTML = html; }),
    fetch("https://claudio-arz.github.io/AeroDeck-HTML/airSpeed.html").then(r => r.text()).then(html => { document.getElementById("inst01").innerHTML = html; }),
    fetch("https://claudio-arz.github.io/AeroDeck-HTML/airSpeed_Control.html").then(r => r.text()).then(html => { document.getElementById("inst08").innerHTML = html; }),
    fetch("https://claudio-arz.github.io/AeroDeck-HTML/gyro.html").then(r => r.text()).then(html => { document.getElementById("inst10").innerHTML = html; }),
    fetch("https://claudio-arz.github.io/AeroDeck-HTML/Gyro_Control.html").then(r => r.text()).then(html => { document.getElementById("inst07").innerHTML = html; })
  ];

  Promise.all(loads).then(() => {
    // Inicializar controles/instrumentos que requieren setup después de cargar HTML
    if (typeof updateAttitudeControl === 'function') updateAttitudeControl();
    if (typeof setupRPMControls === 'function') setupRPMControls(ws);
    if (typeof setupVariometerControls === 'function') setupVariometerControls(ws);
    if (typeof AirSpeed !== 'undefined' && typeof AirSpeed.init === 'function') {
      AirSpeed.init({ imgIds: { aguja: 'as-needle' }, sliderIds: { valor: 'as-slider-value' } });
    }
    if (typeof Gyro !== 'undefined' && typeof Gyro.init === 'function') {
      Gyro.init({ imgIds: { giro_dial: 'gyr-dial' }, sliderIds: { valor: 'gyro-slider-value' } });
    }
  });
};
// Cargar el HTML del instrumento AirSpeed de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/airSpeed.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst01").innerHTML = html;
    });
}); 
// Cargar el HTML del slider del instrumento AirSpeed de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/airSpeed_Control.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst08").innerHTML = html;
      // Inicializar AirSpeed solo cuando ambos HTML estén cargados
      if (typeof AirSpeed !== 'undefined' && typeof AirSpeed.init === 'function') {
        AirSpeed.init({
          imgIds: { aguja: 'as-needle' },
          sliderIds: { valor: 'as-slider-value' }
        });
      }
    });
});   
// Cargar el HTML del instrumento Gyro de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/gyro.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst10").innerHTML = html;
    });
}); 
// Cargar el HTML del slider del instrumento Gyro de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/Gyro_Control.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst07").innerHTML = html;
      // Inicializar Gyro solo cuando ambos HTML estén cargados
      if (typeof Gyro !== 'undefined' && typeof Gyro.init === 'function') {
        Gyro.init({
          imgIds: { giro_dial: 'gyr-dial' },
          sliderIds: { valor: 'gyro-slider-value' }
        });
      }
    });
});   

=======
>>>>>>> rama-nueva-desde-905660d3

</script>
</html>
)rawliteral";








