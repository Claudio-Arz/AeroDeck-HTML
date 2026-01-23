// functions_rpm.js: lógica simple y modular para RPM

let isUserSliding = false;
function updateNeedleAndValue(rpm) {
  let angle = 225 + (Math.max(0, Math.min(rpm, 3000)) * 270) / 3000;
  document.getElementById("needle").style.transform =
    `translate(-50%, -100%) rotate(${angle}deg)`;
  document.getElementById("rpm-value").textContent = Math.round(rpm);
  const rpmSlider = document.getElementById("rpm-slider");
  const rpmSliderValue = document.getElementById("rpm-slider-value");
  // El valor visual y la aguja siempre reflejan el dato recibido
  if (rpmSliderValue) {
    rpmSliderValue.textContent = Math.round(rpm);
  }
  // El slider solo se mueve si el usuario no lo está usando
  if (rpmSlider && !isUserSliding) {
    if (Math.abs(Number(rpmSlider.value) - rpm) > 1) {
      rpmSlider.value = rpm;
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
      rpmSliderValue.textContent = value;
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

// Interceptar mensajes del ESP32 solo si el usuario NO está moviendo el slider
if (typeof ws !== 'undefined') {
  ws.onmessage = (msg) => {
    if (!isUserSliding) {
      let data = {};
      try {
        data = JSON.parse(msg.data);
      } catch (e) {
        console.warn('Mensaje WebSocket no es JSON:', msg.data);
        return;
      }
      if (data.rpm !== undefined) updateNeedleAndValue(data.rpm);
    }
  };
}
