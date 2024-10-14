<img src="images/logo-app.png" alt="Logo" style="float: left; margin-right: 10px; width: 120px;">

# AirQuality-EmbeddedProgetto
## Traccia
Questo progetto si concentra sul monitoraggio della qualità dell'aria. Al posto di utilizzare sensori fisici, i dati vengono generati in modo casuale per simulare i livelli di inquinamento atmosferico. Ogni 5 secondi, viene prodotto un valore numerico randomico all'interno di un intervallo predefinito, permettendo così di classificare la qualità dell'aria in diverse categorie. Gli utenti possono visualizzare questi dati tramite un'app web, in cui è presente un contatore che consente di visualizzare in modo semplice e chiaro i risultati. Per realizzare il progetto, è stato usato un ESP32, un microcontrollore, a cui sono stati collegati 3 LED (rosso, giallo, verde) in modo da fornire un'indicazione visiva immediata della qualità dell'aria in tempo reale.

## Suddivisione cartelle
- ESP32-air-quality-control : contiene lo zip del progetto su WokWi, includendo file come "sketch.ino" per il funzionamento del circuito, le librerie e il diagramma (.json).
- app: contiene la parte back-end e front-end dell'app per visualizzare e gestire i dati sulla qualità dell'aria.
- mqtt-subscription (presente dentro back-end): Il server MQTT è in ascolto su un'istanza EC2 di AWS.
- Mosquitto: cartella che contiene i componenti necessari per far funzionare il broker MQTT Mosquitto.
- secrets: cartella che contiene i certificati. Va scaricata e caricata all'interno di "mqtt-subscription".

## Host Endpoint
Il server MQTT è in ascolto su un'istanza EC2 di AWS.
Host endpoint: a1cxrn2jmoxkss-ats.iot.us-east-1.amazonaws.com

## Perchè viene utilizzata una EC2?
L'utilizzo di un'istanza EC2 su AWS ha rappresentato una scelta strategica per il progetto. Questa soluzione ha permesso di ospitare il broker MQTT in un ambiente cloud scalabile e flessibile. Eliminando la necessità di gestire un'infrastruttura locale, la configurazione della rete è stata semplificata notevolmente. Inoltre, la connessione diretta tra l'emulatore ESP32 e il broker MQTT sulla VM ha garantito una comunicazione efficiente e affidabile. La scelta del cloud ha offerto la possibilità di accedere ai dati e di gestire il sistema da qualsiasi luogo con una connessione internet, facilitando lo sviluppo e il testing.
È possibile consultare la documentazione AWS per l'inizializzazione di un server MQTT su istanza EC2 al [link](https://aws.amazon.com/it/blogs/iot/how-to-bridge-mosquitto-mqtt-broker-to-aws-iot/).

## Connessione al server
Per collegarsi al server MQTT, ogni dispositivo deve fornire delle credenziali uniche (nome utente e password) e presentare tre certificati digitali. Questi certificati, che si trovano in una cartella detta "secrets", servono a verificare l'identità del dispositivo e a proteggere la comunicazione da accessi non autorizzati e manomissioni.

Per autenticare gli applicativi app/back-end ed ESP32-air-quality-control/ è necessario:
- Copiare la cartella secrets scaricata in app/back-end/mqtt-subscription/
- Copiare il contenuto dei certificati dove indicato nel file ESP32-air-quality-control/sketch.ino

## Funzionalità
- Monitoraggio della qualità dell'aria: il sistema genera valori casuali per simulare la qualità dell'aria e li pubblica sul server MQTT.
- Indicatori LED: i LED si accendono in base alla qualità dell'aria simulata, fornendo un feedback visivo immediato.
- Interfaccia web: gli utenti possono visualizzare i dati sulla qualità dell'aria in tempo reale attraverso un'interfaccia web intuitiva. È presente un contatore in modo da osservare chiaramente i risultati.
