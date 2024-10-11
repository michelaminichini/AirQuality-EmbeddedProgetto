# Sistema di Monitoraggio della Qualità dell'Aria con ESP32
Questo progetto implementa un sistema di monitoraggio della qualità dell'aria utilizzando un microcontrollore ESP32 e la piattaforma AWS IoT. Il dispositivo raccoglie dati simulati sulla qualità dell'aria, li elabora e li pubblica su un broker MQTT sicuro utilizzando certificati AWS per la connessione crittografata. I dati inviati possono essere monitorati e visualizzati in tempo reale.

## Funzionalità principali
- Simulazione della qualità dell'aria: il dispositivo genera periodicamente un valore casuale per la qualità dell'aria (tra 0 e 400) per simulare diverse condizioni atmosferiche.
- Connessione Wi-Fi: il dispositivo si connette al WiFi. La funzione responsabile blocca il proseguimento del codice fino a quando non è correttamente connesso. Poi, una volta riuscito, viene condiviso l'indirizzo IP insieme ad un messaggio di riuscita.
- Connessione MQTT: la funzione responsabile connette l'ESP32 a un broker MQTT usando una connessione sicura basata su certificati, genera un ID client casuale per evitare conflitti e gestisce eventuali errori di connessione con messaggi di debug. Se la connessione fallisce, ritenta ogni 3 secondi finché non riesce.
- Funzione callback: funzione che viene eseguita automaticamente ogni volta che un messaggio arriva sul topic MQTT a cui il dispositivo è iscritto. Converte il payload del messaggio (ricevuto in formato byte) in una stringa leggibile e poi stampa il messaggio ricevuto sulla seriale.
- Indicazione tramite LED: tre LED (rosso, giallo e verde) indicano lo stato della qualità dell'aria: con il verde, la qualità dell'aria è buona, con il giallo è moderata mentre con il rosso è insalubre/pericolosa
- Pubblicazione di dati in formato JSON: i dati sulla qualità dell'aria vengono pubblicati nel formato JSON e contengono: nome del dispositivo, valore della qualità dell'aria e descrizione.

### WokWi
Il progetto è stato realizzato su  [Wokwi](https://wokwi.com/), il link al progetto può essere trovato nel file "ESP32-air-quality-control/wokwi-project.txt" oppure [qui](https://wokwi.com/projects/409557010663431169).