const express = require("express");
const fs = require("fs");
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
