/*
  Tablero AeroDeck
  Claudio Arzamendia Systems
  Tablero completo con intrumental aeronáutico
  para ajustar instrumentos analógicos.

  2026-01-24 19:37:12
  En el sistema vamos a usar librerías estándar de JS y CSS.
  El código JS se divide en módulos lógicos por instrumento.
  Cada módulo tiene funciones para actualizar la UI y
  configurar los controles. El WebSocket se maneja en mainHTML.html
  y los mensajes se distribuyen a los módulos según el contenido.

  functions_rpm.js: lógica simple y modular para RPM. Cada función
  debe tener una buena documentación. Indicando en comienzo de la 
  función qué hace, y en los parámetros qué espera y qué devuelve,
  o que ejecuta.




*/


/*
  Actualiza la aguja del tacómetro y el valor numérico de RPM.
  Parámetros:
    rpm: número, valor de RPM entre 0 y 3000.

  Comunicaciones:
    No envía ni recibe mensajes WebSocket.

  Issues:
    - La aguja no se mueve suavemente, sino en saltos.


*/ 
let isUserSliding = false;
function updateNeedleAndValue(rpm) {
  let angle = 225 + (Math.max(0, Math.min(rpm, 3000)) * 270) / 3000;
  const needle = document.getElementById("needle");
  if (needle) {
    needle.style.setProperty('--needle-rotation', `${angle}deg`);
    needle.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
  }
  const rpmValueDiv = document.getElementById("rpm-value");
  if (rpmValueDiv) rpmValueDiv.textContent = Math.round(rpm);
  const rpmSlider = document.getElementById("rpm-slider");
  const rpmSliderValue = document.getElementById("rpm-slider-value");
  if (rpmSliderValue) rpmSliderValue.textContent = Math.round(rpm);
  // Solo actualizar el slider si el usuario NO está interactuando
  if (rpmSlider && !isUserSliding) {
    if (Math.abs(Number(rpmSlider.value) - rpm) > 1) {
      rpmSlider.value = rpm;
      if (rpmSliderValue) rpmSliderValue.textContent = Math.round(rpm);
    }
  }
}


/*
  Configura los controles de RPM: botón de inicio, slider de RPM,
  y botón de ruido (noice).
  Parámetros:
    ws: WebSocket abierto y listo para enviar mensajes.

  Comunicaciones:
    Envía mensajes JSON:
      { startMotorRoutine: true }
      { setRPMSpeed: valor }
      { setNoice: true/false }

  Issues:
    - El botón Noice no sincroniza bien su estado en todos los clientes.
      Hay que investigar y corregir.
*/
function setupRPMControls(ws) {
  const startBtnRpm = document.getElementById("start-btn-rpm");
  if (startBtnRpm) {
    startBtnRpm.addEventListener("click", function() {
      if(ws.readyState === 1) {
        ws.send(JSON.stringify({ startMotorRoutine: true }));
      }
    });
  }

  const rpmSlider = document.getElementById("rpm-slider");
  const rpmSliderValue = document.getElementById("rpm-slider-value");
  
  if (rpmSlider && rpmSliderValue) {
    rpmSlider.addEventListener("input", function(e) {
      isUserSliding = true;
      const value = parseInt(e.target.value);
      updateNeedleAndValue(value);
      if(ws.readyState === 1) {
        ws.send(JSON.stringify({ setRPMSpeed: value }));
      }
    });
    // Detectar cuando el usuario deja de interactuar con el slider
    const stopSliding = function() { isUserSliding = false; };
    rpmSlider.addEventListener("change", stopSliding);
    rpmSlider.addEventListener("mouseup", stopSliding);
    rpmSlider.addEventListener("touchend", stopSliding);
  }
  const noiceBtn = document.getElementById("noice-btn");
  let noiceOn = false;
  if (noiceBtn) {
    noiceBtn.addEventListener("click", function() {
      noiceOn = !noiceOn;
      // El estado visual y el texto serán actualizados por ws.onmessage centralizado
      if(ws.readyState === 1) {
        ws.send(JSON.stringify({ setNoice: noiceOn }));
      }
    });
  }
}

// Fin de functions_rpm.js
