# Macao Caffè - Vendita Online di Capsule di Caffè


## Indice

1.  [Introduzione](#introduzione)
2.  [Funzionalità](#funzionalità)
3.  [Tecnologie Utilizzate](#tecnologie-utilizzate)
4.  [Utilizzo](#utilizzo)
5.  [Screenshot](#screenshot)
6.  [Prossimi passi](#prossimi-passi)
7. [Contatti](#contatti)

---

## Introduzione

Benvenuti in Macao Caffè! Questo progetto è un e-commerce base per la vendita di capsule di caffè, progettato per offrire un'esperienza intuitiva e funzionale. Dalla navigazione del catalogo all'effettuazione degli ordini, l'applicazione gestisce tutte le funzionalità essenziali di un negozio online.

L'applicazione è composta da un backend che gestisce la logica di business, la persistenza dei dati e le API, e un frontend moderno e reattivo che fornisce l'interfaccia utente.

---

## Funzionalità

Ecco le principali funzionalità offerte dalla piattaforma:

*   **Catalogo Prodotti:** Visualizzazione di tutte le capsule di caffè disponibili con dettagli (nome, descrizione, prezzo, immagine).
*   **Ricerca e Filtri:** Possibilità di cercare prodotti per nome.
*   **Dettaglio Prodotto:** Pagina dedicata per ogni prodotto con informazioni dettagliate, immagini multiple e recensioni dei clienti.
*   **Carrello:** Aggiunta, rimozione e gestione delle quantità dei prodotti nel carrello.
*   **Checkout:** Processo di acquisto semplificato per finalizzare l'ordine.
*   **Autenticazione Utente:** Registrazione, login e logout per gli utenti.
*   **Area Utente:** Visualizzazione della cronologia degli ordini e gestione del profilo.
*   **Dashboard Amministrativa:** Gestione prodotti, ordini, utenti.

---

## Tecnologie Utilizzate

Questo progetto è stato sviluppato utilizzando le seguenti tecnologie:

### Backend

*   **Linguaggio:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB
*   **ORM/ODM:** Mongoose
*   **Autenticazione:** JWT, OAuth2

### Frontend

*   **Libreria/Framework:** React
*   **Gestione Stato:** Context API
*   **Routing:** React Router
*   **Styling:** Bootstrap
*   **Package Manager:** npm
*   **Altro:** Vite


## Utilizzo

Puoi accedere all'applicazione tramite il tuo browser all'indirizzo (https://ui-macao.vercel.app).

Accedendo con un normale account ( ruolo 'user' ) potrai utilizzare:

*   **Navigazione:** Esplora il catalogo dei prodotti nella homepage.
*   **Registrazione/Login:** Crea un nuovo account o effettua il login per accedere alle funzionalità complete.
*   **Acquisto:** Aggiungi prodotti al carrello e procedi al checkout.
*   **Profilo:** Visualizza e gestisci i tuoi ordini.

Tutte le rimanenti funzionalità di back office sono consentite solo all'utente con ruolo 'admin'. 
Per poter visualizzare e utilizzare questa parte è stato presisposto il seguente utente 'admin' di test:

username: utente.admin@mail.com
password: passwordAdmin123

Si prega di utilizzare queste credenziali con cautela dato che dalla dashboard di amministrazione si ha accesso alle risorse principali del negozio pubblico: prodotti, ordini, utenti.

---

## Screenshot 

### Homepage
<div align="start">
    <img src="https://res.cloudinary.com/dztq95r7a/image/upload/v1761874314/home_choaqc.png" width="500" alt="Pagina catalogo prodotti">
</div>

### Dettaglio Prodotto
<div align="start">
    <img src="https://res.cloudinary.com/dztq95r7a/image/upload/v1761874024/dettaglio-prodotto_darez1.png" width="500" alt="Pagina dettaglio prodotto">
</div>

### Carrello e Checkout
<div align="start">
    <img src="https://res.cloudinary.com/dztq95r7a/image/upload/v1761874032/carrello_m0hrno.png" width="500" alt="Pagina carrello">
</div>

<div align="start">
    <img src="https://res.cloudinary.com/dztq95r7a/image/upload/v1761874043/riepilogo_ozwaa4.png" width="500" alt="Pagina riepilogo ordine">
</div>

### Pannello di amministrazione
<div align="start">
    <img src="https://res.cloudinary.com/dztq95r7a/image/upload/v1761874055/dashboard-admin_hx9xko.png" width="500" alt="Pagina pannello di amministrazione">
</div>

---

## Prossimi passi

Come ogni buon sistema software, per ottenere un risultato sempre migliore e vicino alle esigenze dell'utilizzatore finale, si possono integrare diversi miglioramenti, tra cui:

* **Pagamento**: la possibilità di effettuare pagamenti sicuri tramite Stripe
* **Notifiche**: informare l'utente dei passaggi di stato di un ordine tramite posta elettronica

---

## Contatti

Per qualsiasi domanda o suggerimento, puoi contattarmi tramite:

*   **Email:** iolanda.anile@gmail.com
*   **LinkedIn:** https://www.linkedin.com/in/iolanda-anile-195415135/