# AirQuality-EmbeddedProgetto
## Traccia
Questo progetto si concentra sul monitoraggio della qualità dell'aria. Al posto di utilizzare sensori fisici, i dati vengono generati in modo casuale per simulare i livelli di inquinamento atmosferico. Ogni pochi secondi, viene prodotto un valore numerico randomico all'interno di un intervallo predefinito, permettendo così di classificare la qualità dell'aria in diverse categorie. Gli utenti possono visualizzare questi dati tramite un'app web, e i LED rossi, verdi e gialli forniscono un'indicazione visiva immediata della qualità dell'aria in tempo reale.

## Suddivisione cartelle
- ESP32-air-quality-control : contiene lo zip del progetto su WokWi, includendo file come .ino per il funzionamento del circuito, le librerie e il diagramma (.json).
- app: contiene la parte back-end e front-end dell'app per visualizzare e gestire i dati sulla qualità dell'aria.
- MQTT server: Il server MQTT è in ascolto su un'istanza EC2 di AWS.

## Host Endpoint
## Perchè viene utilizzata una EC2?
## Connessione al server

## Funzionalità
- Monitoraggio della qualità dell'aria: il sistema genera valori casuali per simulare la qualità dell'aria e li pubblica sul server MQTT.
- Indicatori LED: i LED si accendono in base alla qualità dell'aria simulata, fornendo un feedback visivo immediato.
- Interfaccia web: gli utenti possono visualizzare i dati sulla qualità dell'aria in tempo reale attraverso un'interfaccia web intuitiva.
