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
// Ejecutar todo el JS solo cuando el DOM esté completamente cargado
window.addEventListener('DOMContentLoaded', () => {
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

    console.log("Inicio mainHTML.cpp data.verticalSpeed: " + data.verticalSpeed);
    console.log("Inicio mainHTML.cpp data.altitudValue.: " + data.altitudValue);

    // --- Actualizar instrumentos ---
    if (data.verticalSpeed !== undefined && typeof updateVariometerAndValue === 'function') {
      console.log("mainHTML.cpp data.verticalSpeed: " + data.verticalSpeed);
      updateVariometerAndValue(data.verticalSpeed);
      
      }
      if (data.altitudValue !== undefined && typeof updateAltimeterAndValue === 'function') {
        console.log("mainHTML.cpp data.altitudValue.: " + data.altitudValue);
        updateAltimeterAndValue(data.altitudValue);
    }
  };

  // Cargar el HTML del instrumento Variometer de forma dinámica
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
    });
});      

// Cargar el HTML del instrumento Altimeter de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/altimetro_Instrumento.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst03").innerHTML = html;
    });
});      

</script>
</html>
)rawliteral";








