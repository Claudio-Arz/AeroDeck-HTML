// Alias para compatibilidad con mainHTML.cpp
function updateAltimeterAndValue(altitudValue, bandera_off) {
  updateAltimeter(altitudValue, bandera_off);
}
/*
  Sistema AeroDeck
  Claudio Arzamendia Systems
  Tablero completo con intrumental aeronáutico
  para ajustar instrumentos analógicos.


*/


// Función para actualizar el altímetro con el valor recibido
function updateAltimeter(altitudValue, bandera_off) {
  // Actualizar el valor numérico en el centro del instrumento
  document.getElementById("altimeter-value").textContent = altitudValue;
  // Calcular los ángulos de las agujas en función de la altitud
  const decenasMiles = Math.floor(altitudValue / 10000);
  const miles = Math.floor((altitudValue % 10000) / 1000);
  const cientos = Math.floor((altitudValue % 1000) / 100);
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
    flagElement.style.transform = "translate(-50%, -50%) scale(1)";
  } else {
    flagElement.style.transform = "translate(-50%, -50%) scale(0)";
  }
}

