// functions_rpm.js: lógica simple y modular para RPM

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
      this.textContent = "Noice: " + (noiceOn ? "ON" : "OFF");
      if(noiceOn) {
        this.style.background = "#0c0";
        this.style.color = "#222";
      } else {
        this.style.background = "#444";
        this.style.color = "#fff";
      }
      if(ws.readyState === 1) {
        ws.send(JSON.stringify({ setNoice: noiceOn }));
      }
    });
  }
}

// Interceptar mensajes del ESP32 y actualizar la aguja solo si el usuario NO está moviendo el slider
if (typeof ws !== 'undefined') {
  ws.onmessage = (msg) => {
    let data = {};
    try {
      data = JSON.parse(msg.data);
    } catch (e) {
      console.warn('Mensaje WebSocket no es JSON:', msg.data);
      return;
    }
    if (data.rpm !== undefined && !isUserSliding) updateNeedleAndValue(data.rpm);
  };
}
