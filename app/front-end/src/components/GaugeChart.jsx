import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

// Registriamo gli elementi di Chart.js
Chart.register(ArcElement, Tooltip, Legend);

const GaugeChart = ({ airQuality }) => {
  // Logica per definire i colori basata sui range di qualità dell'aria
  const getColor = (value) => {
    if (value <= 50) return 'green'; // Good air quality
    if (value <= 100) return 'rgb(98, 220, 98)'; // Moderate air quality
    if (value <= 150) return 'yellow'; // Unhealthy air quality for sensitive groups
    if (value <= 200) return 'orange'; // Unhealthy air quality
    if (value <= 300) return 'red'; // Very unhealthy air quality
    return 'rgb(106, 0, 0)'; // Dangerous air quality
  };

  const data = {
    datasets: [{
      data: [airQuality, 400 - airQuality], // Il valore e lo spazio restante
      backgroundColor: [
        getColor(airQuality), // Colore in base al valore
        'lightgray' // Lo sfondo
      ],
      borderWidth: 0
    }]
  };

  const options = {
    rotation: -90, // Ruota il grafico di -90 gradi per farlo partire da sinistra
    circumference: 180, // Mostra solo la metà superiore
    cutout: '80%', // Lascia spazio nel centro per renderlo realistico
    plugins: {
      legend: {
        display: false // Rimuovi la leggenda
      }
    }
  };

  return (
    <div>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default GaugeChart;
