# Igrannonica Web App - Neuranetic

![Logo firme](slike/neuralnetic-git.png)

## Grane
Posednja verzija projekta se postavlja na master svakog cetvrtka.<br>
Na grani dev se push promene tokom nedelje
##
---
## Potrebni programi

> Angular: 13.2.5 <br>
> Node: 16.14.0<br>
> Package Manager: 8.5.1<br>
> .Net: 6.0<br>
> MySql: 8.0<br>
> Python: 3.10<br>
> Python-library: sklearn,request,torch,pandas,numpy,signalrcore<br>
##
---
## FrontEnd

Potrebno je otvoriti cmd na src/frontend/angular<br>
Zatim je potrebno instalirati potrebne biblioteke sa:
> npm install
Ukoliko se ne instalira `@aspnet/signalr` potrebno je instalirati ga manuelno
> npm install @aspnet/signalr

Posle toga pokrenuti Angular server
>ng serve --open
---
## BackEnd

Potreno je pokrenuti src/backend/dotNet.sln pomocu Visual Studio 2022
##
---
## Python

Potrebno je otvoriti cmd na src/ml<br>
Zatim je potrebno izvrsiti komandu
> py MLServer.py
##
---
## MySql

Potrebno je otvoriti Baza.sql unutar sql foldera i izvrsiti taj querty.<br>
Zatim je potrebno postaviti praznu sifru za root korisnika.
##

## Portovi
10061 -- Angular<br>
10062 -- dotNet<br>
10070 -- python<br>
##

## Pokretanje aplikacije 
Pre pokretanja apliacije potrebnoje proveriti da li su portovi zauzeti i da li su procesi od projekta vec pokretnuti.<br>
### Python
Potrebno je otvoriti folder NeuralNeti/Ml<br>
Zatim je potrebno izvrsiti komandu
> nohup python3 MLServer.py &
###
### BackEnd
Potrebno je otvoriti folder NeuralNeti/BackEnd<br>
Zatim je potrebno izvrsiti komandu
> nohup dotnet dotNet.dll &
###
### FrontEnd
Potrebno je otvoriti folder NeuralNeti/FrontEnd<br>
Zatim je potrebno izvrsiti komandu
> nohup python3 server.py &
###
##

## Uputstvo za pokretanje modela
1. Korisnik treba da napravi nalog, a zatim da se prijavi na njega
2. Potrebno je da korisnik napravi eksperiment, to moze da uradi klikom na dugme "Novi eksperiment", to cega odvesti na stranu eksperimenta.
3. Potrebno je ucitati podatke( Na crveo dugme!!! ) koji su u .csv formatu. Ukoliko postoje kategorijske vrednosti potrebno ih je enkodirati tako sto se izabere kolona i klikne se na dugme(Label encoding ili one-hot encoding). Moguce je rucno menjati podatke unutar tabele. SVE PROMENE SE NE CUVAJU U CSV FAJLU VEC JE SAMO IN-MEMORY!
4. Klikom na dugme izaberi ponudjene su opcije za testni skup. (Proveren nacin da radi je da se izabere Prozivoljan unos vrednosti, da se izabere neka vrednost(mora da se promeni na bilo koju, postoji bug!!!), a zatim kliknuti primeni da bi se ta vrednost primenila)
5. Potrebno je preci na tab modeli, napraviti model ako ne postoji ni jedan i uci u njega.
6. Potrebno je izabrati ulazne i izlazne kolone po zelji. Ostala podesavanja se cuvaju klikom da dugme sacuvaj. Pre pokretanja modela sva podesavanja se ponovo cuvaju.
7. Ukoliko su uradjeni svi koraci model je spreman za tesiranje.<br>
DUGME ZA POKRETANJE TRENIRANJA JE DOVOLJNO PRITISNUTI SAMO JEDNOM!!!<br>
Ako je sve pokrenutno kako treba Loss ce biti iscrtan na dnu strane. Ukoliko se nije pokrenulo treba proveriti da li su svi podaci lepo sredjeni ,enkodirani i podesavanja za Klasifikaciju i regresiju dobro namestena.
##

# APLIKACIJA JE JOS UVEK U IZRADI I NIJE IDIOT-PROOF, potrebno je strpljenje i pametno koriscenje aplikacije
