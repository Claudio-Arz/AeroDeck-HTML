/*
  Sistema AeroDeck
  Claudio Arzamendia Systems
  Tablero completo con intrumental aeronáutico
  para ajustar instrumentos analógicos.

  2026-01-26 01:19:18
    El altimeter y variometer usan el mismo sistema de control.



*/  

/*
  

*/
// Actualiza la aguja del altímetro y el valor numérico.
// Parámetros:
//   altitud: número, valor de altitud en pies (0 a 20000).
function updateAltimeterAndValue(altitud) {
  
  let heading = altitud; // Valor en pies.

  // Aguja de cientos de pies
  let angle_pies = (heading % 1000) * 360 / 1000;
  document.getElementById("aguja_pies").style.transform =
    `translate(-50%, -50%) rotate(${angle_pies}deg)`;

  // Aguja de miles de pies (0-9999)
  let miles_pies = heading / 10;
  let angle_miles = (miles_pies % 1000) * 360 / 1000;
  let milesNeedle = document.getElementById("aguja_miles");
  if (milesNeedle) {
    milesNeedle.style.transform = `translate(-50%, -50%) rotate(${angle_miles}deg)`;
  }

  // Aguja de decenas de miles de pies (0-20000)
  let dec_miles = miles_pies / 10;
  let angle_dec_miles = (dec_miles % 1000) * 360 / 1000;
  let decMilesNeedle = document.getElementById("aguja_decenas_miles");
  if (decMilesNeedle) {
    decMilesNeedle.style.transform = `translate(-50%, -50%) rotate(${angle_dec_miles}deg)`;
  }

  // Valor numérico central
  document.getElementById("altimeter-value").textContent =
    Math.round(heading);
}

function updateAltimeterFlag(estado) {
  // Bandera visible entre 19000 y 20000 pies (estado true)
  let angle_flag = estado ? 0 : 180;
  let flagNeedle = document.getElementById("altimeter-flag");
  if (flagNeedle) {
    flagNeedle.style.transform = `translate(-50%, -50%) rotate(${angle_flag}deg)`;
  }
}