/*
  Sistema AeroDeck
  Claudio Arzamendia Systems
  Tablero completo con intrumental aeronáutico
  para ajustar instrumentos analógicos.

  2026-02-21 01:52:52
  Este es un reloj que recibe la hora en formato HH:MM:SS desde el ESP32 y actualiza 
  las agujas del reloj en consecuencia.

  Al hacer clic en el instrumento, se alterna la visibilidad de un cristal roto 
  para simular daños en el instrumento.

*/


// Función para actualizar el reloj con el valor recibido
function updateReloj(horaValue) {
  // Actualizar la hora en el instrumento
  const [horas, minutos, segundos] = horaValue.split(':').map(Number);
  const hora = horas % 12; // Convertir a formato de 12 horas
  const minutosNorm = minutos / 60;
  const segundosNorm = segundos / 60;
  const anguloHoras = (hora + minutosNorm) * 30; // 360 / 12 = 30 grados por hora
  const anguloMinutos = (minutos + segundosNorm) * 6; // 360 / 60 = 6 grados por minuto
  const anguloSegundos = segundos * 6; // 360 / 60 = 6 grados por segundo

  // Rotar las agujas según los ángulos calculados
  document.getElementById("aguja_horas").style.transform = `translate(-50%, -50%) rotate(${anguloHoras}deg)`;
  document.getElementById("aguja_minutos").style.transform = `translate(-50%, -50%) rotate(${anguloMinutos}deg)`;
  document.getElementById("aguja_segundos").style.transform = `translate(-50%, -50%) rotate(${anguloSegundos}deg)`;

}

// Alterna la visibilidad del cristal roto en el instrumento  Reloj
function toggleRelojBrokenCrystal() {
  const crystal = document.getElementById('reloj_broken_crystal14');
  if (crystal) {
    crystal.classList.toggle('visible');
  }
}
