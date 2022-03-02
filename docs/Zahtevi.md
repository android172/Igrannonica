# Zahtevi Projekta
## Rad sa podacima
- **Uvoz podataka**, Obavezno preko *csv* fajl formata, opciono podrzavanje drugih podataka.
- Podatke treba cuvati u bazi, na front endu koristiti pageing.
- Mogucnost sortiranja i filtriranja podataka.
- **Obrada Podataka**, Mogucnost promene individualnih polja podataka.
- Izbor metode enkodiranja kategoriskih podataka.
- Selekcija ulaznih i izlaznih kolona.
- **Vizualizacija podataka**, prikaz Statistickih podataka, npr:
    * Mean, median, kvantili
    * Broj praznih polja kolone
    * Minimum, maximum
    * itd...
- Mogucnost ucitavanja **trening skupa**, ili alternativno Mogucnost automatske podele podataka na trening i testni skup
- Koriscenje **validacionog skupa**, pomocu izabrane metode validacije

## Podesavanje modela
- Podesavanje parametara mreze:
    * Vrsta problema (**regresija** ili **klasifikacija**, opciono i klasterizacija)
    * Podesavanje broja **tajnih sloje**, i broja cvorova za svaki sloj (broj cvorova za ulazni i izlazni sloj odredjen ulaznim i izlaznim podacima)
    * Postavljanje **aktivacione funkcije** slojeva
    * **Stopa ucenja**
    * Regularizacija i stopa Regularizacije
    * Broj epoha, i broj iteracija u svakoj epohi
- Mogucnost cuvanja i kasnijeg ucitavanja podesavanja mreze.
- Vizualizacija jacine svake veze izmedju cvorova.
- Izbor **loss funkcije**.

## Trening modela
- Mogucnost pokretanja i zaustavljanja treninga
- Vizualizacija greske tokom treninga na test i trening skupu pomocu loss funkcije.
- Cuvanje logova
- Cuvanje rezultujucih modela
- Vizualizacija izlaza
- Metrike izlaza
- Mogucnost pokretanja treninga od neke prethodno istrenirane tacke, tj. mogucnost ucitavanja tezina


## Upravljanje korisnicima
- Login i register funkcionalnosti.
- Za svakog korisnika cuvamo:
    * Korisnicko ime
    * Lozinku
    * Email
    * Profilnu sliku
    * Datum kreiranja naloga
- Svaki korisnik za sebe ima povezanu listu eksperimenata.
- Za cuvanje podataka u bazi neophodno prijavljivanje korisnika
- U okviru eksperimenta cuvamo:
    * Naziv eksperimenata   
    * Datum kreiranja
    * Vreme poslednje izmene
    * Trening, test i validacione podatke za koje se model pravi
    * Listu isprobavanih konfiguracija mreze
    * Tezine modela nakon svake istrenirane epohe date konfiguracije
- Korisnik ima mogucnost pretrage i sortiranja eksperimenata.