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
ws.onmessage = (msg) => {
  let data = JSON.parse(msg.data);
  let heading = data.altitud ?? 0;
  let verticalSpeed = data.verticalSpeed ?? 0;

  // Actualiza instrumentos
  let angle_pies = (heading % 1000) * 360 / 1000; // Angulo para cientos de pies.
  document.getElementById("aguja_pies").style.transform =
    `translate(-50%, -100%) rotate(${angle_pies}deg)`;
  document.getElementById("altimeter-value").textContent =
    Math.round(heading);
};