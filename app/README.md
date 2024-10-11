# Web App
Stack utilizzato:
- front-end: React
- back-end: ExpressJs

## Preparazione dell'ambiente
Installare i pacchetti necessari eseguendo il comando "npm install" in entrambe le cartelle: front-end e back-end.

## Front-end
Il front-end costituisce un'applicazione React. Una volta avviata, viene visualizzato un contatore (Gauge) che mostra in maniera semplice ed intuitiva i valori rilevati. 

Il contatore è stato realizzato grazie a react-chartjs-2, una libreria JavaScript che permette di creare grafici interattivi e personalizzabili all'interno di applicazioni React. Questo strumento, che fa da ponte tra Chart.js e il framework React, rende molto più semplice l'integrazione di grafici nelle applicazioni React.

### Come si avvia ? 
Eseguire il comando "npm run start" una volta terminata l'installazione dei pacchetti.

## Back-end
Composto da:
- API endpoint (creati usando Express)
- Script .sh per l'iscrizione (subscriber) e la pubblicazione (publisher) nel topic del server MQTT

### API endpoint: get('/') 
Questa API esegue la lettura del file `output.txt`, decodifica i dati in esso contenuti, rimuovendo parti non necessarie (come il prefisso `"test_project"`), e li trasforma in un oggetto JSON. Successivamente, l'API invia questo JSON come risposta HTTP al browser, permettendo all'applicazione React di visualizzare i dati in modo strutturato e di interagire con essi.

### Script .sh
Lo script 'subscriber' rimane in ascolto sul topic "test_project" e reindirizza i messaggi ricevuti sul file di testo "output.txt". Il suo contenuto viene poi letto e condiviso dalla API get.

### Come si avvia ?
Eseguire il comando "node server.js" che fa partire il server e lo mette in ascolto di richieste HTTP sulla porta specificata (7000).
