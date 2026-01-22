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
  
  <div id="Instrumento1"></div>  
  <div id="Instrumento2"></div>  
  <div id="Instrumento3"></div>  
  <div id="Instrumento4"></div>  
  <div id="Instrumento5"></div>  
  <div id="Instrumento6"></div>  
  <div id="Instrumento7"></div>  
  <div id="Instrumento8"></div>  
  <div id="Instrumento9"></div>  
  <div id="Instrumento10"></div>  
  <div id="Instrumento11"></div>  
  <div id="Instrumento12"></div>  
  <div id="Instrumento13"></div>  
  <div id="Instrumento14"></div>  

</div>


<script>

// Configurar la conexión WebSocket
const ws = new WebSocket(`ws://${window.location.hostname}/ws`);
ws.onopen = () => {
  console.log('Conexión WebSocket establecida');
};
ws.onclose = () => {
  console.log('Conexión WebSocket cerrada');
};
ws.onerror = (error) => {
  console.error('Error en la conexión WebSocket:', error);
};

// Cargar el HTML del instrumento RPM de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/RPM.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("Instrumento1").innerHTML = html;
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
      document.getElementById("Instrumento2").innerHTML = html;
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
