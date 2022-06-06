import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KontaktComponent } from './kontakt/kontakt.component';
import { NoviEksperimentComponent } from './novi-eksperiment/novi-eksperiment.component';
import { ONamaComponent } from './o-nama/o-nama.component';
import { PocetnaStranaComponent } from './pocetna-strana/pocetna-strana.component';
import { PrijavaComponent } from './prijava/prijava.component';
import { RegistracijaComponent } from './registracija/registracija.component';
// import { MojiEksperimentiComponent } from './moji-eksperimenti/moji-eksperimenti.component';
import { ProfilnaStranaComponent } from './profilna-strana/profilna-strana.component';
import { ProfilnaStranaIzmenaPodatakaComponent } from './profilna-strana-izmena-podataka/profilna-strana-izmena-podataka.component';
import { EksperimentComponent } from './eksperiment/eksperiment.component';
import { LoggedinGuard } from './auth/loggedin.guard';
import { LoggedoutGuard } from './auth/loggedout.guard';
import { PrijaviseGuard } from './auth/prijavise.guard';

const routes: Routes = [
  {path:"", redirectTo: "/pocetna-strana", pathMatch: "full"},
  {path:'pocetna-strana', component:PocetnaStranaComponent},
  {path:'prijava', component:PrijavaComponent,canActivate:[LoggedoutGuard]},
  {path:'registracija', component:RegistracijaComponent,canActivate:[LoggedoutGuard]},
  {path:'eksperimenti', component:NoviEksperimentComponent,canActivate:[PrijaviseGuard]},
  {path:'kontakt', component:KontaktComponent},
  {path:'o-nama', component:ONamaComponent},
  // {path:'moji-eksperimenti', component:MojiEksperimentiComponent,canActivate:[LoggedinGuard]},
  {path:'profilna-strana', component:ProfilnaStranaComponent,canActivate:[LoggedinGuard]},
  {path:'profilna-strana-izmena-podataka', component:ProfilnaStranaIzmenaPodatakaComponent,canActivate:[LoggedinGuard]},
  {path:'eksperiment', component:EksperimentComponent,canActivate:[LoggedinGuard]},
  {path:'**', redirectTo: "/pocetna-strana"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

