import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PocetnaStranaComponent } from './pocetna-strana/pocetna-strana.component';
import { PrijavaComponent } from './prijava/prijava.component';
import { RegistracijaComponent } from './registracija/registracija.component';

const routes: Routes = [
  {path:"", redirectTo: "/pocetnastrana", pathMatch: "full"},
  {path:'pocetnastrana', component:PocetnaStranaComponent},
  {path:'prijava', component:PrijavaComponent},
  {path:'registracija', component:RegistracijaComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

