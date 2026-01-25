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
<script>


// Inicialización del WebSocket para comunicación con el ESP32
const ws = new WebSocket('ws://' + location.hostname + ':81/');

// === Funciones de actualización de instrumentos ===




// Handler WebSocket: actualiza todos los instrumentos y el botón Noice
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
  if (data.verticalSpeed !== undefined) updateVariometerAndValue(data.verticalSpeed);

  // --- Sincronizar visualmente el botón Noice en todos los clientes ---
  if (data.rpmNoiceOn !== undefined) {
    // Función para actualizar el estado visual del botón Noice y la variable global
    function updateNoiceButtonState(state) {
      window.noiceOn = !!state;
      const btn = document.getElementById('noice-btn');
      if (btn) {
        if (state) {
          btn.classList.add('active');
          btn.textContent = 'Noice ON';
        } else {
          btn.classList.remove('active');
          btn.textContent = 'Noice OFF';
        }
      }
    }
    // Si el botón ya está en el DOM, actualizarlo
    if (document.getElementById('noice-btn')) {
      updateNoiceButtonState(data.rpmNoiceOn);
    } else {
      // Si el botón se carga dinámicamente, observar el DOM hasta que aparezca
      const observer = new MutationObserver((mutations, obs) => {
        const btn = document.getElementById('noice-btn');
        if (btn) {
          updateNoiceButtonState(data.rpmNoiceOn);
          obs.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

};

// Cargar el HTML del instrumento RPM de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/RPM.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst04").innerHTML = html;
    });
});
// Cargar el HTML del Controles de RPM de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/RPM_Control.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst06").innerHTML = html;
      if (typeof setupRPMControls === 'function') {
        setupRPMControls(ws);
      }
    });
});
// Cargar el HTML del instrumento Variometer de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/variometer.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst11").innerHTML = html;
    });
});
// Cargar el HTML del slider del  instrumento Variometer de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/variometer_Control.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst14").innerHTML = html;
      if (typeof setupVariometerControls === 'function') {
        setupVariometerControls(ws);
      }
    });
});

</script>
</head>

<body>
<div id="main-html">
<!-- El contenido HTML principal se cargará aquí dinámicamente -->
</div>
</body>

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
</html>
)rawliteral";








