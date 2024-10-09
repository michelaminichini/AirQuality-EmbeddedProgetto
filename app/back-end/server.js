const express = require("express");
const fs = require("fs");
const iconv = require("iconv-lite");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const hostname = "localhost";
const port = 7000;
const outputFile = "./mqtt-subscription/output.txt";

app.use(bodyParser.json());
app.use(cors());

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

// Funzione per pulire caratteri indesiderati
const cleanString = (str) => {
  return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
};

// // Funzione per scrivere dati nel file con codifica UTF-8
// const writeDataToFile = (data) => {
//   fs.appendFile(outputFile, data + '\n', { encoding: 'utf8' }, (err) => {
//     if (err) {
//       console.error('Errore nella scrittura nel file:', err);
//     }
//   });
// };

// Funzione per decodificare i dati
const decodeData = (data) => {
  let decodedData;

  // Controlla se i primi due byte indicano BOM per UTF-16 LE
  if (data[0] === 0xFF && data[1] === 0xFE) {
    // Se è presente il BOM, decodifica come UTF-16 LE
    decodedData = iconv.decode(data, 'utf-16le');
  } else {
    // Altrimenti, prova a decodificare come UTF-8
    try {
      decodedData = iconv.decode(data, 'utf-8');
    } catch (e) {
      console.error('Errore nel decoding dei dati in UTF-8:', e);
      return null; // Ritorna null se non riesce a decodificare
    }
  }

  return decodedData;
};

// Uso nella tua funzione di lettura
app.get("/", (req, res) => {
  fs.readFile(outputFile, null, (err, data) => {
    if (err) {
      console.error('Errore nella lettura del file:', err);
      return res.status(500).send("Errore nel server");
    }

    // Decodifica i dati letti
    const decodedData = decodeData(data);

    if (!decodedData) {
      return res.status(500).send("Errore nel decoding dei dati");
    }

    // Ora puoi procedere a gestire decodedData come JSON
    const rows = decodedData.split("\n").map(cleanString).filter(row => row !== "");
    
    // Rimuovi "test_project" e crea un array di oggetti JSON
    const jsonItems = rows.map(row => {
      const jsonString = row.replace(/^test_project\s*/, ""); // Rimuovi "test_project" dall'inizio
      return jsonString;
    });

    console.log("Items JSON:", jsonItems); // Log degli items JSON

    const stringJson = `{"items": [${jsonItems.join(",")}]}`;

    let responseJson = {};
    try {
      responseJson = JSON.parse(stringJson);
    } catch (error) {
      console.log("Errore nel parsing della stringa JSON:", error.message);
    }

    console.log("response:", responseJson);
    res.send(responseJson);
  });
});