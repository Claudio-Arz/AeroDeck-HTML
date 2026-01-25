/*
  1-18-2026
  Arzamendia Systems
  Tablero completo con intrumental aeronáutico
  para ajustar con instrumentos analógicos.

  



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

// ===== CONFIGURAR ACCESS POINT =====
const char* ap_ssid = "Intrumentos-ESP32";  // Nombre del AP servidor
const char* ap_pass = "12345678";   // mínimo 8 caracteres

// Puerto DNS estándar
const byte DNS_PORT = 53;

// IP fija del AP (típica 192.168.4.1)
IPAddress apIP(192, 168, 4, 1);
IPAddress netMsk(255, 255, 255, 0);
// ===== HTML COMPLETO EMBEBIDO =====
#include "mainHTML.cpp"



// ===== WEBSOCKET EVENTOS =====
int vsSliderValue = 0;
float rpm = 0.0f;
int varRPM = 0;
int ant_Val_RPM = 0;
bool rpmNoiceOn = false;
bool startRoutine = false;
unsigned long routineStart = 0;
int routineStep = 0;
float routineInitial = 0;

// FuelFlow
float fuelFlow = 0.0f;
float varFuelFlow = 0.0f;
float ant_Val_FuelFlow = -1.0f;

// Attitude Control
float rollValue = 0.0f;
int pitchValue = 0;


// AirSpeed
float airspeedValue = 40.0f;
float varAirspeed = 40.0f;
float ant_Val_Airspeed = -1.0f;

// Variables de estado de instrumentos
float heading = 0.0f;
float verticalSpeed = 0.0f;
float vsVar = 0.0f;

void onWsEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  if (type == WStype_TEXT) {
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, payload, length);
    if (!error) {
      if (doc.containsKey("setAirspeed")) {
        varAirspeed = doc["setAirspeed"].as<float>();
      }
      if (doc.containsKey("setRPMNoice")) {
        rpmNoiceOn = doc["setRPMNoice"].as<bool>();
      }
      if (doc.containsKey("setVerticalSpeed")) {
        vsSliderValue = doc["setVerticalSpeed"].as<int>();
      }
      if (doc.containsKey("setRPMSpeed")) {
        varRPM = doc["setRPMSpeed"].as<int>();
      }
      if (doc.containsKey("setFuelFlow")) {
        varFuelFlow = doc["setFuelFlow"].as<float>();
      }
      if (doc.containsKey("setRoll")) {
        rollValue = doc["setRoll"].as<float>();
      }
      if (doc.containsKey("setPitch")) {
        pitchValue = doc["setPitch"].as<int>();
      }
      if (doc.containsKey("startMotorRoutine")) {
        if (rpm == 0.0f) {
          startRoutine = true;
          routineStart = millis();
          routineStep = 0;
          routineInitial = varRPM;
        }
      }
    }
  }
  if (type == WStype_CONNECTED) {
    // Enviar estado inicial al cliente recién conectado
    char buffer[400];
    sprintf(buffer, "{\"heading\":%.2f,\"verticalSpeed\":%.2f,\"vsSliderValue\":%d,\"rpm\":%.2f,\"fuelFlow\":%.2f,\"roll\":%.2f,\"pitch\":%d,\"airspeed\":%.2f}", heading, vsVar, vsSliderValue, rpm, fuelFlow, rollValue, pitchValue, airspeedValue);
    ws.sendTXT(num, buffer);
  }
}

// ===== HANDLERS DEL SERVIDOR HTTP =====

// Página principal
void handleRoot() {
  String page = MAIN_page;
  page.replace("Cargando...", WiFi.localIP().toString());
  server.send(200, "text/html", page);
}

// Redirección genérica: cualquier path te manda al Tablero principal
void handleNotFound() {
  server.sendHeader("Location", String("http://") + apIP.toString(), true);
  server.send(302, "text/plain", "");
}


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
  server.onNotFound(handleNotFound);
  server.begin();

  // ===== WEBSOCKET =====
  ws.begin();
  ws.onEvent(onWsEvent);

  // Inicializar valores de sliders en el frontend al conectar
  delay(500); // Espera breve para asegurar que el frontend esté listo
  char buffer[400];
  sprintf(buffer, "{\"heading\":%.2f,\"verticalSpeed\":%.2f,\"vsSliderValue\":%d,\"rpm\":%.2f,\"fuelFlow\":%.2f,\"roll\":%.2f,\"pitch\":%d,\"airspeed\":%.2f}", heading, vsVar, vsSliderValue, rpm, fuelFlow, rollValue, pitchValue, airspeedValue);
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
    } else if (routineStep == 2) { // Bajar a 700 rpm en 3s
      float frac = min(1.0f, t / 3000.0f);
      varRPM = 1000 + (700 - 1000) * frac;
      if (frac >= 1.0f) {
        varRPM = 700;
        startRoutine = false;
      }
    }
  }

  // Procesar DNS (muy importante para el portal cautivo)
  dnsServer.processNextRequest();

  // HTTP server
  server.handleClient();

  // WebSocket
  ws.loop();

  // Lectura y envío del heading
  static unsigned long lastUpdate = millis();
  unsigned long now = millis();
  float dt = (now - lastUpdate) / 60000.0f; // minutos
  lastUpdate = now;
  heading += vsVar * 1000.0f * dt; // vsVar en 1000 pies/minuto * minutos = pies
  if (heading >= 20000.0f) heading = 20000.0f;
  if (heading <= 0.0f) heading = 0.0f;

  if (verticalSpeed != vsSliderValue) {
    verticalSpeed = vsSliderValue;
    vsVar = (verticalSpeed / 127.0f) * 2.0f;
    Serial.print("verticalSpeed: ");
    Serial.print(verticalSpeed);
    Serial.print("  vsVar: ");
    Serial.println(vsVar);
  }

  // Limitar el valor de varRPM entre 0 y 3000
  if (varRPM > 3000) varRPM = 3000;
  if (varRPM < 0) varRPM = 0;

  // Asignar el valor del slider directamente a rpm
  rpm = (float)varRPM;
  // Calcular valor mostrado with ruido solo para enviar al frontend
  float rpm_mostrar = rpm;
  if (rpm != 0.0f && rpmNoiceOn) {
    int ruido = random(-5, 6); // de -5 a +5
    rpm_mostrar = rpm + ruido;
    if (rpm_mostrar < 0) rpm_mostrar = 0;
    if (rpm_mostrar > 3000) rpm_mostrar = 3000;
  }

  // FuelFlow: limitar y asignar
  if (varFuelFlow > 20.0f) varFuelFlow = 20.0f;
  if (varFuelFlow < 0.0f) varFuelFlow = 0.0f;
  fuelFlow = varFuelFlow;
  float fuelFlow_mostrar = fuelFlow;
  if (ant_Val_FuelFlow != varFuelFlow) {
    ant_Val_FuelFlow = varFuelFlow;
    Serial.print("FuelFlow: ");
    Serial.println(fuelFlow);
  }

  // AirSpeed: limitar y asignar
  if (varAirspeed > 200.0f) varAirspeed = 200.0f;
  if (varAirspeed < 40.0f) varAirspeed = 40.0f;
  airspeedValue = varAirspeed;
  float airspeed_mostrar = airspeedValue;
  if (ant_Val_Airspeed != varAirspeed) {
    ant_Val_Airspeed = varAirspeed;
    Serial.print("Airspeed: ");
    Serial.println(airspeedValue);
  }

  // Solo imprimir si cambia el valor
  if (ant_Val_RPM != varRPM) {
    ant_Val_RPM = varRPM;
    Serial.print("RPM: ");
    Serial.println(rpm);
  }

  char buffer[400];
  sprintf(buffer, "{\"heading\":%.2f,\"verticalSpeed\":%.2f,\"vsSliderValue\":%d,\"rpm\":%.2f,\"fuelFlow\":%.2f,\"roll\":%.2f,\"pitch\":%d,\"airspeed\":%.2f}", heading, vsVar, vsSliderValue, rpm_mostrar, fuelFlow_mostrar, rollValue, pitchValue, airspeed_mostrar);
  ws.broadcastTXT(buffer);

  delay(50);
}
