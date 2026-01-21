// Funciones para instrumentos y controles RPM

function updateNeedleAndValue(rpm) {
  // 0 rpm = 225°, 3000 rpm = 495° (225° + 270°), recorre 270° antihorario
  let angle = 225 + (Math.max(0, Math.min(rpm, 3000)) * 270) / 3000;
  document.getElementById("needle").style.transform =
    `translate(-50%, -100%) rotate(${angle}deg)`;
  document.getElementById("rpm-value").textContent = Math.round(rpm);
  // Actualizar el valor del slider y su display si cambia por rutina automática
  const rpmSlider = document.getElementById("rpm-slider");
  const rpmSliderValue = document.getElementById("rpm-slider-value");
  if (rpmSlider && Math.abs(rpmSlider.value - rpm) > 1) {
    rpmSlider.value = rpm;
    rpmSliderValue.textContent = Math.round(rpm);
  }
}



function setupRPMControls(ws) {
  // Botón Start principal
  const startBtn = document.getElementById("start-btn");
  if (startBtn) {
    startBtn.addEventListener("click", function() {
      if(ws.readyState === 1) {
        ws.send(JSON.stringify({ startMotorRoutine: true }));
      }
    });
  }

  // Slider
  const rpmSlider = document.getElementById("rpm-slider");
  const rpmSliderValue = document.getElementById("rpm-slider-value");
  if (rpmSlider && rpmSliderValue) {
    rpmSlider.addEventListener("input", function(e) {
      const value = parseInt(e.target.value);
      rpmSliderValue.textContent = value;
      if(ws.readyState === 1) {
        ws.send(JSON.stringify({ setRPMSpeed: value }));
      }
    });
  }

  // Botón Start del slider
  const startBtnSlider = document.getElementById("start-btn-slider");
  if (startBtnSlider) {
    startBtnSlider.addEventListener("click", function() {
      if(ws.readyState === 1) {
        ws.send(JSON.stringify({ startMotorRoutine: true }));
      }
    });
  }

  // Botón de ruido
  const noiceBtn = document.getElementById("noice-btn");
  let noiceOn = false;
  if (noiceBtn) {
    noiceBtn.addEventListener("click", function() {
      noiceOn = !noiceOn;
      this.textContent = "Noice: " + (noiceOn ? "ON" : "OFF");
      if(ws.readyState === 1) {
        ws.send(JSON.stringify({ setRPMNoice: noiceOn }));
      }
    });
  }
}
