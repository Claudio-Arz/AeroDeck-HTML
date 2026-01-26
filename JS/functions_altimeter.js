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
  
  let heading = altitud;

  // Actualiza instrumentos
  let angle_pies = (heading % 1000) * 360 / 1000; // Angulo para cientos de pies.
  document.getElementById("aguja_pies").style.transform =
    `translate(-50%, -50%) rotate(${angle_pies}deg)`;
  document.getElementById("altimeter-value").textContent =
    Math.round(heading);
};