// Alias para compatibilidad con mainHTML.cpp
function updateAltimeterAndValue(altitudValue, bandera_off, atmosphericPressureInHg) {
  updateAltimeter(altitudValue, bandera_off, atmosphericPressureInHg);
}
/*
  Sistema AeroDeck
  Claudio Arzamendia Systems
  Tablero completo con intrumental aeronáutico
  para ajustar instrumentos analógicos.


*/


// Función para actualizar el altímetro con el valor recibido
function updateAltimeter(altitudValue, bandera_off, atmosphericPressureInHg) {
  // Actualizar el valor numérico en el centro del instrumento
  document.getElementById("altimeter-value").textContent = Math.round(altitudValue);
  // Calcular los ángulos de las agujas en función de la altitud
  const decenasMiles = altitudValue / 10000; // Decenas de miles
  const miles =   (altitudValue % 10000) / 1000;
  const cientos = (altitudValue % 1000) / 100;
  const anguloDecenasMiles = (decenasMiles / 10) * 360; // 10 divisiones para decenas de miles
  const anguloMiles = (miles / 10) * 360; // 10 divisiones para miles
  const anguloCientos = (cientos / 10) * 360; // 10 divisiones para cientos
  // Rotar las agujas según los ángulos calculados
  document.getElementById("aguja_decenas_miles").style.transform = `translate(-50%, -50%) rotate(${anguloDecenasMiles}deg)`;
  document.getElementById("aguja_miles").style.transform = `translate(-50%, -50%) rotate(${anguloMiles}deg)`;
  document.getElementById("aguja_pies").style.transform = `translate(-50%, -50%) rotate(${anguloCientos}deg)`;
  // Mostrar u ocultar la bandera OFF según el valor de bandera_off
  const flagElement = document.getElementById("altimeter-flag");
  if (!bandera_off) {
    // Mostrar la bandera OFF
    flagElement.style.transform = "translate(-50%, -50%) rotate(180deg)";
  } else {
    // Ocultar la bandera OFF
    flagElement.style.transform = "translate(-50%, -50%) rotate(0deg)";
  }

  // Actualizar escala Kollsman y lectura en ventanita
  // Rango gráfico: 28..31 inHg distribuidos en 180°
  // Referencia: 29.92 inHg = 0°
  // Menor presión => sentido horario (+)
  // Mayor presión => sentido antihorario (-)
  const pressure = (typeof atmosphericPressureInHg === 'number') ? atmosphericPressureInHg : 29.92;
  const pressureClamped = Math.max(28.0, Math.min(31.0, pressure));
  const kolsmanAngle = (29.92 - pressureClamped) * 60.0;

  const kolsmanScale = document.getElementById("altimeter-kollsman");
  if (kolsmanScale) {
    kolsmanScale.style.transform = `translate(-50%, -50%) rotate(${kolsmanAngle.toFixed(2)}deg)`;
  }

  const kolsmanElement = document.getElementById("altimeter-kollsman-value");
  if (kolsmanElement) {
    kolsmanElement.textContent = `${pressureClamped.toFixed(2)} inHg`;
  }
}

// Alterna la visibilidad del cristal roto en el instrumento Altímetro
function toggleAltimeterBrokenCrystal() {
  const crystal = document.getElementById('altimeter_broken_crystal13');
  if (crystal) {
    crystal.classList.toggle('visible');
  }
}
