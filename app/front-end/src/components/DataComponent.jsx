import React, { useEffect, useState } from "react";

const DataComponent = () => {
  // Stato per memorizzare i dati dei sensori
  const [data, setData] = useState([]);
  const [updatedMessages, setUpdatedMessages] = useState([]);

  // Funzione per recuperare i dati dal server
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Effettua la richiesta HTTP al server (modifica l'URL in base alla tua configurazione)
        const response = await fetch("http://localhost:7000/air_quality");
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        const responseData = await response.json();
        setData(responseData.items);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 20000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let dataObjects = updatedMessages;

    if (!(data instanceof Array)) {
      return;
    }

    // Aggiorna i dati esistenti o aggiungi nuovi
    for (const item of data) {
      const itemIndex = dataObjects.findIndex(
        (e) => e.ESPname === item.ESPname
      );
      if (itemIndex >= 0) {
        dataObjects[itemIndex] = item;
      } else {
        dataObjects.push(item);
      }
    }

    setUpdatedMessages(dataObjects);
  }, [data]);

  // Funzione per determinare il messaggio basato sul valore della qualità dell'aria
  const renderAirQualityMessage = (airQualityValue) => {
    if (airQualityValue <= 50) {
      return "Buona qualità dell'aria";
    } else if (airQualityValue <= 100) {
      return "Qualità dell'aria moderata";
    } else if (airQualityValue <= 150) {
      return "Insalubre per gruppi sensibili";
    } else if (airQualityValue <= 200) {
      return "Insalubre";
    } else if (airQualityValue <= 300) {
      return "Molto insalubre";
    } else {
      return "Pericolosa";
    }
  };

  // Funzione per determinare la classe CSS in base al valore della qualità dell'aria
  const getAirQualityClass = (airQualityValue) => {
    if (airQualityValue <= 50) {
      return "air-quality-good";
    } else if (airQualityValue <= 100) {
      return "air-quality-moderate";
    } else if (airQualityValue <= 150) {
      return "air-quality-unhealthy";
    } else if (airQualityValue <= 200) {
      return "air-quality-very-unhealthy";
    } else {
      return "air-quality-hazardous";
    }
  };

  // Funzione per determinare la posizione dell'indicatore a leva
  const getLeverPosition = (airQualityValue) => {
    return `${(airQualityValue / 400) * 100}%`;
  };

  return (
    <div className="App">
      <h2>Sistema di Monitoraggio della Qualità dell'Aria</h2>
      <table>
        <thead>
          <tr>
            <th>Nome del Sensore</th>
            <th>Valore Qualità dell'Aria</th>
            <th>Stato</th>
            <th>Indicatore</th>
          </tr>
        </thead>
        <tbody>
          {updatedMessages.map((item) => (
            <tr key={item.ESPname}>
              <td>{item.ESPname}</td>
              <td>{item.air_quality}</td>
              <td>{renderAirQualityMessage(item.air_quality)}</td>
              <td>
                <div className="air-quality-indicator">
                  <div
                    className={`lever ${getAirQualityClass(item.air_quality)}`}
                    style={{ left: getLeverPosition(item.air_quality) }}
                  ></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!data.length && <p>Fetching data...</p>}
    </div>
  );
};

export default DataComponent;
