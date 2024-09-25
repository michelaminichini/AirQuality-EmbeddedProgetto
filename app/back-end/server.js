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
  host: "a3gozzilrkv83v-ats.iot.us-east-1.amazonaws.com",  // Inserisci il tuo MQTT broker (AWS o altro)
  port: 8883,
  protocol: "mqtts",
  username: "admin",      // Username MQTT (modifica se necessario)
  password: "password",   // Password MQTT (modifica se necessario)
  ca: fs.readFileSync('./mqtt-subscription/secrets/rootCA.pem'),
  cert: fs.readFileSync('./mqtt-subscription/secrets/cert.crt'),
  key: fs.readFileSync('./mqtt-subscription/secrets/private.key')
};

// Connessione MQTT
const mqttClient = mqtt.connect(mqttOptions);

// Controlla se la connessione è attiva
mqttClient.on('connect', () => {
  console.log("Connesso al broker MQTT!");
  mqttClient.subscribe("air_quality/data", (err) => {
    if (!err) {
      console.log("Iscritto al topic 'air_quality/data'");
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

// Rotta POST per impostare lo stato del sensore ESP
app.post("/set-esp-status", async (req, res) => {
  try {
    const { status, ESPname } = req.body;

    if (!status || !ESPname) {
      res.status(400).send("È necessario specificare sia 'status' che 'ESPname'.");
      return;
    }

    const command = `sh ./mqtt-subscription/publisher.sh ${status}-${ESPname}`;

    if (status === "disable" || status === "enabled") {
      console.log(`Esecuzione comando: ${command}`);
    } else {
      res.status(400).send('Lo stato deve essere "disable" o "enabled".');
      return;
    }

    // Esegui il comando per inviare il messaggio MQTT
    await exec(command);
    res.status(200).send(`Stato del sensore ${ESPname} aggiornato con successo.`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Errore nell'aggiornamento dello stato del sensore.");
  }
});
