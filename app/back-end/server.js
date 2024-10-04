const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);
const mqtt = require("mqtt");

// Configurazione Express
const app = express();
const hostname = "localhost";
const port = 7000;
const outputFile = "./mqtt-subscription/output.txt";

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Avvio del server Express
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

// MQTT client configuration
const mqttOptions = {
  host: "a1cxrn2jmoxkss-ats.iot.us-east-1.amazonaws.com",
  port: 8883,
  protocol: "mqtts",
  username: "admin",
  password: "password",
  ca: fs.readFileSync('./mqtt-subscription/Mosquitto/certs/rootCA.pem'),
  cert: fs.readFileSync('./mqtt-subscription/Mosquitto/certs/cert.crt'),
  key: fs.readFileSync('./mqtt-subscription/Mosquitto/certs/private.key')
};

// Connessione MQTT
const mqttClient = mqtt.connect(mqttOptions);

// Controlla se la connessione è attiva
mqttClient.on('connect', () => {
  console.log("Connesso al broker MQTT!");
  mqttClient.subscribe("test_project", (err) => {
    if (!err) {
      console.log("Iscritto al topic 'test_project'");
    }
  });
});

// Funzione che riceve dati MQTT e li scrive nel file
mqttClient.on('message', (topic, message) => {
  const timestamp = new Date().toISOString();
  const data = `${timestamp} - ${topic}: ${message.toString()}\n`;
  fs.appendFile(outputFile, data, (err) => {
    if (err) {
      console.error("Errore nella scrittura su file", err);
    }
  });
});

// Rotta GET per ottenere gli ultimi 5 dati dal file
app.get("/", (req, res) => {
  fs.readFile(outputFile, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Errore nella lettura del file");
      return;
    }

    const rows = data.split("\n");
    const lastElements = rows.slice(-6, -1); // Ottieni gli ultimi 5 dati

    const response = {
      items: lastElements.map(row => {
        const parts = row.split(" - ");
        return { timestamp: parts[0], data: parts[1] };
      })
    };

    res.json(response);
  });
});