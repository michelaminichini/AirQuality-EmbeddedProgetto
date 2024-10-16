#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>

// Credenziali Wi-Fi
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// Credenziali server MQTT
const char* mqttServer = "a1cxrn2jmoxkss-ats.iot.us-east-1.amazonaws.com";
const int mqttPort = 8883;
const char* mqttTopic = "test_project";
const char* mqttUsername = "michela";
const char* mqttPassword = "password";
const char* ESPname = "AirQualitySensor";

// Certificati AWS
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
const long interval = 5000;

// Pin LED
#define LED_GREEN_PIN 18 // Pin per LED verde
#define LED_YELLOW_PIN 19 // Pin per LED giallo
#define LED_RED_PIN 21 // Pin per LED rosso

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

    // Imposta certificati per la connessione sicura
    espClient.setCACert(AWS_CERT_CA); // Certificato CA
    espClient.setCertificate(AWS_CERT_CRT); // Certificato del dispositivo
    espClient.setPrivateKey(AWS_CERT_PRIVATE); // Chiave privata del dispositivo

    // Genera un ID client casuale
    String clientId = "ESP32Client-" + String(random(0xffff), HEX);

    // Tentativo di connessione
    if (client.connect(clientId.c_str())) {
      Serial.println("Connected to MQTT.");
      client.subscribe(mqttTopic); // Iscrizione al topic
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state()); // Stampa il codice di errore

      // Debugging dettagliato
      Serial.print(" - Error message: ");
      if (client.state() == -2) {
        Serial.println("MQTT Connection Timeout or DNS failure (check broker URL)");
      } else if (client.state() == -1) {
        Serial.println("MQTT Connection Refused");
      } else if (client.state() == -4) {
        Serial.println("Server closed connection");
      } else {
        Serial.println("Unknown error");
      }

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
    return "Good air quality";
  } else if (airQualityValue <= 100) {
    return "Moderate air quality";
  } else if (airQualityValue <= 150) {
    return "Unhealthy air quality for sensitive groups";
  } else if (airQualityValue <= 200) {
    return "Unhealthy air quality";
  } else if (airQualityValue <= 300) {
    return "Very unhealthy air quality";
  } else {
    return "Dangerous air quality";
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
  data["airQuality"] = airQualityValue;  
  data["description"] = getAirQualityDescription(airQualityValue);  

  // Serializza i dati JSON
  serializeJson(data, jsonBuffer);

  // Invia i dati al topic MQTT
  
  Serial.println("Publishing data...");
  client.publish(mqttTopic, jsonBuffer);
  Serial.println("Data published: ");
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


// All'interno del setup()
void setup() {
  Serial.begin(115200);

  // Connessione WiFi
  connectWiFi();

  //START MQTT init
  espClient.setCACert(AWS_CERT_CA);
  espClient.setCertificate(AWS_CERT_CRT);
  espClient.setPrivateKey(AWS_CERT_PRIVATE);
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);
  //END MQTT init

  // Configurazione dei pin dei LED come uscite
  pinMode(LED_GREEN_PIN, OUTPUT);
  pinMode(LED_YELLOW_PIN, OUTPUT);
  pinMode(LED_RED_PIN, OUTPUT);


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