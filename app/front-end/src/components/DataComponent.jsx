import React, { useEffect, useState } from "react";
import GaugeChart from './GaugeChart';

const DataComponent = () => {
  // Stato per memorizzare i dati dei sensori
  const [data, setData] = useState([]);
  const [updatedMessages, setUpdatedMessages] = useState([]);

  // Funzione per recuperare i dati dal server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:7000/");
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        const responseData = await response.json();

        // Assicurati che ci siano dati
        if (responseData.items) {
          // Parsing dei dati ricevuti
          const parsedData = responseData.items.map((item) => ({
            ESPname: item.ESPname,
            airQuality: item.airQuality,
            description: item.description,
            timestamp: new Date().toISOString() // Aggiungi un timestamp
          }));

          setData(parsedData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 20000); // Aggiorna i dati ogni 20 secondi
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const updatedMap = new Map(updatedMessages.map(item => [item.ESPname, item]));

    data.forEach(item => {
      updatedMap.set(item.ESPname, item); // Aggiorna o aggiunge il messaggio
    });

    setUpdatedMessages(Array.from(updatedMap.values())); // Converti la mappa in array
  }, [data]);

  // Funzione per determinare il messaggio basato sul valore della qualità dell'aria
  const renderAirQualityMessage = (airQualityValue) => {
    if (airQualityValue <= 50) return "Good air quality";
    if (airQualityValue <= 100) return "Moderate air quality";
    if (airQualityValue <= 150) return "Unhealthy air quality for sensitive groups";
    if (airQualityValue <= 200) return "Unhealthy air quality";
    if (airQualityValue <= 300) return "Very unhealthy air quality";
    return "Dangerous air quality";
  };

  // Funzione per determinare la posizione della lancetta
  const getNeedlePosition = (airQualityValue) => {
    const maxRotation = 180; // Rotazione massima di 180 gradi
    const maxValue = 400; // Valore massimo per la qualità dell'aria
    //const minValue = 0; 
    const clampedValue = Math.min(Math.max(airQualityValue, 0), maxValue);  // Limita il valore entro il range [0, maxValue]

    // Calcola la posizione della lancetta
    const rotation = (clampedValue / maxValue) * maxRotation;

    // Aggiungi 90 gradi per iniziare dalla posizione corretta (sinistra del semicerchio)
    const adjustedRotation = rotation - 90;

    console.log("Rotazione calcolata:", adjustedRotation);
    return `rotate(${adjustedRotation}deg)`;
  };

  // Recupera il valore della qualità dell'aria dall'ultimo dato ricevuto
  const latestData = updatedMessages.length > 0 ? updatedMessages[0] : null;
  const airQualityValue = latestData ? latestData.airQuality : 0;

  return (
    <div className="App">
      <h2>Sistema di Monitoraggio della Qualità dell'Aria</h2>
      <p>Valore attualmente rilevato: {airQualityValue}</p>

      {/* Usa il GaugeChart qui */}
      <GaugeChart airQuality={airQualityValue} />

      <p>{renderAirQualityMessage(airQualityValue)}</p>

      {/* <div>
        <h3>Ultimi dati ricevuti:</h3>
        {updatedMessages.map((item, index) => (
          <div key={index}>
            <p><strong>Timestamp:</strong> {item.timestamp}</p>
            <p><strong>ESP Name:</strong> {item.ESPname}</p>
            <p><strong>Air Quality Value:</strong> {item.airQuality}</p>
            <p><strong>Description:</strong> {item.description}</p>
            <hr />
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default DataComponent;
