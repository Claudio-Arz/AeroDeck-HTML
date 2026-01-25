/*
  HTML/mainHTML.cpp
  Claudio Arzamendia Systems
  Tablero completo con intrumental aeronáutico
  para ajustar instrumentos analógicos.

  2026-01-24 19:28:29
  Tenemos un buen punto en el sistema para tenerlo en cuanta
  en futuros desarrollos.

  Dos instrumentos (RPM y Variometer) funcionan bien con WebSocket.
  El botón Noice sincroniza su estado en todos los clientes. Pero
  hay que presionarlo dos veces para que tome el estado correcto.

  Tenemos que modifica esta librería, de modo que el mainHTML.html
  se vea en el edetor VS Code como un archivo HTML normal, con
  su respectivo formato y coloreado de sintaxis. Este archivo
  mainHTML.cpp debe contener solo el código C++ necesario para
  embeber el HTML como una cadena de texto en memoria de programa.

  


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

</head>

<body>
<div id="main-html">
<!-- El contenido HTML principal se cargará aquí dinámicamente -->
</div>
<script>
// Inicialización del WebSocket para comunicación con el ESP32
const ws = new WebSocket('ws://' + location.hostname + ':81/');

// === Funciones de actualización de instrumentos ===
// Cargar el HTML principal de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/mainHTML.html")
  .then(r => r.text())
  .then(html => {
    document.getElementById("main-html").innerHTML = html;
    if (typeof setupVariometerControls === 'function') {
      setupVariometerControls(ws);
    }
  });
});
      
</script>
</body>
</html>
)rawliteral";








