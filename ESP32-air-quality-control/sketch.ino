#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>

#define AirQualityPin 34 // Pin collegato al sensore MQ-135 (può essere ignorato per la simulazione)

// Credenziali Wi-Fi
const char* ssid = "WokWi-GUEST";  // Modifica con il tuo SSID
const char* password = "";          // Modifica con la tua password

// Credenziali server MQTT
const char* mqttServer = "a1cxrn2jmoxkss-ats.iot.us-east-1.amazonaws.com";
const int mqttPort = 8883;
const char* mqttTopic = "test_project";
const char* mqttUsername = "admin";
const char* mqttPassword = "password";
const char* ESPname = "AirQualitySensorONE";

// Certificati AWS (da sostituire con i tuoi certificati reali)
static const char AWS_CERT_CA[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
<rootCA.pem>
-----END CERTIFICATE-----
)EOF";

static const char AWS_CERT_CRT[] PROGMEM = R"KEY(
-----BEGIN CERTIFICATE-----
<cert.crt>
-----END CERTIFICATE-----
)KEY";

static const char AWS_CERT_PRIVATE[] PROGMEM = R"KEY(
-----BEGIN RSA PRIVATE KEY-----
<private.key>
-----END RSA PRIVATE KEY-----
)KEY";

// Variabili di temporizzazione
unsigned long previousMillis = 0;
const long interval = 1000;

// Pin LED
#define LED_GREEN_PIN 12 // Pin per LED verde
#define LED_YELLOW_PIN 14 // Pin per LED giallo
#define LED_RED_PIN 13 // Pin per LED rosso

WiFiClientSecure espClient;
PubSubClient client(espClient);

// Buffer per il messaggio MQTT
#define MSG_BUFFER_SIZE (50)
char msg[MSG_BUFFER_SIZE];

int airQualityValue;  // Valore di qualità dell'aria simulato

// Funzione per la connessione WiFi
void connectWiFi() {
  WiFi.begin(ssid, password);
  Serial.println("Connessione...");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.println(".");
    delay(1000);
  }
  Serial.println("Connessione riuscita");
  Serial.println("indirizzo IP: ");
  Serial.println(WiFi.localIP());
}

// Funzione per la connessione MQTT
void connectMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    String clientId = "ESP32Client-" + String(random(0xffff), HEX);
    if (client.connect(clientId.c_str(), mqttUsername, mqttPassword)) {
      Serial.println("Connected to MQTT.");
      client.subscribe(mqttTopic);
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 3 seconds.");
      delay(3000);
    }
  }
}

// Funzione di callback per messaggi in arrivo (MQTT)
void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println("Message received: " + message);
}

// Funzione che restituisce una descrizione della qualità dell'aria
String getAirQualityDescription(int airQualityValue) {
  if (airQualityValue <= 50) {
    return "Buona qualità dell'aria";
  } else if (airQualityValue <= 100) {
    return "Qualità dell'aria moderata";
  } else if (airQualityValue <= 150) {
    return "Qualità dell'aria insalubre per gruppi sensibili";
  } else if (airQualityValue <= 200) {
    return "Qualità dell'aria insalubre";
  } else if (airQualityValue <= 300) {
    return "Qualità dell'aria molto insalubre";
  } else {
    return "Qualità dell'aria pericolosa";
  }
}

// Funzione per generare casualmente un valore di qualità dell'aria
int simulateAirQuality() {
  return random(0, 401);  // Valore casuale tra 0 e 400 per simulare diverse condizioni
}

// Funzione per inviare i dati della qualità dell'aria come JSON
void publishAirQualityData() {
  StaticJsonDocument<200> data;
  char jsonBuffer[512];

  // Crea l'oggetto JSON
  data["ESPname"] = ESPname;
  data["air_quality"] = airQualityValue;  // Valore simulato del sensore
  data["description"] = getAirQualityDescription(airQualityValue);  // Aggiunta della descrizione

  // Serializza i dati JSON
  serializeJson(data, jsonBuffer);

  // Invia i dati al topic MQTT
  client.publish(mqttTopic, jsonBuffer);
  Serial.println("Published air quality data: ");
  Serial.println(jsonBuffer);
}

// Funzione per gestire i LED in base alla qualità dell'aria
void handleLEDs() {
  if (airQualityValue <= 100) { // Buona qualità dell'aria
    digitalWrite(LED_GREEN_PIN, HIGH);
    digitalWrite(LED_YELLOW_PIN, LOW);
    digitalWrite(LED_RED_PIN, LOW);
  } else if (airQualityValue <= 200) { // Qualità dell'aria moderata o insalubre per gruppi sensibili
    digitalWrite(LED_GREEN_PIN, LOW);
    digitalWrite(LED_YELLOW_PIN, HIGH);
    digitalWrite(LED_RED_PIN, LOW);
  } else { // Qualità dell'aria insalubre
    digitalWrite(LED_GREEN_PIN, LOW);
    digitalWrite(LED_YELLOW_PIN, LOW);
    digitalWrite(LED_RED_PIN, HIGH);
  }
}

void setup() {
  Serial.begin(115200);

  // Configurazione dei pin dei LED come uscite
  pinMode(LED_GREEN_PIN, OUTPUT);
  pinMode(LED_YELLOW_PIN, OUTPUT);
  pinMode(LED_RED_PIN, OUTPUT);

  // Connessione WiFi
  connectWiFi();

  // Impostazioni MQTT
  espClient.setCACert(AWS_CERT_CA);
  espClient.setCertificate(AWS_CERT_CRT);
  espClient.setPrivateKey(AWS_CERT_PRIVATE);
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);

  // Pin setup (non più necessario per la simulazione)
  pinMode(AirQualityPin, INPUT);

  // Genera un valore iniziale casuale per la qualità dell'aria
  airQualityValue = simulateAirQuality();
  Serial.print("Valore iniziale di qualità dell'aria simulato: ");
  Serial.println(airQualityValue);

  Serial.println("Sistema di monitoraggio della qualità dell'aria avviato.");
  handleLEDs(); // Aggiorna lo stato dei LED inizialmente
}

void loop() {
  if (!client.connected()) {
    connectMQTT();
  }
  client.loop(); // Gestione MQTT

  // Ogni 'interval' secondi, genera un nuovo valore di qualità dell'aria e invia i dati
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    // Genera un nuovo valore di qualità dell'aria simulato
    airQualityValue = simulateAirQuality();
    Serial.print("Nuovo valore di qualità dell'aria simulato: ");
    Serial.println(airQualityValue);

    // Pubblica i dati
    publishAirQualityData();

    // Gestisce lo stato dei LED in base al valore della qualità dell'aria
    handleLEDs();
  }
}
