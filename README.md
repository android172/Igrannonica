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