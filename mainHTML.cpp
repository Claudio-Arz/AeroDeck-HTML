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
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_altimeter.js"></script>
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_Attitude.js"></script>
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_airSpeed.js"></script>
<script src="https://claudio-arz.github.io/AeroDeck-HTML/JS/functions_Gyro.js"></script>
<script>


</script>
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
    
  if (data.airspeed !== undefined) updateAirspeed(data.airspeed);
  if (data.rpm !== undefined) updateNeedleAndValue(data.rpm);
  // if (data.fuelFlow !== undefined) updateFuelFlowInstrument(data.fuelFlow);
  if (data.verticalSpeed !== undefined) updateVariometerAndValue(data.verticalSpeed);
  if (data.varAltitud !== undefined) updateAltimeterAndValue(data.varAltitud);
  if (data.gyro !== undefined) updateGyroDialAndValue(data.gyro);
  if (typeof window.updateAttitudeInstrument === 'function' && typeof data.roll === 'number' && typeof data.pitch === 'number') {
    window.updateAttitudeInstrument(data.roll, data.pitch);
  }



  // --- Sincronizar visualmente el botón Noice en todos los clientes ---
  if (data.rpmNoiceOn !== undefined) {
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
    if (document.getElementById('noice-btn')) {
      updateNoiceButtonState(data.rpmNoiceOn);
    } else {
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

  // --- Sincronizar visualmente el botón Zero en todos los clientes ---
  if (data.atti_zero !== undefined) {
    function updateZeroButtonState(state) {
      window.attiZeroActive = !!state;
      const btn = document.getElementById('atti-zero-btn');
      if (btn) {
        btn.textContent = state ? 'Zero: ON' : 'Zero: OFF';
        btn.classList.toggle('active', !!state);
      }
    }
    if (document.getElementById('atti-zero-btn')) {
      updateZeroButtonState(data.atti_zero);
    } else {
      const observer = new MutationObserver((mutations, obs) => {
        const btn = document.getElementById('atti-zero-btn');
        if (btn) {
          updateZeroButtonState(data.atti_zero);
          obs.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

};

// Cargar el HTML del Controles de RPM de forma dinámica
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
      // Esperar a que setupRPMControls esté disponible si aún no lo está
      function trySetupRPMControls() {
        if (typeof setupRPMControls === 'function') {
          setupRPMControls(ws);
        } else {
          setTimeout(trySetupRPMControls, 50);
        }
      }
      trySetupRPMControls();
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
// Cargar el HTML del instrumento Altimeter de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/altimeter.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst03").innerHTML = html;
      if (typeof setupVariometerControls === 'function') {
        setupVariometerControls(ws);
      }
    });
});      
// Cargar el HTML del instrumento AttitudeControl de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/AttitudeControl.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst02").innerHTML = html;
      // Solo se inicializa updateAttitudeControl en el joystick (inst05)
    });
});      
// Cargar el HTML de los sliders para Pitch y Roll del instrumento AttitudeControl de forma dinámica
window.addEventListener('DOMContentLoaded', () => {
  fetch("https://claudio-arz.github.io/AeroDeck-HTML/AttitudeControl_Control.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("inst05").innerHTML = html;
      if (typeof updateAttitudeControl === 'function') {
        updateAttitudeControl(ws);
      }
    });
});      
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
      // Inicializar controles del Gyro
      // Esperar a que el DOM esté listo antes de inicializar controles Gyro
      function trySetupGyroControls() {
        if (typeof setupGyroControls === 'function' && document.getElementById('gyr-slider') && document.getElementById('gyr-dial')) {
          setupGyroControls(ws);
        } else {
          setTimeout(trySetupGyroControls, 50);
        }
      }
      trySetupGyroControls();
    });
});   


</script>
</html>
)rawliteral";








