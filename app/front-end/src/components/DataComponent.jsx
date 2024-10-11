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
          throw new Error(`Network response was not okay: ${response.status}`);
        }
        const responseData = await response.json();

        if (responseData.items) {
          // Parsing dei dati ricevuti
          const parsedData = responseData.items.map((item) => ({
            ESPname: item.ESPname,
            airQuality: item.airQuality,
            description: item.description,
            timestamp: new Date().toISOString() // Aggiunge un timestamp
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

    setUpdatedMessages(Array.from(updatedMap.values())); // Converte la mappa in array
  }, [data]);

  // Funzione per determinare il messaggio basato sul valore della qualità dell'aria
  const renderAirQualityMessage = (airQualityValue) => {
    if (airQualityValue <= 50) return "Good air quality";
    if (airQualityValue <= 100) return "Moderate air quality";
    if (airQualityValue <= 150) return "Unhealthy air quality for sensitive groups";
    if (airQualityValue <= 200) return "Unhealthy air quality";
    if (airQualityValue <= 300) return "Very unhealthy air quality";
    return "Dangerous air quality"; // se il valore supera 301 (con un massimo di 400)
  };

  // Funzione per determinare la posizione della lancetta
  const getNeedlePosition = (airQualityValue) => {
    const maxRotation = 180; // Rotazione massima di 180 gradi
    const maxValue = 400; // Valore massimo per la qualità dell'aria
    const clampedValue = Math.min(Math.max(airQualityValue, 0), maxValue);  // Limita il valore entro il range [0, maxValue]

    // Calcola la posizione della lancetta
    const rotation = (clampedValue / maxValue) * maxRotation;

    // Aggiungere 90 gradi per iniziare dalla posizione corretta (sinistra del semicerchio)
    const adjustedRotation = rotation - 90;

    console.log("Rotazione calcolata:", adjustedRotation);
    return `rotate(${adjustedRotation}deg)`;
  };

  // Recupera il valore della qualità dell'aria dall'ultimo dato ricevuto
  const latestData = updatedMessages.length > 0 ? updatedMessages[0] : null;
  const airQualityValue = latestData ? latestData.airQuality : 0;

  return (
    <div className="App">
      <h2>Air Quality Monitoring System</h2>
      <p>Currently measured value: {airQualityValue}</p>

      {/* Uso di GaugeChart */}
      <GaugeChart airQuality={airQualityValue} />

      <p>{renderAirQualityMessage(airQualityValue)}</p>
    </div>
  );
};

export default DataComponent;