/*

Autor: Claudio Arzamendia Systems
Fecha: 2026-02-15 04:00:08


functions_Attitude.js - Funciones para actualizar el instrumento de actitud (horizonte artificial)
Envia los datos de actitud (pitch, roll) al ESP32 para que los refleje en el horizonte artificial,
y en todas las otras terminales.  




*/ 
function setupAttitudeControls() {
  const pitchSlider = document.getElementById('pitch-slider');
  const rollSlider = document.getElementById('roll-slider');
  const pitchValue = document.getElementById('pitch-value');
  const rollValue = document.getElementById('roll-value');

  pitchSlider.addEventListener('input', () => {
    const value = parseFloat(pitchSlider.value);
    pitchValue.textContent = value.toFixed(1);
    sendAttitudeToESP32("pitchSlider", value);
  });

  rollSlider.addEventListener('input', () => {
    const value = parseFloat(rollSlider.value);
    rollValue.textContent = value.toFixed(1);
    sendAttitudeToESP32("rollSlider", value);
  });
}

function sendAttitudeToESP32(DataVar, DataValue) {
  getWebSocketInstance(function(ws) {
    console.log('Enviando actitud al ESP32:', DataVar, DataValue);
    ws.send(JSON.stringify({ [DataVar]: DataValue }));
  });
}   

function updateAttitudeAndValue(pitchValue, rollValue, varPitch, varRoll) {
  setAttitudeValues(varPitch, varRoll);
    // Actualizar los valores numéricos en el centro del instrumento
    pitchValue.textContent = varPitch.toFixed(1);
    rollValue.textContent = varRoll.toFixed(1);
    // Calcular el ángulo de la aguja en función del valor de pitch y roll
    const pitchAngle = (varPitch / 90) * 45;
    const rollAngle = (varRoll / 90) * 45;  
    // Aplicar las transformaciones CSS para rotar el horizonte artificial
    const horizon = document.getElementById('horizon');
    if (horizon) {
      horizon.style.transform = `rotateX(${pitchAngle}deg) rotateZ(${rollAngle}deg)`;
    }
}

function setAttitudeValues(varPitch, varRoll) {
  const pitchSlider = document.getElementById('pitch-slider');
  const rollSlider = document.getElementById('roll-slider');
  if (pitchSlider) pitchSlider.value = varPitch;
  if (rollSlider) rollSlider.value = varRoll;
}   

function initializeAttitudeControls() {
  setupAttitudeControls();
    // Aquí puedes agregar cualquier inicialización adicional si es necesario
    // Por ejemplo, podrías enviar un valor inicial al ESP32 para sincronizar el estado
    sendAttitudeToESP32("pitchSlider", 0);
    sendAttitudeToESP32("rollSlider", 0);
}   

function setupAttitudeControls() {
  const pitchSlider = document.getElementById('pitch-slider');
  const rollSlider = document.getElementById('roll-slider');
  const pitchValue = document.getElementById('pitch-value');
  const rollValue = document.getElementById('roll-value');
    pitchSlider.addEventListener('input', () => {   
    const value = parseFloat(pitchSlider.value);
    pitchValue.textContent = value.toFixed(1);
    sendAttitudeToESP32("pitchSlider", value);
  });
  rollSlider.addEventListener('input', () => {
    const value = parseFloat(rollSlider.value);
    rollValue.textContent = value.toFixed(1);
    sendAttitudeToESP32("rollSlider", value);
  });

}


