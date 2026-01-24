/*
  2026-01-20 18:29
  Claudio Arzamendia Systems
  Tablero completo con intrumental aeronáutico
  para ajustar instrumentos analógicos.

  



*/

#include <WiFi.h>
#include <WiFiManager.h> // https://github.com/tzapu/WiFiManager
#include <WebServer.h>
#include <WebSocketsServer.h>
#include <DNSServer.h>
#include <ArduinoJson.h>

// ===== OBJETOS =====
WebServer server(80);
WebSocketsServer ws(81);
DNSServer dnsServer;

// ===== VARIABLES GLOBALES =====
// ===== VARIABLES RPM Y VARIOMETER =====
float rpm = 0.0f;
int varRPM = 0;
bool startRoutine = false;
unsigned long routineStart = 0;
int routineStep = 0;
float routineInitial = 0;
bool rpmNoiceOn = false;
float vsVar = 0.0f;
int vsSliderValue = 0;

void onWsEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
    if (type == WStype_CONNECTED) {
      // Enviar valor inicial de variometer al cliente recién conectado
      char buffer[128];
      sprintf(buffer, "{\"variometer\":%.2f}", vsVar);
      ws.sendTXT(num, buffer);
    }
    if (type == WStype_TEXT) {
      String msg = (const char*)payload;
      // Cambiar el estado de rpmNoiceOn si se recibe el mensaje del botón
      if (msg.indexOf("setNoice") >= 0) {
        int start = msg.indexOf(":");
        int end = msg.indexOf("}", start);
        if (start > 0 && end > start) {
          String val = msg.substring(start + 1, end);
          // Alternar si no se especifica valor, o asignar si es true/false
          if (val == "toggle") {
            rpmNoiceOn = !rpmNoiceOn;
          } else {
            rpmNoiceOn = (val == "true");
          }
        }
      }
      // Use setVariometerSpeed for variometer
      if (msg.indexOf("setVariometerSpeed") >= 0) {
        int start = msg.indexOf(":");
        int end = msg.indexOf("}", start);
        if (start > 0 && end > start) {
          String val = msg.substring(start + 1, end);
          vsVar = val.toFloat();
        }
      }
      // Use setRPMSpeed for RPM
      if (msg.indexOf("setRPMSpeed") >= 0) {
        int start = msg.indexOf(":");
        int end = msg.indexOf("}", start);
        if (start > 0 && end > start) {
          String val = msg.substring(start + 1, end);
          varRPM = val.toInt();
        }
      }
      if (msg.indexOf("startMotorRoutine") >= 0) {
        if (rpm == 0.0f) {
          startRoutine = true;
          routineStart = millis();
          routineStep = 0;
          routineInitial = varRPM;
        }
      }
    }
}

// ===== CONFIGURAR ACCESS POINT =====
const char* ap_ssid = "Intrumentos-ESP32";  // Nombre del AP servidor
const char* ap_pass = "12345678";   // mínimo 8 caracteres

// Puerto DNS estándar
const byte DNS_PORT = 53;

// IP fija del AP (típica 192.168.4.1)
IPAddress apIP(192, 168, 4, 1);
IPAddress netMsk(255, 255, 255, 0);
// ===== HTML COMPLETO EMBEBIDO =====
#include "HTML/mainHTML.cpp"



// ===== WEBSOCKET EVENTOS =====
// void onWsEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
//   if (type == WStype_CONNECTED) {
//     // Enviar estado inicial al cliente recién conectado
//     char buffer[400];
//     sprintf(buffer, "{\"rpm\":%.2f}", rpm );
//     ws.sendTXT(num, buffer);
//   }
//   // Aquí puedes agregar el manejo de mensajes entrantes si lo necesitas
// }

// ===== HANDLERS DEL SERVIDOR HTTP =====

// Página principal
void handleRoot() {
  String page = MAIN_page;
  page.replace("Cargando...", WiFi.localIP().toString());
  server.send(200, "text/html", page);
}

// Redirección genérica: cualquier path te manda al Tablero principal
// void handleNotFound() {
//   server.sendHeader("Location", String("http://") + apIP.toString(), true);
//   server.send(302, "text/plain", "");
// }


// ===== SETUP =====
void setup() {
  Serial.begin(115200);
  WiFiManager wifiManager;
  // wifiManager.resetSettings(); // Descomenta para forzar portal cada vez
  Serial.println("Iniciando WiFiManager...");
  if (!wifiManager.autoConnect("Instrumentos-ESP32")) {
    Serial.println("No se pudo conectar a WiFi. Reiniciando...");
    delay(3000);
    ESP.restart();
  }
  Serial.println("Conectado a WiFi!");
  Serial.print("IP asignada: ");
  Serial.println(WiFi.localIP());

  // ===== HTTP SERVER =====

  server.on("/", handleRoot);
  // server.onNotFound(handleNotFound); // Comentado porque handleNotFound está comentada
  server.begin();

  // ===== WEBSOCKET =====
  ws.begin();
  ws.onEvent(onWsEvent);

  // Inicializar valores de sliders en el frontend al conectar
  delay(500); // Espera breve para asegurar que el frontend esté listo
  char buffer[200];
  sprintf(buffer, "{\"verticalSpeed\":%.2f,\"vsSliderValue\":%d,\"rpm\":%.2f}", vsVar, vsSliderValue, rpm);
  ws.broadcastTXT(buffer);
}



void loop() {
  // Rutina automática de arranque para RPM
  if (startRoutine) {
    unsigned long t = millis() - routineStart;
    if (routineStep == 0) { // Subir a 1000 rpm en 1.5s
      float frac = min(1.0f, t / 1500.0f);
      varRPM = routineInitial + (1000 - routineInitial) * frac;
      if (frac >= 1.0f) {
        routineStep = 1;
        routineStart = millis();
      }
    } else if (routineStep == 1) { // Mantener 3s
      varRPM = 1000;
      if (t >= 3000) {
        routineStep = 2;
        routineStart = millis();
      }
    } else if (routineStep == 2) { // Bajar a 700 rpm en 4s
      float frac = min(1.0f, t / 4000.0f);
      varRPM = 1000 + (455 - 1000) * frac;
      if (frac >= 1.0f) {
        varRPM = 455;
        startRoutine = false;
      }
    }
  }

  // Calcular valor mostrado con ruido solo para enviar al frontend
  float rpm_mostrar = rpm;
  if (rpm != 0.0f && rpmNoiceOn) {
      int ruido = random(-5, 6); // de -5 a +5
      rpm_mostrar = rpm + ruido;
      if (rpm_mostrar < 0) rpm_mostrar = 0;
      if (rpm_mostrar > 3000) rpm_mostrar = 3000;
  }
  
  // Procesar DNS (muy importante para el portal cautivo)
  dnsServer.processNextRequest();

  // HTTP server
  server.handleClient();

  // WebSocket
  ws.loop();

  
  // Limitar el valor de varRPM entre 0 y 3000
  if (varRPM > 3000) varRPM = 3000;
  if (varRPM < 0) varRPM = 0;

  // Asignar el valor del slider directamente a rpm
  rpm = (float)varRPM;

  // Enviar valores de los dos instrumentos activos (rpm usa rpm_mostrar)
  char buffer[200];
  sprintf(buffer, "{\"variometer\":%.2f, \"vsSliderValue\":%d, \"rpm\":%.2f}",
    vsVar, vsSliderValue, rpm_mostrar);
  ws.broadcastTXT(buffer);

  delay(50);
}
