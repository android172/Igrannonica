import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KontaktComponent } from './kontakt/kontakt.component';
import { NoviEksperimentComponent } from './novi-eksperiment/novi-eksperiment.component';
import { ONamaComponent } from './o-nama/o-nama.component';
import { PocetnaStranaComponent } from './pocetna-strana/pocetna-strana.component';
import { PrijavaComponent } from './prijava/prijava.component';
import { RegistracijaComponent } from './registracija/registracija.component';
import { MojiEksperimentiComponent } from './moji-eksperimenti/moji-eksperimenti.component';
import { ProfilnaStranaComponent } from './profilna-strana/profilna-strana.component';
import { ProfilnaStranaIzmenaPodatakaComponent } from './profilna-strana-izmena-podataka/profilna-strana-izmena-podataka.component';
import { EksperimentComponent } from './eksperiment/eksperiment.component';

const routes: Routes = [
  {path:"", redirectTo: "/pocetna-strana", pathMatch: "full"},
  {path:'pocetna-strana', component:PocetnaStranaComponent},
  {path:'prijava', component:PrijavaComponent},
  {path:'registracija', component:RegistracijaComponent},
  {path:'novi-eksperiment', component:NoviEksperimentComponent},
  {path:'kontakt', component:KontaktComponent},
  {path:'o-nama', component:ONamaComponent},
  {path:'moji-eksperimenti', component:MojiEksperimentiComponent},
  {path:'profilna-strana', component:ProfilnaStranaComponent},
  {path:'profilna-strana-izmena-podataka', component:ProfilnaStranaIzmenaPodatakaComponent},
  {path:'eksperiment', component:EksperimentComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

