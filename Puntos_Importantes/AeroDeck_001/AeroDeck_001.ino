/*
2026-02-08 14:50:47
Versión 003
Claudio Arzamendia Systems
Tablero completo con instrumental aeronáutico
para ajustar instrumentos analogicos.





Este sistema se basa en que .ino genera una página de internet y luego
 recibe y envía valores para actualizar la vista de los instrumentos. 
 El problema es que muevo el variometer, que tiene que enviar el valor 
 del slider al .ino, este programa tiene que calcular el valor  para el 
 altímetro, y transmitir los valores para el altimetro y el variómetro 
 para que se actualicen el la página web.

 2026-02-09 16:08:40
 Recuperando una caida, por cambios de librerías.

 2026-02-10 18:37:37
 Se volvió a usar ficheros .js esternos para funciones de actualización de instrumentos.
 Esta volviendo variometro y altimetro poco a poco a la vida.
 2026-02-11 21:08:03
 Ajustando por qué el slider no se refleja en el variómetro.
*/

#include <WiFi.h>
#include <WiFiManager.h> // https://github.com/tzapu/WiFiManager
#include <WebServer.h>
#include <WebSocketsServer.h>
#include <DNSServer.h>
#include <ArduinoJson.h>
// ===== HTML COMPLETO EMBEBIDO =====
#include "HTML/mainHTML.cpp"
// ===== OBJETOS =====
WebServer server(80);
WebSocketsServer ws(81);
DNSServer dnsServer;

// ===== VARIABLES GLOBALES =====


float verSpeedValue = 0.0f; // Velocidad vertical en pies por minuto mostrada por el variómetro
float altitudValue = 0.0f; // Altitud en pies mostrada por el altímetro
bool bandera_off = false; // Indica si el altímetro NO debe mostrar bandera_off


void onWsEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  
  if (type == WStype_TEXT) {
    StaticJsonDocument<128> doc;
    DeserializationError error = deserializeJson(doc, payload, length);
    if (error) {
      // Si no es JSON válido, ignorar
      return;
    }
    if (doc["verticalSpeed"].is<float>() || doc["verticalSpeed"].is<int>()) {
      verSpeedValue = doc["verticalSpeed"].as<float>();
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



// ===== HANDLERS DEL SERVIDOR HTTP =====

// Página principal
void handleRoot() {
  String page = MAIN_page;
  page.replace("Cargando...", WiFi.localIP().toString());
  server.send(200, "text/html", page);
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
  // server.onNotFound(handleNotFound); // Comentado porque handleNotFound está comentada
  server.begin();
  
  // ===== WEBSOCKET =====
  ws.begin();
  ws.onEvent(onWsEvent);
  

}


static unsigned long lastUpdate = 0; // usada en variometroAltimetro
float cuentaTiempo = 0.0f;

// ===== LOOP PRINCIPAL =====
void loop() {
  cuentaTiempo += 0.05f; // Aproximadamente cada 50 ms
  if (cuentaTiempo >= 5.0f) {
    // Cuenta 5 segundos y puede hacer algo.
    // Serial.println("==============================");
  }
  
  // Manejo de variómetro y altímetro
  variometroAltimetro();
  // Procesar DNS (muy importante para el portal cautivo)
  dnsServer.processNextRequest();
  // HTTP server
  server.handleClient();
  // WebSocket
  ws.loop();

  if (cuentaTiempo >= 5.0f) {
    cuentaTiempo = 0.0f;
    // Serial.println("altitudValue....: " + String(altitudValue) + " pies");
    // Serial.println("verSpeedValue...: " + String(verSpeedValue) + " pies/Min");
    // Serial.println("bandera_off.....: " + String(bandera_off ? "true" : "false") + " > 19000 pies");
  }
  
  // Enviar valores de los dos instrumentos activos
  StaticJsonDocument<1000> doc;
  doc["verticalSpeed"] = verSpeedValue;
  doc["altitudValue"] = altitudValue;
  doc["bandera_off"] = bandera_off;
  String output;
  serializeJson(doc, output);
  ws.broadcastTXT(output);
  delay(50);
  
}

// Función para manejar variómetro y altímetro
void variometroAltimetro() {
  if (altitudValue < 19000.0f) {
    bandera_off = false; // Reiniciar bandera_off si altitud es menor a 19000 pies
  } else {
    bandera_off = true; // Activar bandera_off si altitud es 19000 pies o más
  }
  
  if (verSpeedValue != 0 ) {
    unsigned long now = millis();
    if (lastUpdate == 0) lastUpdate = now;
    float dt = (now - lastUpdate) / 60000.0f; // minutos
    lastUpdate = now;
    if (dt > 0) {
      altitudValue += verSpeedValue * dt;
    }
    if (altitudValue <= 0.0f) altitudValue = 0.0f;
  }
}



